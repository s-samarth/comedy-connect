'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ComedianProfilePage() {
    const { user, isAuthenticated, isComedian, isLoading } = useAuth();
    const isVerified = user?.role === 'COMEDIAN_VERIFIED';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!isAuthenticated || !isComedian) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle size={48} className="text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold italic uppercase tracking-tight">Access Denied</h1>
                    <p className="text-muted-foreground font-medium">You must be logged in as a comedian to manage your artist profile.</p>
                    <Link href="/">
                        <Button className="rounded-full h-12 px-8 font-black uppercase tracking-tight italic">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="container mx-auto px-4 pt-32 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                    <div className="space-y-4">
                        <Link href="/comedian/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest mb-2">
                            <ArrowLeft size={14} />
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                                Manage <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Artist Profile</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status:</p>
                        <Badge variant={isVerified ? "default" : "outline"} className={isVerified ? "bg-green-600/10 text-green-500 border-green-500/20 py-1.5 px-4 rounded-full" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 py-1.5 px-4 rounded-full"}>
                            {isVerified ? (
                                <span className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-[11px]"><ShieldCheck size={14} /> Verified</span>
                            ) : (
                                <span className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-[11px]"><AlertCircle size={14} /> Pending Verification</span>
                            )}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-card border border-border rounded-3xl space-y-6 shadow-xl shadow-primary/5">
                            <div className="space-y-4">
                                <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-primary/20 p-1">
                                    <div className="w-full h-full rounded-2xl bg-muted overflow-hidden relative">
                                        {user?.image ? (
                                            <Image src={user.image} alt={user.name || ''} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                                <Image src="/symbol.png" alt="Logo" width={48} height={48} className="opacity-20 translate-y-2" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase italic tracking-tight">{user?.name}</h3>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{user?.comedianProfile?.stageName || 'Artist'}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</p>
                                    <p className="font-bold text-sm truncate">{user?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Number</p>
                                    <p className="font-bold text-sm">+{user?.phone ? `91 ${user.phone}` : 'Not set'}</p>
                                </div>
                            </div>

                            {!isVerified && (
                                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                                    <p className="text-[11px] font-bold text-yellow-500/80 leading-relaxed">
                                        * Complete all fields and upload a clear profile photo to speed up your verification process.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-8">
                        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/5">
                            <ProfileEditForm user={user} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
