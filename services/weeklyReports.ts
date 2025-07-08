import { firestore } from '../firebase/config';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';

export type WeeklyReport = {
    id?: string;
    weekStartDate: string;
    weekEndDate: string;
    tasks: string;
    learnings: string;
    outcomes: string;
    challenges: string;
    nextWeekGoals: string;
    attachments: string[];
    submittedAt: Date;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    feedback?: string;
    userId: string;
    company?: string;
};

export type WeeklyReportFormData = Omit<WeeklyReport, 'id' | 'submittedAt' | 'status' | 'userId' | 'feedback'>;

// Create a new weekly report
export const createWeeklyReport = async (userId: string, reportData: WeeklyReportFormData): Promise<string> => {
    try {
        const reportsCol = collection(firestore, `users/${userId}/weeklyReports`);
        const docRef = await addDoc(reportsCol, {
            ...reportData,
            submittedAt: new Date(),
            status: 'submitted',
            userId
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating weekly report:', error);
        throw new Error('Failed to create weekly report');
    }
};

// Get all weekly reports for a user
export const getUserWeeklyReports = async (userId: string): Promise<WeeklyReport[]> => {
    try {
        const reportsCol = collection(firestore, `users/${userId}/weeklyReports`);
        const reportsQuery = query(reportsCol, orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(reportsQuery);

        const reports: WeeklyReport[] = [];
        querySnapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() } as WeeklyReport);
        });

        return reports;
    } catch (error) {
        console.error('Error fetching weekly reports:', error);
        throw new Error('Failed to fetch weekly reports');
    }
};

// Get a specific weekly report
export const getWeeklyReport = async (userId: string, reportId: string): Promise<WeeklyReport | null> => {
    try {
        const reportRef = doc(firestore, `users/${userId}/weeklyReports/${reportId}`);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
            return { id: reportSnap.id, ...reportSnap.data() } as WeeklyReport;
        }
        return null;
    } catch (error) {
        console.error('Error fetching weekly report:', error);
        throw new Error('Failed to fetch weekly report');
    }
};

// Update a weekly report
export const updateWeeklyReport = async (
    userId: string,
    reportId: string,
    updates: Partial<WeeklyReport>
): Promise<void> => {
    try {
        const reportRef = doc(firestore, `users/${userId}/weeklyReports/${reportId}`);
        await updateDoc(reportRef, updates);
    } catch (error) {
        console.error('Error updating weekly report:', error);
        throw new Error('Failed to update weekly report');
    }
};

// Delete a weekly report
export const deleteWeeklyReport = async (userId: string, reportId: string): Promise<void> => {
    try {
        const reportRef = doc(firestore, `users/${userId}/weeklyReports/${reportId}`);
        await deleteDoc(reportRef);
    } catch (error) {
        console.error('Error deleting weekly report:', error);
        throw new Error('Failed to delete weekly report');
    }
};

// Get reports by status
export const getReportsByStatus = async (userId: string, status: WeeklyReport['status']): Promise<WeeklyReport[]> => {
    try {
        const reportsCol = collection(firestore, `users/${userId}/weeklyReports`);
        const reportsQuery = query(
            reportsCol,
            where('status', '==', status),
            orderBy('submittedAt', 'desc')
        );
        const querySnapshot = await getDocs(reportsQuery);

        const reports: WeeklyReport[] = [];
        querySnapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() } as WeeklyReport);
        });

        return reports;
    } catch (error) {
        console.error('Error fetching reports by status:', error);
        throw new Error('Failed to fetch reports by status');
    }
};

// Get reports for a specific date range
export const getReportsByDateRange = async (
    userId: string,
    startDate: string,
    endDate: string
): Promise<WeeklyReport[]> => {
    try {
        const reportsCol = collection(firestore, `users/${userId}/weeklyReports`);
        const reportsQuery = query(
            reportsCol,
            where('weekStartDate', '>=', startDate),
            where('weekEndDate', '<=', endDate),
            orderBy('weekStartDate', 'desc')
        );
        const querySnapshot = await getDocs(reportsQuery);

        const reports: WeeklyReport[] = [];
        querySnapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() } as WeeklyReport);
        });

        return reports;
    } catch (error) {
        console.error('Error fetching reports by date range:', error);
        throw new Error('Failed to fetch reports by date range');
    }
};

// Listen to real-time updates for weekly reports
export const subscribeToWeeklyReports = (
    userId: string,
    callback: (reports: WeeklyReport[]) => void
) => {
    const reportsCol = collection(firestore, `users/${userId}/weeklyReports`);
    const reportsQuery = query(reportsCol, orderBy('submittedAt', 'desc'));

    return onSnapshot(reportsQuery, (querySnapshot) => {
        const reports: WeeklyReport[] = [];
        querySnapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() } as WeeklyReport);
        });
        callback(reports);
    });
};

// Update report status (for coordinators/admins)
export const updateReportStatus = async (
    userId: string,
    reportId: string,
    status: WeeklyReport['status'],
    feedback?: string
): Promise<void> => {
    try {
        const reportRef = doc(firestore, `users/${userId}/weeklyReports/${reportId}`);
        const updates: Partial<WeeklyReport> = { status };
        if (feedback) {
            updates.feedback = feedback;
        }
        await updateDoc(reportRef, updates);
    } catch (error) {
        console.error('Error updating report status:', error);
        throw new Error('Failed to update report status');
    }
};

// Get all reports for coordinators (across all users)
export const getAllReportsForCoordinators = async (): Promise<WeeklyReport[]> => {
    try {
        const usersCol = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCol);

        const allReports: WeeklyReport[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const reportsCol = collection(firestore, `users/${userDoc.id}/weeklyReports`);
            const reportsQuery = query(reportsCol, orderBy('submittedAt', 'desc'));
            const reportsSnapshot = await getDocs(reportsQuery);

            reportsSnapshot.forEach((reportDoc) => {
                allReports.push({ id: reportDoc.id, ...reportDoc.data() } as WeeklyReport);
            });
        }

        return allReports.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    } catch (error) {
        console.error('Error fetching all reports for coordinators:', error);
        throw new Error('Failed to fetch all reports');
    }
}; 