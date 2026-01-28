'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    userRole?: string;
}

export default function DeleteAccountModal({ isOpen, onClose, userRole }: DeleteAccountModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/v1/profile/delete', {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to delete account');
                setLoading(false);
                return;
            }

            // Success - Sign out and redirect
            await signOut({ callbackUrl: '/' });
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-2xl border border-border">
                <div className="flex items-center gap-3 mb-4 text-destructive">
                    <AlertTriangle size={24} />
                    <h3 className="text-xl font-bold text-foreground">Delete Account</h3>
                </div>

                {error ? (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                ) : (
                    <p className="text-muted-foreground mb-6 font-medium">
                        Are you sure you want to delete your account? You will lose all your tickets and preferences. This action is irreversible.
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Deleting...
                            </>
                        ) : (
                            'Confirm Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
