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
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background font-sans p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg border border-border">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground">
                        Sign In
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to access your bookings, save favorites, and manage your profile
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-2">Why Sign In?</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                            <div className="text-muted-foreground">
                                <span className="font-medium text-foreground">Manage Bookings:</span>
                                <span className="ml-1">View and manage all your show tickets in one place</span>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                            <div className="text-muted-foreground">
                                <span className="font-medium text-foreground">Personalized Experience:</span>
                                <span className="ml-1">Save your favorite comedians and venues</span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                        <p className="text-sm">
                            {error === 'Callback' ? 'Authentication failed. Please try again.' :
                                error === 'OAuthSignin' ? 'Could not sign in with Google. Please try again.' :
                                    error === 'Default' ? 'An error occurred during authentication.' :
                                        'Authentication failed. Please try again.'}
                        </p>
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        className="w-full flex items-center justify-center px-4 py-3 border border-input rounded-md shadow-sm text-sm font-medium bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                    >
                        {isSigningIn ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground mr-2"></div>
                                Signing In...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                                Continue with Google
                            </>
                        )}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-background text-muted-foreground">Or</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                            Just browsing? You can view all shows without an account.
                        </p>
                        <a
                            href="/shows"
                            className="inline-flex items-center px-4 py-2 border border-primary/20 text-primary bg-primary/5 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors"
                        >
                            Continue as Guest
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><div className="text-center">Loading...</div></div>}>
            <SignInPage />
        </Suspense>
    );
}
