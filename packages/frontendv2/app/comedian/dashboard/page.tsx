'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Mic2,
    Calendar,
    TrendingUp,
    Settings,
    Plus,
    ExternalLink,
    ShieldCheck,
    AlertCircle,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function ComedianDashboardPage() {
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertCircle size={48} className="text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">You must be logged in as a comedian to view this page.</p>
                    <Link href="/">
                        <Button>Back to Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge variant={isVerified ? "default" : "outline"} className={isVerified ? "bg-green-600/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}>
                                {isVerified ? (
                                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> Verified Artist</span>
                                ) : (
                                    <span className="flex items-center gap-1"><AlertCircle size={12} /> Pending Verification</span>
                                )}
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                            Artist <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Dashboard</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/comedian/profile">
                            <Button variant="outline" className="rounded-full h-12 border-border font-bold uppercase tracking-tight gap-2">
                                <Settings size={18} />
                                Profile Settings
                            </Button>
                        </Link>
                        {isVerified && (
                            <Link href="/organizer/shows/new">
                                <Button className="rounded-full h-12 font-bold uppercase tracking-tight gap-2">
                                    <Plus size={18} />
                                    Create Show
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-card border-border rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <Calendar size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Shows</p>
                                <p className="text-3xl font-black italic mt-1">0</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <Users size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Audience</p>
                                <p className="text-3xl font-black italic mt-1">0</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenue Shares</p>
                                <p className="text-3xl font-black italic mt-1">₹0</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Artist Score</p>
                                <p className="text-3xl font-black italic mt-1">--</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Verification Alert */}
                {!isVerified && (
                    <div className="p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-full">
                                <AlertCircle size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-tight underline decoration-yellow-500 decoration-2 underline-offset-4">Identity Verification Pending</h3>
                                <p className="text-sm text-muted-foreground font-medium max-w-lg">
                                    We're currently reviewing your profile to ensure you're part of the professional comedy circuit.
                                    You'll get full access once verified.
                                </p>
                            </div>
                        </div>
                        <Button className="bg-yellow-500 text-black hover:bg-yellow-600 rounded-full h-12 px-8 font-black uppercase tracking-tight italic">
                            Check Status
                        </Button>
                    </div>
                )}

                {/* Recent Activity / My Shows Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                <span className="w-8 h-1 bg-primary rounded-full" />
                                UPCOMING SHOWS
                            </h2>
                            <Link href="/organizer/shows" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View All</Link>
                        </div>

                        <div className="bg-muted/20 border border-border rounded-3xl p-12 text-center space-y-4">
                            <Mic2 size={48} className="text-muted-foreground/30 mx-auto" />
                            <p className="text-muted-foreground font-bold uppercase tracking-tight italic">No shows scheduled yet.</p>
                            {isVerified && (
                                <Link href="/organizer/shows/new" className="inline-block">
                                    <Button variant="outline" className="rounded-full h-12 border-border font-black uppercase tracking-tight gap-2">
                                        <Plus size={18} /> List My First Show
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                            <span className="w-8 h-1 bg-primary rounded-full" />
                            MY PROFILE
                        </h2>

                        <Card className="bg-card border-border rounded-3xl overflow-hidden">
                            <div className="relative h-32 bg-primary/20">
                                <div className="absolute -bottom-10 left-6 p-1 bg-card rounded-2xl border border-border">
                                    <div className="w-20 h-20 rounded-xl bg-muted animate-pulse" />
                                </div>
                            </div>
                            <CardContent className="pt-14 pb-8 px-6 space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase tracking-tight italic">{user?.name}</h3>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{user?.comedianProfile?.stageName || 'New Artist'}</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border">
                                    <Link href="/profile" className="flex items-center justify-between group">
                                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Public Profile</span>
                                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                    </Link>
                                </div>

                                <Button variant="outline" className="w-full rounded-full h-12 border-border font-black uppercase tracking-tight gap-2">
                                    Share Profile
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
