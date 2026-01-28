'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import OrganizerShowManagement from '@/components/organizer/OrganizerShowManagement';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ShowsContent() {
    const { user, isOrganizer, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading Management Panel...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !isOrganizer) {
        router.push('/auth/signin');
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 pt-32 pb-20">
                {/* Navigation Breadcrumb */}
                <div className="mb-12">
                    <Link href="/organizer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-[0.2em] group">
                        <div className="bg-muted p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                            <ArrowLeft size={14} />
                        </div>
                        Back to Organizer Dashboard
                    </Link>
                </div>

                {/* Main Component */}
                <OrganizerShowManagement
                    userId={user?.id || ''}
                    isVerified={user?.role === 'ORGANIZER_VERIFIED'}
                />
            </main>
        </div>
    );
}

export default function OrganizerShowsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ShowsContent />
        </Suspense>
    );
}
