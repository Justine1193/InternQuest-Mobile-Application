import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Linking, StatusBar, Modal, Image, ScrollView, RefreshControl } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Card, Button, ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, firestore, storage, ADMIN_FILE_FUNCTION_BASE_URL } from '../firebase/config';
import { collection, addDoc, query, orderBy, getDocs, doc, deleteDoc, updateDoc, getDoc, deleteField, where, setDoc } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SecurityUtils } from '../services/security';
import { colors, radii, shadows, spacing } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { AppHeader } from '../ui/components/AppHeader';

const FIRESTORE_MAX_BYTES = 700 * 1024; // ~700KB


type TemplateDoc = {
  id: string;
  // support older and newer naming schemas
  name?: string; // friendly name or title
  description?: string;
  uploaderId?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  // storage vs firestore
  storedInFirestore?: boolean;
  // older schema: contentBase64
  contentBase64?: string;
  // newer schema: fileData is full data url like "data:application/pdf;base64,..."
  fileData?: string;
  // file metadata
  contentType?: string;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
  path?: string;
  url?: string;
  // Accept legacy / alternate field names used in older documents
  fileUrl?: string;
  downloadUrl?: string;
  downloadURL?: string;
  fileDownloadUrl?: string;
  file_path?: string;
  filePath?: string;
  storagePath?: string;
  file_pathname?: string;
  // optional due date (ISO string or human string) for file requirements
  dueDate?: string;
};

type StepProgressStatus = 'pending' | 'completed';

type ResourceStep = {
  id: string;
  title?: string;
  description?: string;
  /**
   * Primary instructions for the step.
   * Can be stored in Firestore as an array of strings or a single newline-separated string.
   */
  instructions?: string[] | string;
  /**
   * Required documents for this step.
   * Can be stored as `requiredDocuments` or `required_documents`,
   * each either a string[] or newline-separated string.
   */
  requiredDocuments?: string[] | string;
  required_documents?: string[] | string;
  order?: number;
  is_active?: boolean;
  /**
   * Action type for this step. Extra strings are allowed for forward-compatibility,
   * but the client only has specific UX for the known values.
   */
  action_type?: 'upload' | 'download' | 'view' | 'none' | string;
  /**
   * Optional target for the action:
   * - For "view"/"download": can be an external URL
   * - For "upload"/"view": can be a navigation route name
   */
  action_target?: string | null;
  /**
   * Attached files for this step (from resource_steps).
   * Each item can have name, url/fileUrl/downloadUrl, or path/storagePath for Storage.
   */
  attachedFiles?: Array<{
    name?: string;
    url?: string;
    fileUrl?: string;
    downloadUrl?: string;
    path?: string;
    storagePath?: string;
  }>;
  /**
   * Backend: required_document_attachments (matches admin "DOCUMENT 1" format).
   * Each item = Document name + Reference file (optional): attachment_name, attachment_url.
   * Also supports: document_name/documentName + reference_file/referenceFile.
   */
  required_document_attachments?: Array<{
    attachment_name?: string;
    attachment_type?: string;
    attachment_url?: string;
    document_name?: string;
    documentName?: string;
    reference_file?: { url?: string; fileName?: string; name?: string };
    referenceFile?: { url?: string; fileName?: string; name?: string };
  }>;
}

const ResourceManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateDoc[]>([]);
  const [myDocs, setMyDocs] = useState<TemplateDoc[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'other' | null>(null);
  const [previewLocalUri, setPreviewLocalUri] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalUri, setImageModalUri] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [steps, setSteps] = useState<ResourceStep[]>([]);
  const [stepProgress, setStepProgress] = useState<Record<string, StepProgressStatus>>({});
  const [stepsLoading, setStepsLoading] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const admin = await SecurityUtils.isAdmin();
      setIsAdmin(admin);
      await Promise.all([loadTemplates(), loadMyDocuments(), loadSteps()]);
    })();
  }, []);

  const loadMyDocuments = async () => {
    try {
      if (!auth.currentUser) return;
      const userSnap = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (!userSnap.exists()) {
        setMyDocs([]);
        return;
      }

      const data: any = userSnap.data();
      const checklist = data?.generatedDocuments?.ojtCompletionChecklist;
      if (checklist?.url) {
        setMyDocs([
          {
            id: 'generated_ojt_completion_checklist',
            name: checklist.title || 'OJT Completion Checklist',
            fileName: checklist.title || 'OJT Completion Checklist',
            description: 'Auto-generated after all requirements are approved.',
            uploadedAt: checklist.generatedAt?.toDate ? checklist.generatedAt.toDate().toISOString() : undefined,
            url: checklist.url,
            path: checklist.path,
            fileType: 'application/pdf',
          },
        ]);
      } else {
        setMyDocs([]);
      }
    } catch (e) {
      setMyDocs([]);
    }
  };

  const handleRegenerateChecklist = async () => {
    if (!auth.currentUser) return;

    Alert.alert(
      'Regenerate checklist?',
      'This will remove the current generated checklist from Guides. The app will generate a fresh one the next time you open Requirements Checklist.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {
              const userRef = doc(firestore, 'users', auth.currentUser!.uid);
              const userSnap = await getDoc(userRef);
              const data: any = userSnap.exists() ? userSnap.data() : {};
              const checklist = data?.generatedDocuments?.ojtCompletionChecklist;

              // Best-effort: delete the old PDF from Storage (optional)
              const oldPath = checklist?.path;
              if (oldPath) {
                try {
                  const sRef = storageRef(storage, oldPath);
                  const storageModule: any = await import('firebase/storage');
                  if (storageModule.deleteObject) {
                    await storageModule.deleteObject(sRef);
                  }
                } catch (e) {
                  // Failed to delete old checklist from storage
                }
              }

              // Remove Firestore pointer so next visit regenerates
              await updateDoc(userRef, {
                'generatedDocuments.ojtCompletionChecklist': deleteField(),
              } as any);

              await loadMyDocuments();

              Alert.alert(
                'Ready to regenerate',
                'Now open Requirements Checklist to generate a fresh PDF.',
                [
                  { text: 'Later', style: 'cancel' },
                  { text: 'Go to Checklist', onPress: () => navigation.navigate('RequirementsChecklist') },
                ]
              );
            } catch (e) {
              Alert.alert('Error', 'Failed to reset the generated checklist.');
            }
          },
        },
      ]
    );
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // read from the `helpDeskFiles` collection (matches workspace screenshot)
      const q = query(collection(firestore, 'helpDeskFiles'), orderBy('uploadedAt', 'desc'));
      const snap = await getDocs(q);
      const docs: TemplateDoc[] = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));

      // Resolve any storage paths to download URLs so the UI can preview and download images/PDFs
      const resolvedDocs = await Promise.all(docs.map(async (docItem) => {
        // Accept multiple possible URL field names used historically
        const possibleUrl = docItem.url || docItem.fileUrl || docItem.downloadUrl || docItem.downloadURL || docItem.fileDownloadUrl;
        if (possibleUrl) return { ...docItem, url: possibleUrl };

        // If we have a Storage path, try to resolve it to a download URL
        // Accept multiple path field variants too
        const possiblePath = docItem.path || docItem.filePath || docItem.storagePath || docItem.file_path || docItem.file_pathname;
        if (possiblePath) {
          try {
            const resolvedUrl = await getDownloadURL(storageRef(storage, possiblePath));
            return { ...docItem, url: resolvedUrl };
          } catch (err) {
            // Could be permission issue or wrong path — keep the original doc and continue
            return docItem;
          }
        }

        return docItem;
      }));

      setTemplates(resolvedDocs);
    } catch (err) {
      Alert.alert('Error', 'Failed to load templates.');
    } finally {
      setLoading(false);
    }
  };

  const loadSteps = async () => {
    try {
      setStepsLoading(true);

      // Fetch all steps (no index required); filter and sort in app so we match
      // both website field names: is_active/isActive, order/orderNumber
      const stepsRef = collection(firestore, 'resource_steps');
      const snap = await getDocs(stepsRef);

      const rawSteps: ResourceStep[] = snap.docs.map((d: any) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      const isActive = (s: ResourceStep & { isActive?: boolean }) => {
        const v = s.is_active ?? (s as any).isActive;
        return v === true || v === 'true';
      };
      const getOrder = (s: ResourceStep & { orderNumber?: number }) =>
        typeof s.order === 'number' ? s.order : (s as any).orderNumber ?? 999;

      const loadedSteps = rawSteps
        .filter(isActive)
        .sort((a, b) => getOrder(a) - getOrder(b));

      setSteps(loadedSteps);

      // Load per-student progress if a user is signed in
      if (auth.currentUser) {
        const progressQuery = query(
          collection(firestore, 'student_resource_progress'),
          where('student_id', '==', auth.currentUser.uid)
        );
        const progressSnap = await getDocs(progressQuery);

        const map: Record<string, StepProgressStatus> = {};
        progressSnap.forEach((docSnap: any) => {
          const data: any = docSnap.data();
          if (data?.step_id && (data.status === 'completed' || data.status === 'pending')) {
            map[data.step_id] = data.status;
          }
        });
        setStepProgress(map);
      } else {
        setStepProgress({});
      }
    } catch (e) {
      // Silent fail; the rest of the Guides screen should continue to work
    } finally {
      setStepsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTemplates(), loadMyDocuments(), loadSteps()]);
    setRefreshing(false);
  };

  const markStepCompleted = async (stepId: string) => {
    if (!auth.currentUser) return;
    try {
      const studentId = auth.currentUser.uid;
      const progressRef = doc(
        firestore,
        'student_resource_progress',
        `${studentId}_${stepId}`
      );
      await setDoc(
        progressRef,
        {
          student_id: studentId,
          step_id: stepId,
          status: 'completed' as StepProgressStatus,
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      setStepProgress((prev) => ({
        ...prev,
        [stepId]: 'completed',
      }));
    } catch (e) {
      Alert.alert('Error', 'Could not save your progress. Please try again.');
    }
  };

  const handleStepAction = async (step: ResourceStep) => {
    if (!step.action_type || step.action_type === 'none') return;

    try {
      setActiveStepId(step.id);

      const actionType = step.action_type;
      const target = step.action_target || null;

      if (actionType === 'upload') {
        // Reuse the existing requirements upload flow as the primary upload destination
        navigation.navigate('RequirementsChecklist' as never);
      } else if (actionType === 'view') {
        if (target && /^https?:\/\//i.test(target)) {
          await WebBrowser.openBrowserAsync(target);
        } else if (target) {
          // Treat as a navigation route name when not a URL
          navigation.navigate(target as never);
        }
      } else if (actionType === 'download') {
        if (target && /^https?:\/\//i.test(target)) {
          await WebBrowser.openBrowserAsync(target);
        } else {
          Alert.alert(
            'Download',
            'This step is not linked to a downloadable file yet. Please use the Guides section below.'
          );
        }
      }

      await markStepCompleted(step.id);
    } catch (e) {
      // Any user-facing errors are already surfaced via Alerts
    } finally {
      setActiveStepId(null);
    }
  };

  /**
   * Opens an attached file from a resource step.
   * Storage path format: resource_steps/{stepId}/required_docs/{timestamp}_{index}_{filename}
   */
  const openStepAttachment = async (stepId: string, file: { name?: string; url?: string; fileUrl?: string; downloadUrl?: string; path?: string; storagePath?: string; attachment_url?: string }) => {
    const url = file.url || file.fileUrl || file.downloadUrl || (file as any).attachment_url;
    if (url && /^https?:\/\//i.test(url)) {
      await WebBrowser.openBrowserAsync(url);
      return;
    }
    let path = file.path || file.storagePath;
    if (path) {
      if (!path.startsWith('resource_steps/')) {
        path = `resource_steps/${stepId}/required_docs/${path}`;
      }
      try {
        const resolvedUrl = await getDownloadURL(storageRef(storage, path));
        await WebBrowser.openBrowserAsync(resolvedUrl);
      } catch (e) {
        Alert.alert('Error', 'Could not open file. The link may be invalid or expired.');
      }
      return;
    }
    Alert.alert('Unavailable', 'This file has no link or path set.');
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewUrl(null);
  };

  // helper to format possible due date strings
  const formatDate = (v?: string | null) => {
    if (!v) return '';
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return String(v);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return String(v);
    }
  };

  const uriToBlob = (uri: string) => new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () { resolve(xhr.response as Blob); };
    xhr.onerror = function () { reject(new Error('Failed to fetch file for upload')); };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const uploadToStorage = async (uri: string, name: string, fileAny: any) => {
    const blob = await uriToBlob(uri);
    const remotePath = `helpDeskFiles/${auth.currentUser?.uid}/${Date.now()}_${name}`;
    const sRef = storageRef(storage, remotePath);
    await uploadBytes(sRef, blob, { contentType: fileAny.mimeType || fileAny.type || 'application/octet-stream' });
    const downloadURL = await getDownloadURL(sRef);
    return { name, url: downloadURL, path: remotePath, contentType: fileAny.mimeType || fileAny.type || 'application/octet-stream', uploadedAt: new Date().toISOString() };
  };

  const handleUpload = async () => {
    if (!isAdmin) return Alert.alert('Not authorized', 'Only administrators can upload templates.');
    if (!title) return Alert.alert('Missing title', 'Please enter a name for the template.');

    try {
      setUploading(true);

      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], copyToCacheDirectory: true });
      if (result.canceled) { setUploading(false); return; }
      const f: any = result.assets && result.assets.length > 0 ? result.assets[0] : (result as any);
      const uri = f.uri;
      const name = f.name || f.fileName || `template_${Date.now()}`;

      // Always store uploaded files in Cloud Storage and write a Firestore record with path + url
      // (We avoid embedding base64 into Firestore; Storage is preferred for images and PDFs)
      try {
        const fileMeta = await uploadToStorage(uri, name, f);
        // write a reference doc that points to the storage path + download URL
        await addDoc(collection(firestore, 'helpDeskFiles'), {
          fileName: name,
          // only include a description when provided
          ...(description ? { description } : {}),
          uploadedBy: auth.currentUser?.uid,
          uploadedAt: fileMeta.uploadedAt,
          storedInFirestore: false,
          path: fileMeta.path,
          url: fileMeta.url,
          fileType: fileMeta.contentType,
          fileSize: undefined,
        });

        setTitle(''); setDescription('');
        Alert.alert('Success', 'Template uploaded to Storage.');
        await loadTemplates();
      } catch (storageErr) {
        Alert.alert('Error', 'Failed to upload template to storage.');
      }

    } catch (err) {
      Alert.alert('Error', 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (t: TemplateDoc) => {
    try {
      setPreviewLoading(true);

      // Helper to write base64 to a local file and share/open it
      const writeBase64AndShare = async (base64: string, name = 'file', contentType = 'application/octet-stream') => {
        const ext = (contentType && contentType.split('/')[1]) ? `.${contentType.split('/')[1].split('+')[0]}` : '';
        const filenameSafe = (name || 'file').replace(/[^a-z0-9_.-]/gi, '_');
        const localPath = `${FileSystem.cacheDirectory}${filenameSafe}_${Date.now()}${ext}`;
        await FileSystem.writeAsStringAsync(localPath, base64, { encoding: FileSystem.EncodingType.Base64 });
        // Prefer sharing; on many devices this will open the file in the native viewer
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localPath);
        } else {
          // fallback to opening the file URI (some platforms may support it)
          await Linking.openURL(localPath);
        }
      };

      // Resolve canonical URL / path fields
      const possibleUrl = t.url || t.fileUrl || t.downloadUrl || t.downloadURL || t.fileDownloadUrl;
      const possiblePath = t.path || t.filePath || t.storagePath || t.file_path || t.file_pathname;

      // If a URL is present, download the file to cache and share/open it
      if (possibleUrl) {
        const fileName = t.fileName || t.name || `download_${Date.now()}`;
        const extMatch = (possibleUrl.match(/\.(\w+)(?:\?|$)/) || [])[1];
        const ext = extMatch ? `.${extMatch}` : '';
        const localPath = `${FileSystem.cacheDirectory}${fileName}_${Date.now()}${ext}`;
        const { uri } = await FileSystem.downloadAsync(possibleUrl, localPath);
        await Sharing.shareAsync(uri);
        return;
      }

      // If a storage path is present but no direct URL, resolve it to a download URL and fetch from Storage
      // If no URL, but we have a storage path (or variant), resolve it then download
      if (!possibleUrl && possiblePath) {
        try {
          const resolvedUrl = await getDownloadURL(storageRef(storage, possiblePath));
          const fileName = t.fileName || t.name || `download_${Date.now()}`;
          const extMatch = (resolvedUrl.match(/\.(\w+)(?:\?|$)/) || [])[1];
          const ext = extMatch ? `.${extMatch}` : '';
          const localPath = `${FileSystem.cacheDirectory}${fileName}_${Date.now()}${ext}`;
          const { uri } = await FileSystem.downloadAsync(resolvedUrl, localPath);
          await Sharing.shareAsync(uri);
          return;
        } catch (storageResolveErr) {
          // Failed to resolve storage path to URL
        }
      }

      // If Firestore-stored file is present, prefer streaming via cloud function if configured
      // only use cloud function URL when it looks like a real URL (not the
      // placeholder https://<region>-<project>.cloudfunctions.net/... used in config)
      const isCloudFnConfigured = typeof ADMIN_FILE_FUNCTION_BASE_URL === 'string' &&
        ADMIN_FILE_FUNCTION_BASE_URL.length > 0 &&
        !ADMIN_FILE_FUNCTION_BASE_URL.includes('<') &&
        ADMIN_FILE_FUNCTION_BASE_URL.includes('cloudfunctions.net');

      if (t.id && isCloudFnConfigured) {
        const openUrl = `${ADMIN_FILE_FUNCTION_BASE_URL}?docId=${t.id}`;
        const fileName = t.fileName || t.name || `download_${Date.now()}`;
        const extMatch = (openUrl.match(/\.(\w+)(?:\?|$)/) || [])[1];
        const ext = extMatch ? `.${extMatch}` : '.pdf';
        const localPath = `${FileSystem.cacheDirectory}${fileName}_${Date.now()}${ext}`;
        const { uri } = await FileSystem.downloadAsync(openUrl, localPath);
        await Sharing.shareAsync(uri);
        return;
      }

      // The client no longer reads embedded file data (base64) in Firestore documents.
      // Prefer Cloud Storage `path` or `url` instead.
      // Firestore-embedded base64 is no longer supported by the client — we fetch files only from Cloud Storage.
      // If no URL/path is present at this point, inform the user and ask admins to migrate the document.
      Alert.alert('Unavailable', 'No downloadable Storage path or URL found for this template. Please ask an administrator to upload this file to Cloud Storage and set the Firestore document `path` or `url`.');

      Alert.alert('Unavailable', 'No downloadable file found for this template.');
    } catch (err) {
      Alert.alert('Error', 'Failed to download/open the file.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // --- Migration: migrate a base64-stored Firestore doc to Cloud Storage ---
  const handleMigrateToStorage = async (t: TemplateDoc) => {
    if (!isAdmin) return Alert.alert('Not authorized', 'Only administrators can migrate templates.');
    Alert.alert('Migrate to Storage?', 'This will upload the embedded file to Cloud Storage and update the Firestore document to reference the Storage path (removing the base64 content). Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Migrate', style: 'default', onPress: async () => {
          setUploading(true);
          try {
            // find the embedded data (data URL or contentBase64)
            let dataUrl: string | null = null;
            if (t.fileData) dataUrl = t.fileData;
            else if (t.contentBase64) dataUrl = `data:${t.contentType || 'application/octet-stream'};base64,${t.contentBase64}`;

            if (!dataUrl) throw new Error('No embedded file data to migrate.');

            // Convert to blob using fetch (works for data URLs)
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            const fileName = (t.fileName || t.name || `migrated_${t.id || Date.now()}`).replace(/[^a-z0-9_.-]/gi, '_');
            const remotePath = `helpDeskFiles/${t.uploadedBy || auth.currentUser?.uid || 'migrated'}/${Date.now()}_${fileName}`;
            const sRef = storageRef(storage, remotePath);

            await uploadBytes(sRef, blob, { contentType: t.fileType || t.contentType || 'application/octet-stream' });
            // get a secure download URL
            const downloadURL = await getDownloadURL(sRef);

            const docRef = doc(firestore, 'helpDeskFiles', t.id);
            await updateDoc(docRef, {
              path: remotePath,
              url: downloadURL,
              storedInFirestore: false,
              fileType: t.fileType || t.contentType || 'application/octet-stream',
              uploadedAt: new Date().toISOString(),
              // remove embedded content (set to null so doc no longer stores raw base64)
              fileData: null,
              contentBase64: null,
            } as any);

            Alert.alert('Success', 'Template migrated to Cloud Storage.');
            await loadTemplates();
          } catch (err) {
            Alert.alert('Migration failed', String(err));
          } finally {
            setUploading(false);
          }
        }
      }
    ]);
  };

  const handlePreview = async (t: TemplateDoc) => {
    const isCloudFnConfigured = typeof ADMIN_FILE_FUNCTION_BASE_URL === 'string' &&
      ADMIN_FILE_FUNCTION_BASE_URL.length > 0 &&
      !ADMIN_FILE_FUNCTION_BASE_URL.includes('<') &&
      ADMIN_FILE_FUNCTION_BASE_URL.includes('cloudfunctions.net');
    try {
      // Use cloud function or storage/url/dataUrl and open the in-app preview modal
      if (t.id && isCloudFnConfigured) {
        const openUrl = `${ADMIN_FILE_FUNCTION_BASE_URL}?docId=${t.id}`;
        setPreviewUrl(openUrl);
        setShowPreviewModal(true);
        return;
      }

      // Accept several canonical URL fields set on the document
      const possibleUrl = t.url || t.fileUrl || t.downloadUrl || t.downloadURL || t.fileDownloadUrl;
      if (possibleUrl) {
        setPreviewUrl(possibleUrl);
        setShowPreviewModal(true);
        return;
      }

      // If no URL available, but path variants exist, attempt to resolve via Storage
      const possiblePath = t.path || t.filePath || t.storagePath || t.file_path || t.file_pathname;
      if (possiblePath) {
        try {
          const resolvedUrl = await getDownloadURL(storageRef(storage, possiblePath));
          setPreviewUrl(resolvedUrl);
          setShowPreviewModal(true);
          return;
        } catch (e) {
          // Failed to resolve storage path for preview
        }
      }

      // For preview: do not attempt to preview PDFs — they should be downloaded instead
      // Preview from Firestore-embedded base64 is not supported.
      // We only preview files that have a storage URL or are served via the admin cloud function.
      Alert.alert('Preview unavailable', 'This template cannot be previewed because it does not have a Cloud Storage URL or path. Please ask an administrator to upload the file to Cloud Storage and set the Firestore document `path` or `url`.');
    } catch (err) {
      Alert.alert('Error', 'Failed to preview template.');
    }
  };

  const handleDelete = async (t: TemplateDoc) => {
    if (!isAdmin) return Alert.alert('Not authorized', 'Only admins can delete templates.');
    Alert.alert('Delete template?', `Remove "${t.name}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            // delete storage object if present
            const deletePath = t.path || t.filePath || t.storagePath || t.file_path || t.file_pathname;
            if (deletePath) {
              try {
                const sRef = storageRef(storage, deletePath);
                const storageModule: any = await import('firebase/storage');
                const deleteObjectFn = storageModule.deleteObject;
                if (deleteObjectFn) await deleteObjectFn(sRef);
              } catch (e) {
                // Failed to delete storage object
              }
            }

            await deleteDoc(doc(firestore, 'helpDeskFiles', t.id));
            Alert.alert('Deleted', 'Template removed.');
            await loadTemplates();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete template.');
          }
        }
      }
    ]);
  };

  // Group templates: PDFs should live in their own stacked section

  // Split templates into images, PDFs, and others
  const imageTemplates = templates.filter(item => {
    const fileName = String(item.fileName || item.name || '').toLowerCase();
    const fileType = String(item.fileType || item.contentType || '').toLowerCase();
    return fileType.startsWith('image') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);
  });

  // Combine all non-image templates (PDFs + other document types) and group them by 'requirement'
  // so multiple attachments appear stacked inside the same card.
  const docTemplates = templates.filter(item => {
    const fileName = String(item.fileName || item.name || '').toLowerCase();
    const fileType = String(item.fileType || item.contentType || '').toLowerCase();
    const isImage = fileType.startsWith('image') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);
    return !isImage; // keeps pdfs + docx + other documents
  });

  const groupedDocMap: Record<string, { description?: string, dueDate?: string | undefined, items: TemplateDoc[] }> = {};
  docTemplates.forEach(p => {
    const key = `${p.description || 'File Requirement'}||${p.dueDate || ''}`;
    if (!groupedDocMap[key]) groupedDocMap[key] = { description: p.description, dueDate: p.dueDate, items: [] };
    groupedDocMap[key].items.push(p);
  });
  const groupedDocs = Object.keys(groupedDocMap).map(k => groupedDocMap[k]);

  // Get file icon based on type
  const getFileIcon = (item: TemplateDoc) => {
    const fileName = String(item.fileName || item.name || '').toLowerCase();
    const fileType = String(item.fileType || item.contentType || '').toLowerCase();
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'document-text';
    }
    if (fileType.includes('image') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName)) {
      return 'image';
    }
    if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return 'document';
    }
    return 'document-outline';
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => stepProgress[s.id] === 'completed').length;

  return (
    <Screen style={{ backgroundColor: colors.white }} contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
      {/* main content area */}
      <ScrollView
        style={styles.contentWrap}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero header (scrolls with content) */}
        <View style={styles.heroContainer}>
          <View style={styles.heroCard}>
            <View style={styles.heroTitleRow}>
              <View style={styles.heroIconWrap}>
                <Ionicons name="book-outline" size={28} color={colors.onPrimary} />
              </View>
              <Text style={styles.heroTitle}>Guides</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              Follow the steps below and open or download attached files to complete your internship requirements.
            </Text>
          </View>
        </View>

        {/* Dynamic student guide steps */}
        {totalSteps > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="list-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Student guide</Text>
                <Text style={styles.sectionSubtitle}>Complete each step and open attached documents</Text>
              </View>
            </View>
            <View style={styles.stepsProgressRow}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${totalSteps ? (completedSteps / totalSteps) * 100 : 0}%` }]} />
              </View>
              <Text style={styles.stepsProgressText}>
                {completedSteps} of {totalSteps} completed
              </Text>
              {stepsLoading && (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
              )}
            </View>

            {steps.map((step, index) => {
              const status: StepProgressStatus =
                stepProgress[step.id] === 'completed' ? 'completed' : 'pending';
              const isBusy = activeStepId === step.id;

              return (
                <StepCard
                  key={step.id}
                  index={index}
                  step={step}
                  status={status}
                  onActionPress={() => handleStepAction(step)}
                  onOpenAttachment={openStepAttachment}
                  isBusy={isBusy}
                />
              );
            })}
          </View>
        )}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator animating size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading resources...</Text>
          </View>
        ) : templates.length === 0 && myDocs.length === 0 ? (
          <View style={styles.emptyStateWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="book-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No guides yet</Text>
            <Text style={styles.emptySubtitle}>Your guides and resources will show here. Check back later or ask your coordinator if you need help.</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => setShowUploadModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.onPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.uploadButtonText}>Upload Resource</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* My Documents Section */}
            {myDocs.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>My Documents</Text>
                    <Text style={styles.sectionSubtitle}>Tap to download or open</Text>
                  </View>
                </View>
                <View style={styles.fileCard}>
                  {myDocs.map((att, idx) => (
                    <TouchableOpacity
                      key={att.id}
                      style={[styles.fileItem, idx === myDocs.length - 1 && { marginBottom: 0 }]}
                      onPress={() => handleDownload(att)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.fileIconWrap, { backgroundColor: colors.primarySoft }]}>
                        <Ionicons name="document-text" size={24} color={colors.primary} />
                      </View>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {att.fileName || att.name || 'OJT Completion Checklist'}
                        </Text>
                        <Text style={styles.fileMeta}>
                          {att.uploadedAt ? new Date(att.uploadedAt).toLocaleDateString() : 'Recently added'}
                        </Text>
                      </View>
                      <Ionicons name="download-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

          </>
        )}
      </ScrollView>
      {/* Upload Modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent onRequestClose={() => setShowUploadModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowUploadModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Resource</Text>
              <TouchableOpacity
                onPress={() => setShowUploadModal(false)}
                activeOpacity={0.7}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Add a new guide or form for students</Text>

            <TextInput
              placeholder="Resource name"
              value={title}
              onChangeText={setTitle}
              style={styles.modalInput}
              mode="outlined"
            />
            <TextInput
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              style={styles.modalInput}
              mode="outlined"
              multiline
              numberOfLines={2}
            />

            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={async () => {
                try {
                  const result = await DocumentPicker.getDocumentAsync({
                    type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                    copyToCacheDirectory: true
                  });
                  if (result.canceled) return;
                  const f: any = result.assets && result.assets.length > 0 ? result.assets[0] : (result as any);
                  setSelectedFile(f);
                } catch (e) {
                  Alert.alert('Error', 'Failed to pick file');
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="document-attach-outline" size={20} color={colors.primary} />
              <Text style={styles.filePickerText}>
                {selectedFile ? (selectedFile.name || selectedFile.fileName) : 'Choose file'}
              </Text>
              {selectedFile && (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              )}
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setTitle('');
                  setDescription('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={async () => {
                  if (!selectedFile) return Alert.alert('No file', 'Please choose a file to upload.');
                  if (!title) return Alert.alert('Missing title', 'Please enter a resource name.');

                  setUploading(true);
                  try {
                    const uri = selectedFile.uri;
                    const name = selectedFile.name || selectedFile.fileName || `template_${Date.now()}`;

                    const meta = await uploadToStorage(uri, name, selectedFile);
                    await addDoc(collection(firestore, 'helpDeskFiles'), {
                      fileName: title,
                      description,
                      uploadedBy: auth.currentUser?.uid,
                      uploadedAt: meta.uploadedAt,
                      storedInFirestore: false,
                      path: meta.path,
                      url: meta.url,
                      fileType: meta.contentType,
                      fileSize: undefined,
                    });

                    Alert.alert('Success', 'Resource uploaded successfully.');
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setTitle('');
                    setDescription('');
                    await loadTemplates();
                  } catch (err) {
                    Alert.alert('Error', 'Upload failed. Please try again.');
                  } finally {
                    setUploading(false);
                  }
                }}
                activeOpacity={0.8}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* preview modal - embedded WebView when available, otherwise the button already uses WebBrowser */}
      <Modal visible={showPreviewModal} animationType="slide" onRequestClose={closePreview}>
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>Preview</Text>
            <Button mode="text" onPress={closePreview}>Close</Button>
          </View>

          {previewUrl ? (
            // Try to dynamically import WebView. Some dev environments may not have it installed.
            (() => {
              // Try to render WebView dynamically so the app still compiles if the package isn't installed here.
              let WebViewComponent: any = null;
              try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                WebViewComponent = require('react-native-webview').WebView;
              } catch (e) {
                WebViewComponent = null;
              }

              if (WebViewComponent) {
                return <WebViewComponent source={{ uri: previewUrl }} style={{ flex: 1 }} />;
              }

              // Fallback: open system browser and close modal (ensure previewUrl is defined)
              (async () => { if (previewUrl) { await WebBrowser.openBrowserAsync(previewUrl); } closePreview(); })();
              return (
                <View style={{ padding: 18, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Text style={{ color: colors.textMuted }}>Previewing requires react-native-webview (not installed here) — opening in your browser instead.</Text>
                </View>
              );
            })()
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.textMuted }}>No preview available</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Full-screen image modal */}
      <Modal visible={showImageModal && !!imageModalUri} animationType="fade" transparent={false} onRequestClose={() => setShowImageModal(false)}>
        <View style={styles.fullImageWrap}>
          <TouchableOpacity
            style={styles.fullImageClose}
            onPress={() => setShowImageModal(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color={colors.onPrimary} />
          </TouchableOpacity>
          {imageModalUri ? (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              <Image source={{ uri: imageModalUri as string }} style={styles.fullImage} resizeMode="contain" />
            </ScrollView>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.textMuted }}>No image</Text>
            </View>
          )}
        </View>
      </Modal>
    </Screen>
  );
};

type StepAttachment = {
  name?: string;
  fileName?: string;
  url?: string;
  fileUrl?: string;
  downloadUrl?: string;
  path?: string;
  storagePath?: string;
};

type StepCardProps = {
  index: number;
  step: ResourceStep;
  status: StepProgressStatus;
  onActionPress: () => void | Promise<void>;
  onOpenAttachment?: (stepId: string, file: StepAttachment) => void;
  isBusy: boolean;
};

function StepCard({ index, step, status, onActionPress, onOpenAttachment, isBusy }: StepCardProps) {
  const instructionsRaw: string[] =
    Array.isArray(step.instructions)
      ? (step.instructions as string[])
      : typeof step.instructions === 'string'
        ? step.instructions.split('\n')
        : Array.isArray((step as any).instructions_list)
          ? ((step as any).instructions_list as string[])
          : [];

  const instructions = instructionsRaw
    .map((s: string) => s.trim())
    .filter(Boolean);

  const rawDocs: string[] =
    Array.isArray(step.requiredDocuments)
      ? (step.requiredDocuments as string[])
      : typeof step.requiredDocuments === 'string'
        ? step.requiredDocuments.split('\n')
        : Array.isArray(step.required_documents)
          ? (step.required_documents as string[])
          : typeof step.required_documents === 'string'
            ? step.required_documents.split('\n')
            : [];

  const documents = rawDocs
    .map((s: string) => s.trim())
    .filter(Boolean);

  const rawAttached = step.attachedFiles
    ?? (step as any).required_document_attachments
    ?? (step as any).attachments
    ?? (step as any).files
    ?? [];
  const attachedFiles: StepAttachment[] = Array.isArray(rawAttached)
    ? rawAttached.map((item: any) => {
        const docName = item.document_name ?? item.documentName ?? item.attachment_name ?? item.name;
        const refFile = item.reference_file ?? item.referenceFile;
        const url = item.attachment_url ?? item.url ?? refFile?.url;
        const fileName = refFile?.fileName ?? refFile?.name ?? item.attachment_name ?? item.name;
        return {
          name: docName,
          fileName: fileName,
          url,
          fileUrl: url ?? item.fileUrl,
          downloadUrl: url ?? item.downloadUrl,
          path: item.path,
          storagePath: item.storagePath,
        };
      })
    : [];

  // Pair required_documents (e.g. ["test", "test"]) with required_document_attachments by index.
  // Document name comes from required_documents[i]; file to open from attachedFiles[i].
  const pairedDocs = attachedFiles.map((file, i) => ({
    documentName: documents[i] ?? file.name ?? `Document ${i + 1}`,
    file,
  }));

  const isCompleted = status === 'completed';
  const showAction = step.action_type && step.action_type !== 'none';

  const actionLabel =
    step.action_type === 'upload'
      ? 'Upload now'
      : step.action_type === 'download'
        ? 'Download'
        : step.action_type === 'view'
          ? 'Open'
          : 'Continue';

  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeaderRow}>
        <View
          style={[
            styles.stepNumberChip,
            isCompleted && styles.stepNumberChipDone,
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={18} color={colors.success} />
          ) : (
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepTitle}>
            {step.title || `Step ${index + 1}`}
          </Text>
          {step.description ? (
            <Text style={styles.stepDescription}>{step.description}</Text>
          ) : null}
        </View>
        {isCompleted && (
          <View style={styles.stepStatusPill}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.success}
            />
            <Text style={styles.stepStatusText}>Done</Text>
          </View>
        )}
      </View>

      {instructions.length > 0 && (
        <View style={styles.stepList}>
          {instructions.map((text, i) => (
            <View key={i} style={styles.stepListItem}>
              <View style={styles.stepBullet} />
              <Text style={styles.stepListText}>{text}</Text>
            </View>
          ))}
        </View>
      )}

      {(documents.length > 0 || attachedFiles.length > 0) && (
        <View style={styles.stepDocs}>
          <Text style={styles.stepDocsLabel}>Required documents</Text>
          {pairedDocs.length > 0 && onOpenAttachment && (
            <View style={styles.attachedFilesList}>
              {pairedDocs.map(({ documentName, file }, i) => {
                const referenceFileName = file.fileName || file.name || `File ${i + 1}`;
                const hasLink = !!(file.url || file.fileUrl || file.downloadUrl || file.path || file.storagePath || (file as any).attachment_url);
                const isLastDoc = i === pairedDocs.length - 1;
                return (
                  <View key={`file-${i}`} style={[styles.documentEntry, isLastDoc && { marginBottom: 0 }]}>
                    <Text style={styles.documentNameLabel}>Document file</Text>
                    <Text style={styles.documentNameValue}>{documentName}</Text>
                    <TouchableOpacity
                      style={styles.attachedFileRow}
                      onPress={() => hasLink && onOpenAttachment(step.id, file)}
                      disabled={!hasLink}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="document-attach-outline"
                        size={20}
                        color={hasLink ? colors.primary : colors.textSubtle}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={[styles.attachedFileNameText, !hasLink && styles.attachedFileLabelDisabled]} numberOfLines={1}>
                        {hasLink ? referenceFileName : 'No file attached'}
                      </Text>
                      {hasLink ? (
                        <Ionicons name="open-outline" size={20} color={colors.primary} />
                      ) : (
                        <Ionicons name="lock-closed-outline" size={18} color={colors.textSubtle} />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
          {documents.length > attachedFiles.length && (
            <View style={styles.stepDocsPills}>
              {documents.slice(attachedFiles.length).map((docName, i) => (
                <View key={`doc-${i}`} style={styles.stepDocPill}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={colors.info}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.stepDocPillText} numberOfLines={1}>
                    {docName}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {showAction && (
        <TouchableOpacity
          style={[
            styles.stepActionButton,
            isCompleted && styles.stepActionButtonSecondary,
          ]}
          onPress={onActionPress}
          activeOpacity={0.8}
          disabled={isBusy}
        >
          {isBusy ? (
            <ActivityIndicator
              size="small"
              color={isCompleted ? colors.primary : colors.onPrimary}
            />
          ) : (
            <>
              <Text
                style={[
                  styles.stepActionText,
                  isCompleted && styles.stepActionTextSecondary,
                ]}
              >
                {isCompleted ? 'Review step' : actionLabel}
              </Text>
              <Ionicons
                name={
                  step.action_type === 'upload'
                    ? 'cloud-upload-outline'
                    : step.action_type === 'download'
                      ? 'download-outline'
                      : 'arrow-forward'
                }
                size={18}
                color={isCompleted ? colors.primary : colors.onPrimary}
              />
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* hero header */
  heroContainer: {
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: colors.primary,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroCard: {
    paddingVertical: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTitle: {
    color: colors.onPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    color: colors.onPrimarySubtle,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: '95%',
  },
  heroKicker: {
    color: colors.onPrimarySubtle,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTitleLine: {
    color: colors.onPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },

  /* content */
  contentWrap: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 32 },

  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },

  emptyStateWrap: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.lg,
    minHeight: 48,
  },
  uploadButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  /* Sections */
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepsProgressRow: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  stepsProgressText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },

  /* Step cards */
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.card,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberChipDone: {
    backgroundColor: colors.successSoft,
  },
  stepNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  stepDescription: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  stepStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    backgroundColor: colors.successSoft,
    marginLeft: 8,
  },
  stepStatusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  stepList: {
    marginTop: 8,
  },
  stepListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  stepBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 7,
    marginRight: 10,
    opacity: 0.8,
  },
  stepListText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  stepDocs: {
    marginTop: 14,
  },
  stepDocsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stepDocsPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  stepDocPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 4,
    marginBottom: 6,
  },
  stepDocPillText: {
    fontSize: 12,
    color: colors.text,
    maxWidth: 180,
  },
  attachedFilesList: {
    marginTop: 6,
  },
  documentEntry: {
    marginBottom: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentNameLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  documentNameValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  referenceFileNameSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  documentNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  documentNameButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
    flex: 1,
  },
  referenceFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referenceFileLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  attachedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachedFileNameText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  attachedFileLabelDisabled: {
    color: colors.textSubtle,
    fontWeight: '500',
  },
  stepActionButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    gap: 8,
  },
  stepActionButtonSecondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stepActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  stepActionTextSecondary: {
    color: colors.primary,
  },

  /* File Cards */
  fileCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  groupDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    marginBottom: 12,
    gap: 6,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },

  /* Image Grid */
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageCard: {
    width: '48%',
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  imageThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceAlt,
  },
  imageLabel: {
    padding: 10,
    backgroundColor: colors.surface,
  },
  imageLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  imageDeleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.danger,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Upload Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceAlt,
    marginBottom: 20,
    gap: 12,
  },
  filePickerText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onPrimary,
  },

  /* Full-screen image viewer */
  fullImageWrap: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  fullImageClose: {
    position: 'absolute',
    top: 44,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ResourceManagementScreen;
