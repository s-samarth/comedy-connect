'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShowResponse } from '@comedy-connect/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, AlertCircle, Loader2 } from 'lucide-react';
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
        <Card className="sticky top-24 border-border bg-card shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="text-xl font-black uppercase italic tracking-tight">
                    Book Tickets
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Price Display */}
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-primary italic">₹{show.ticketPrice}</span>
                    <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">per ticket</span>
                </div>

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
                    <>
                        {/* Quantity Selector */}
                        {user && (
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    Number of Tickets
                                </label>
                                <Select
                                    value={quantity.toString()}
                                    onValueChange={(val) => setQuantity(parseInt(val))}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full h-12 rounded-full border-border bg-muted/30 font-bold">
                                        <SelectValue placeholder="Select quantity" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                                            <SelectItem key={num} value={num.toString()} className="font-bold">
                                                {num} {num === 1 ? 'Ticket' : 'Tickets'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                                    {availableTickets} tickets available
                                </p>
                            </div>
                        )}

                        {/* Price Breakdown */}
                        {user && (
                            <div className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-border">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Booking Fee (8%)</span>
                                    <span>₹{bookingFee.toFixed(2)}</span>
                                </div>
                                <div className="pt-3 border-t border-border flex justify-between items-center">
                                    <span className="font-black uppercase tracking-tighter">Total Amount</span>
                                    <span className="text-2xl font-black text-foreground">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-xs font-bold text-red-500 uppercase tracking-tight bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </p>
                        )}

                        {/* Action Button */}
                        <Button
                            className="w-full h-14 rounded-full text-lg font-black uppercase tracking-tighter italic gap-2 transition-all active:scale-[0.98]"
                            onClick={handleBooking}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : user ? (
                                <>
                                    <Ticket size={20} />
                                    Confirm Booking
                                </>
                            ) : (
                                'Sign in to Book'
                            )}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
