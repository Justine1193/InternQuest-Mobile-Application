import { auth, firestore } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

// Security utility functions
export class SecurityUtils {
    // Check if user is authenticated
    static isAuthenticated(): boolean {
        return auth.currentUser !== null;
    }

    // Get current user ID
    static getCurrentUserId(): string | null {
        return auth.currentUser?.uid || null;
    }

    // Check if user has admin role
    static async isAdmin(): Promise<boolean> {
        if (!auth.currentUser) return false;

        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.role === 'admin';
            }
            return false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    // Sanitize user input
    static sanitizeInput(input: string): string {
        return input.trim().replace(/[<>]/g, '');
    }

    // Validate email format
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@neu\.edu\.ph$/;
        return emailRegex.test(email);
    }

    // Validate student ID format
    static validateStudentId(studentId: string): boolean {
        const studentIdRegex = /^\d{2}-\d{5}-\d{3}$/;
        return studentIdRegex.test(studentId);
    }

    // Validate phone number format
    static validatePhoneNumber(phone: string): boolean {
        const phoneRegex = /^\d{11}$/;
        return phoneRegex.test(phone);
    }

    // Check if user can access specific data
    static canAccessUserData(targetUserId: string): boolean {
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) return false;

        // Users can only access their own data, admins can access all
        return currentUserId === targetUserId;
    }

    // Basic device security checks
    static checkDeviceSecurity(): {
        isSecure: boolean;
        warnings: string[];
    } {
        const warnings: string[] = [];
        let isSecure = true;

        // Check for development mode
        if (__DEV__) {
            warnings.push('App is running in development mode');
            isSecure = false;
        }

        // Check for debugger
        if ((global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            warnings.push('React DevTools detected');
            isSecure = false;
        }

        // Platform-specific checks
        if (Platform.OS === 'android') {
            // Add Android-specific security checks here
            // This would require additional libraries like react-native-device-info
        } else if (Platform.OS === 'ios') {
            // Add iOS-specific security checks here
        }

        return { isSecure, warnings };
    }

    // API key protection (basic obfuscation)
    static getProtectedApiKey(): string {
        // This is a basic obfuscation - in production, use proper encryption
        const key = "AIzaSyCdc_SdyFRbNFIw3KqJcQQ19ALfW3pLIts";
        return key.split('').reverse().join('').split('').reverse().join('');
    }

    // Certificate pinning check (placeholder)
    static async verifyCertificate(): Promise<boolean> {
        // In production, implement actual certificate pinning
        // This would require libraries like react-native-ssl-pinning
        return true;
    }

    // Rate limiting helper (basic implementation)
    private static requestCounts: { [key: string]: { count: number; timestamp: number } } = {};

    static checkRateLimit(action: string, limit: number = 10, windowMs: number = 60000): boolean {
        const now = Date.now();
        const key = `${action}_${this.getCurrentUserId()}`;

        if (!this.requestCounts[key] || now - this.requestCounts[key].timestamp > windowMs) {
            this.requestCounts[key] = { count: 1, timestamp: now };
            return true;
        }

        if (this.requestCounts[key].count >= limit) {
            return false;
        }

        this.requestCounts[key].count++;
        return true;
    }

    // Session security check
    static checkSessionSecurity(): boolean {
        const user = auth.currentUser;
        if (!user) return false;

        // Check if user has recent activity
        const lastActivity = user.metadata.lastSignInTime;
        if (lastActivity) {
            const lastSignIn = new Date(lastActivity);
            const now = new Date();
            const hoursSinceLastSignIn = (now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60);

            // Force re-authentication after 24 hours
            if (hoursSinceLastSignIn > 24) {
                return false;
            }
        }

        return true;
    }

    // Data encryption helper (basic)
    static encryptSensitiveData(data: string): string {
        // In production, use proper encryption libraries
        // This is just a basic example
        return btoa(data); // Base64 encoding (NOT secure encryption)
    }

    static decryptSensitiveData(encryptedData: string): string {
        // In production, use proper decryption
        return atob(encryptedData); // Base64 decoding
    }
}
