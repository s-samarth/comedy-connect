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
import { Loader2, Mic2, Instagram, Youtube, Twitter, Sparkles, Send } from 'lucide-react';
import Image from 'next/image';

export default function ComedianOnboardingPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [formData, setFormData] = React.useState({
        stageName: '',
        bio: '',
        contact: '',
        instagram: '',
        twitter: '',
        youtube: ''
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
            await api.post('/api/v1/comedian/profile', {
                stageName: formData.stageName,
                bio: formData.bio,
                contact: formData.contact,
                socialLinks: {
                    instagram: formData.instagram,
                    twitter: formData.twitter,
                    youtube: formData.youtube
                }
            });
            router.push('/comedian/pending-verification');
        } catch (err: any) {
            setError(err.message || 'Failed to create profile');
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading || !user) return null;

    return (
        <main className="min-h-screen bg-transparent py-20 px-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary blur-[150px] rounded-full" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-12 space-y-4">
                    <Image src="/symbol.png" alt="Logo" width={64} height={64} className="mx-auto" />
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
                        Artist <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Profile</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Define your stage presence and get verified.</p>
                </div>

                <Card className="bg-card border-border shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border p-8">
                        <CardTitle className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                            <Mic2 size={24} className="text-primary" />
                            Comedian Onboarding
                        </CardTitle>
                        <CardDescription className="font-medium">Admin verification usually takes 24-48 hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold uppercase tracking-tight">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Stage Name */}
                                <div className="space-y-3">
                                    <Label htmlFor="stageName" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Sparkles size={14} /> Stage Name *
                                    </Label>
                                    <Input
                                        id="stageName"
                                        name="stageName"
                                        required
                                        value={formData.stageName}
                                        onChange={handleChange}
                                        className="h-12 rounded-full bg-muted/30 border-border focus:border-primary font-bold"
                                        placeholder="Enter your artist name"
                                    />
                                </div>

                                {/* Bio */}
                                <div className="space-y-3">
                                    <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Artist Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="rounded-2xl bg-muted/30 border-border focus:border-primary font-medium min-h-[120px]"
                                        placeholder="Describe your comedy style and experience..."
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
                                            maxLength={10}
                                            className="h-12 pl-16 rounded-full bg-muted/30 border-border focus:border-primary font-bold"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Instagram size={14} /> Social Presence
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="instagram" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instagram</Label>
                                            <Input
                                                id="instagram"
                                                name="instagram"
                                                value={formData.instagram}
                                                onChange={handleChange}
                                                className="h-10 rounded-full bg-muted/20 border-border"
                                                placeholder="@handle"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="twitter" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Twitter / X</Label>
                                            <Input
                                                id="twitter"
                                                name="twitter"
                                                value={formData.twitter}
                                                onChange={handleChange}
                                                className="h-10 rounded-full bg-muted/20 border-border"
                                                placeholder="@handle"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="youtube" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">YouTube</Label>
                                            <Input
                                                id="youtube"
                                                name="youtube"
                                                value={formData.youtube}
                                                onChange={handleChange}
                                                className="h-10 rounded-full bg-muted/20 border-border"
                                                placeholder="@handle"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.stageName || !formData.contact}
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
                                    Our team will review your application shortly.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
