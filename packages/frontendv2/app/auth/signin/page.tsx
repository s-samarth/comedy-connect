'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function SignInContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    useEffect(() => {
        // Redirect to the API signin route
        window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    }, [callbackUrl]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Redirecting to Sign In...</h1>
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><div className="text-center">Loading...</div></div>}>
            <SignInContent />
        </Suspense>
    );
}
