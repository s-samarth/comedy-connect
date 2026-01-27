import { Navbar } from '@/components/layout/navbar';
import { ShowList } from '@/components/shows/show-list';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ShowsPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-20">
                {/* Header */}
                <div className="flex flex-col gap-8 mb-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                            All <span className="text-primary underline decoration-primary decoration-4 underline-offset-8">Comedy</span> Shows
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-2xl">
                            Browse our curated selection of the finest stand-up comedy shows in town.
                            Filter by date, venue, or comedian to find your perfect night out.
                        </p>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder="Search shows, comedians, or venues..."
                                className="pl-10 h-12 bg-muted/50 border-border focus:border-primary/50 transition-all rounded-full"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="h-12 border-border font-bold uppercase tracking-tight gap-2 rounded-full">
                                <Calendar size={18} />
                                Date
                            </Button>
                            <Button variant="outline" className="h-12 border-border font-bold uppercase tracking-tight gap-2 rounded-full">
                                <MapPin size={18} />
                                Venue
                            </Button>
                            <Button variant="outline" className="h-12 border-border font-bold uppercase tracking-tight gap-2 rounded-full">
                                <SlidersHorizontal size={18} />
                                Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Show List */}
                <ShowList mode="discovery" />

                {/* Load More/Pagination */}
                <div className="mt-20 text-center">
                    <Button variant="outline" size="lg" className="font-bold border-border hover:bg-muted px-8 rounded-full">
                        Load More Shows
                    </Button>
                </div>
            </div>

            {/* Footer (Simplified) */}
            <footer className="py-12 border-t border-border mt-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        © 2026 Comedy Connect. Secure Booking Guaranteed.
                    </p>
                </div>
            </footer>
        </main>
    );
}

import { Calendar, MapPin } from 'lucide-react';
