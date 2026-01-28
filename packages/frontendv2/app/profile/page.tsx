'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useBookings } from '@/lib/hooks';
import ProfileCard from '@/components/profile/ProfileCard';
import UserBookings from '@/components/profile/UserBookings';

function ProfileContent() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { bookings, isLoading: bookingsLoading } = useBookings();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || bookingsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted-foreground mt-2">Manage your account and view your booking history</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-1">
                        <ProfileCard user={user} />
                    </div>

                    {/* User Bookings */}
                    <div className="lg:col-span-2">
                        <UserBookings bookings={bookings || []} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">Loading...</div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
