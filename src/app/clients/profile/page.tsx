'use client';

import { TelegramConnect } from '@/components/telegram-connect';

export default function ClientProfilePage() {
    return (
        <div className="p-4 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground mb-4">Próximamente: Podrás gestionar todos tus datos personales desde aquí.</p>
            <TelegramConnect />
        </div>
    );
}
