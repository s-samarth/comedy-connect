'use client';

import React from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useShow } from '@/lib/hooks';

import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, MapPin, Ticket, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const { id } = useParams() as { id: string };
    const { show, isLoading } = useShow(id);
    const bookingId = searchParams.get('bookingId');

    if (isLoading || !show) {
        return (
            <main className="min-h-screen bg-transparent">

                <div className="container mx-auto px-4 pt-32 text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-12 w-12 bg-muted rounded-full mx-auto" />
                        <div className="h-8 w-64 bg-muted rounded mx-auto" />
                    </div>
                </div>
            </main>
        );
    }

    const showDate = new Date(show.date);

    return (
        <main className="min-h-screen bg-transparent flex flex-col">
            <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-4">
                <div className="max-w-xl w-full space-y-8 text-center">
                    {/* Success Icon */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 rounded-full" />
                        <CheckCircle2 size={80} className="text-primary mx-auto relative z-10 animate-in zoom-in duration-500" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                            You're <span className="text-primary underline decoration-primary decoration-4 underline-offset-4">In!</span>
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            Your booking is confirmed. Get ready for a night of pure laughter.
                        </p>
                    </div>

                    {/* Ticket Info Card */}
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                        <div className="p-8 space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Booking ID: {bookingId || 'CC-XXXXXX'}</p>
                                <h2 className="text-2xl font-black uppercase tracking-tight line-clamp-1 italic">{show.title}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-left border-t border-border pt-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date & Time</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <Calendar size={14} className="text-primary" />
                                        {format(showDate, 'EEE, MMM d • h:mm a')}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Venue</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <MapPin size={14} className="text-primary" />
                                        <span className="line-clamp-1">{show.venue}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Ticket size={24} className="text-primary" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                                        <p className="text-sm font-bold uppercase tracking-tight">Confirmed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Paid</p>
                                    <p className="text-lg font-black italic">₹{(show.ticketPrice * 1.08).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Footer / Tear off effect */}
                        <div className="relative h-4 bg-muted border-t border-dashed border-border flex justify-between items-center px-4 overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-background" />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                        <Link href="/bookings">
                            <Button size="lg" className="h-14 px-8 font-black uppercase tracking-tighter italic gap-2 rounded-full w-full sm:w-auto">
                                My Bookings
                                <ArrowRight size={20} />
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="h-14 px-8 font-black uppercase tracking-tighter italic gap-2 rounded-full border-border w-full sm:w-auto">
                            <Download size={20} />
                            Save Ticket
                        </Button>
                    </div>

                    <Link href="/shows" className="block text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors pt-4">
                        Keep browsing shows
                    </Link>
                </div>
            </div>
        </main>
    );
}
