'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function FooterLinks() {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogContent, setDialogContent] = React.useState({ title: '', description: '', action: '' });

    const { user, isOrganizer, isComedian } = useAuth();
    const router = useRouter();

    const handleArtistClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (!user || user.role === 'AUDIENCE') {
            router.push('/onboarding/comedian');
            return;
        }

        if (isOrganizer) {
            setDialogContent({
                title: 'You are an Organizer',
                description: 'Your account is already registered as an Organizer. You can manage your shows from the dashboard.',
                action: '/organizer/dashboard'
            });
            setDialogOpen(true);
            return;
        }

        if (isComedian) {
            if (user.role === 'COMEDIAN_UNVERIFIED') {
                router.push('/comedian/pending-verification');
            } else {
                router.push('/comedian/dashboard');
            }
            return;
        }
    };

    const handleOrganizerClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (!user || user.role === 'AUDIENCE') {
            router.push('/onboarding/organizer');
            return;
        }

        if (isComedian) {
            setDialogContent({
                title: 'You are a Comedian',
                description: 'Your account is already registered as a Comedian. You can manage your profile from the dashboard.',
                action: '/comedian/dashboard'
            });
            setDialogOpen(true);
            return;
        }

        if (isOrganizer) {
            if (user.role === 'ORGANIZER_UNVERIFIED') {
                router.push('/organizer/pending-verification');
            } else {
                router.push('/organizer/dashboard');
            }
            return;
        }
    };

    return (
        <>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li>
                    <a href="#" onClick={handleArtistClick} className="hover:text-primary transition-colors">
                        Join as Artist
                    </a>
                </li>
                <li>
                    <a href="#" onClick={handleOrganizerClick} className="hover:text-primary transition-colors">
                        Join as Organizer
                    </a>
                </li>
            </ul>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md border-border bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">{dialogContent.title}</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium pt-2">
                            {dialogContent.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end pt-4">
                        <Button
                            className="w-full h-12 rounded-full font-bold uppercase tracking-widest gap-2"
                            onClick={() => router.push(dialogContent.action)}
                        >
                            Go to Dashboard <ArrowRight size={16} />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
