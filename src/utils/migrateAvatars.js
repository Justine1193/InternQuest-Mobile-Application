/**
 * Migration utility to move avatarBase64 from Firestore to Firebase Storage
 */

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64, mimeType = 'image/jpeg') {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Detect image MIME type from base64 string
 */
function detectMimeType(base64) {
  if (base64.startsWith('data:image/')) {
    const match = base64.match(/data:image\/(\w+);base64,/);
    if (match) {
      return `image/${match[1]}`;
    }
  }
  // Check if it's PNG by looking at base64 signature
  if (base64.startsWith('/9j/') || base64.startsWith('iVBORw0KGgo')) {
    return base64.startsWith('iVBORw0KGgo') ? 'image/png' : 'image/jpeg';
  }
  return 'image/jpeg';
}

/**
 * Migrate all avatars from Firestore to Storage
 */
export async function migrateAllAvatars() {
  try {
    console.log('🚀 Starting avatar migration...');
    
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter users with avatarBase64
    const usersWithAvatars = users.filter(user => user.avatarBase64 || user.avatarbase64);
    
    console.log(`Found ${usersWithAvatars.length} users with avatarBase64`);
    
    if (usersWithAvatars.length === 0) {
      console.log('✅ No avatars to migrate');
      return { success: true, migrated: 0, failed: 0 };
    }
    
    const results = [];
    
    // Migrate each user's avatar
    for (const user of usersWithAvatars) {
      const base64Data = user.avatarBase64 || user.avatarbase64;
      
      try {
        console.log(`Migrating avatar for user: ${user.id}`);
        
        // Detect MIME type
        const mimeType = detectMimeType(base64Data);
        const extension = mimeType.split('/')[1] || 'jpg';
        const fileName = extension === 'png' ? 'profile.png' : 'profile.jpg';
        const storagePath = `profilePictures/${user.id}/${fileName}`;
        
        // Convert base64 to blob
        const blob = base64ToBlob(base64Data, mimeType);
        
        // Upload to Storage
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, blob, { contentType: mimeType });
        
        // Get download URL
        const downloadUrl = await getDownloadURL(storageRef);
        
        // Update user document - remove avatarBase64, add profilePictureUrl
        const userRef = doc(db, 'users', user.id);
        const updateData = {
          profilePictureUrl: downloadUrl
        };
        
        // Remove both possible field names
        if (user.avatarBase64) {
          updateData.avatarBase64 = null;
        }
        if (user.avatarbase64) {
          updateData.avatarbase64 = null;
        }
        
        await updateDoc(userRef, updateData);
        
        console.log(`✅ Successfully migrated avatar for user: ${user.id}`);
        results.push({ success: true, userId: user.id, downloadUrl });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Failed to migrate avatar for user ${user.id}:`, error);
        results.push({ success: false, userId: user.id, error: error.message });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    return {
      success: true,
      total: usersWithAvatars.length,
      migrated: successful,
      failed: failed,
      results: results
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}

