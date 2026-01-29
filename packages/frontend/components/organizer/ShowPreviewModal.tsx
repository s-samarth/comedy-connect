'use client';

import React from 'react';
import { X, Calendar, MapPin, Clock, Youtube, Instagram } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ShowPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function ShowPreviewModal({ isOpen, onClose, data }: ShowPreviewModalProps) {
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
                        <div className="space-y-8">
                            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-border shadow-2xl">
                                {data.posterImageUrl ? (
                                    <img
                                        src={data.posterImageUrl}
                                        alt={data.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <p className="text-muted-foreground font-bold">No Poster Selected</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                    <div className="space-y-3">
                                        <Badge className="bg-primary hover:bg-primary text-primary-foreground font-black uppercase tracking-widest px-4 py-1.5 text-sm">
                                            ₹{data.ticketPrice || '0'}
                                        </Badge>
                                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                                            {data.title || 'Show Title'}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-8 bg-muted/30 rounded-[2rem] border border-border">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Calendar size={16} className="text-primary" />
                                        {format(showDate, 'EEE, MMM d')}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Clock size={16} className="text-primary" />
                                        {format(showDate, 'h:mm a')}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Venue</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <MapPin size={16} className="text-primary" />
                                        <span className="line-clamp-1">{data.venue || 'Venue TBD'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Clock size={16} className="text-primary" />
                                        {data.durationMinutes || 60} mins
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
                                        <div className="grid grid-cols-1 gap-6">
                                            {data.youtubeUrls?.slice(0, 1).map((url: string, i: number) => (
                                                <div key={i} className="aspect-video rounded-[1.5rem] overflow-hidden border border-border bg-muted flex items-center justify-center">
                                                    <Youtube size={48} className="text-red-500 opacity-50" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Mock */}
                            <div className="lg:col-span-1 space-y-8">
                                <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Booking Info</p>
                                        <div className="text-3xl font-black uppercase italic tracking-tighter">₹{data.ticketPrice || '0'}</div>
                                    </div>
                                    <Button disabled className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
                                        Book Tickets (Disabled in Preview)
                                    </Button>
                                    <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {data.totalTickets || '0'} Tickets Available
                                    </p>
                                </div>

                                <div className="p-8 rounded-[2rem] bg-muted/20 border border-border space-y-4">
                                    <h3 className="font-bold flex items-center gap-2 uppercase tracking-tight text-sm">
                                        <MapPin size={16} className="text-primary" />
                                        Location
                                    </h3>
                                    <p className="text-sm font-medium">{data.venue || 'Venue TBD'}</p>
                                    <Button variant="outline" disabled className="w-full rounded-full h-10 border-border text-[10px] font-bold uppercase tracking-widest opacity-50">
                                        Open in Maps
                                    </Button>
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
        </div>
    );
}
