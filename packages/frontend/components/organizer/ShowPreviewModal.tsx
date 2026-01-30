'use client';

import React from 'react';
import Image from 'next/image';
import { X, Calendar, MapPin, Clock, Youtube, Instagram, Users, Hourglass, Languages, Theater, Navigation, Info, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getYouTubeId, getInstagramId } from '@/lib/validations';
import { useAuth } from '@/lib/hooks';

interface ShowPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function ShowPreviewModal({ isOpen, onClose, data }: ShowPreviewModalProps) {
    const { user } = useAuth();
    if (!isOpen || !data) return null;

    const showDate = data.date ? new Date(data.date) : new Date();

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-background w-full max-w-5xl rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden max-h-[90vh] border border-border">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[110] bg-background/50 hover:bg-background/80 p-3 rounded-full text-foreground backdrop-blur-md transition-all border border-border"
                >
                    <X size={20} />
                </button>

                {/* Preview Banner */}
                <div className="bg-primary text-primary-foreground text-center text-[10px] font-black uppercase tracking-[0.2em] py-2 z-[105] shadow-lg">
                    Preview Mode • How it will appear to users
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="container mx-auto px-6 py-12 space-y-12">
                        {/* Hero Section */}
                        {/* Hero Section Banner */}
                        <div className="space-y-8">
                            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">
                                {data.title || 'Show Title'}
                            </h1>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-9 space-y-12">
                                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-primary/50 shadow-[0_0_50px_rgba(0,0,0,0.6),0_0_30px_rgba(245,166,35,0.2)]">
                                        {data.posterImageUrl ? (
                                            <Image
                                                src={data.posterImageUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <p className="text-muted-foreground font-bold">No Poster Selected</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                    </div>
                                </div>

                                {/* Sidebar Mock */}
                                <div className="lg:col-span-3">
                                    <div className="border-2 border-primary/60 bg-card/85 backdrop-blur-3xl shadow-[0_0_60px_rgba(0,0,0,0.6),0_0_30px_rgba(245,166,35,0.15)] overflow-hidden rounded-[2rem]">
                                        <div className="p-5 space-y-5">
                                            {/* Unified Header */}
                                            <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2 border-b border-primary/20 pb-3">
                                                <Ticket className="text-primary" size={18} />
                                                Event Details
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} className="text-muted-foreground" />
                                                    <p className="text-xs font-black uppercase tracking-tight">{format(showDate, 'EEE, d MMM yyyy')}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Clock size={18} className="text-muted-foreground" />
                                                    <p className="text-xs font-black uppercase tracking-tight">{format(showDate, 'h:mm a')}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Hourglass size={18} className="text-muted-foreground" />
                                                    <p className="text-xs font-bold">{data.durationMinutes || 60} Mins</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Users size={18} className="text-muted-foreground" />
                                                    <p className="text-xs font-bold">Age 16+</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MapPin size={18} className="text-muted-foreground" />
                                                    <p className="text-xs font-bold line-clamp-1">{data.venue || 'Venue TBD'}</p>
                                                </div>
                                            </div>

                                            <div className="pt-5 border-t border-primary/20 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xl font-black text-primary italic leading-none">₹{data.ticketPrice || '0'}</p>
                                                    <Button disabled className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-tighter italic">
                                                        Book
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                                    <span className="w-10 h-1.5 bg-primary rounded-full" />
                                    About the Show
                                </h2>
                                <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap text-lg">
                                    {data.description || 'No description provided for this show yet.'}
                                </p>
                            </div>

                            {/* Media */}
                            {(data.youtubeUrls?.length > 0 || data.instagramUrls?.length > 0) && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                                        <span className="w-10 h-1.5 bg-primary rounded-full" />
                                        Watch Highlights
                                    </h2>
                                    <div className="grid grid-cols-1 gap-8">
                                        {data.youtubeUrls?.map((url: string, i: number) => {
                                            const videoId = getYouTubeId(url);
                                            if (!videoId) return null;
                                            return (
                                                <div key={`yt-${i}`} className="aspect-video rounded-[2rem] overflow-hidden border border-primary/20 shadow-2xl bg-black">
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                        title="YouTube video player"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            );
                                        })}
                                        {data.instagramUrls?.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {data.instagramUrls?.map((url: string, i: number) => {
                                                    const reelId = getInstagramId(url);
                                                    if (!reelId) return null;
                                                    return (
                                                        <div key={`ig-${i}`} className="flex justify-center">
                                                            <div className="rounded-[2rem] overflow-hidden border border-primary/20 shadow-2xl bg-white aspect-[9/16] w-full max-w-[320px]">
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
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Organizer Info - Moved to main column for better flow */}
                        <div className="p-8 rounded-[2rem] bg-card/50 border-2 border-primary/30 backdrop-blur-xl space-y-6 shadow-lg">
                            <h3 className="font-bold flex items-center gap-2 uppercase tracking-tight text-sm">
                                <Users size={16} className="text-primary" />
                                Organized By
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20">
                                    {user?.name?.charAt(0).toUpperCase() || 'O'}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-black text-sm uppercase tracking-tight">{user?.name || 'Organizer'}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verified Host</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-border bg-background/80 backdrop-blur-md flex justify-end gap-4 z-[110]">
                <Button variant="ghost" onClick={onClose} className="font-bold uppercase tracking-widest text-xs px-8 h-12 rounded-xl">
                    Close Preview
                </Button>
                <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs px-12 h-12 rounded-xl shadow-xl shadow-primary/20">
                    Looks Great
                </Button>
            </div>
        </div>
    );
}
