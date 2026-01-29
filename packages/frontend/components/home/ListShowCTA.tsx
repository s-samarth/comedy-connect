'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function ListShowCTA() {
    const { user, isOrganizer, isComedian } = useAuth();
    const router = useRouter();

    const handleClick = () => {
        if (!user) {
            router.push('/onboarding/role-selection');
            return;
        }

        if (isOrganizer) {
            router.push('/organizer/dashboard');
            return;
        }

        if (isComedian) {
            router.push('/comedian/dashboard');
            return;
        }

        // Audience or new user
        router.push('/onboarding/role-selection');
    };

    return (
        <Button
            onClick={handleClick}
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg font-bold rounded-full border-border hover:bg-muted gap-2"
        >
            List Your Show
            <ArrowRight size={20} />
        </Button>
    );
}
