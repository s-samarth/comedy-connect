'use client';

import { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, Loader2, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AdminPasswordPromptProps {
    onVerified: () => void;
    needsSetup: boolean;
}

export function AdminPasswordPrompt({ onVerified, needsSetup }: AdminPasswordPromptProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSetup, setIsSetup] = useState(needsSetup);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const endpoint = isSetup ? '/api/v1/admin/set-password' : '/api/v1/admin/verify-password';
            const body = isSetup
                ? { password, confirmPassword }
                : { password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                if (isSetup) {
                    setIsSetup(false);
                    setPassword('');
                    setConfirmPassword('');
                    toast.success('Admin password set successfully');
                } else {
                    onVerified();
                }
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (error) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* High-Energy Background Blurs - Straight from Homepage */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl pointer-events-none opacity-30 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary blur-[140px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600 blur-[120px] rounded-full opacity-60" />
            </div>

            <div className="relative z-10 w-full max-w-xl text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
                {/* Brand Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mx-auto">
                    <Zap size={14} className="fill-primary" />
                    Administrative Security
                </div>

                {/* Hero Typography */}
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-[900] tracking-tighter leading-[0.85] uppercase italic text-white drop-shadow-2xl">
                        ADMIN <br />
                        <span className="text-primary underline decoration-white/10 decoration-8 underline-offset-8">ACCESS.</span>
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-sm mx-auto font-bold tracking-tight opacity-60">
                        {isSetup
                            ? 'Configure your master key for platform steering.'
                            : 'Synchronize credentials to access the command board.'
                        }
                    </p>
                </div>

                {/* Glass Entry Point */}
                <div className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[4rem] p-10 md:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative group overflow-hidden">
                    {/* Inner Accent Blur */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <div className="space-y-6">
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">
                                    Primary Authorization Key
                                </label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" size={20} />
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-18 bg-white/[0.05] border-white/5 rounded-[2rem] pl-16 pr-8 text-white text-lg font-black tracking-[0.4em] focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.08] transition-all placeholder:text-muted-foreground/10 placeholder:tracking-normal"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {isSetup && (
                                <div className="space-y-3 text-left animate-in slide-in-from-top-4 duration-500">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">
                                        Verify Roster Key
                                    </label>
                                    <div className="relative group/input">
                                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" size={20} />
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-18 bg-white/[0.05] border-white/5 rounded-[2rem] pl-16 pr-8 text-white text-lg font-black tracking-[0.4em] focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.08] transition-all placeholder:text-muted-foreground/10 placeholder:tracking-normal"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4 text-red-400 animate-in shake duration-500">
                                <AlertCircle size={20} className="shrink-0" />
                                <p className="text-[10px] font-black uppercase tracking-widest italic leading-tight">
                                    {error}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-18 bg-primary hover:bg-orange-600 text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-[0_20px_40px_rgba(255,100,0,0.4)] hover:shadow-[0_25px_50px_rgba(255,100,0,0.5)] transition-all group active:scale-[0.97]"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-black" size={24} />
                            ) : (
                                <>
                                    {isSetup ? 'Initialize Console' : 'Synchronize Access'}
                                    <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={22} />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer Meta */}
                <div className="pt-4 flex items-center justify-center gap-10 opacity-30">
                    <div className="flex flex-col items-center gap-1">
                        <ShieldCheck size={20} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Secure Handshake</span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <div className="flex flex-col items-center gap-1">
                        <Zap size={20} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Live Authorization</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
