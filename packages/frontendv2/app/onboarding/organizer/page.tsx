'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CalendarRange, MapPin, Phone, Info, Building2, Send } from 'lucide-react';
import Image from 'next/image';

export default function OrganizerOnboardingPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [formData, setFormData] = React.useState({
        name: '',
        contact: '',
        venue: '',
        description: ''
    });

    // Use a ref to track if we've already prefilled the data to prevent overwriting user edits
    const hasPrefilledRef = React.useRef(false);

    React.useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/');
        } else if (user?.phone && !hasPrefilledRef.current) {
            setFormData(prev => ({ ...prev, contact: user.phone || '' }));
            hasPrefilledRef.current = true;
        }
    }, [user, isAuthLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.contact.length !== 10) {
            setError('Contact number must be exactly 10 digits');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await api.post('/api/v1/organizer/profile', formData);
            router.push('/organizer/pending-verification');
        } catch (err: any) {
            setError(err.message || 'Failed to create profile');
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading || !user) return null;

    return (
        <main className="min-h-screen bg-background py-20 px-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[150px] rounded-full" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-12 space-y-4">
                    <Image src="/symbol.png" alt="Logo" width={64} height={64} className="mx-auto" />
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
                        Host <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Shows</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Create your organization profile to start hosting events.</p>
                </div>

                <Card className="bg-card border-border shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border p-8">
                        <CardTitle className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                            <CalendarRange size={24} className="text-primary" />
                            Organizer Onboarding
                        </CardTitle>
                        <CardDescription className="font-medium">Verification ensures a secure experience for the audience.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold uppercase tracking-tight">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Organization/Venue Name */}
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Building2 size={14} /> Organizer / Venue Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="h-12 rounded-full bg-muted/30 border-border focus:border-primary font-bold"
                                        placeholder="E.g. The Comedy Club, Gachibowli"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        About your shows
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="rounded-2xl bg-muted/30 border-border focus:border-primary font-medium min-h-[120px]"
                                        placeholder="Describe the types of comedy shows you organize..."
                                    />
                                </div>

                                {/* Contact */}
                                <div className="space-y-3">
                                    <Label htmlFor="contact" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Contact Number * (For verification)
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground tracking-widest">+91 </span>
                                        <Input
                                            id="contact"
                                            name="contact"
                                            type="tel"
                                            required
                                            value={formData.contact}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setFormData(prev => ({ ...prev, contact: val }));
                                            }}
                                            pattern="[0-9]{10}"
                                            maxLength={10}
                                            className="h-12 pl-16 rounded-full bg-muted/30 border-border focus:border-primary font-bold"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                {/* Venue Location */}
                                <div className="space-y-3">
                                    <Label htmlFor="venue" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <MapPin size={14} /> Venue Location (Optional)
                                    </Label>
                                    <Input
                                        id="venue"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleChange}
                                        className="h-12 rounded-full bg-muted/30 border-border focus:border-primary font-bold"
                                        placeholder="Address or city"
                                    />
                                </div>
                            </div>

                            <div className="pt-8">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.name || !formData.contact}
                                    className="w-full h-14 rounded-full text-lg font-black uppercase tracking-tighter italic gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Submit for Verification
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">
                                    Your profile will be reviewed by our administration.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
