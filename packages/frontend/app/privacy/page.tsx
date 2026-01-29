'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-transparent text-white selection:bg-primary/30 pt-24 pb-20">
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Back Button */}
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <div className="max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                        <Shield className="w-3 h-3 text-primary" />
                        Legal, Because We Don't Want To Go To Jail
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] mb-12">
                        PRIVACY <span className="text-primary italic underline decoration-primary decoration-8 underline-offset-8">POLICY.</span>
                    </h1>

                    <div className="space-y-12 prose prose-invert prose-neutral max-w-none">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold uppercase tracking-tight text-white border-l-4 border-primary pl-4">1. Information We Collect</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                At Comedy Connect, we collect information to provide a better experience for all our users. This includes account information like your name, email address, and ticket purchase history.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold uppercase tracking-tight text-white border-l-4 border-primary pl-4">2. How We Use Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use the information we collect to maintain and improve our services, to develop new ones, and to protect Comedy Connect and our users.
                            </p>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                                <li>Process your event bookings and payments.</li>
                                <li>Send you updates about upcoming shows.</li>
                                <li>Personalize your experience with relevant comedian recommendations.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold uppercase tracking-tight text-white border-l-4 border-primary pl-4">3. Data Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We work hard to protect Comedy Connect and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold uppercase tracking-tight text-white border-l-4 border-primary pl-4">4. Updates to This Policy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our Privacy Policy may change from time to time. We will post any privacy policy changes on this page and, if the changes are significant, we will provide a more prominent notice.
                            </p>
                        </section>

                        <div className="pt-12 border-t border-white/5 text-sm text-muted-foreground font-medium italic">
                            Last updated: January 30, 2026
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
