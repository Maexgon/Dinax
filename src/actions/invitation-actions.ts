'use server';

import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

interface GenerateInvitationResult {
    success: boolean;
    code?: string;
    error?: string;
}

export async function generateInvitation(
    tenantId: string,
    clientId: string,
    clientEmail: string
): Promise<GenerateInvitationResult> {
    try {
        const db = getAdminFirestore();

        // Check if there is already a pending invitation for this client
        const existingInvites = await db
            .collection('invitations')
            .where('tenantId', '==', tenantId)
            .where('clientId', '==', clientId)
            .where('status', '==', 'pending')
            .get();

        if (!existingInvites.empty) {
            // Return existing code if valid
            const data = existingInvites.docs[0].data();
            return { success: true, code: data.code };
        }

        // Generate a code: xxxx-yyyy
        const code = `${randomBytes(2).toString('hex')}-${randomBytes(2).toString('hex')}`;

        // Expires in 48 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        await db.collection('invitations').add({
            code,
            tenantId,
            clientId,
            email: clientEmail,
            status: 'pending',
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(expiresAt),
        });

        return { success: true, code };
    } catch (error: any) {
        console.error('Error generating invitation:', error);
        return { success: false, error: error.message || 'Failed to generate invitation.' };
    }
}

interface ValidateInvitationResult {
    success: boolean;
    data?: {
        tenantId: string;
        clientId: string;
        email: string;
    };
    error?: string;
}

export async function validateInvitation(code: string): Promise<ValidateInvitationResult> {
    try {
        const db = getAdminFirestore();
        const invitesSnap = await db.collection('invitations')
            .where('code', '==', code)
            .where('status', '==', 'pending')
            .limit(1)
            .get();

        if (invitesSnap.empty) {
            return { success: false, error: 'Código inválido o expirado.' };
        }

        const invite = invitesSnap.docs[0].data();
        const now = new Date();
        if (invite.expiresAt.toDate() < now) {
            return { success: false, error: 'El código ha expirado.' };
        }

        return {
            success: true,
            data: {
                tenantId: invite.tenantId,
                clientId: invite.clientId,
                email: invite.email
            }
        };

    } catch (error: any) {
        console.error('Error validating invitation:', error);
        return { success: false, error: 'Error al validar el código.' };
    }
}

export async function linkClientUser(authUid: string, code: string) {
    try {
        const db = getAdminFirestore();
        const invitesSnap = await db.collection('invitations')
            .where('code', '==', code)
            .where('status', '==', 'pending')
            .limit(1)
            .get();

        if (invitesSnap.empty) {
            throw new Error('Invitation invalid during linking.');
        }

        const inviteDoc = invitesSnap.docs[0];
        const invite = inviteDoc.data();

        const batch = db.batch();

        // 1. Mark invitation as used
        batch.update(inviteDoc.ref, {
            status: 'used',
            usedBy: authUid,
            usedAt: Timestamp.now()
        });

        // 2. Link Client Doc in Tenant
        const clientRef = db.doc(`tenants/${invite.tenantId}/user_profile/${invite.clientId}`);
        batch.update(clientRef, {
            userId: authUid
        });

        // 3. Create/Update User Profile (Root)
        const userProfileRef = db.doc(`user_profile/${authUid}`);
        batch.set(userProfileRef, {
            id: authUid,
            tenantId: invite.tenantId,
            clientId: invite.clientId,
            email: invite.email,
            role: 'client',
            createdAt: Timestamp.now()
        }, { merge: true });

        await batch.commit();
        return { success: true };

    } catch (error: any) {
        console.error('Error linking user:', error);
        return { success: false, error: error.message };
    }
}
