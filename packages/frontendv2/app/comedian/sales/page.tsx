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
    IndianRupee
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ComedianSalesPage() {
    const { user, isAuthenticated, isComedian, isLoading: isAuthLoading } = useAuth();
    const { sales, isLoading: isSalesLoading } = useSales();

    if (isAuthLoading || isSalesLoading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!isAuthenticated || !isComedian) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle size={48} className="text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold italic uppercase tracking-tight">Access Denied</h1>
                    <p className="text-muted-foreground font-medium">You must be logged in as a comedian to view sales reports.</p>
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
    const avgTicketPrice = sales.length > 0 ? totalRevenue / totalTicketsSold : 0;

    return (
        <main className="min-h-screen bg-transparent pb-20">
            <div className="container mx-auto px-4 pt-32 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                    <div className="space-y-4">
                        <Link href="/comedian/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest mb-2">
                            <ArrowLeft size={14} />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                            Sales <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Reports</span>
                        </h1>
                    </div>

                    <Button variant="outline" className="rounded-full h-12 border-border font-bold uppercase tracking-tight gap-2">
                        <Download size={18} />
                        Export Data
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <TrendingUp size={24} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Revenue</p>
                            </div>
                            <p className="text-4xl font-black italic tracking-tighter transition-all">₹{totalRevenue.toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <Ticket size={24} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets Sold</p>
                            </div>
                            <p className="text-4xl font-black italic tracking-tighter transition-all">{totalTicketsSold.toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                                    <Sparkles size={24} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg. Per Show</p>
                            </div>
                            <p className="text-4xl font-black italic tracking-tighter transition-all">₹{Math.round(totalRevenue / (sales.length || 1)).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Table Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                        <span className="w-8 h-1 bg-primary rounded-full" />
                        PERFORMANCE BREAKDOWN
                    </h2>

                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="text-left py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Show Details</th>
                                        <th className="text-center py-6 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets</th>
                                        <th className="text-right py-6 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenue</th>
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
                                                    <p className="font-bold uppercase italic">No sales data found yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sales.map((show) => (
                                            <tr key={show.showId} className="group hover:bg-muted/30 transition-colors">
                                                <td className="py-6 px-8">
                                                    <div className="space-y-1">
                                                        <p className="font-black uppercase italic tracking-tight group-hover:text-primary transition-colors">{show.title}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            <Calendar size={12} className="text-primary" />
                                                            {format(new Date(show.date), 'MMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <div className="space-y-1">
                                                        <p className="font-black italic">{show.ticketsSold} / {show.totalTickets}</p>
                                                        <div className="w-24 h-1 bg-muted rounded-full mx-auto overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${(show.ticketsSold / show.totalTickets) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-right">
                                                    <p className="font-black italic text-primary">₹{show.totalRevenue.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">₹{show.ticketPrice} avg/tkt</p>
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <Badge variant={show.isPublished ? "default" : "outline"} className={show.isPublished ? "bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-bold uppercase" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 text-[10px] font-bold uppercase"}>
                                                        {show.isPublished ? "Published" : "Draft"}
                                                    </Badge>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <Link href={`/shows/${show.showId}`}>
                                                        <Button variant="ghost" size="sm" className="rounded-full h-8 px-4 font-black uppercase text-[10px] tracking-widest gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                            View Show <ChevronRight size={14} />
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
