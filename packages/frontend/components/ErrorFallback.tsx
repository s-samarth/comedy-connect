import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
    showDetails?: boolean;
}

/**
 * Reusable error fallback UI component
 * Can be used with ErrorBoundary or for manual error states
 */
export function ErrorFallback({ error, resetError, showDetails = false }: ErrorFallbackProps) {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <AlertCircle className="w-16 h-16 text-destructive" />
                        <div className="absolute inset-0 bg-destructive blur-2xl opacity-20 animate-pulse" />
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Oops! Something went wrong</h2>
                    <p className="text-muted-foreground">
                        {error?.message || 'An unexpected error occurred. Please try again.'}
                    </p>
                </div>

                {/* Error Details (Development Only) */}
                {showDetails && error && process.env.NODE_ENV === 'development' && (
                    <details className="text-left text-xs bg-muted p-4 rounded-lg border border-border">
                        <summary className="cursor-pointer font-semibold mb-2 text-muted-foreground hover:text-foreground">
                            Technical Details
                        </summary>
                        <pre className="overflow-auto text-destructive whitespace-pre-wrap">
                            {error.stack || error.message}
                        </pre>
                    </details>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                    {resetError && (
                        <button
                            onClick={resetError}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    )}
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
