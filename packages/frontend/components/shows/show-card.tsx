'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ShowResponse } from '@comedy-connect/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShowCardProps {
    show: ShowResponse;
}

export function ShowCard({ show }: ShowCardProps) {
    const showDate = new Date(show.date);
    const isSoldOut = show.ticketInventory?.available === 0;

    // Get the main comedian's image or fallback to poster
    const mainComedian = show.showComedians?.[0]?.comedian;
    const displayImage = mainComedian?.profileImageUrl || show.posterImageUrl || '/logo.png';

    return (
        <Card className="group overflow-hidden bg-card/70 backdrop-blur-md border-primary/20 hover:border-primary/60 transition-all duration-300 flex flex-col h-full shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(245,166,35,0.05)] hover:shadow-primary/10">
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                    src={displayImage}
                    alt={show.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {isSoldOut ? (
                        <Badge variant="destructive" className="bg-red-600 text-white font-bold uppercase tracking-wider">
                            Sold Out
                        </Badge>
                    ) : (
                        <Badge className="bg-primary text-primary-foreground font-bold uppercase tracking-wider">
                            ₹{show.ticketPrice}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-5 flex flex-col flex-grow gap-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                        {show.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                        <Users size={14} className="text-primary" />
                        {mainComedian?.name || 'Various Artists'}
                    </p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground flex-grow">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>{format(showDate, 'EEE, MMM d • h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="line-clamp-1">{show.venue}</span>
                    </div>
                </div>

                <div className="pt-2">
                    <Link href={`/shows/${show.id}`} className="block">
                        <Button
                            className="w-full font-bold uppercase tracking-tight gap-2"
                            variant={isSoldOut ? "secondary" : "default"}
                            disabled={isSoldOut}
                        >
                            {isSoldOut ? 'View Details' : (
                                <>
                                    <Ticket size={16} />
                                    Book Tickets
                                </>
                            )}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
