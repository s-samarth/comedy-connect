'use client';

import React from 'react';
import { useAuth, useSales } from '@/lib/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    Ticket,
    Calendar,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Download,
    ChevronRight,
    Sparkles,
    Building2,
    MapPin
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function OrganizerSalesPage() {
    const { user, isAuthenticated, isOrganizer, isLoading: isAuthLoading } = useAuth();
    const { sales, isLoading: isSalesLoading } = useSales();

    if (isAuthLoading || isSalesLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!isAuthenticated || !isOrganizer) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle size={48} className="text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold italic uppercase tracking-tight">Access Denied</h1>
                    <p className="text-muted-foreground font-medium">You must be logged in as an organizer to view sales reports.</p>
                    <Link href="/">
                        <Button className="rounded-full h-12 px-8 font-black uppercase tracking-tight italic">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const totalTicketsSold = sales.reduce((sum, show) => sum + show.ticketsSold, 0);
    const totalRevenue = sales.reduce((sum, show) => sum + show.totalRevenue, 0);

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="container mx-auto px-4 pt-32 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                    <div className="space-y-4">
                        <Link href="/organizer/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest mb-2">
                            <ArrowLeft size={14} />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                            Organizer <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Sales Report</span>
                        </h1>
                    </div>

                    <Button variant="outline" className="rounded-full h-12 border-border font-bold uppercase tracking-tight gap-2">
                        <Download size={18} />
                        Download CSV
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
                        <CardContent className="p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 text-primary">
                                <TrendingUp size={12} /> Total Revenue
                            </p>
                            <p className="text-4xl font-black italic tracking-tighter transition-all">₹{totalRevenue.toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
                        <CardContent className="p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 text-primary">
                                <Ticket size={12} /> Tickets Sold
                            </p>
                            <p className="text-4xl font-black italic tracking-tighter transition-all">{totalTicketsSold.toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
                        <CardContent className="p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 text-primary">
                                <Building2 size={12} /> Total Shows
                            </p>
                            <p className="text-4xl font-black italic tracking-tighter transition-all">{sales.length}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
                        <CardContent className="p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 text-primary">
                                <Sparkles size={12} /> Fill rate
                            </p>
                            <p className="text-4xl font-black italic tracking-tighter transition-all">
                                {Math.round((totalTicketsSold / (sales.reduce((sum, s) => sum + s.totalTickets, 0) || 1)) * 100)}%
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Table Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                        <span className="w-8 h-1 bg-primary rounded-full" />
                        EVENT SETTLEMENTS
                    </h2>

                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="text-left py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Show Details</th>
                                        <th className="text-center py-6 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets Sold</th>
                                        <th className="text-right py-6 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Net Revenue</th>
                                        <th className="text-center py-6 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                        <th className="text-right py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {sales.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 px-8 text-center">
                                                <div className="space-y-4 opacity-30">
                                                    <AlertCircle size={48} className="mx-auto" />
                                                    <p className="font-bold uppercase italic">No sales recordings found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sales.map((show) => (
                                            <tr key={show.showId} className="group hover:bg-muted/30 transition-colors">
                                                <td className="py-6 px-8">
                                                    <div className="space-y-1">
                                                        <p className="font-black uppercase italic tracking-tight group-hover:text-primary transition-colors">{show.title}</p>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            <span className="flex items-center gap-1"><Calendar size={12} className="text-primary" /> {format(new Date(show.date), 'MMM d')}</span>
                                                            <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {show.venue || 'Venue'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="space-y-1.5 flex flex-col items-center">
                                                        <p className="font-black italic text-sm">{show.ticketsSold} / {show.totalTickets}</p>
                                                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-primary to-orange-500"
                                                                style={{ width: `${(show.ticketsSold / show.totalTickets) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-right">
                                                    <p className="font-black italic text-xl text-primary">₹{show.totalRevenue.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Settled</p>
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                                                        Settled
                                                    </Badge>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <Link href={`/shows/${show.showId}`}>
                                                        <Button variant="ghost" size="sm" className="rounded-full h-10 border border-border/50 font-black uppercase text-[10px] tracking-widest gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                                                            Details <ChevronRight size={14} />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
