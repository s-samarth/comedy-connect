'use client';

import React from 'react';
import { useShows } from '@/lib/hooks';
import { ShowCard } from './show-card';
import { Skeleton } from '@/components/ui/skeleton';

interface ShowListProps {
    mode?: 'discovery' | 'manage' | 'public';
}

export function ShowList({ mode = 'discovery' }: ShowListProps) {
    const { shows, isLoading, error } = useShows(mode);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <Skeleton className="aspect-[4/5] rounded-xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Failed to load shows. Please try again later.</p>
            </div>
        );
    }

    if (shows.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No shows found. Check back later!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
            ))}
        </div>
    );
}
