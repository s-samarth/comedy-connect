'use client';

import { Calendar, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';

interface UserBookingsProps {
    bookings: Array<{
        id: string;
        createdAt: Date | string;
        show: {
            id: string;
            title: string;
            date: Date | string;
            venue: string;
            ticketPrice: number;
        };
    }>;
}

export default function UserBookings({ bookings }: UserBookingsProps) {
    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const getStatusBadge = (showDate: Date | string) => {
        const now = new Date();
        const showDateTime = new Date(showDate);

        if (showDateTime < now) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Past Event</span>;
        } else {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Upcoming</span>;
        }
    };

    if (bookings.length === 0) {
        return (
            <div className="bg-card rounded-lg shadow-sm border border-border p-8">
                <div className="text-center">
                    <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        You haven't booked any comedy shows yet. Start exploring and book your first show!
                    </p>
                    <Link
                        href="/shows"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Browse Shows
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-medium text-foreground">Booking History</h3>
                <p className="text-sm text-muted-foreground">Your recent comedy show bookings</p>
            </div>

            <div className="divide-y divide-border">
                {bookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <h4 className="text-lg font-medium text-foreground">{booking.show.title}</h4>
                                        <div className="mt-1 flex items-center space-x-4 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="mr-1.5 h-4 w-4" />
                                                {formatDate(booking.show.date)}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="mr-1.5 h-4 w-4" />
                                                {booking.show.venue}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getStatusBadge(booking.show.date)}
                                        <span className="text-sm text-muted-foreground">
                                            Booked on {formatDate(booking.createdAt)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-foreground">{formatPrice(booking.show.ticketPrice)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {bookings.length > 0 && (
                <div className="px-6 py-4 border-t border-border">
                    <Link
                        href="/shows"
                        className="text-sm font-medium text-primary hover:underline hover:text-primary/80"
                    >
                        Book More Shows →
                    </Link>
                </div>
            )}
        </div>
    );
}
