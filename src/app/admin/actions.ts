
'use server';

import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin';

export async function getAdminStats() {
    const db = getAdminFirestore();
    const auth = getAdminAuth();

    try {
        const [tenantsSnap, usersSnap, profilesSnap] = await Promise.all([
            db.collection('tenants').get(),
            db.collection('users').get(),
            db.collection('user_profile').get(),
        ]);

        const totalTenants = tenantsSnap.size;
        const totalUsers = profilesSnap.size;
        
        // Count clients (this might be heavy if many users, for now we sum subcollections if possible or just show users)
        // In a real big app we would have a 'stats' collection.
        // Let's try to get a sample of connections if we had a logs collection.
        // Since we don't have a connections collection, we'll use the profiles count as 'total accounts'.

        return {
            tenants: totalTenants,
            users: totalUsers,
            dbDocuments: tenantsSnap.size + usersSnap.size + profilesSnap.size, // Simplified
            activeSessions: Math.floor(totalUsers * 0.15), // Mocked for now based on total users
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return { tenants: 0, users: 0, dbDocuments: 0, activeSessions: 0 };
    }
}

export async function getTenantsList() {
    const db = getAdminFirestore();
    try {
        const usersSnap = await db.collection('users').limit(50).get();
        const tenants = usersSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
                email: data.email || 'No email',
                role: data.role || 'Coach',
                status: data.status || 'active', 
                joined: data.joinDate || (data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0] : '2024-01-01'),
                tenantId: data.tenantId || doc.id
            };
        });
        return tenants;
    } catch (error) {
        console.error('Error fetching tenants list:', error);
        return [];
    }
}

export async function getRecentActivity() {
    const db = getAdminFirestore();
    try {
        // We check for any collection that looks like activity. 
        // If not found, we use the most recently created users.
        const recentUsersSnap = await db.collection('users').orderBy('createdAt', 'desc').limit(5).get();
        
        return recentUsersSnap.docs.map(doc => {
            const data = doc.data();
            return {
                name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                email: data.email,
                time: data.createdAt ? getTimeAgo(data.createdAt.seconds * 1000) : 'Recently',
                status: 'Offline'
            };
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
    }
}

export async function getDetailedUsageStats() {
    const db = getAdminFirestore();
    try {
        const [tenantsSnap, usersSnap, invitationsSnap] = await Promise.all([
            db.collection('tenants').get(),
            db.collection('users').get(),
            db.collection('invitations').get(),
        ]);

        // Try to find clients in all users (iterating users might be slow if many, but for now ok)
        // In a real app we'd query for role='client'
        const users = usersSnap.docs.map(d => d.data());
        const coachesCount = users.filter(u => u.role === 'coach' || u.role === undefined).length;
        const clientsCount = users.filter(u => u.role === 'client').length;

        return {
            coaches: coachesCount,
            clients: clientsCount,
            invitations: invitationsSnap.size,
            tenants: tenantsSnap.size,
            // Mocking historical data for chart consistency but basing on real totals
            growthData: [
                { day: 'Mon', signups: Math.floor(coachesCount * 0.1) },
                { day: 'Tue', signups: Math.floor(coachesCount * 0.2) },
                { day: 'Wed', signups: Math.floor(coachesCount * 0.15) },
                { day: 'Thu', signups: Math.floor(coachesCount * 0.3) },
                { day: 'Fri', signups: coachesCount }, // Today
            ]
        };
    } catch (error) {
        console.error('Error fetching detailed usage stats:', error);
        return null;
    }
}

export async function getAuthEvents() {
    const db = getAdminFirestore();
    try {
        const recentProfiles = await db.collection('users').orderBy('createdAt', 'desc').limit(10).get();
        return recentProfiles.docs.map(doc => {
            const data = doc.data();
            return {
                name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
                action: data.isProfileComplete ? 'Profile Updated' : 'Account Created',
                method: data.role === 'client' ? 'Invitation' : 'Google',
                project: 'Platform',
                time: data.createdAt ? getTimeAgo(data.createdAt.seconds * 1000) : 'Recent',
                device: 'Browser'
            };
        });
    } catch (error) {
        console.error('Error fetching auth events:', error);
        return [];
    }
}

export async function createUser(data: { email: string; name: string; role: string }) {
    const auth = getAdminAuth();
    const db = getAdminFirestore();
    try {
        // Create in Firebase Auth
        const userRecord = await auth.createUser({
            email: data.email,
            displayName: data.name,
        });

        const [firstName, ...lastName] = data.name.split(' ');

        // Create in Firestore 'users' collection
        await db.collection('users').doc(userRecord.uid).set({
            id: userRecord.uid,
            email: data.email,
            firstName: firstName || '',
            lastName: lastName.join(' ') || '',
            name: data.name,
            role: data.role,
            isProfileComplete: false,
            createdAt: new Date(),
        });

        return { success: true, uid: userRecord.uid };
    } catch (error: any) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
    }
}

export async function updateUserRole(uid: string, newRole: string) {
    const db = getAdminFirestore();
    try {
        await db.collection('users').doc(uid).update({ role: newRole });
        // Also update user_profile if it exists
        const profileRef = db.collection('user_profile').doc(uid);
        const profileDoc = await profileRef.get();
        if (profileDoc.exists) {
            await profileRef.update({ role: newRole });
        }
        return { success: true };
    } catch (error: any) {
        console.error('Error updating role:', error);
        return { success: false, error: error.message };
    }
}

export async function resetUserPassword(email: string) {
    const auth = getAdminAuth();
    try {
        const link = await auth.generatePasswordResetLink(email);
        return { success: true, link };
    } catch (error: any) {
        console.error('Error resetting password:', error);
        return { success: false, error: error.message };
    }
}

export async function suspendUser(uid: string, suspend: boolean = true) {
    const auth = getAdminAuth();
    const db = getAdminFirestore();
    try {
        // 1. Disable in Firebase Auth
        await auth.updateUser(uid, { disabled: suspend });

        // 2. Update Firestore status
        await db.collection('users').doc(uid).update({ 
            status: suspend ? 'suspended' : 'active' 
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error suspending user:', error);
        return { success: false, error: error.message };
    }
}

function getTimeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
