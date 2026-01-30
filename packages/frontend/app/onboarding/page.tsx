'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, User, MapPin, Phone, Info, Megaphone } from 'lucide-react';
import Image from 'next/image';

export default function OnboardingPage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        }>
            <OnboardingForm />
        </React.Suspense>
    );
}

function OnboardingForm() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [formData, setFormData] = React.useState({
        name: '',
        age: '',
        city: 'Hyderabad',
        watchedComedy: '',
        phone: '',
        heardAboutUs: '',
        bio: ''
    });

    React.useEffect(() => {
        if (!isAuthLoading && !user) {
            window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`;
        } else if (user?.onboardingCompleted) {
            router.push('/');
        }
        if (user && !formData.name) {
            setFormData(prev => ({ ...prev, name: user.name || '' }));
        }
    }, [user, isAuthLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (value: string) => {
        setFormData(prev => ({ ...prev, watchedComedy: value }));
    };

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post('/api/v1/onboarding', {
                ...formData,
                age: parseInt(formData.age)
            });
            // Force a hard redirect to refresh session and go to destination
            window.location.href = callbackUrl;
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading || !user) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-transparent py-20 px-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-12 space-y-4">

                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase italic">
                        Welcome to <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">Comedy Connect</span>
                    </h1>
                    <p className="text-muted-foreground font-medium"> help us personalize your laughter journey.</p>
                </div>

                <Card className="bg-card border-border shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border px-8 pt-0 pb-0">
                        <CardTitle className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                            <Sparkles size={24} className="text-primary" />
                            Your Profile
                        </CardTitle>
                        <CardDescription className="font-medium">All marked fields (*) are mandatory.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-0">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold uppercase tracking-tight">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Name */}
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <User size={14} /> Full Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="h-12 rounded-full bg-muted/30 border-border focus:border-primary font-bold"
                                        placeholder="Abhishek Singh Bassi"
                                    />
                                </div>

                                {/* Age */}
                                <div className="space-y-3">
                                    <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Age *
                                    </Label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="number"
                                        required
                                        min="1"
                                        max="120"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="h-12 rounded-full bg-muted/30 border-border focus:border-primary font-bold"
                                        placeholder="25"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* City */}
                                <div className="space-y-3">
                                    <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <MapPin size={14} /> City *
                                    </Label>
                                    <select
                                        id="city"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="h-12 w-full px-4 rounded-full bg-muted/30 border border-border focus:outline-none focus:border-primary font-bold text-sm appearance-none"
                                    >
                                        <option value="">Select city</option>
                                        <option value="Hyderabad">Hyderabad</option>
                                    </select>
                                </div>

                                {/* Phone */}
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Phone size={14} /> Phone (Optional)
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground tracking-widest">+91 </span>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setFormData(prev => ({ ...prev, phone: val }));
                                            }}
                                            maxLength={10}
                                            className="h-12 pl-16 rounded-full bg-muted/30 border-border focus:border-primary font-bold"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Watched Comedy */}
                            <div className="space-y-4 pt-2">
                                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                    Have you watched live comedy before? *
                                </Label>
                                <RadioGroup
                                    value={formData.watchedComedy}
                                    onValueChange={handleRadioChange}
                                    className="flex gap-8"
                                    required
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="yes" className="border-primary text-primary" />
                                        <Label htmlFor="yes" className="font-bold">Yes, definitely.</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="no" className="border-primary text-primary" />
                                        <Label htmlFor="no" className="font-bold">Not yet!</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Heard About Us */}
                            <div className="space-y-3 pt-2">
                                <Label htmlFor="heardAboutUs" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Megaphone size={14} /> Where did you hear about us? (Optional)
                                </Label>
                                <select
                                    id="heardAboutUs"
                                    name="heardAboutUs"
                                    value={formData.heardAboutUs}
                                    onChange={handleChange}
                                    className="h-12 w-full px-4 rounded-full bg-muted/30 border border-border focus:outline-none focus:border-primary font-bold text-sm appearance-none"
                                >
                                    <option value="">Select an option</option>
                                    <option value="friends">Friends</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="comics">From comedians</option>
                                    <option value="google">Google search</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Bio */}
                            <div className="space-y-3">
                                <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Info size={14} /> Bio (Optional)
                                </Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="rounded-2xl bg-muted/30 border-border focus:border-primary font-medium min-h-[100px]"
                                    placeholder="Tell us what makes you laugh..."
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 rounded-full text-lg font-black uppercase tracking-tighter italic gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            Save and Continue
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
