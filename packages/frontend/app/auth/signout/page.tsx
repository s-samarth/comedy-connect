'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOutPage() {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error('Sign out error:', error);
            setIsSigningOut(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center font-sans p-4 bg-background">
            {/* Background elements to match sign-in */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md space-y-8 bg-card/80 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-2xl border border-white/10 relative overflow-hidden group z-10">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="text-center relative z-10">
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        LEAVING THE <br /> <span className="text-primary">STAGE?</span>
                    </h2>
                    <p className="mt-4 text-xs text-meta-label font-bold uppercase tracking-widest leading-relaxed">
                        Your session will be terminated. <br /> All unsaved spotlights will fade.
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4 relative z-10">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:200ms]" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:400ms]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Active session detected</span>
                    </div>
                </div>

                <div className="mt-8 space-y-4 relative z-10">
                    <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center justify-center px-6 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSigningOut ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        ) : (
                            "CONFIRM SIGN OUT"
                        )}
                    </button>

                    <button
                        onClick={() => router.back()}
                        disabled={isSigningOut}
                        className="w-full flex items-center justify-center px-6 py-4 bg-white/[0.05] text-white border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/[0.1] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        GO BACK TO SHOW
                    </button>
                </div>
            </div>
        </div>
    );
}
