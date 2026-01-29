'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Users, Mic2, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-transparent text-white selection:bg-primary/30 pt-24 pb-20">
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[15%] w-[35rem] h-[35rem] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Back Button */}
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                                <Sparkles className="w-3 h-3 text-primary" />
                                Our Story
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
                                THE CRAFT. THE LAUGHS. <br />
                                <span className="text-primary italic underline decoration-primary decoration-8 underline-offset-8">THE CONNECTION.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                                Comedy Connect is Hyderabad's premier platform dedicated to the raw energy of live stand-up. We're bridging the gap between world-class artists and the city's most passionate fans.
                            </p>
                        </div>
                    </div>

                    {/* Founder Reveal */}
                    <div className="relative group max-w-sm mx-auto lg:ml-auto lg:mr-0 w-full">
                        <div className="absolute -inset-4 bg-primary/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl">
                            <Image
                                src="/my-photo.png"
                                alt="Samarth Saraswat"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <Quote className="w-5 h-5 fill-primary" />
                                    <div className="h-px flex-1 bg-primary/20" />
                                </div>
                                <p className="text-xl font-black italic tracking-tighter uppercase text-white leading-tight">
                                    "Comedy is the <span className="text-primary">shortest distance</span> between two people."
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-1 pl-2">
                            <h3 className="text-lg font-bold uppercase tracking-tight text-white">Samarth Saraswat</h3>
                            <p className="text-xs font-black uppercase tracking-widest text-primary italic">
                                Founder, Comedy Connect & Standup Comedian
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mission Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Mic2 className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">Support Talent</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Empowering local and famous comedians with seamless booking tools and a platform to reach their audience directly.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">Community First</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Building a vibrant community of comedy lovers through curated events, interactive profiles, and exclusive early access.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">Pure Experiences</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Ensuring every show is a premium experience, from lightning-fast ticket booking to the final standing ovation.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative rounded-[40px] overflow-hidden p-12 md:p-20 text-center border border-white/5">
                    <div className="absolute inset-0 bg-primary/5 -z-10" />
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-6">
                        Ready to join the <span className="text-primary italic">Movement?</span>
                    </h2>
                    <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
                        Whether you're a comedian looking for a stage or a fan looking for a laugh, there's a place for you here.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button size="lg" className="rounded-full px-12 h-14 text-base font-bold uppercase tracking-widest bg-primary text-black hover:bg-white transition-all shadow-lg shadow-primary/20">
                                Start Vibing
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
