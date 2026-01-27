'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Mic2, CalendarRange, Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function RoleSelectionPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/');
        }
    }, [user, isAuthLoading, router]);

    const roles = [
        {
            id: 'AUDIENCE',
            title: 'Audience',
            description: 'Discover the best shows and book your tickets instantly.',
            icon: Users,
            color: 'primary',
            features: ['Book shows', 'Follow comedians', 'Rate performances']
        },
        {
            id: 'COMEDIAN',
            title: 'Comedian',
            description: 'Perform, manage your profile, and build your fan base.',
            icon: Mic2,
            color: 'orange-600',
            features: ['Artist profile', 'Show invites', 'Performance analytics']
        },
        {
            id: 'ORGANIZER',
            title: 'Organizer',
            description: 'Create events, manage ticket sales, and host the night.',
            icon: CalendarRange,
            color: 'primary',
            features: ['Create shows', 'Manage inventory', 'Financial tracking']
        }
    ];

    const handleSelect = (role: string) => {
        if (role === 'AUDIENCE') {
            router.push('/');
        } else {
            router.push(`/onboarding/${role.toLowerCase()}`);
        }
    };

    if (isAuthLoading || !user) return null;

    return (
        <main className="min-h-screen bg-background py-20 px-4 flex items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/20 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-5xl w-full relative z-10 space-y-12">
                <div className="text-center space-y-4">
                    <Image src="/symbol.png" alt="Logo" width={64} height={64} className="mx-auto" />
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        CHOOSE YOUR <span className="text-primary italic underline decoration-primary decoration-4 underline-offset-4">VIBE</span>.
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg max-w-xl mx-auto">
                        How do you want to experience the comedy revolution? Choose one to finish your profile.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className="group relative bg-card border-border hover:border-primary/50 transition-all duration-500 rounded-3xl overflow-hidden cursor-pointer"
                            onClick={() => handleSelect(role.id)}
                        >
                            <CardContent className="p-8 space-y-8">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                                    <role.icon size={32} />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black uppercase italic tracking-tight underline decoration-primary/30 group-hover:decoration-primary transition-all underline-offset-4">
                                        {role.title}
                                    </h3>
                                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                                        {role.description}
                                    </p>
                                </div>

                                <ul className="space-y-3 pt-4">
                                    {role.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            <Check size={14} className="text-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full rounded-full h-12 font-black uppercase tracking-tighter italic gap-2 group-hover:shadow-lg group-hover:shadow-primary/20"
                                    variant={role.id === 'AUDIENCE' ? 'default' : 'outline'}
                                >
                                    Get Started
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    );
}
