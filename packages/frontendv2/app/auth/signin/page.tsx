'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/lib/hooks';

function SignInPage() {
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            // Logic adapted from frontend implementation
            if (user && !user.onboardingCompleted) {
                router.push('/onboarding');
            } else {
                router.push(callbackUrl);
            }
        }
    }, [isAuthenticated, authLoading, router, user, callbackUrl]);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signIn('google', {
                callbackUrl: callbackUrl,
                prompt: 'consent'
            });
        } catch (error) {
            console.error('Sign in error:', error);
            setIsSigningIn(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center text-meta-label font-bold uppercase tracking-widest animate-pulse">Establishing Connection...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center font-sans p-4">
            <div className="w-full max-w-md space-y-8 bg-card/80 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="text-center relative z-10">
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                        JOIN THE <br /> <span className="text-primary">STAGE.</span>
                    </h2>
                    <p className="mt-4 text-xs text-meta-label font-bold uppercase tracking-widest leading-relaxed">
                        Authorize via secure stream to <br /> access the comedy grid.
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Management Console</p>
                            <p className="text-[10px] text-meta-label leading-relaxed">Oversee bookings and favorite acts.</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center animate-in shake duration-500">
                        {error === 'Callback' ? 'Authentication failed. Please try again.' :
                            error === 'OAuthSignin' ? 'Could not sign in with Google. Please try again.' :
                                error === 'Default' ? 'An error occurred during authentication.' :
                                    'Authentication failed. Please try again.'}
                    </div>
                )}

                <div className="mt-8 space-y-6 relative z-10">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        className="w-full flex items-center justify-center px-6 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50 group/btn"
                    >
                        {isSigningIn ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                AUTH VIA GOOGLE
                            </>
                        )}
                    </button>

                    <div className="relative pt-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="px-4 bg-transparent text-meta-label">Or</span>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <a
                            href="/shows"
                            className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-2 group"
                        >
                            CONTINUE AS GUEST
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-center text-meta-label font-bold uppercase tracking-widest animate-pulse">SYNCING...</div></div>}>
            <SignInPage />
        </Suspense>
    );
}
