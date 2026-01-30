'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShowResponse } from '@comedy-connect/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, AlertCircle, Loader2, Calendar, Hourglass, Users, Languages, Theater, MapPin, Navigation, Info, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api/client';

interface ShowBookingProps {
    show: ShowResponse;
    user: any;
}

export function ShowBooking({ show, user }: ShowBookingProps) {
    const router = useRouter();
    const [quantity, setQuantity] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const availableTickets = show.ticketInventory?.available || 0;
    const isSoldOut = availableTickets === 0;
    const isPastShow = new Date(show.date) < new Date();
    const maxQuantity = Math.min(availableTickets, 10);

    const subtotal = show.ticketPrice * quantity;
    const bookingFee = subtotal * 0.08; // Assuming 8% as per existing logic
    const total = subtotal + bookingFee;

    const handleBooking = async () => {
        if (!user) {
            window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`;
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post<{ booking: { id: string } }>('/api/v1/bookings', {
                showId: show.id,
                quantity,
            });

            router.push(`/shows/${show.id}/success?bookingId=${response.booking.id}`);
        } catch (err: any) {
            setError(err.message || 'Booking failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="sticky top-32 border-2 border-primary/60 bg-card/85 backdrop-blur-3xl shadow-[0_0_60px_rgba(0,0,0,0.6),0_0_30px_rgba(245,166,35,0.15)] overflow-hidden rounded-[2rem]">
            <CardContent className="p-5 space-y-5">
                {/* Unified Event Details Header */}
                <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2 border-b border-primary/20 pb-3">
                    <Ticket className="text-primary" size={18} />
                    Event Details
                </h3>

                {/* Vertical Details List */}
                <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-4">
                        <Calendar size={18} className="text-muted-foreground" />
                        <p className="text-sm font-black uppercase tracking-tight">{format(new Date(show.date), 'EEE, d MMM yyyy')}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Clock size={18} className="text-muted-foreground" />
                        <p className="text-sm font-black uppercase tracking-tight">{format(new Date(show.date), 'h:mm a')}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Hourglass size={18} className="text-muted-foreground" />
                        <p className="text-sm font-bold">{show.durationMinutes || 60} Minutes</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Users size={18} className="text-muted-foreground" />
                        <p className="text-sm font-bold">Age Limit - 16yrs +</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Languages size={18} className="text-muted-foreground" />
                        <p className="text-sm font-bold">English, Hindi</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Theater size={18} className="text-muted-foreground" />
                        <p className="text-sm font-bold">Stand-up Comedy</p>
                    </div>

                    <div className="flex items-start gap-4">
                        <MapPin size={18} className="text-muted-foreground mt-0.5" />
                        <div className="flex-grow space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold line-clamp-2">{show.venue}</p>
                                <a href={show.googleMapsLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-colors">
                                    <Navigation size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-3.5 border-t border-primary/20">
                    {availableTickets < 30 && !isSoldOut && (
                        <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 mb-5">
                            <Info size={16} className="flex-shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-tight">Bookings are filling fast!</p>
                        </div>
                    )}

                    {/* Status Messages */}
                    {isPastShow ? (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p className="text-sm font-bold uppercase tracking-tight">This show has already ended.</p>
                        </div>
                    ) : isSoldOut ? (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                            <Ticket size={20} className="flex-shrink-0" />
                            <p className="text-sm font-bold uppercase tracking-tight">🎫 SOLD OUT! Check back later.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Quantity Selector */}
                            {user && (
                                <div className="flex items-center justify-between gap-4 p-3 bg-primary/10 rounded-xl border border-primary/30 shadow-inner">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">
                                        Tickets
                                    </label>
                                    <Select
                                        value={quantity.toString()}
                                        onValueChange={(val) => setQuantity(parseInt(val))}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-20 h-9 rounded-lg border-primary/40 bg-background/80 font-black text-primary shadow-sm hover:border-primary transition-colors">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-primary/40">
                                            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                                                <SelectItem key={num} value={num.toString()} className="font-bold">
                                                    {num}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Footer Price & Button */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <p className="text-2xl font-black text-primary italic leading-none">₹{subtotal.toFixed(0)}</p>
                                    {availableTickets < 20 && <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Filling Fast</p>}
                                </div>
                                <Button
                                    className="h-14 px-10 rounded-2xl text-lg font-black uppercase tracking-tighter italic shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                    onClick={handleBooking}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        'Book Now'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
