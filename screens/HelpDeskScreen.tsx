import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Linking, StatusBar, Modal, Image, ScrollView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Card, Button, ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore, storage, ADMIN_FILE_FUNCTION_BASE_URL } from '../firebase/config';
import { collection, addDoc, query, orderBy, getDocs, doc, deleteDoc, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SecurityUtils } from '../services/security';
import { colors, radii, shadows, spacing } from '../ui/theme';

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

const HelpDeskScreen: React.FC = () => {
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

  useEffect(() => {
    (async () => {
      const admin = await SecurityUtils.isAdmin();
      setIsAdmin(admin);
      await Promise.all([loadTemplates(), loadMyDocuments()]);
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
      console.warn('Failed to load generated documents:', e);
      setMyDocs([]);
    }
  };

  const handleRegenerateChecklist = async () => {
    if (!auth.currentUser) return;

    Alert.alert(
      'Regenerate checklist?',
      'This will remove the current generated checklist from Resources. The app will generate a fresh one the next time you open Requirements Checklist.',
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
                  console.warn('Failed to delete old generated checklist from storage:', e);
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
              console.error('Failed to reset generated checklist:', e);
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
            console.warn('Failed to resolve storage path to URL for', docItem.path, err);
            return docItem;
          }
        }

        return docItem;
      }));

      setTemplates(resolvedDocs);
    } catch (err) {
      console.error('Failed to load templates:', err);
      Alert.alert('Error', 'Failed to load templates.');
    } finally {
      setLoading(false);
    }
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
        console.error('Storage upload error:', storageErr);
        Alert.alert('Error', 'Failed to upload template to storage.');
      }

    } catch (err) {
      console.error('Upload failed:', err);
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
          console.warn('Failed to resolve storage path to URL, continuing to other fallbacks', storageResolveErr);
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
      console.error('Download failed', err);
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
      { text: 'Migrate', style: 'default', onPress: async () => {
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
          console.error('Migration failed', err);
          Alert.alert('Migration failed', String(err));
        } finally {
          setUploading(false);
        }
      } }
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
          console.warn('Failed to resolve storage path for preview', e);
        }
      }

      // For preview: do not attempt to preview PDFs — they should be downloaded instead
      // Preview from Firestore-embedded base64 is not supported.
      // We only preview files that have a storage URL or are served via the admin cloud function.
      Alert.alert('Preview unavailable', 'This template cannot be previewed because it does not have a Cloud Storage URL or path. Please ask an administrator to upload the file to Cloud Storage and set the Firestore document `path` or `url`.');
    } catch (err) {
      console.error('Preview failed', err);
      Alert.alert('Error', 'Failed to preview template.');
    }
  };

  const handleDelete = async (t: TemplateDoc) => {
    if (!isAdmin) return Alert.alert('Not authorized', 'Only admins can delete templates.');
    Alert.alert('Delete template?', `Remove "${t.name}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          // delete storage object if present
          const deletePath = t.path || t.filePath || t.storagePath || t.file_path || t.file_pathname;
          if (deletePath) {
            try {
              const sRef = storageRef(storage, deletePath);
              const storageModule: any = await import('firebase/storage');
              const deleteObjectFn = storageModule.deleteObject;
              if (deleteObjectFn) await deleteObjectFn(sRef);
            } catch (e) { console.warn('Failed to delete storage object', e); }
          }

          await deleteDoc(doc(firestore, 'helpDeskFiles', t.id));
          Alert.alert('Deleted', 'Template removed.');
          await loadTemplates();
        } catch (err) {
          console.error('Delete failed', err);
          Alert.alert('Error', 'Failed to delete template.');
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: TemplateDoc }) => {
    const fileName = String(item.fileName || item.name || '').toLowerCase();
    const fileType = String(item.fileType || '').toLowerCase();
    const isImage = fileType.startsWith('image') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);

    // If this is an image template, render a simplified card containing only the image
    if (isImage) {
      // Only render images from Storage URLs. Firestore-stored base64 image content is not used by the client.
      const imageUri = item.url || item.fileUrl || item.downloadUrl || item.downloadURL || item.fileDownloadUrl || null;
      return (
        <Card style={[styles.card, styles.imageOnlyCard]}>
          {imageUri ? (
            <View style={styles.inlineImageWrap}>
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => {
                  setImageModalUri(imageUri as string);
                  setShowImageModal(true);
                }}
              >
                <Image source={{ uri: imageUri }} style={styles.inlineImage} resizeMode="contain" />
              </TouchableOpacity>
              {isAdmin && (
                <View style={styles.imageAdminOverlay}>
                  <TouchableOpacity style={styles.imageDeleteBtn} onPress={() => handleDelete(item)}>
                    <MaterialCommunityIcons name="delete" size={18} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <Card.Content>
              <Text style={styles.metaText}>Image unavailable</Text>
            </Card.Content>
          )}
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Card.Title title={item.fileName || item.name || 'Untitled'} subtitle={item.description || item.fileType || ''} titleNumberOfLines={2} subtitleNumberOfLines={2} />
        <Card.Content>
          <Text style={styles.metaText}>Uploaded: {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : '—'}</Text>

          {/* Non-image templates: maybe show a small thumbnail when url available - keep existing flow */}
          {(!isImage && item.fileType && item.fileType.startsWith('image') && item.url) && (
            <Image source={{ uri: item.url }} style={styles.inlineImage} resizeMode="contain" />
          )}
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
        {/* If this is an image we already displayed it inline — hide Preview/Download actions.
            Otherwise keep the existing preview / download controls. */}
        {/* Determine special handling: images already inlined, PDFs should be download-only (no Preview) */}
          {(() => {
          const fileName = String(item.fileName || item.name || '').toLowerCase();
          const fileType = String(item.fileType || '').toLowerCase();
          const isImage = fileType.startsWith('image') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);
          const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');

          // Images were already rendered inline — nothing to show here
          if (isImage) return null;

          // PDF: show a download-only file row (clicking it downloads the file)
          if (isPdf) {
            return (
              <TouchableOpacity activeOpacity={0.9} onPress={() => handleDownload(item)} style={styles.pdfBox}>
                <View style={styles.pdfBoxInner}>
                  <MaterialCommunityIcons name="file-pdf-box" size={18} color={colors.text} style={{ marginRight: 10 }} />
                  <Text style={styles.pdfBoxText}>{item.fileName || item.name || 'document.pdf'}</Text>
                </View>
              </TouchableOpacity>
            );
          }

          // Otherwise render exactly like the PDF row: single download action, compact style
          return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleDownload(item)} style={styles.pdfBox}>
              <View style={styles.pdfBoxInner}>
                <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.text} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>{item.fileName || item.name || 'document'}</Text>
                  {item.uploadedAt ? <Text style={[styles.attachmentMeta, { marginTop: 2 }]}>Uploaded {new Date(item.uploadedAt).toLocaleDateString()}</Text> : null}
                </View>
                <MaterialCommunityIcons name="download" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })()}
        {isAdmin && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {(item.fileData || item.contentBase64) ? (
              <Button mode="text" onPress={() => handleMigrateToStorage(item)} color={colors.danger} style={{ marginRight: 6 }}>Migrate</Button>
            ) : null}
            <IconButton icon="delete" onPress={() => handleDelete(item)} />
          </View>
        )}
      </Card.Actions>
    </Card>
  );

    };
  // group templates: PDFs should live in their own stacked section

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

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" />

      {/* big decorative header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerInner}>
          <View style={styles.headerTextWrap}>
            <View style={styles.headerRowTop}>
              <View style={styles.headerBadge}><Text style={styles.headerBadgeText}>RESOURCES</Text></View>
            </View>
            <Text style={styles.title}>Forms & resources</Text>
          </View>

          {/* decorative accent circle */}
          <View style={styles.headerAccent} />
        </View>
      </View>

      {/* main content area */}
      <ScrollView style={styles.contentWrap} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {loading ? (
          <ActivityIndicator animating size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : templates.length === 0 ? (
          <View style={styles.emptyStateWrap}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color={colors.textSubtle} />
            </View>

            <Text style={styles.emptyTitle}>No templates yet</Text>
            <Text style={styles.emptySubtitle}>Ask your admin to upload the latest requirement forms to the "helpDeskFiles" collection in Firestore.</Text>

            <View style={styles.infoCallout}>
              <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={colors.text} style={{ marginRight: 10 }} />
              <Text style={styles.infoCalloutText}>Admins: upload templates to Cloud Storage and set the Firestore document's `path` or `url` (example: helpDeskFiles/&lt;uId&gt;/file.pdf). The client fetches assets only from Cloud Storage.</Text>
            </View>

            {isAdmin && (
              <Button mode="outlined" icon="upload" onPress={() => setShowUploadModal(true)} color={colors.primary} style={{ marginTop: 18 }}>Upload template</Button>
            )}
          </View>
        ) : (
          <>
            {/* My generated documents (only visible for the signed-in user) */}
            {myDocs.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.pdfSectionTitle}>My Documents</Text>
                <Card style={styles.requirementCard}>
                  <View style={styles.requirementHeader}>
                    <Text style={styles.requirementTitle}>Generated</Text>
                    <TouchableOpacity onPress={handleRegenerateChecklist} activeOpacity={0.85} style={styles.regenBtn}>
                      <MaterialCommunityIcons name="refresh" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.regenBtnText}>Regenerate</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                    {myDocs.map(att => (
                      <TouchableOpacity key={att.id} activeOpacity={0.9} onPress={() => handleDownload(att)} style={styles.attachmentRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View style={[styles.attachmentIconWrap, { backgroundColor: colors.primary }]}>
                            <MaterialCommunityIcons name="file-pdf-box" size={18} color={colors.onPrimary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.attachmentText}>{att.fileName || att.name || 'OJT Completion Checklist'}</Text>
                            {att.uploadedAt ? <Text style={styles.attachmentMeta}>Generated {new Date(att.uploadedAt).toLocaleDateString()}</Text> : null}
                          </View>
                        </View>
                        <MaterialCommunityIcons name="download" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card>
              </View>
            )}

            {/* 1. Render all image templates first */}
            {imageTemplates.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                {imageTemplates.map(item => (
                  <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>
                ))}
              </View>
            )}

            {/* 2. Render grouped document section next (PDFs + DOCs stacked together) */}
            {groupedDocs.length > 0 && (
              <View style={styles.pdfSection}>
                {groupedDocs.map((g, idx) => (
                  <Card style={styles.requirementCard} key={idx}>
                    <View style={styles.requirementHeader}>
                      <Text style={styles.requirementTitle}>File Requirement</Text>
                    </View>
                    <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                      {g.description ? <Text style={styles.requirementDescription}>{g.description}</Text> : null}
                      {g.dueDate ? <Text style={styles.requirementDue}>Due: {formatDate(g.dueDate)}</Text> : null}
                      {/* attachments stacked inside the card */}
                      <View style={{ marginTop: 10 }}>
                        {g.items.map(att => (
                          <TouchableOpacity key={att.id} activeOpacity={0.9} onPress={() => handleDownload(att)} style={styles.attachmentRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <View style={styles.attachmentIconWrap}>
                                  {(() => {
                                    // choose a suitable icon based on file type/extension
                                    const fname = String(att.fileName || att.name || '').toLowerCase();
                                    const ftype = String(att.fileType || att.contentType || '').toLowerCase();
                                    if (ftype === 'application/pdf' || fname.endsWith('.pdf')) return <MaterialCommunityIcons name="file-pdf-box" size={18} color={colors.onPrimary} />;
                                    return <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.onPrimary} />;
                                  })()}
                                </View>
                              <View style={{ flex: 1 }}>
                                <Text numberOfLines={1} ellipsizeMode='tail' style={styles.attachmentText}>{att.fileName || att.name || 'document.pdf'}</Text>
                                {att.uploadedAt ? <Text style={styles.attachmentMeta}>Uploaded {new Date(att.uploadedAt).toLocaleDateString()}</Text> : null}
                              </View>
                            </View>
                            <MaterialCommunityIcons name="download" size={18} color={colors.textMuted} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* 3. No further 'other' documents — all non-image docs are grouped above */}
          </>
        )}
      </ScrollView>
      {/* upload modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent onRequestClose={() => setShowUploadModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <View style={{ backgroundColor: colors.surface, padding: 18, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>Upload new template</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 12 }}>Give it a name and choose the file to upload (PDF, DOCX, images).</Text>

            <TextInput placeholder="Template name" value={title} onChangeText={setTitle} style={{ marginBottom: 8 }} />
            <TextInput placeholder="Short description (optional)" value={description} onChangeText={setDescription} style={{ marginBottom: 6 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Button mode="outlined" onPress={async () => {
                try {
                  const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], copyToCacheDirectory: true });
                  if (result.canceled) return;
                  const f: any = result.assets && result.assets.length > 0 ? result.assets[0] : (result as any);
                  setSelectedFile(f);
                } catch (e) {
                  console.error('pick failed', e);
                  Alert.alert('Error', 'Failed to pick file');
                }
              }} color={colors.primary}>Choose file</Button>

              <Text style={{ marginLeft: 12, color: colors.text, flex: 1 }}>{selectedFile ? (selectedFile.name || selectedFile.fileName) : 'No file selected'}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button mode="outlined" onPress={() => { setShowUploadModal(false); setSelectedFile(null); }} >Cancel</Button>
              <Button mode="contained" onPress={async () => {
                if (!selectedFile) return Alert.alert('No file', 'Please choose a file to upload.');
                if (!title) return Alert.alert('Missing title', 'Please enter a template name.');

                setUploading(true);
                try {
                  const uri = selectedFile.uri;
                  const name = selectedFile.name || selectedFile.fileName || `template_${Date.now()}`;

                  try {
                    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                    const estimatedBytes = Math.ceil((base64.length * 3) / 4);
                  // Always upload to Storage (do not embed base64 into Firestore)
                  } catch (e) { console.warn('cannot store base64, continue to storage', e); }

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

                  Alert.alert('Success', 'Template uploaded to Storage.');
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setTitle(''); setDescription('');
                  await loadTemplates();
                } catch (err) {
                  console.error('Upload via modal failed', err);
                  Alert.alert('Error', 'Upload failed');
                } finally { setUploading(false); }
              }} loading={uploading} color={colors.primary}>Upload</Button>
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

      {/* Full-screen image modal (mobile) */}
      <Modal visible={showImageModal && !!imageModalUri} animationType="fade" transparent={false} onRequestClose={() => setShowImageModal(false)}>
        <View style={styles.fullImageWrap}>
          <TouchableOpacity style={styles.fullImageClose} onPress={() => setShowImageModal(false)}>
            <Text style={styles.fullImageCloseText}>Close</Text>
          </TouchableOpacity>
          {imageModalUri ? (
            <Image source={{ uri: imageModalUri as string }} style={styles.fullImage} resizeMode="contain" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>No image</Text></View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },

  /* header */
  headerWrap: { backgroundColor: 'transparent' },
  headerInner: {
    height: 160,
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 70, // smaller curve
    paddingLeft: 22, // less left padding
    paddingRight: 12,
    paddingTop: 36, // less top padding
    justifyContent: 'center',
    overflow: 'visible',
  },
  headerTextWrap: { maxWidth: '70%', zIndex: 2 },
  headerTag: { color: colors.onPrimaryMuted, fontSize: 12, letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.onPrimary, lineHeight: 30 },
  subtitle: { color: colors.onPrimaryMuted, marginTop: 8, fontSize: 14, lineHeight: 20, maxWidth: '90%' },

  /* content */
  contentWrap: { flex: 1, paddingTop: spacing.xl },

  emptyStateWrap: { alignItems: 'center', paddingHorizontal: 36, marginTop: 18 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: 18, backgroundColor: colors.surface },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 6, color: colors.text },
  emptySubtitle: { color: colors.textMuted, textAlign: 'center', marginTop: 8, fontSize: 14 },

  infoCallout: { marginTop: 22, marginHorizontal: 18, padding: 14, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surfaceAlt, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  infoCalloutText: { color: colors.text, flex: 1, fontSize: 13 },

  /* upload / list */
  uploadBox: { padding: 16, backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 6, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  input: { marginBottom: 8, backgroundColor: colors.surface },
  card: { marginVertical: 8, marginHorizontal: 0, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  imageOnlyCard: { padding: 0, marginVertical: 8, marginHorizontal: 0, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  inlineImageWrap: { position: 'relative', width: '100%' },
  imageAdminOverlay: { position: 'absolute', right: 10, top: 10, zIndex: 20 },
  imageDeleteBtn: { backgroundColor: colors.overlay, padding: 6, borderRadius: 18 },
  cardActions: { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12 },
  metaText: { color: colors.textMuted, marginTop: 6 },
  inlineImage: { width: '100%', height: 280, borderRadius: radii.lg, marginTop: 12, backgroundColor: colors.surface },
  /* Full-screen image viewer */
  fullImageWrap: { flex: 1, backgroundColor: colors.black, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%' },
  fullImageClose: { position: 'absolute', top: 44, right: 16, zIndex: 10, padding: 8, backgroundColor: colors.overlay, borderRadius: 8 },
  fullImageCloseText: { color: colors.onPrimary, fontSize: 14 },
  /* PDF download row */
  pdfBox: { width: '100%', borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: 14, marginTop: 10, backgroundColor: colors.surface },
  pdfBoxInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pdfBoxText: { color: colors.text, fontWeight: '600' },
  pdfBoxSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  pdfSection: { marginHorizontal: 16, marginTop: 8 },
  pdfSectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  headerRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerBadge: { backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.md },
  headerBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  headerAccent: { position: 'absolute', right: -16, top: -16, width: 100, height: 100, backgroundColor: colors.primarySoft, borderRadius: 60, transform: [{ rotate: '16deg' }], zIndex: 1 },
  /* requirement grouped card */
  requirementCard: { marginVertical: 8, borderRadius: 12, overflow: 'hidden' },
  requirementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12 },
  requirementTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  requirementDescription: { color: colors.textMuted, marginTop: 6 },
  requirementDue: { color: colors.textMuted, marginTop: 6, fontSize: 13 },
  /* status badge removed */
  attachmentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, marginBottom: 8, backgroundColor: colors.surface },
  attachmentIconWrap: { width: 36, height: 36, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  attachmentMeta: { color: colors.textSubtle, fontSize: 12, marginTop: 2 },
  attachmentText: { color: colors.text, fontWeight: '600' },
  regenBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.md, backgroundColor: colors.primarySoft },
  regenBtnText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});

export default HelpDeskScreen;
