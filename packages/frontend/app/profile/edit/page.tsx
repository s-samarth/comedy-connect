'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { Loader2 } from 'lucide-react';

function EditProfileContent() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-transparent pt-20">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
                        <p className="text-muted-foreground mt-2">Update your personal information and public profile</p>
                    </div>
                </div>

                <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
                    <div className="p-8">
                        <ProfileEditForm user={user} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function EditProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="text-center">Loading...</div>
            </div>
        }>
            <EditProfileContent />
        </Suspense>
    );
}
