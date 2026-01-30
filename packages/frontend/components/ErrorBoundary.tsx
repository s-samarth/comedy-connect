'use client';

import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary component to catch React rendering errors
 * and display a fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
                            <p className="text-muted-foreground">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left text-xs bg-muted p-4 rounded-lg">
                                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                                <pre className="overflow-auto text-red-500">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                            >
                                Try again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
                            >
                                Go to home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
