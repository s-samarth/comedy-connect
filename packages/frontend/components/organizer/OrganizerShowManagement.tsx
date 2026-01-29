'use client';

import React, { useState, useEffect } from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Clock, Plus, Edit2, Trash2, Youtube, Instagram, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ShowPreviewModal from "./ShowPreviewModal";
import { api } from "@/lib/api/client";

interface Show {
    id: string;
    title: string;
    description?: string;
    date: string;
    venue: string;
    googleMapsLink: string;
    ticketPrice: number;
    totalTickets: number;
    posterImageUrl?: string;
    youtubeUrls?: string[];
    instagramUrls?: string[];
    durationMinutes?: number;
    createdAt: string;
    isPublished: boolean;
    _count: {
        bookings: number;
    };
    stats?: {
        ticketsSold: number;
        revenue: number;
    };
    ticketInventory: {
        available: number;
    };
}

interface OrganizerShowManagementProps {
    userId: string;
    isVerified: boolean;
}

export default function OrganizerShowManagement({ userId, isVerified }: OrganizerShowManagementProps) {
    const [shows, setShows] = useState<Show[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingShow, setEditingShow] = useState<Show | null>(null);
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        venue: "",
        googleMapsLink: "",
        ticketPrice: "",
        totalTickets: "",
        posterImageUrl: "",
        youtubeUrls: [] as string[],
        instagramUrls: [] as string[],
        durationMinutes: "60"
    });

    useEffect(() => {
        fetchShows();
    }, []);

    const fetchShows = async () => {
        try {
            setIsLoading(true);
            const data = await api.get<{ shows: Show[] }>("/api/v1/shows?mode=manage");
            setShows(data.shows);
        } catch (error) {
            console.error("Failed to fetch shows:", error);
            toast.error("Failed to load shows");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.googleMapsLink &&
            !formData.googleMapsLink.startsWith('https://maps.app.goo.gl') &&
            !formData.googleMapsLink.startsWith('https://google.com/maps') &&
            !formData.googleMapsLink.startsWith('https://www.google.com/maps')) {
            toast.error("Invalid Google Maps Link. Must be a valid Google Maps URL.");
            return;
        }

        try {
            setIsLoading(true);
            const url = editingShow ? `/api/v1/shows/${editingShow.id}` : "/api/v1/shows";
            const method = editingShow ? "PUT" : "POST";

            const payload = {
                ...formData,
                ticketPrice: parseInt(formData.ticketPrice),
                totalTickets: parseInt(formData.totalTickets),
                durationMinutes: parseInt(formData.durationMinutes) || 60,
                date: new Date(formData.date).toISOString()
            };

            await api.post(url, payload); // api.post handles both POST and PUT if we use generic fetch, but here let's assume api has specific methods if needed. 
            // Wait, looking at frontendv2/lib/api.ts (from previous turns) it has api.post and api.get.

            toast.success(editingShow ? "Show updated successfully" : "Show created successfully");
            fetchShows();
            setShowForm(false);
            setEditingShow(null);
            resetForm();
        } catch (error) {
            console.error("Save show error:", error);
            toast.error("Failed to save show");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            date: "",
            venue: "",
            googleMapsLink: "",
            ticketPrice: "",
            totalTickets: "",
            posterImageUrl: "",
            youtubeUrls: [],
            instagramUrls: [],
            durationMinutes: "60"
        });
    };

    const handleEdit = (show: Show) => {
        setEditingShow(show);
        const date = new Date(show.date);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);

        setFormData({
            title: show.title,
            description: show.description || "",
            date: localISOTime,
            venue: show.venue,
            googleMapsLink: show.googleMapsLink || "",
            ticketPrice: show.ticketPrice.toString(),
            totalTickets: show.totalTickets.toString(),
            posterImageUrl: show.posterImageUrl || "",
            youtubeUrls: show.youtubeUrls || [],
            instagramUrls: show.instagramUrls || [],
            durationMinutes: (show.durationMinutes || 60).toString()
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this show?")) return;
        try {
            setIsLoading(true);
            // Assuming api has delete or we use fetch
            const response = await fetch(`/api/v1/shows/${id}`, { method: "DELETE" });
            if (response.ok) {
                toast.success("Show deleted");
                fetchShows();
            } else {
                toast.error("Failed to delete show");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublishAction = async (id: string, publish: boolean) => {
        const action = publish ? "publish" : "unpublish";
        if (!confirm(`Are you sure you want to ${action} this show?`)) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/v1/shows/${id}/${action}`, { method: "POST" });
            if (response.ok) {
                toast.success(`Show ${action}ed successfully`);
                fetchShows();
            } else {
                const err = await response.json();
                toast.error(err.error || `Failed to ${action} show`);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredShows = shows.filter(show => {
        const showDate = new Date(show.date);
        const now = new Date();
        if (filter === "upcoming") return showDate >= now;
        if (filter === "past") return showDate < now;
        return true;
    });

    const handlePreview = (data: any) => {
        setPreviewData(data);
        setPreviewOpen(true);
    };

    if (isLoading && shows.length === 0) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Show Management</h2>
                    <p className="text-muted-foreground text-sm font-medium">Create and manage your comedy events</p>
                </div>
                {isVerified && !showForm && (
                    <Button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest gap-2 py-6 px-8 rounded-2xl shadow-xl shadow-primary/20"
                    >
                        <Plus size={20} /> Create New Show
                    </Button>
                )}
            </div>

            {!isVerified && (
                <Card className="border-yellow-500/50 bg-yellow-500/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-yellow-700 dark:text-yellow-400">
                            <div className="bg-yellow-500/20 p-3 rounded-2xl">
                                <Badge variant="outline" className="border-yellow-500 text-yellow-500 uppercase font-black">Warning</Badge>
                            </div>
                            <div>
                                <h3 className="font-bold">Verification Required</h3>
                                <p className="text-sm opacity-80">You need to be a verified organizer to create and list shows. Please complete your profile.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {showForm && (
                <Card className="border-border shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border p-8">
                        <CardTitle className="text-2xl font-black uppercase italic tracking-tight">
                            {editingShow ? "Edit Show" : "Create New Show"}
                        </CardTitle>
                        <CardDescription>Enter the details for your upcoming comedy event</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Left Column: Media */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Show Poster</Label>
                                        <div className="aspect-[3/4] rounded-3xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center bg-muted/20 hover:border-primary/50 transition-all group relative">
                                            <ImageUpload
                                                type="show"
                                                currentImage={formData.posterImageUrl}
                                                onUpload={(url) => setFormData(prev => ({ ...prev, posterImageUrl: url }))}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Details */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Title *</Label>
                                            <Input
                                                id="title"
                                                required
                                                placeholder="e.g. Comedy Night Live"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                className="rounded-xl h-12 bg-muted/20 border-border focus:ring-primary"
                                                disabled={editingShow?.isPublished}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date & Time *</Label>
                                            <Input
                                                id="date"
                                                type="datetime-local"
                                                required
                                                value={formData.date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                                className="rounded-xl h-12 bg-muted/20 border-border focus:ring-primary"
                                                disabled={editingShow?.isPublished}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                                        <Textarea
                                            id="description"
                                            rows={4}
                                            placeholder="Tell the audience about this show..."
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="rounded-xl bg-muted/20 border-border focus:ring-primary resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="venue" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Venue *</Label>
                                            <Input
                                                id="venue"
                                                required
                                                placeholder="e.g. The Laugh Club, Gachibowli"
                                                value={formData.venue}
                                                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                                                className="rounded-xl h-12 bg-muted/20 border-border focus:ring-primary"
                                                disabled={editingShow?.isPublished}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="googleMapsLink" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Maps Link *</Label>
                                            <Input
                                                id="googleMapsLink"
                                                type="url"
                                                required
                                                placeholder="https://maps.app.goo.gl/..."
                                                value={formData.googleMapsLink}
                                                onChange={(e) => setFormData(prev => ({ ...prev, googleMapsLink: e.target.value }))}
                                                className="rounded-xl h-12 bg-muted/20 border-border focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ticket Price (₹) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                required
                                                min="0"
                                                value={formData.ticketPrice}
                                                onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
                                                className="rounded-xl h-12 bg-muted/20 border-border focus:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tickets" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Tickets *</Label>
                                            <Input
                                                id="tickets"
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.totalTickets}
                                                onChange={(e) => setFormData(prev => ({ ...prev, totalTickets: e.target.value }))}
                                                className="rounded-xl h-12 bg-muted/20 border-border focus:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Duration (mins)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={formData.durationMinutes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: e.target.value }))}
                                                className="rounded-xl h-12 bg-muted/20 border-border focus:ring-primary"
                                                disabled={editingShow?.isPublished}
                                            />
                                        </div>
                                    </div>

                                    {/* Social Links Sub-section */}
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Social & Media (Optional)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><Youtube size={14} className="text-red-500" /> YouTube Video</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="YouTube URL"
                                                        className="rounded-xl bg-muted/20 border-border"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const val = (e.target as HTMLInputElement).value;
                                                                if (val && formData.youtubeUrls.length < 1) {
                                                                    setFormData(p => ({ ...p, youtubeUrls: [...p.youtubeUrls, val] }));
                                                                    (e.target as HTMLInputElement).value = "";
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.youtubeUrls.map((url, i) => (
                                                        <Badge key={i} variant="secondary" className="gap-2 py-1 px-3">
                                                            <span className="max-w-[150px] truncate">{url}</span>
                                                            <Trash2 size={12} className="cursor-pointer text-destructive" onClick={() => setFormData(p => ({ ...p, youtubeUrls: p.youtubeUrls.filter((_, idx) => idx !== i) }))} />
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><Instagram size={14} className="text-pink-500" /> Instagram Reel</Label>
                                                <Input
                                                    placeholder="Instagram URL"
                                                    className="rounded-xl bg-muted/20 border-border"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = (e.target as HTMLInputElement).value;
                                                            if (val && formData.instagramUrls.length < 2) {
                                                                setFormData(p => ({ ...p, instagramUrls: [...p.instagramUrls, val] }));
                                                                (e.target as HTMLInputElement).value = "";
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.instagramUrls.map((url, i) => (
                                                        <Badge key={i} variant="secondary" className="gap-2 py-1 px-3">
                                                            <span className="max-w-[150px] truncate">{url}</span>
                                                            <Trash2 size={12} className="cursor-pointer text-destructive" onClick={() => setFormData(p => ({ ...p, instagramUrls: p.instagramUrls.filter((_, idx) => idx !== i) }))} />
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-8 border-t border-border justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => { setShowForm(false); setEditingShow(null); resetForm(); }}
                                    className="font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handlePreview(formData)}
                                    className="border-primary text-primary hover:bg-primary/5 font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-xl gap-2"
                                >
                                    <Eye size={16} /> Preview
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs h-12 px-10 rounded-xl shadow-lg shadow-primary/20"
                                >
                                    {editingShow ? "Update Show" : "Create Show"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Sub-header with Filter */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setFilter("all")}
                        className="rounded-full font-bold uppercase text-[10px] tracking-widest"
                    >
                        All Shows
                    </Button>
                    <Button
                        variant={filter === "upcoming" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setFilter("upcoming")}
                        className="rounded-full font-bold uppercase text-[10px] tracking-widest"
                    >
                        Upcoming
                    </Button>
                    <Button
                        variant={filter === "past" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setFilter("past")}
                        className="rounded-full font-bold uppercase text-[10px] tracking-widest"
                    >
                        Past
                    </Button>
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{filteredShows.length} shows found</p>
            </div>

            {/* Shows Grid */}
            {filteredShows.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto opacity-50">
                        <Calendar size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg">No shows found</h3>
                        <p className="text-muted-foreground text-sm font-medium">Start by creating your first comedy event!</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredShows.map((show) => (
                        <Card key={show.id} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-primary/5 rounded-3xl">
                            {/* Poster Header */}
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={show.posterImageUrl || '/logo.png'}
                                    alt={show.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    <Badge className={show.isPublished ? "bg-green-600 font-black uppercase tracking-widest text-[10px]" : "bg-zinc-500 font-black uppercase tracking-widest text-[10px]"}>
                                        {show.isPublished ? "PUBLISHED" : "DRAFT"}
                                    </Badge>
                                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary text-primary font-black uppercase tracking-widest text-[10px]">
                                        ₹{show.ticketPrice}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="p-6 flex flex-col flex-grow gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter line-clamp-1 group-hover:text-primary transition-colors">
                                        {show.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <MapPin size={12} className="text-primary" />
                                        {show.venue}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <Calendar size={14} className="text-primary" />
                                            {format(new Date(show.date), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</p>
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <Clock size={14} className="text-primary" />
                                            {format(new Date(show.date), 'h:mm a')}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                {show._count.bookings > 0 && (
                                    <div className="bg-muted/30 rounded-2xl p-3 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{show._count.bookings} Bookings</Badge>
                                        </span>
                                        <span className="text-green-600">Earnings: ₹{show._count.bookings * show.ticketPrice}</span>
                                    </div>
                                )}

                                {/* Card Actions */}
                                <div className="pt-2 grid grid-cols-2 gap-2 mt-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(show)}
                                        className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 h-10 border-border hover:bg-muted"
                                    >
                                        <Edit2 size={12} /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePreview(show)}
                                        className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 h-10 border-primary text-primary hover:bg-primary/5"
                                    >
                                        <Eye size={12} /> View
                                    </Button>

                                    {!show.isPublished ? (
                                        <Button
                                            size="sm"
                                            onClick={() => handlePublishAction(show.id, true)}
                                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest h-10"
                                        >
                                            Publish
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handlePublishAction(show.id, false)}
                                            className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-10 opacity-50 hover:opacity-100"
                                        >
                                            Unpublish
                                        </Button>
                                    )}

                                    {!show.isPublished && show._count.bookings === 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(show.id)}
                                            className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-10 border-destructive/50 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ShowPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                data={previewData}
            />
        </div>
    );
}

