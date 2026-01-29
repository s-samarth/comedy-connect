'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useBookings } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, MapPin, Ticket, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { bookings, isLoading: isBookingsLoading } = useBookings();

    if (isAuthLoading || isBookingsLoading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!user) {
        window.location.href = '/auth/signin?callbackUrl=/bookings';
        return null;
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED_UNPAID':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-bold uppercase tracking-widest text-[10px]">Confirmed</Badge>;
            case 'CONFIRMED':
                return <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]">Paid</Badge>;
            case 'PENDING':
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-bold uppercase tracking-widest text-[10px]">Pending</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-bold uppercase tracking-widest text-[10px]">Cancelled</Badge>;
            default:
                return <Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px]">{status}</Badge>;
        }
    };

    return (
        <main className="min-h-screen bg-transparent py-20 px-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 space-y-12">
                <div className="text-center space-y-4">
                    <Image src="/symbol.png" alt="Logo" width={64} height={64} className="mx-auto" />
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        MY <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">BOOKINGS</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Your history of laughter and entertainment.</p>
                </div>

                {bookings.length === 0 ? (
                    <Card className="bg-card border-border shadow-2xl rounded-3xl overflow-hidden border-dashed">
                        <CardContent className="p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <Ticket size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black uppercase italic tracking-tight">No Bookings Yet</h3>
                                <p className="text-muted-foreground font-medium">You haven't booked any comedy shows yet. Start exploring!</p>
                            </div>
                            <Link href="/shows">
                                <Button className="h-12 rounded-full px-8 font-black uppercase tracking-tighter italic gap-2">
                                    Browse Shows <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking: any) => {
                            const showDate = new Date(booking.show.date);
                            const isPastShow = showDate < new Date();

                            return (
                                <Card
                                    key={booking.id}
                                    className={`group bg-card border-border hover:border-primary/50 transition-all duration-500 rounded-3xl overflow-hidden ${isPastShow ? 'opacity-60' : 'shadow-xl shadow-primary/5'}`}
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Show Image */}
                                        <div className="md:w-64 aspect-video md:aspect-auto relative bg-muted flex-shrink-0 overflow-hidden">
                                            {booking.show.posterImageUrl ? (
                                                <Image
                                                    src={booking.show.posterImageUrl}
                                                    alt={booking.show.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground opacity-20">
                                                    <Sparkles size={48} />
                                                </div>
                                            )}
                                            {isPastShow && (
                                                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <Badge variant="secondary" className="font-black uppercase tracking-widest">Past Event</Badge>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <CardContent className="flex-1 p-8 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black uppercase italic tracking-tight group-hover:text-primary transition-colors">
                                                        {booking.show.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} className="text-primary" />
                                                            {format(showDate, 'EEE, MMM d, yyyy')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={14} className="text-primary" />
                                                            {booking.show.venue}
                                                        </span>
                                                    </div>
                                                </div>
                                                {getStatusBadge(booking.status)}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/50">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets</p>
                                                    <p className="font-black text-xl italic">{booking.quantity}</p>
                                                </div>
                                                <div className="space-y-1 text-primary">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Amount</p>
                                                    <p className="font-black text-xl italic">₹{booking.totalAmount + (booking.bookingFee || 0)}</p>
                                                </div>
                                                <div className="space-y-1 ml-auto text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Booking ID</p>
                                                    <p className="font-mono text-xs font-bold uppercase">{booking.id.slice(0, 8)}</p>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Link href={`/shows/${booking.show.id}`}>
                                                    <Button variant="outline" className="w-full rounded-full h-10 border-border hover:bg-muted font-bold uppercase text-[10px] tracking-widest">
                                                        View Show Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
