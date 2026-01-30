'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useShow, useAuth } from '@/lib/hooks';

import { ShowBooking } from '@/components/shows/show-booking';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, Clock, Youtube, Instagram, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getYouTubeId, getInstagramId } from '@/lib/validations';

export default function ShowDetailsPage() {
    const { id } = useParams() as { id: string };
    const { show, isLoading, error } = useShow(id);
    const { user } = useAuth();

    if (isLoading) {
        return (
            <main className="min-h-screen">

                <div className="container mx-auto px-4 pt-32">
                    <Skeleton className="h-[400px] w-full rounded-3xl" />
                </div>
            </main>
        );
    }

    if (error || !show) {
        return (
            <main className="min-h-screen">

                <div className="container mx-auto px-4 pt-32 text-center">
                    <h1 className="text-2xl font-bold">Show not found</h1>
                    <Link href="/shows">
                        <Button variant="link" className="mt-4">Back to shows</Button>
                    </Link>
                </div>
            </main>
        );
    }

    const showDate = new Date(show.date);

    return (
        <main className="min-h-screen">
            <div className="container mx-auto px-4 pt-32 pb-20">
                {/* Back Link */}
                <Link href="/shows" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-xs tracking-widest mb-8">
                    <ArrowLeft size={16} />
                    Back to all shows
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Header / Hero */}
                        <div className="space-y-6">
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl">
                                <Image
                                    src={show.posterImageUrl || '/logo.png'}
                                    alt={show.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                    <div className="space-y-2">
                                        <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-widest">
                                            ₹{show.ticketPrice}
                                        </Badge>
                                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                                            {show.title}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-muted/30 rounded-3xl border border-border">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Date</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Calendar size={14} className="text-primary" />
                                        {format(showDate, 'EEE, MMM d')}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Time</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Clock size={14} className="text-primary" />
                                        {format(showDate, 'h:mm a')}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Venue</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <MapPin size={14} className="text-primary" />
                                        <span className="line-clamp-1">{show.venue}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground uppercase">Duration</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Clock size={14} className="text-primary" />
                                        {show.durationMinutes || 60} mins
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                <span className="w-8 h-1 bg-primary rounded-full" />
                                About the Show
                            </h2>
                            <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                                {show.description || 'No description provided for this show.'}
                            </p>
                        </div>

                        {/* Organizer vs Comedians Section */}
                        {show.creator?.role?.includes('ORGANIZER') ? (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                    <span className="w-8 h-1 bg-primary rounded-full" />
                                    Organized by
                                </h2>
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-muted/20 border border-border hover:border-primary/30 transition-all group max-w-md">
                                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center text-primary font-black text-3xl border border-primary/20">
                                        {(show.creator as any)?.name?.charAt(0).toUpperCase() || 'O'}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{(show.creator as any)?.name || 'Organizer'}</h3>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">Verified Host</p>
                                        <div className="flex gap-4 pt-2">
                                            <Link href={`/profile/${(show.creator as any)?.id}`}>
                                                <Button variant="outline" size="sm" className="rounded-full h-8 text-[10px] uppercase font-black tracking-widest px-4">
                                                    View Profile
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Featuring Section */
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                    <span className="w-8 h-1 bg-primary rounded-full" />
                                    FEATURING
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {show.showComedians.map(({ comedian }) => (
                                        <div key={(comedian as any).id} className="flex gap-4 p-4 rounded-2xl bg-muted/20 border border-border hover:border-primary/30 transition-all group">
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={(comedian as any).profileImageUrl || '/logo.png'}
                                                    alt={(comedian as any).name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{(comedian as any).name}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 font-medium">{(comedian as any).bio || 'Professional Stand-up Comedian.'}</p>
                                                <div className="flex gap-3 pt-1">
                                                    {(comedian as any).youtubeUrls?.map((url: string, i: number) => (
                                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                                            <Youtube size={16} className="text-muted-foreground hover:text-red-500 cursor-pointer" />
                                                        </a>
                                                    ))}
                                                    {(comedian as any).instagramUrls?.map((url: string, i: number) => (
                                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                                            <Instagram size={16} className="text-muted-foreground hover:text-pink-500 cursor-pointer" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Social Feed / Media */}
                        {(show.youtubeUrls?.length > 0 || show.instagramUrls?.length > 0) && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                    <span className="w-8 h-1 bg-primary rounded-full" />
                                    Watch Highlights
                                </h2>
                                <div className="grid grid-cols-1 gap-8">
                                    {show.youtubeUrls?.map((url, i) => {
                                        const videoId = getYouTubeId(url);
                                        if (videoId) {
                                            return (
                                                <div key={`yt-${i}`} className="aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl bg-black">
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                        title="YouTube video player"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            )
                                        }
                                        return null;
                                    })}
                                    {show.instagramUrls?.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {show.instagramUrls?.map((url, i) => {
                                                const reelId = getInstagramId(url);
                                                if (reelId) {
                                                    return (
                                                        <div key={`ig-${i}`} className="flex justify-center">
                                                            <div className="rounded-3xl overflow-hidden border border-border shadow-2xl bg-white aspect-[9/16] w-full max-w-[320px]">
                                                                <iframe
                                                                    className="w-full h-full"
                                                                    src={`https://www.instagram.com/reel/${reelId}/embed`}
                                                                    frameBorder="0"
                                                                    scrolling="no"
                                                                    // @ts-expect-error - legacy attribute
                                                                    allowtransparency="true"
                                                                ></iframe>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Booking */}
                    <div className="lg:col-span-4 relative">
                        <ShowBooking show={show} user={user} />

                        {/* Venue Card */}
                        <div className="mt-8 p-6 rounded-3xl bg-muted/20 border border-border space-y-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <MapPin size={18} className="text-primary" />
                                Location
                            </h3>
                            <p className="text-sm font-medium">{show.venue}</p>
                            <a
                                href={show.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <Button variant="outline" className="w-full rounded-full h-10 border-border text-xs font-bold uppercase tracking-widest">
                                    Open in Google Maps
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
