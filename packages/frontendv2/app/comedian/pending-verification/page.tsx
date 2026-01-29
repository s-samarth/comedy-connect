'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Clock, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ComedianPendingPage() {
    return (
        <main className="min-h-screen bg-transparent flex flex-col">


            <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-4">
                <div className="max-w-xl w-full space-y-8 text-center">
                    {/* Icon */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 rounded-full" />
                        <Clock size={80} className="text-primary mx-auto relative z-10" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                            Verification <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Pending</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">
                            Your artist profile has been submitted and is currently being reviewed by our team.
                        </p>
                    </div>

                    <div className="p-8 bg-muted/20 border border-border rounded-3xl space-y-6 text-left">
                        <div className="flex gap-4">
                            <ShieldCheck className="text-primary flex-shrink-0" size={24} />
                            <div className="space-y-1">
                                <p className="font-bold uppercase tracking-tight text-sm">Security & Trust</p>
                                <p className="text-xs text-muted-foreground font-medium">We verify every artist to ensure a premium experience for comedy fans.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Clock className="text-primary flex-shrink-0" size={24} />
                            <div className="space-y-1">
                                <p className="font-bold uppercase tracking-tight text-sm">Estimated Time</p>
                                <p className="text-xs text-muted-foreground font-medium">Review typically takes 24-48 business hours.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                        <Link href="/">
                            <Button size="lg" className="h-14 px-8 font-black uppercase tracking-tighter italic gap-2 rounded-full w-full sm:w-auto">
                                Go to Home
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
