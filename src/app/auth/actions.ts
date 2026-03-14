'use server';

// This server action is intentionally left empty for now.
// The registration logic has been moved to the client-side component
// in `src/app/register/page.tsx` to ensure a stable and atomic registration flow.
// This file is kept to avoid breaking imports, but it does not perform any Firebase operations.

import { getAdminFirestore } from '@/lib/firebase-admin';

export async function completePasswordChange(uid: string) {
    const db = getAdminFirestore();
    try {
        await db.collection('users').doc(uid).update({
            forcePasswordChange: false
        });
        return { success: true };
    } catch (error: any) {
        console.error('Error completing password change:', error);
        return { success: false, error: error.message };
    }
}

export async function signUpWithEmailAndPassword(
  prevState: any,
  formData: FormData
) {
    // This is a placeholder. The actual logic is on the client.
    // We return a non-descript message to avoid confusion.
    return {
        success: false,
        message: 'This action is handled on the client.',
    };
}
