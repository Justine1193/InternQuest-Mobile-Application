import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ScrollView,
  Image,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { Swipeable } from 'react-native-gesture-handler';
import { auth, firestore } from '../firebase/config';
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc, updateDoc, where, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SecurityUtils } from '../services/security';
import { colors, radii, shadows } from '../ui/theme';
import { Screen } from '../ui/components/Screen';
import { useNotificationCount } from '../context/NotificationCountContext';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Notifications'>;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  action?: string;
  ts?: number;
  imageUrl?: string;
  image?: string;
  images?: string[];
  imageUrls?: string[];
  raw?: any;
  _rawData?: any;
};

type PendingApplicationItem = {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  appliedAt?: string;
  applicantName?: string;
  applicantEmail?: string;
};

// Visual priority for accent bar and icons
type Priority = 'urgent' | 'required' | 'info' | 'success';
type IconType = 'document' | 'report' | 'info' | 'briefcase';

const ACCENT = {
  urgent: colors.danger,
  required: colors.warning,
  info: colors.info,
  success: colors.success,
} as const;

/** Parses raw reminder text into scannable title, subtext, and action. Removes "Reminder:" prefix. */
function parseReminderDisplay(
  text: string,
  index: number
): { id: string; title: string; subtext: string; actionHint: string; priority: Priority; iconType: IconType } | null {
  const trimmed = text.replace(/^Reminder:\s*/i, '').trim();
  if (/upload your\s+.+\.?$/i.test(trimmed)) {
    const match = trimmed.match(/upload your\s+(.+?)\.?$/i);
    const rawTitle = match ? match[1].trim() : trimmed;
    const title = rawTitle.endsWith('.') ? rawTitle.slice(0, -1) : rawTitle;
    return {
      id: `reminder-doc-${index}-${title.slice(0, 20)}`,
      title,
      subtext: `Please upload your "${title}" to proceed with your internship application.`,
      actionHint: 'Upload now →',
      priority: 'required',
      iconType: 'document',
    };
  }
  if (/weekly\s+accomplishment\s+report/i.test(trimmed)) {
    return {
      id: `reminder-report-${index}`,
      title: 'Weekly accomplishment report',
      subtext: 'Due by end of week',
      actionHint: 'Submit now →',
      priority: 'required',
      iconType: 'report',
    };
  }
  return null;
}

/** Normalize server notification to title + subtext + optional action hint. */
function notificationToDisplay(notif: NotificationItem): {
  id: string;
  title: string;
  subtext: string;
  actionHint: string | null;
  priority: Priority;
  iconType: IconType;
  time: string;
  raw: NotificationItem;
} {
  const actionHint = notif.action ? `${notif.action} →` : null;
  
  // Detect if this is a rejection notification
  const titleLower = (notif.title || '').toLowerCase();
  const descLower = (notif.description || '').toLowerCase();
  const isRejection = titleLower.includes('rejected') || 
                      titleLower.includes('rejection') ||
                      descLower.includes('rejected') || 
                      descLower.includes('rejection') ||
                      descLower.includes('denied') ||
                      titleLower.includes('denied');
  
  // Detect if this is an approval notification
  const isApproval = titleLower.includes('approved') || 
                     titleLower.includes('approval') ||
                     descLower.includes('approved') || 
                     descLower.includes('approval') ||
                     titleLower.includes('accepted') ||
                     descLower.includes('accepted');
  
  // Detect if it's about a requirement/document
  const isRequirementRelated = titleLower.includes('requirement') ||
                               titleLower.includes('document') ||
                               descLower.includes('requirement') ||
                               descLower.includes('document') ||
                               titleLower.includes('upload') ||
                               descLower.includes('upload');
  
  // Extract requirement/document name from title or description
  const extractRequirementName = (): string | null => {
    const fullText = `${notif.title || ''} ${notif.description || ''}`;
    
    // Common requirement names to look for (ordered by specificity)
    const requirementPatterns: Array<{ pattern: RegExp; name: string }> = [
      { pattern: /(?:proof\s+of\s+enrollment\s*\(?\s*com\s*\)?|certificate\s+of\s+matriculation)/i, name: 'COM' },
      { pattern: /proof\s+of\s+insurance/i, name: 'Proof of Insurance' },
      { pattern: /(?:parental\s+consent|parent\/guardian\s+consent)/i, name: 'Parental Consent' },
      { pattern: /(?:moa|memorandum\s+of\s+agreement)/i, name: 'MOA' },
      { pattern: /(?:ojt\s+orientation|orientation\s+certificate)/i, name: 'OJT Orientation' },
      { pattern: /waiver(?:\s+form)?/i, name: 'Waiver' },
      { pattern: /(?:medical\s+clearance|medical\s+certificate)/i, name: 'Medical Clearance' },
      { pattern: /(?:resume|curriculum\s+vitae|cv)/i, name: 'Resume' },
      { pattern: /application(?:\s+form)?/i, name: 'Application Form' },
      { pattern: /(?:endorsement\s+letter|endorsement)/i, name: 'Endorsement Letter' },
      { pattern: /clearance(?:\s+form)?/i, name: 'Clearance Form' },
    ];
    
    // Try exact matches first
    for (const { pattern, name } of requirementPatterns) {
      if (pattern.test(fullText)) {
        return name;
      }
    }
    
    // Try to extract from quoted text: "requirement 'COM'" or "document 'Proof of Insurance'"
    const quotedMatch = fullText.match(/(?:requirement|document|file)\s+["']([^"']+)["']/i);
    if (quotedMatch && quotedMatch[1]) {
      const extracted = quotedMatch[1].trim();
      // Capitalize properly (handle acronyms)
      return extracted.split(/\s+/).map(word => {
        const upper = word.toUpperCase();
        // If it's a common acronym, keep it uppercase
        if (['COM', 'MOA', 'OJT', 'CV'].includes(upper)) {
          return upper;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    }
    
    // Try to extract requirement name before "has been rejected/approved"
    const statusMatch = fullText.match(/([^.!?]+?)\s+has\s+been\s+(?:rejected|approved|denied|accepted)/i);
    if (statusMatch && statusMatch[1]) {
      let name = statusMatch[1].trim();
      // Remove "your" prefix if present
      name = name.replace(/^your\s+/i, '');
      // Capitalize properly
      return name.split(/\s+/).map(word => {
        const upper = word.toUpperCase();
        if (['COM', 'MOA', 'OJT', 'CV'].includes(upper)) {
          return upper;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    }
    
    // Fallback: try to extract from "requirement/document/file [name]"
    const fallbackMatch = fullText.match(/(?:requirement|document|file)\s+([A-Za-z][^.!?]*?)(?:\s+has\s+been|\s+is|$)/i);
    if (fallbackMatch && fallbackMatch[1]) {
      let name = fallbackMatch[1].trim();
      name = name.replace(/^your\s+/i, '');
      return name.split(/\s+/).map(word => {
        const upper = word.toUpperCase();
        if (['COM', 'MOA', 'OJT', 'CV'].includes(upper)) {
          return upper;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    }
    
    return null;
  };
  
  // Generate improved title based on notification type
  let displayTitle = notif.title || 'Notification';
  
  if (isRejection || isApproval) {
    const requirementName = extractRequirementName();
    if (requirementName) {
      if (isRejection) {
        displayTitle = `Your ${requirementName} has been rejected`;
      } else if (isApproval) {
        displayTitle = `Your ${requirementName} has been approved`;
      }
    } else {
      // Fallback: improve generic rejection/approval messages
      if (isRejection) {
        displayTitle = 'Your document has been rejected';
      } else if (isApproval) {
        displayTitle = 'Your document has been approved';
      }
    }
  }
  
  // Set priority: urgent (red) for rejections, required (orange) for requirement reminders, info (blue) for others
  let priority: Priority = 'info';
  let iconType: IconType = 'info';
  
  if (isRejection) {
    priority = 'urgent'; // Red accent bar
    iconType = 'document'; // Document icon for requirement rejections
  } else if (isApproval) {
    priority = 'success'; // Green accent bar for approvals
    iconType = 'document';
  } else if (isRequirementRelated) {
    priority = 'required'; // Orange accent bar
    iconType = 'document';
  }
  
  return {
    id: notif.id,
    title: displayTitle,
    subtext: notif.description || '',
    actionHint,
    priority,
    iconType,
    time: notif.time,
    raw: notif,
  };
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { setNotificationCount } = useNotificationCount();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingApplications, setPendingApplications] = useState<PendingApplicationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  /** Filter: All | Messages (server notifications) | Requirements (upload docs) | Reports (weekly report) */
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'messages' | 'requirements' | 'reports'>('all');
  
  // Custom alert modal state
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }>;
  } | null>(null);

  // Animation for clear button
  const clearButtonScale = useRef(new Animated.Value(1)).current;
  const clearButtonOpacity = useRef(new Animated.Value(1)).current;

  // Ensure arrays are always arrays (defensive programming)
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeReminders = Array.isArray(reminders) ? reminders : [];
  const safePendingApplications = Array.isArray(pendingApplications) ? pendingApplications : [];

  // Custom alert function
  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }>,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) => {
    setAlertConfig({ title, message, type, buttons });
    setAlertModalVisible(true);
  };

  const fetchPendingApplications = async () => {
    try {
      const applicationsRef = collection(firestore, 'applications');
      const pendingQuery = query(applicationsRef, where('status', '==', 'pending'), orderBy('appliedAt', 'desc'));
      const snapshot = await getDocs(pendingQuery);
      const items: PendingApplicationItem[] = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        const appliedAtDate = data.appliedAt?.toDate ? data.appliedAt.toDate() : (data.appliedAt ? new Date(data.appliedAt) : null);
        return {
          id: docSnap.id,
          userId: data.userId || '',
          companyId: data.companyId || '',
          companyName: data.companyName || 'Unknown Company',
          appliedAt: appliedAtDate ? appliedAtDate.toLocaleString() : undefined,
          applicantName: data.userProfile?.name,
          applicantEmail: data.userProfile?.email,
        };
      });
      setPendingApplications(items);
    } catch (error) {
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastPendingApplicationsFetchError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
        }
      } catch (diagErr) {
        // Silent error handling
      }
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const applicationRef = doc(firestore, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: auth.currentUser?.uid || null,
      });
      await fetchPendingApplications();
    } catch (err) {
      Alert.alert('Error', 'Could not approve application. Please try again.');
    }
  };

  const handleDenyApplication = async (applicationId: string) => {
    try {
      const applicationRef = doc(firestore, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: auth.currentUser?.uid || null,
      });
      await fetchPendingApplications();
    } catch (err) {
      Alert.alert('Error', 'Could not deny application. Please try again.');
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.firstName && data.lastName
            ? `${data.firstName} ${data.lastName}`
            : data.name || '');
        }
      } catch (error) {
        // Silent error handling
      }
    };
    fetchUserName();
    fetchReminders();
    fetchNotifications();
    (async () => {
      const admin = await SecurityUtils.isAdmin();
      setIsAdmin(admin);
      if (admin) {
        fetchPendingApplications();
      }
    })();

    // Set up real-time listener for notifications
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const notificationsRef = collection(firestore, 'notifications');
      
      // Listen to notifications where userId matches
      const unsubscribe1 = onSnapshot(
        query(notificationsRef, where('userId', '==', uid)),
        () => {
          fetchNotifications(); // Refetch to merge with other queries
        },
        () => {
          // Silent error handling
        }
      );

      // Listen to notifications where targetStudentId matches
      const unsubscribe2 = onSnapshot(
        query(notificationsRef, where('targetStudentId', '==', uid)),
        () => {
          fetchNotifications(); // Refetch to merge with other queries
        },
        () => {
          // Silent error handling
        }
      );

      // Listen to broadcast notifications (targetType="all")
      const unsubscribe3 = onSnapshot(
        query(notificationsRef, where('targetType', '==', 'all')),
        () => {
          fetchNotifications(); // Refetch to merge with other queries
        },
        () => {
          // Silent error handling
        }
      );

      return () => {
        unsubscribe1();
        unsubscribe2();
        unsubscribe3();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!auth.currentUser) {
      setInitialLoading(false);
      return;
    }
    try {
      const uid = auth.currentUser.uid;
      const notificationsRef = collection(firestore, 'notifications');
      
      // IMPORTANT: Support multiple notification targeting schemes:
      // 1. Personal: userId == uid OR targetStudentId == uid
      // 2. Broadcast: targetType == "all" (for all users)
      // We query all three and merge client-side.
      const [snapByUserId, snapByTargetStudentId, snapByTargetTypeAll] = await Promise.all([
        getDocs(query(notificationsRef, where('userId', '==', uid))),
        getDocs(query(notificationsRef, where('targetStudentId', '==', uid))),
        getDocs(query(notificationsRef, where('targetType', '==', 'all'))),
      ]);

      const byId = new Map<string, NotificationItem>();
      const addFromSnap = (snap: any) => {
        snap.docs.forEach((docSnap: any) => {
          const data = docSnap.data();
          
          const timestampObj = data.timestamp?.toDate
            ? data.timestamp.toDate()
            : (data.timestamp ? new Date(data.timestamp) : null);
          const ts = timestampObj ? timestampObj.getTime() : 0;

          // Use title if available, otherwise fall back to 'Notification'
          // Subject is not needed - use title directly
          const notificationTitle = data.title || 'Notification';
          // Message/description is the body content
          const notificationDescription = data.message || data.description || '';
          
          // Handle multiple images: support arrays (images, imageUrls) or single (imageUrl, image, imageURL)
          let imageUrls: string[] = [];
          
          // Check for array fields first
          if (Array.isArray(data.images) && data.images.length > 0) {
            imageUrls = data.images.filter((url: any) => {
              if (!url) return false;
              const urlStr = typeof url === 'string' ? url : (url.url || url.imageUrl || url);
              return urlStr && typeof urlStr === 'string' && urlStr.trim().length > 0;
            }).map((url: any) => typeof url === 'string' ? url : (url.url || url.imageUrl || url));
          } else if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
            imageUrls = data.imageUrls.filter((url: any) => url && typeof url === 'string');
          } else if (Array.isArray(data.attachments) && data.attachments.length > 0) {
            // Check attachments array
            imageUrls = data.attachments
              .map((att: any) => att.url || att.imageUrl || att.image || att)
              .filter((url: any) => url && typeof url === 'string');
          } else {
            // Single image fallback - check multiple field names
            const singleImage = data.imageUrl || data.image || data.imageURL || 
                               data.attachmentUrl || data.attachment || 
                               data.photo || data.photoUrl ||
                               data.fileUrl || data.downloadUrl || data.downloadURL;
            if (singleImage && typeof singleImage === 'string' && singleImage.trim().length > 0) {
              // Accept any string that looks like a URL or data URI
              if (singleImage.startsWith('http://') || singleImage.startsWith('https://') || 
                  singleImage.startsWith('data:') || singleImage.startsWith('file://') ||
                  singleImage.includes('/') || singleImage.includes('.')) {
                imageUrls = [singleImage];
              }
            }
          }
          
          // Also check if images are stored as objects with url property
          if (imageUrls.length === 0 && data.images && typeof data.images === 'object' && !Array.isArray(data.images)) {
            const imgObj = data.images;
            if (imgObj.url && typeof imgObj.url === 'string') {
              imageUrls = [imgObj.url];
            } else if (Array.isArray(imgObj.urls)) {
              imageUrls = imgObj.urls.filter((url: any) => url && typeof url === 'string');
            }
          }
          
          // Debug: log all data fields to help identify image field
          // Remove this after debugging if needed
          if (imageUrls.length === 0 && data && typeof data === 'object' && !Array.isArray(data)) {
            try {
              const dataKeys = Object.keys(data);
              if (dataKeys.some(key => key.toLowerCase().includes('image') || key.toLowerCase().includes('photo') || key.toLowerCase().includes('attach'))) {
                // Try to find any field that might contain image data
                dataKeys.forEach(key => {
                  try {
                    const lowerKey = key.toLowerCase();
                    if ((lowerKey.includes('image') || lowerKey.includes('photo') || lowerKey.includes('attach')) && data[key]) {
                      if (typeof data[key] === 'string' && data[key].trim().length > 0) {
                        imageUrls.push(data[key]);
                      } else if (Array.isArray(data[key])) {
                        imageUrls.push(...data[key].filter((item: any) => typeof item === 'string'));
                      }
                    }
                  } catch (e) {
                    // Silent error handling
                  }
                });
              }
            } catch (e) {
              // Silent error handling
            }
          }

          // Store notification with all image data preserved
          const notificationItem: NotificationItem = {
            id: docSnap.id,
            title: notificationTitle,
            description: notificationDescription,
            time: timestampObj ? timestampObj.toLocaleString() : (data.time || ''),
            action: data.action,
            ts,
            imageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined,
            images: imageUrls.length > 0 ? imageUrls : undefined,
            image: imageUrls.length > 0 ? imageUrls[0] : undefined,
          };
          
          // Preserve ALL raw Firestore data as a backup
          // This ensures we can access any field that might contain images
          const rawNotification = notificationItem as any;
          rawNotification._rawData = data; // Store complete raw data
          
          // Also preserve specific image-related fields
          if (data.images) rawNotification.rawImages = data.images;
          if (data.imageUrls) rawNotification.rawImageUrls = data.imageUrls;
          if (data.attachments) rawNotification.rawAttachments = data.attachments;
          if (data.imageUrl) rawNotification.rawImageUrl = data.imageUrl;
          if (data.image) rawNotification.rawImage = data.image;
          
          byId.set(docSnap.id, notificationItem);
        });
      };

      addFromSnap(snapByUserId);
      addFromSnap(snapByTargetStudentId);
      addFromSnap(snapByTargetTypeAll);

      const items: NotificationItem[] = Array.from(byId.values());

      // Newest first (best-effort).
      items.sort((a, b) => {
        return (b.ts || 0) - (a.ts || 0);
      });

      // Now filter out any notifications this user has hidden
      try {
        const hiddenSnap = await getDocs(collection(firestore, `users/${uid}/hiddenNotifications`));
        const hiddenIds = new Set(hiddenSnap.docs.map((d: any) => d.id));
        if (hiddenIds.size > 0) {
          const filtered = items.filter(i => !hiddenIds.has(i.id));
          setNotifications(filtered);
          setNotificationCount(filtered.length);
        } else {
          setNotifications(items);
          setNotificationCount(items.length);
        }
        setInitialLoading(false);
      } catch (e) {
        // If fetching hidden notifications fails, fall back to showing all notifications
        try {
          if (auth.currentUser) {
            // Persist a short diagnostic on the user doc so server-side logs can be correlated
            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastHiddenNotificationsFetchError: { time: new Date().toISOString(), message: String(e) } }, { merge: true });
          }
        } catch (diagErr) {
          // Silent error handling
        }
        setNotifications(items);
        setNotificationCount(items.length);
        setInitialLoading(false);
      }
    } catch (error) {
      try {
        if (auth.currentUser) {
          await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastNotificationsFetchError: { time: new Date().toISOString(), message: String(error) } }, { merge: true });
        }
      } catch (diagErr) {
        // Silent error handling
      }
      setInitialLoading(false);
    }
  }, []);

  const fetchReminders = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const reminderList: string[] = [];

    // Check requirements
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const requirements = data.requirements || [];
        requirements.forEach((req: any) => {
          if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
            reminderList.push(`Reminder: Please upload your ${req.title}.`);
          }
        });
      }
    } catch (e) {
      // ignore
    }

    // Check weekly report for current week
    try {
      const reportsCol = collection(firestore, `users/${userId}/weeklyReports`);
      const reportsSnap = await getDocs(reportsCol);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      let hasReport = false;
      reportsSnap.forEach((doc: any) => {
        const data: any = doc.data();
        const weekStart = new Date(data.weekStartDate);
        const weekEnd = new Date(data.weekEndDate);
        if (
          weekStart.getTime() === startOfWeek.getTime() &&
          weekEnd.getTime() === endOfWeek.getTime()
        ) {
          hasReport = true;
        }
      });
      if (!hasReport) {
        reminderList.push('Reminder: Don’t forget to submit your weekly accomplishment report!');
      }
    } catch (e) {
      // ignore
    }

    setReminders(reminderList);
  };

  const handleDelete = (id: string) => {
    // Hide for the current user only: add an entry under users/{uid}/hiddenNotifications/{notificationId}
    (async () => {
      if (!auth.currentUser) {
        // fallback to local-only removal while signed out
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        return;
      }

      try {
        const uid = auth.currentUser.uid;
        // create a doc where id == notification id so it's easy to check/remove
        await setDoc(doc(firestore, `users/${uid}/hiddenNotifications`, id), {
          hiddenAt: new Date().toISOString(),
        });

        // reflect change in UI
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        setNotificationCount((prev: number) => Math.max(0, prev - 1));
      } catch (err) {
        // Persist a diagnostic marker to the user's doc so we can inspect server-side
        try {
          if (auth.currentUser) {
            await setDoc(doc(firestore, 'users', auth.currentUser.uid), { lastNotificationsHideError: { time: new Date().toISOString(), message: String(err) } }, { merge: true });
          }
        } catch (diagErr) {
          // Silent error handling
        }
        // still remove locally so the user experience is responsive
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        setNotificationCount((prev: number) => Math.max(0, prev - 1));
      }
    })();
  };

  const handleClearAllMessages = () => {
    if (!auth.currentUser) return;
    
    // Animation: scale down and fade
    Animated.parallel([
      Animated.sequence([
        Animated.timing(clearButtonScale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(clearButtonScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(clearButtonOpacity, {
          toValue: 0.6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(clearButtonOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Get all notification IDs (messages only, not reminders)
    if (safeNotifications.length === 0) {
      setTimeout(() => {
        showAlert(
          'No Messages',
          'You don\'t have any messages to clear right now.',
          [
            {
              text: 'OK',
              style: 'default',
              onPress: () => setAlertModalVisible(false),
            },
          ],
          'info'
        );
      }, 150);
      return;
    }
    
    const messageIds = safeNotifications.map(notif => notif?.id).filter((id): id is string => !!id);
    
    if (messageIds.length === 0) {
      setTimeout(() => {
        showAlert(
          'No Messages',
          'You don\'t have any messages to clear right now.',
          [
            {
              text: 'OK',
              style: 'default',
              onPress: () => setAlertModalVisible(false),
            },
          ],
          'info'
        );
      }, 150);
      return;
    }

    // Show confirmation dialog after animation
    setTimeout(() => {
      showAlert(
        'Clear All Messages',
        `Are you sure you want to clear all ${messageIds.length} message${messageIds.length !== 1 ? 's' : ''}? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setAlertModalVisible(false),
          },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              setAlertModalVisible(false);
              try {
                const uid = auth.currentUser?.uid;
                if (!uid) return;
                
                const batch = messageIds.map(id => 
                  setDoc(doc(firestore, `users/${uid}/hiddenNotifications`, id), {
                    hiddenAt: new Date().toISOString(),
                  })
                );
                
                await Promise.all(batch);
                
                // Clear all notifications from UI
                setNotifications([]);
              } catch (err) {
                // Silent error handling - still clear locally for better UX
                setNotifications([]);
              }
            },
          },
        ],
        'warning'
      );
    }, 150);
  };

  const renderRightActions = (id: string) => (
    <View style={styles.swipeDeleteContainer}>
      <TouchableOpacity
        style={styles.swipeDeleteButton}
        onPress={() => handleDelete(id)}
        activeOpacity={0.8}
      >
        <Ionicons name="trash" size={24} color={colors.onPrimary} />
        <Text style={styles.swipeDeleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const handleNotificationPress = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  /** Resolve press handler for a reminder from its original text. */
  const getReminderPress = (text: string) => {
    if (text.includes('upload your')) return () => navigation.navigate('RequirementsChecklist');
    if (text.includes('weekly accomplishment report')) return () => navigation.navigate('WeeklyReport');
    return undefined;
  };

  /** Unified feed: reminder display items + notification display items. */
  type FeedEntry =
    | { type: 'reminder'; id: string; title: string; subtext: string; actionHint: string; priority: Priority; iconType: IconType; onPress: (() => void) | undefined; originalText: string }
    | { type: 'notification'; id: string; title: string; subtext: string; actionHint: string | null; priority: Priority; iconType: IconType; time: string; raw: NotificationItem; imageUrl?: string; images?: string[] };

  const feed: FeedEntry[] = useMemo(() => {
    const entries: FeedEntry[] = [];
    safeReminders.forEach((text, index) => {
      if (text) {
        const parsed = parseReminderDisplay(text, index);
        if (parsed) {
          entries.push({
            type: 'reminder',
            id: parsed.id,
            title: parsed.title,
            subtext: parsed.subtext,
            actionHint: parsed.actionHint,
            priority: parsed.priority,
            iconType: parsed.iconType,
            onPress: getReminderPress(text),
            originalText: text,
          });
        }
      }
    });
    safeNotifications.forEach((notif) => {
      if (notif) {
        try {
          const d = notificationToDisplay(notif);
          entries.push({
            type: 'notification',
            id: d.id,
            title: d.title,
            subtext: d.subtext,
            actionHint: d.actionHint,
            priority: d.priority,
            iconType: d.iconType,
            time: d.time,
            raw: d.raw,
            imageUrl: notif.imageUrl,
            images: notif.images,
          });
        } catch (e) {
          // Silent error handling - skip invalid notifications
        }
      }
    });
    return entries;
  }, [safeReminders, safeNotifications]);

  /** Filter feed by selected category: all, messages, requirements, reports */
  const filteredFeed: FeedEntry[] = useMemo(() => {
    if (!Array.isArray(feed)) {
      return [];
    }
    
    let filtered = feed;
    
    // Apply filter
    if (notificationFilter !== 'all') {
      filtered = feed.filter((entry) => {
        if (!entry) return false;
        if (notificationFilter === 'messages') {
          return entry.type === 'notification';
        }
        if (notificationFilter === 'requirements') {
          return entry.type === 'reminder' && entry.iconType === 'document';
        }
        if (notificationFilter === 'reports') {
          return entry.type === 'reminder' && entry.iconType === 'report';
        }
        return true;
      });
    }
    
    // Sort by priority: urgent (rejected) > success (approved) > required > info
    // Within same priority, sort by time (most recent first)
    const priorityOrder: Record<Priority, number> = {
      urgent: 0,    // Rejected - highest priority
      success: 1,    // Approved - second priority
      required: 2,   // Requirement reminders
      info: 3,       // Other notifications
    };
    
    return filtered.sort((a, b) => {
      // First, sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // If same priority, sort by time (most recent first)
      // For notifications, use the timestamp; for reminders, put them after notifications
      if (a.type === 'notification' && b.type === 'notification') {
        const timeA = a.raw?.ts || 0;
        const timeB = b.raw?.ts || 0;
        return timeB - timeA; // Most recent first
      }
      if (a.type === 'notification') return -1; // Notifications before reminders
      if (b.type === 'notification') return 1;
      
      // Both are reminders, keep original order
      return 0;
    });
  }, [feed, notificationFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNotifications(),
      fetchReminders(),
      isAdmin ? fetchPendingApplications() : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [isAdmin]);

  const isEmpty = filteredFeed.length === 0 && !(isAdmin && safePendingApplications.length > 0);

  const renderIcon = (iconType: IconType, priority: Priority) => {
    const color = ACCENT[priority];
    switch (iconType) {
      case 'document':
        return <Ionicons name="document-text-outline" size={22} color={color} />;
      case 'report':
        return <Ionicons name="calendar-outline" size={22} color={color} />;
      case 'briefcase':
        return <Ionicons name="briefcase-outline" size={22} color={color} />;
      default:
        return <Ionicons name="information-circle-outline" size={22} color={color} />;
    }
  };

  const renderFeedCard = (item: FeedEntry) => {
    const isNotification = item.type === 'notification';
    const displayDate = isNotification 
      ? formatNotificationDate(item.time, item.raw?.ts)
      : null;
    const accentColor = ACCENT[item.priority];

    const cardContent = (
      <View style={styles.cardInnerNew}>
        {/* Left: accent bar + type icon (no profile/avatar) */}
        <View style={[styles.cardIconAccentWrap, { backgroundColor: accentColor + '18' }]}>
          <View style={[styles.cardIconAccentBar, { backgroundColor: accentColor }]} />
          <View style={styles.cardIconWrap}>
            {renderIcon(item.iconType, item.priority)}
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardBodyNew}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitleNew} numberOfLines={1}>{item.title}</Text>
            {displayDate && (
              <Text style={styles.cardDate}>{displayDate}</Text>
            )}
          </View>
          {item.subtext ? (
            <Text style={styles.cardSubtextNew} numberOfLines={2}>{item.subtext}</Text>
          ) : null}
          {/* Images */}
          {item.type === 'notification' && (item.images?.length ?? 0) > 0 && (
            <View style={styles.cardImagesContainer}>
              {(item.images ?? []).slice(0, 3).map((imageUrl, idx) => (
                <View key={idx} style={styles.cardImageWrap}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {idx === 2 && (item.images?.length ?? 0) > 3 && (
                    <View style={styles.cardImageOverlay}>
                      <Text style={styles.cardImageOverlayText}>+{(item.images?.length ?? 0) - 3}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
          {item.type === 'notification' && !item.images && item.imageUrl && (
            <View style={styles.cardImageWrap}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      </View>
    );

    if (item.type === 'reminder') {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={item.onPress}
          disabled={!item.onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.subtext}. ${item.actionHint}`}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }

    // Swipeable delete for notifications
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNotificationPress(item.raw)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.subtext}`}
        >
          {cardContent}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Group notifications by date (recent vs previously)
  const groupedFeed = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const recent: FeedEntry[] = [];
    const previous: FeedEntry[] = [];
    
    if (Array.isArray(filteredFeed)) {
      filteredFeed.forEach(item => {
        if (!item) return;
        if (item.type === 'notification' && item.raw?.ts) {
          if (item.raw.ts >= oneDayAgo) {
            recent.push(item);
          } else {
            previous.push(item);
          }
        } else {
          // Reminders go to recent (they're always current)
          recent.push(item);
        }
      });
    }
    
    // Sort recent by timestamp (newest first)
    recent.sort((a, b) => {
      const tsA = a.type === 'notification' ? (a.raw?.ts || 0) : Date.now();
      const tsB = b.type === 'notification' ? (b.raw?.ts || 0) : Date.now();
      return tsB - tsA;
    });
    
    // Sort previous by timestamp (newest first)
    previous.sort((a, b) => {
      const tsA = a.type === 'notification' ? (a.raw?.ts || 0) : 0;
      const tsB = b.type === 'notification' ? (b.raw?.ts || 0) : 0;
      return tsB - tsA;
    });
    
    return { recent, previous };
  }, [filteredFeed]);

  // Format date for display
  const formatNotificationDate = (time: string, ts?: number): string => {
    if (ts) {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return time || '';
  };

  return (
    <Screen contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
      {/* Header: back (left) | title | delete (right) */}
      <View style={styles.headerGradientWrapper}>
        <LinearGradient
          colors={['#4F46E5', '#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Animated.View
              style={[
                styles.headerRightButton,
                {
                  transform: [{ scale: clearButtonScale }],
                  opacity: clearButtonOpacity,
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleClearAllMessages}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={1}
                accessibilityLabel="Delete all notifications"
              >
                <Ionicons name="trash-outline" size={22} color="#DC2626" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>

      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <>
      {/* Filter tabs - single row, horizontal scroll if needed */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {[
            { key: 'all' as const, label: 'All', icon: 'notifications-outline' },
            { key: 'messages' as const, label: 'Messages', icon: 'chatbubble-outline' },
            { key: 'requirements' as const, label: 'Requirements', icon: 'document-text-outline' },
            { key: 'reports' as const, label: 'Reports', icon: 'calendar-outline' },
          ].map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterPill, notificationFilter === key && styles.filterPillActive]}
              onPress={() => setNotificationFilter(key)}
              activeOpacity={0.7}
            >
              {notificationFilter === key && <View style={styles.filterPillIndicator} />}
              <Ionicons
                name={icon as any}
                size={16}
                color={notificationFilter === key ? colors.primary : colors.textMuted}
                style={styles.filterPillIcon}
              />
              <Text style={[styles.filterPillText, notificationFilter === key && styles.filterPillTextActive]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={[...groupedFeed.recent, ...groupedFeed.previous]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.scrollContent, isEmpty && styles.scrollContentEmpty]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          isEmpty ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateMailbox}>
                <View style={styles.mailboxIcon}>
                  <Ionicons name="mail-open-outline" size={48} color={colors.primary} />
                  <View style={styles.mailboxCheckmark}>
                    <Ionicons name="checkmark" size={18} color={colors.onPrimary} />
                  </View>
                </View>
              </View>
              <Text style={styles.emptyStateTitle}>No notifications yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your notification will appear here once you've received them.
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            {isAdmin && safePendingApplications.length > 0 ? (
              <View style={styles.adminSection}>
                <View style={styles.adminSectionTitleRow}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.info} />
                  <Text style={styles.adminSectionTitle}>Pending applications</Text>
                </View>
                {safePendingApplications.slice(0, 20).map((app: PendingApplicationItem) => (
                  <View key={app.id} style={styles.adminAppCard}>
                    <TouchableOpacity
                      style={styles.adminAppCardInner}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (app.companyId) {
                          navigation.navigate('CompanyProfile', { companyId: app.companyId });
                        }
                      }}
                      accessibilityRole="button"
                    >
                      <View style={[styles.adminAccentBar, { backgroundColor: colors.info }]} />
                      <View style={styles.adminAppCardBody}>
                        <Text style={styles.adminAppTitle}>{app.companyName}</Text>
                        <Text style={styles.adminAppSub}>
                          Applicant: {app.applicantName || app.userId || 'Unknown'}
                          {app.applicantEmail ? ` (${app.applicantEmail})` : ''}
                        </Text>
                        {app.appliedAt ? <Text style={styles.adminAppMeta}>Applied: {app.appliedAt}</Text> : null}
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                    </TouchableOpacity>
                    <View style={styles.adminAppActions}>
                      <TouchableOpacity
                        style={styles.adminApproveBtn}
                        onPress={() => handleApproveApplication(app.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />
                        <Text style={styles.adminApproveBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.adminDenyBtn}
                        onPress={() => {
                          Alert.alert(
                            'Deny application',
                            'Are you sure you want to deny this application?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Deny', style: 'destructive', onPress: () => handleDenyApplication(app.id) },
                            ]
                          );
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle" size={18} color={colors.onPrimary} />
                        <Text style={styles.adminDenyBtnText}>Deny</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        }
        renderItem={({ item, index }) => {
          const isFirstPrevious = index === groupedFeed.recent.length && groupedFeed.previous.length > 0;
          return (
            <>
              {isFirstPrevious && (
                <View style={styles.previouslyLabel}>
                  <Text style={styles.previouslyLabelText}>Previously</Text>
                </View>
              )}
              <View style={styles.cardWrap}>
                {renderFeedCard(item)}
              </View>
            </>
          );
        }}
      />
        </>
      )}

      {/* Custom Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertModalVisible}
        onRequestClose={() => setAlertModalVisible(false)}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalContent}>
            {alertConfig && (
              <>
                <View style={styles.alertIconWrap}>
                  <Ionicons
                    name={
                      alertConfig.type === 'error' ? 'alert-circle' :
                      alertConfig.type === 'warning' ? 'warning' :
                      alertConfig.type === 'success' ? 'checkmark-circle' :
                      'information-circle'
                    }
                    size={48}
                    color={
                      alertConfig.type === 'error' ? colors.danger :
                      alertConfig.type === 'warning' ? colors.warning :
                      alertConfig.type === 'success' ? colors.success :
                      colors.info
                    }
                  />
                </View>
                <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                <Text style={styles.alertMessage}>{alertConfig.message}</Text>
                <View style={styles.alertButtonRow}>
                  {alertConfig.buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.alertButton,
                        button.style === 'destructive' && styles.alertButtonDestructive,
                        button.style === 'cancel' && styles.alertButtonCancel,
                        alertConfig.buttons.length === 1 && styles.alertButtonFullWidth,
                      ]}
                      onPress={() => {
                        if (button.onPress) {
                          button.onPress();
                        } else {
                          setAlertModalVisible(false);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.alertButtonText,
                          button.style === 'destructive' && styles.alertButtonTextDestructive,
                          button.style === 'cancel' && styles.alertButtonTextCancel,
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Notification Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedNotification?.title ?? 'Notification'}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseIcon}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>{selectedNotification?.description ?? ''}</Text>
            
            {/* Images in modal - show all images */}
            {(() => {
              // Get all image URLs from various possible fields
              const allImages: string[] = [];
              
              // Check images array first
              if (selectedNotification?.images && Array.isArray(selectedNotification.images) && selectedNotification.images.length > 0) {
                selectedNotification.images.forEach((url: any) => {
                  if (url) {
                    const urlStr = typeof url === 'string' ? url : (url?.url || url?.imageUrl || url?.downloadUrl || url);
                    if (urlStr && typeof urlStr === 'string' && urlStr.trim().length > 0 && !allImages.includes(urlStr)) {
                      allImages.push(urlStr);
                    }
                  }
                });
              }
              
              // Check single imageUrl
              if (selectedNotification?.imageUrl && typeof selectedNotification.imageUrl === 'string' && 
                  selectedNotification.imageUrl.trim().length > 0 && !allImages.includes(selectedNotification.imageUrl)) {
                allImages.push(selectedNotification.imageUrl);
              }
              
              // Check image field
              if (selectedNotification?.image && typeof selectedNotification.image === 'string' && 
                  selectedNotification.image.trim().length > 0 && !allImages.includes(selectedNotification.image)) {
                allImages.push(selectedNotification.image);
              }
              
              // Also check the raw notification data for any image fields we might have missed
              if (selectedNotification) {
                const notificationData = selectedNotification as any;
                
                // Check all possible field names (including raw fields we preserved)
                const possibleFields = [
                  'imageUrl', 'image', 'imageURL', 'images', 'imageUrls',
                  'attachment', 'attachments', 'attachmentUrl', 'attachmentUrls',
                  'photo', 'photoUrl', 'photos', 'photoUrls',
                  'file', 'fileUrl', 'files', 'fileUrls',
                  'downloadUrl', 'downloadURL', 'downloadUrls',
                  'rawImages', 'rawImageUrls', 'rawAttachments', 'rawImageUrl', 'rawImage'
                ];
                
                possibleFields.forEach(field => {
                  try {
                    if (notificationData?.[field]) {
                      if (Array.isArray(notificationData[field])) {
                        notificationData[field].forEach((item: any) => {
                          const url = typeof item === 'string' ? item : (item?.url || item?.imageUrl || item?.downloadUrl || item?.src || item);
                          if (url && typeof url === 'string' && url.trim().length > 0 && !allImages.includes(url)) {
                            allImages.push(url);
                          }
                        });
                      } else if (typeof notificationData[field] === 'string' && notificationData[field].trim().length > 0) {
                        if (!allImages.includes(notificationData[field])) {
                          allImages.push(notificationData[field]);
                        }
                      } else if (typeof notificationData[field] === 'object' && notificationData[field] !== null) {
                        // Handle object with url property
                        const objUrl = notificationData[field]?.url || notificationData[field]?.imageUrl || notificationData[field]?.downloadUrl || notificationData[field]?.src;
                        if (objUrl && typeof objUrl === 'string' && objUrl.trim().length > 0 && !allImages.includes(objUrl)) {
                          allImages.push(objUrl);
                        }
                      }
                    }
                  } catch (e) {
                    // Silent error handling
                  }
                });
                
                // Also check if images are in the raw notification object itself
                if (selectedNotification?.raw) {
                  const rawNotif = selectedNotification.raw as any;
                  possibleFields.forEach(field => {
                    try {
                      if (rawNotif?.[field]) {
                        if (Array.isArray(rawNotif[field])) {
                          rawNotif[field].forEach((item: any) => {
                            const url = typeof item === 'string' ? item : (item?.url || item?.imageUrl || item?.downloadUrl || item?.src || item);
                            if (url && typeof url === 'string' && url.trim().length > 0 && !allImages.includes(url)) {
                              allImages.push(url);
                            }
                          });
                        } else if (typeof rawNotif[field] === 'string' && rawNotif[field].trim().length > 0) {
                          if (!allImages.includes(rawNotif[field])) {
                            allImages.push(rawNotif[field]);
                          }
                        }
                      }
                    } catch (e) {
                      // Silent error handling
                    }
                  });
                }
                
                // Last resort: check _rawData if it exists (complete Firestore document)
                if (notificationData?._rawData && allImages.length === 0) {
                  const firestoreData = notificationData._rawData;
                  // Check every field in the Firestore document
                  if (firestoreData && typeof firestoreData === 'object' && !Array.isArray(firestoreData)) {
                    try {
                      Object.keys(firestoreData).forEach(key => {
                        const value = firestoreData[key];
                        if (value) {
                          if (Array.isArray(value)) {
                            value.forEach((item: any) => {
                              const url = typeof item === 'string' ? item : (item?.url || item?.imageUrl || item?.downloadUrl || item?.src || item);
                              if (url && typeof url === 'string' && url.trim().length > 0 && !allImages.includes(url)) {
                                allImages.push(url);
                              }
                            });
                          } else if (typeof value === 'string' && (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo') || key.toLowerCase().includes('attach') || key.toLowerCase().includes('file'))) {
                            if (value.trim().length > 0 && !allImages.includes(value)) {
                              allImages.push(value);
                            }
                          }
                        }
                      });
                    } catch (e) {
                      // Silent error handling
                    }
                  }
                }
              }
              
              // If we have images, display them
              if (allImages.length > 0) {
                return (
                  <View style={styles.modalImagesWrapper}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={true}
                      style={styles.modalImagesContainer}
                      contentContainerStyle={styles.modalImagesContent}
                    >
                      {allImages.map((imageUrl, idx) => (
                        <View key={idx} style={styles.modalImageWrap}>
                          <Image
                            source={{ uri: imageUrl }}
                            style={styles.modalImage}
                            resizeMode="contain"
                            onError={(error) => {
                              // Silent error handling - image failed to load
                            }}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                );
              }
              
              return null;
            })()}
            
            <Text style={styles.modalTime}>{selectedNotification?.time}</Text>

            {selectedNotification?.action && (
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  if (selectedNotification?.action === 'View all jobs') {
                    setModalVisible(false);
                    navigation.navigate('Home');
                  } else if (selectedNotification?.action === 'Send message') {
                    setModalVisible(false);
                  } else {
                    setModalVisible(false);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalActionButtonText}>{selectedNotification.action}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalButtonRow}>
              {selectedNotification?.id && (
                <TouchableOpacity
                  style={styles.modalDeleteButton}
                  onPress={() => {
                    handleDelete(selectedNotification.id);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={18} color="#DC2626" style={styles.modalDeleteIcon} />
                  <Text style={styles.modalDeleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalCloseButton, !selectedNotification?.id && styles.modalCloseButtonFullWidth]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerGradientWrapper: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingBottom: 16,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  headerBackButton: {
    padding: 4,
    minWidth: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    flex: 1,
    letterSpacing: -0.3,
  },
  headerRightButton: {
    padding: 4,
    minWidth: 40,
    alignItems: 'flex-end',
  },
  filterRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  filterScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    minWidth: 100,
  },
  filterPillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterPillIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  filterPillIcon: {
    marginRight: 6,
    zIndex: 1,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    zIndex: 1,
  },
  filterPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  resultsCountWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  resultsCountText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateMailbox: {
    marginBottom: 28,
  },
  mailboxIcon: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mailboxCheckmark: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardWrap: {
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardInnerNew: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 80,
  },
  cardIconAccentWrap: {
    width: 56,
    minWidth: 56,
    marginRight: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  cardIconAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBodyNew: {
    flex: 1,
    minWidth: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  cardTitleNew: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    minWidth: 0,
    lineHeight: 22,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  cardSubtextNew: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginTop: 6,
  },
  cardImagesContainer: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardImageWrap: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '48%',
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
    aspectRatio: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageOverlayText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  modalImagesContainer: {
    marginTop: 12,
    marginBottom: 16,
    maxHeight: 400,
  },
  modalImagesContent: {
    paddingRight: 8,
    gap: 12,
  },
  modalImagesWrapper: {
    marginTop: 12,
    marginBottom: 16,
  },
  modalImageWrap: {
    width: 300,
    height: 300,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
  },
  previouslyLabel: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  previouslyLabelText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminSection: {
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  adminSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  adminSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  adminAppCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  adminAppCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 14,
    minHeight: 64,
  },
  adminAccentBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
    alignSelf: 'stretch',
    minHeight: 32,
  },
  adminAppCardBody: {
    flex: 1,
    minWidth: 0,
  },
  adminAppTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  adminAppSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  adminAppMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSubtle,
  },
  adminAppActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  adminApproveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: radii.lg,
    gap: 6,
    shadowColor: colors.success,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  adminApproveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  adminDenyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: radii.lg,
    gap: 6,
    shadowColor: colors.danger,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  adminDenyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  swipeDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    marginBottom: 12,
  },
  swipeDeleteButton: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: radii.lg,
    paddingVertical: 8,
  },
  swipeDeleteText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 24,
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 12,
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 12,
  },
  modalTime: {
    fontSize: 12,
    color: colors.textSubtle,
    marginBottom: 20,
  },
  modalActionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  modalActionButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: colors.danger,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.danger,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalDeleteIcon: {
    marginRight: 8,
  },
  modalDeleteButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  modalCloseButton: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCloseButtonFullWidth: {
    flex: 0,
    width: '100%',
  },
  modalCloseButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  alertModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 24,
    alignItems: 'center',
    ...shadows.card,
  },
  alertIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  alertButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    minHeight: 48,
  },
  alertButtonFullWidth: {
    width: '100%',
  },
  alertButtonDestructive: {
    backgroundColor: colors.danger,
  },
  alertButtonCancel: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  alertButtonTextDestructive: {
    color: colors.onPrimary,
  },
  alertButtonTextCancel: {
    color: colors.text,
  },
});

export default NotificationsScreen;
