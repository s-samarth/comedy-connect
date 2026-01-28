'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { api } from '@/lib/api/client';
import { ShowCard } from '@/components/shows/show-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Youtube, Instagram, MapPin, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Comedian {
    id: string;
    name: string;
    bio?: string;
    profileImageUrl?: string;
    socialLinks?: any;
    promoVideoUrl?: string;
    youtubeUrls?: string[];
    instagramUrls?: string[];
    createdAt: string;
    createdBy: string;
}

export default function PublicProfilePage() {
    const { id: userId } = useParams() as { id: string };
    const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<Comedian | null>(null);
    const [shows, setShows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/signin');
            return;
        }

        if (isAuthenticated) {
            fetchProfileData();
        }
    }, [userId, isAuthenticated, authLoading]);

    const fetchProfileData = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch all comedians to find the one matching this userId (createdBy)
            const comediansData = await api.get<{ comedians: Comedian[] }>('/api/v1/comedians');
            const foundProfile = comediansData.comedians.find(c => c.createdBy === userId);

            if (foundProfile) {
                setProfile(foundProfile);

                // 2. Fetch public shows
                const showsData = await api.get<{ shows: any[] }>('/api/v1/shows?mode=public');
                // Filter shows created by this user
                const userShows = showsData.shows.filter(s => s.createdBy === userId);
                setShows(userShows);
            } else {
                // Not a comedian, or not found
                setError("Profile info for this user is restricted or not found.");
            }
        } catch (err) {
            console.error("Failed to fetch public profile:", err);
            setError("Failed to load profile details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <main className="min-h-screen bg-background pt-32 px-4">
                <div className="container mx-auto max-w-4xl space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start anim-enter">
                        <Skeleton className="w-40 h-40 rounded-3xl" />
                        <div className="space-y-4 flex-1 w-full text-center md:text-left">
                            <Skeleton className="h-10 w-1/2 mx-auto md:mx-0" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-3/4 mx-auto md:mx-0" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-background pt-32 px-4 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md bg-muted/20 p-12 rounded-[2.5rem] border border-border mt-20">
                    <User size={48} className="mx-auto text-muted-foreground opacity-50" />
                    <h1 className="text-xl font-black uppercase tracking-tight">{error}</h1>
                    <Button variant="outline" className="rounded-full font-bold uppercase tracking-widest text-[10px]" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20 pt-32">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Navigation */}
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest mb-12">
                    <ArrowLeft size={14} /> Back
                </button>

                {/* Profile Header Card */}
                <div className="relative mb-20">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 rounded-[3rem]" />
                    <div className="bg-card border border-border rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-background shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    {profile?.profileImageUrl ? (
                                        <img src={profile.profileImageUrl} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <User size={60} className="text-muted-foreground opacity-20" />
                                        </div>
                                    )}
                                </div>
                                <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground font-black uppercase tracking-widest px-3 py-1 text-[10px] shadow-lg">
                                    ARTIST
                                </Badge>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-6 text-center md:text-left">
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                                        {profile?.name}
                                    </h1>
                                    <p className="text-primary font-bold uppercase tracking-widest text-xs">
                                        Professional Stand-up Comedian
                                    </p>
                                </div>

                                <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl text-lg">
                                    {profile?.bio || 'This artist prefers to let their comedy do the talking.'}
                                </p>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                                    {profile?.youtubeUrls?.[0] && (
                                        <a href={profile.youtubeUrls[0]} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" className="rounded-2xl gap-2 font-bold uppercase tracking-widest text-[10px] h-11 px-6 border-border hover:bg-red-50 hover:text-red-600 transition-all hover:scale-105">
                                                <Youtube size={16} /> YouTube
                                            </Button>
                                        </a>
                                    )}
                                    {profile?.instagramUrls?.[0] && (
                                        <a href={profile.instagramUrls[0]} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" className="rounded-2xl gap-2 font-bold uppercase tracking-widest text-[10px] h-11 px-6 border-border hover:bg-pink-50 hover:text-pink-600 transition-all hover:scale-105">
                                                <Instagram size={16} /> Instagram
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shows Grid */}
                <div className="space-y-12">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-black uppercase italic tracking-tight">Upcoming Shows</h2>
                        <div className="h-1 flex-1 bg-border rounded-full opacity-30" />
                        <Badge variant="outline" className="border-border text-muted-foreground uppercase tracking-widest font-black text-[10px]">
                            {shows.length} Events
                        </Badge>
                    </div>

                    {shows.length === 0 ? (
                        <div className="py-20 text-center space-y-4 bg-muted/10 rounded-[2.5rem] border border-dashed border-border">
                            <Calendar size={48} className="mx-auto text-muted-foreground opacity-30" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No upcoming shows scheduled</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {shows.map((show) => (
                                <ShowCard key={show.id} show={show} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

// Simple Badge fallback if component not in context
function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
