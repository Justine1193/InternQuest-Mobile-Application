import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Linking, StatusBar, Modal } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Card, Button, ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, firestore, storage } from '../firebase/config';
import { collection, addDoc, query, orderBy, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SecurityUtils } from '../services/security';

const FIRESTORE_MAX_BYTES = 700 * 1024; // ~700KB

// Optional: if you deploy the getAdminFile cloud function, set it here so Firestore-stored files
// can be streamed securely: https://<region>-<project>.cloudfunctions.net/getAdminFile?docId=<DOC_ID>
const ADMIN_FILE_FUNCTION_BASE_URL = 'https://<region>-<project>.cloudfunctions.net/getAdminFile';

type TemplateDoc = {
  id: string;
  name: string;
  description?: string;
  uploaderId?: string;
  uploadedAt?: string;
  storedInFirestore?: boolean;
  contentBase64?: string;
  contentType?: string;
  path?: string;
  url?: string;
};

const HelpDeskScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateDoc[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const admin = await SecurityUtils.isAdmin();
      setIsAdmin(admin);
      await loadTemplates();
    })();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const q = query(collection(firestore, 'helpdesk_templates'), orderBy('uploadedAt', 'desc'));
      const snap = await getDocs(q);
      const docs: TemplateDoc[] = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
      setTemplates(docs);
    } catch (err) {
      console.error('Failed to load templates:', err);
      Alert.alert('Error', 'Failed to load templates.');
    } finally {
      setLoading(false);
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
    const remotePath = `helpdesk_templates/${auth.currentUser?.uid}/${Date.now()}_${name}`;
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

      // Try storing as base64 into firestore for small files
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const estimatedBytes = Math.ceil((base64.length * 3) / 4);

        if (estimatedBytes <= FIRESTORE_MAX_BYTES) {
          const docRef = await addDoc(collection(firestore, 'helpdesk_templates'), {
            name: title,
            description,
            uploaderId: auth.currentUser?.uid,
            uploadedAt: new Date().toISOString(),
            storedInFirestore: true,
            contentBase64: base64,
            contentType: f.mimeType || f.type || 'application/octet-stream',
          });

          setTitle(''); setDescription('');
          Alert.alert('Success', 'Template saved to Firestore.');
          await loadTemplates();
          return;
        }
      } catch (e) {
        // ignore - fall back to storage
        console.warn('Could not store in Firestore, falling back to Storage', e);
      }

      // fallback: store in Storage
      try {
        const fileMeta = await uploadToStorage(uri, name, f);
        await addDoc(collection(firestore, 'helpdesk_templates'), {
          name: title,
          description,
          uploaderId: auth.currentUser?.uid,
          uploadedAt: fileMeta.uploadedAt,
          storedInFirestore: false,
          path: fileMeta.path,
          url: fileMeta.url,
          contentType: fileMeta.contentType,
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
      if (t.url) {
        await Linking.openURL(t.url);
        return;
      }

      // If content stored in Firestore (base64) — use the cloud function if configured
      if (t.id && ADMIN_FILE_FUNCTION_BASE_URL.includes('cloudfunctions')) {
        const openUrl = `${ADMIN_FILE_FUNCTION_BASE_URL}?docId=${t.id}`;
        await Linking.openURL(openUrl);
        return;
      }

      if (t.storedInFirestore && t.contentBase64) {
        // Use data URL directly
        const dataUrl = `data:${t.contentType || 'application/octet-stream'};base64,${t.contentBase64}`;
        await Linking.openURL(dataUrl);
        return;
      }

      Alert.alert('Unavailable', 'No downloadable file found for this template.');
    } catch (err) {
      console.error('Open URL failed', err);
      Alert.alert('Error', 'Failed to open the file.');
    }
  };

  const handlePreview = async (t: TemplateDoc) => {
    try {
      // Prefer cloud function streaming if it's configured
      if (t.id && ADMIN_FILE_FUNCTION_BASE_URL.includes('cloudfunctions')) {
        const openUrl = `${ADMIN_FILE_FUNCTION_BASE_URL}?docId=${t.id}`;
        await WebBrowser.openBrowserAsync(openUrl);
        return;
      }

      // If public storage URL -> open in WebBrowser
      if (t.url) {
        await WebBrowser.openBrowserAsync(t.url);
        return;
      }

      // If stored in Firestore as base64, open data url in browser
      if (t.storedInFirestore && t.contentBase64) {
        const dataUrl = `data:${t.contentType || 'application/octet-stream'};base64,${t.contentBase64}`;
        await WebBrowser.openBrowserAsync(dataUrl);
        return;
      }

      Alert.alert('Preview unavailable', 'This template cannot be previewed in the app. You can download it to view externally.');
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
          if (t.path) {
            try {
              const sRef = storageRef(storage, t.path);
              const storageModule: any = await import('firebase/storage');
              const deleteObjectFn = storageModule.deleteObject;
              if (deleteObjectFn) await deleteObjectFn(sRef);
            } catch (e) { console.warn('Failed to delete storage object', e); }
          }

          await deleteDoc(doc(firestore, 'helpdesk_templates', t.id));
          Alert.alert('Deleted', 'Template removed.');
          await loadTemplates();
        } catch (err) {
          console.error('Delete failed', err);
          Alert.alert('Error', 'Failed to delete template.');
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: TemplateDoc }) => (
    <Card style={styles.card}>
      <Card.Title title={item.name} subtitle={item.description} titleNumberOfLines={2} subtitleNumberOfLines={2} />
      <Card.Content>
        <Text style={styles.metaText}>Uploaded: {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : '—'}</Text>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button mode="outlined" onPress={() => handlePreview(item)} color="#6366F1">Preview</Button>
        </View>
        <Button mode="contained" onPress={() => handleDownload(item)} color="#6366F1">Download</Button>
        {isAdmin && (
          <View style={{ flexDirection: 'row' }}>
            <IconButton icon="delete" onPress={() => handleDelete(item)} />
          </View>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" />

      {/* big decorative header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerInner}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTag}>HELP DESK</Text>
            <Text style={styles.title}>All your OJT forms in one sleek desk.</Text>
            <Text style={styles.subtitle}>Browse, preview, and download the latest Memorandum of Agreement, requirement checklists, and tracker templates curated by the admin team.</Text>
          </View>
        </View>
      </View>

      {/* main content area */}
      <View style={styles.contentWrap}>
        {loading ? (
          <ActivityIndicator animating size="large" color="#6366F1" style={{ marginTop: 20 }} />
        ) : templates.length === 0 ? (
          <View style={styles.emptyStateWrap}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color="#8b93a7" />
            </View>

            <Text style={styles.emptyTitle}>No templates yet</Text>
            <Text style={styles.emptySubtitle}>Ask your admin to upload the latest requirement forms to the "helpDeskTemplates" collection in Firestore.</Text>

            <View style={styles.infoCallout}>
              <MaterialCommunityIcons name="cloud-upload-outline" size={20} color="#0b2b34" style={{ marginRight: 10 }} />
              <Text style={styles.infoCalloutText}>Admins can manage these templates by adding files to Firestore → helpDeskTemplates with fields: title, description, category, fileUrl, updatedAt.</Text>
            </View>

            {isAdmin && (
              <Button mode="outlined" icon="upload" onPress={() => setShowUploadModal(true)} color="#6366F1" style={{ marginTop: 18 }}>Upload template</Button>
            )}
          </View>
        ) : (
          <FlatList data={templates} keyExtractor={t => t.id} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} renderItem={renderItem} />
        )}
      </View>
      {/* upload modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent onRequestClose={() => setShowUploadModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: '#fff', padding: 18, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>Upload new template</Text>
            <Text style={{ color: '#666', marginBottom: 12 }}>Give it a name and choose the file to upload (PDF, DOCX, images).</Text>

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
              }} color="#6366F1">Choose file</Button>

              <Text style={{ marginLeft: 12, color: '#444', flex: 1 }}>{selectedFile ? (selectedFile.name || selectedFile.fileName) : 'No file selected'}</Text>
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
                    if (estimatedBytes <= FIRESTORE_MAX_BYTES) {
                      await addDoc(collection(firestore, 'helpdesk_templates'), {
                        name: title,
                        description,
                        uploaderId: auth.currentUser?.uid,
                        uploadedAt: new Date().toISOString(),
                        storedInFirestore: true,
                        contentBase64: base64,
                        contentType: selectedFile.mimeType || selectedFile.type || 'application/octet-stream',
                      });

                      Alert.alert('Success', 'Template saved to Firestore.');
                      setShowUploadModal(false);
                      setSelectedFile(null);
                      setTitle(''); setDescription('');
                      await loadTemplates();
                      return;
                    }
                  } catch (e) { console.warn('cannot store base64, continue to storage', e); }

                  const meta = await uploadToStorage(uri, name, selectedFile);
                  await addDoc(collection(firestore, 'helpdesk_templates'), {
                    name: title,
                    description,
                    uploaderId: auth.currentUser?.uid,
                    uploadedAt: meta.uploadedAt,
                    storedInFirestore: false,
                    path: meta.path,
                    url: meta.url,
                    contentType: meta.contentType,
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
              }} loading={uploading} color="#6366F1">Upload</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f2f6ff' },

  /* header */
  headerWrap: { backgroundColor: 'transparent' },
  headerInner: {
    height: 160,
    backgroundColor: '#0b2545',
    borderBottomRightRadius: 44,
    paddingHorizontal: 22,
    paddingTop: 26,
    justifyContent: 'center',
  },
  headerTextWrap: { maxWidth: '84%' },
  headerTag: { color: '#c9d6ff', fontSize: 12, letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  subtitle: { color: '#d7e0ff', marginTop: 10, fontSize: 13, lineHeight: 18 },

  /* content */
  contentWrap: { flex: 1, paddingTop: 28 },

  emptyStateWrap: { alignItems: 'center', paddingHorizontal: 36, marginTop: 18 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#e6e9f5', justifyContent: 'center', alignItems: 'center', marginBottom: 18, backgroundColor: '#fff' },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 6, color: '#222' },
  emptySubtitle: { color: '#68707d', textAlign: 'center', marginTop: 8, fontSize: 14 },

  infoCallout: { marginTop: 22, marginHorizontal: 18, padding: 14, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#eaf9fb', borderRadius: 8 },
  infoCalloutText: { color: '#0b2b34', flex: 1, fontSize: 13 },

  /* upload / list */
  uploadBox: { padding: 16, backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 6, borderRadius: 12, elevation: 2 },
  input: { marginBottom: 8, backgroundColor: '#fff' },
  card: { marginVertical: 8, marginHorizontal: 0, borderRadius: 12, overflow: 'hidden' },
  cardActions: { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12 },
  metaText: { color: '#666', marginTop: 6 },
});

export default HelpDeskScreen;
