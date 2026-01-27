'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Clock, ShieldCheck, Mail, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function OrganizerPendingPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-4">
                <div className="max-w-xl w-full space-y-8 text-center">
                    {/* Icon */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 rounded-full" />
                        <Building2 size={80} className="text-primary mx-auto relative z-10" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                            Organizer <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Review</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">
                            We're reviewing your organization details. This ensures the integrity of all hosted shows.
                        </p>
                    </div>

                    <div className="p-8 bg-muted/20 border border-border rounded-3xl space-y-6 text-left">
                        <div className="flex gap-4">
                            <ShieldCheck className="text-primary flex-shrink-0" size={24} />
                            <div className="space-y-1">
                                <p className="font-bold uppercase tracking-tight text-sm">Verified Venue Policy</p>
                                <p className="text-xs text-muted-foreground font-medium">Every organizer is vetted to maintain high-quality listings on Comedy Connect.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Clock className="text-primary flex-shrink-0" size={24} />
                            <div className="space-y-1">
                                <p className="font-bold uppercase tracking-tight text-sm">Review Timeline</p>
                                <p className="text-xs text-muted-foreground font-medium">Standard review period is 1-2 business days.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                        <Link href="/">
                            <Button size="lg" className="h-14 px-8 font-black uppercase tracking-tighter italic gap-2 rounded-full w-full sm:w-auto">
                                Back to Home
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="h-14 px-8 font-black uppercase tracking-tighter italic gap-2 rounded-full border-border w-full sm:w-auto">
                            <Mail size={20} />
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
