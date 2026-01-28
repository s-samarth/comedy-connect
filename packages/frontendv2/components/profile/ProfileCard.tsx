'use client';

import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, MapPin, Globe, Award, Settings, Trash2, Youtube, Instagram, Video, Film } from 'lucide-react';
import { useState } from 'react';
import DeleteAccountModal from './DeleteAccountModal';

interface ProfileCardProps {
    user: {
        id: string;
        email?: string | null;
        role?: string;
        createdAt?: Date | string;
        image?: string | null;
        name?: string | null;
        phone?: string | null;
        age?: number | null;
        city?: string | null;
        language?: string | null;
        bio?: string | null;
        interests?: any | null;
        accounts?: Array<{
            provider: string;
            providerAccountId: string;
        }>;
        organizerProfile?: any;
        comedianProfile?: any;
    };
    isOwner?: boolean;
}

export default function ProfileCard({ user, isOwner = true }: ProfileCardProps) {
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const getRoleDisplay = (role?: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrator';
            case 'ORGANIZER_VERIFIED':
                return 'Verified Organizer';
            case 'ORGANIZER_UNVERIFIED':
                return 'Unverified Organizer';
            case 'AUDIENCE':
                return 'Audience Member';
            default:
                return role || 'User';
        }
    };

    const getRoleColor = (role?: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'ORGANIZER_VERIFIED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'ORGANIZER_UNVERIFIED':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'AUDIENCE':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const formatDate = (date?: Date | string) => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    };

    const formatPhone = (phone: string) => {
        if (!phone) return 'Not provided';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    const isProfileComplete = !!(user.name && user.phone && user.age);

    return (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="text-center">
                {/* Profile Avatar */}
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden border-2 border-border">
                    {user.image ? (
                        <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-12 w-12 text-muted-foreground" />
                    )}
                </div>

                {/* User Info */}
                <h2 className="text-xl font-semibold text-foreground mb-2">
                    {user.name || 'Anonymous User'}
                </h2>

                {isOwner && (
                    <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1">
                        <Mail size={14} />
                        {user.email}
                    </p>
                )}

                {/* Profile Completion Status */}
                <div className="mb-4">
                    {isProfileComplete ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Profile Complete
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            Profile Incomplete
                        </span>
                    )}
                </div>

                {/* Role Badge */}
                <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleDisplay(user.role)}
                    </span>
                </div>

                {/* Account Details */}
                <div className="space-y-4 text-left">
                    {isOwner && user.phone && (
                        <div className="border-t border-border pt-3">
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium text-foreground">
                                {formatPhone(user.phone)}
                            </p>
                        </div>
                    )}

                    {isOwner && user.age && (
                        <div>
                            <p className="text-sm text-muted-foreground">Age</p>
                            <p className="text-sm font-medium text-foreground">
                                {user.age} years old
                            </p>
                        </div>
                    )}

                    {user.city && (
                        <div>
                            <p className="text-sm text-muted-foreground">City</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                                <MapPin size={14} className="text-muted-foreground" />
                                {user.city}
                            </div>
                        </div>
                    )}

                    {user.language && (
                        <div>
                            <p className="text-sm text-muted-foreground">Language Preference</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-foreground capitalize">
                                <Globe size={14} className="text-muted-foreground" />
                                {user.language}
                            </div>
                        </div>
                    )}

                    {user.bio && (
                        <div>
                            <p className="text-sm text-muted-foreground">Bio</p>
                            <p className="text-sm text-foreground italic">
                                "{user.bio}"
                            </p>
                        </div>
                    )}

                    {user.interests && Array.isArray(user.interests) && user.interests.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Comedy Interests</p>
                            <div className="flex flex-wrap gap-1">
                                {(user.interests as string[]).map((interest, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                    >
                                        <Award size={10} className="mr-1" />
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-border pt-3">
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                            <Calendar size={14} className="text-muted-foreground" />
                            {formatDate(user.createdAt)}
                        </div>
                    </div>

                    {(user.organizerProfile || user.comedianProfile) && (
                        <div className="border-t border-border pt-3">
                            <p className="text-sm text-muted-foreground mb-2">Social Media & Clips</p>
                            <div className="flex flex-wrap gap-2">
                                {/* Social Handles */}
                                {(user.comedianProfile?.socialLinks?.youtube || user.organizerProfile?.socialLinks?.youtube) && (
                                    <a
                                        href={`https://youtube.com/@${user.comedianProfile?.socialLinks?.youtube || user.organizerProfile?.socialLinks?.youtube}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 font-bold gap-1"
                                    >
                                        <Youtube size={12} />
                                        YouTube
                                    </a>
                                )}
                                {(user.comedianProfile?.socialLinks?.instagram || user.organizerProfile?.socialLinks?.instagram) && (
                                    <a
                                        href={`https://instagram.com/${user.comedianProfile?.socialLinks?.instagram || user.organizerProfile?.socialLinks?.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs hover:opacity-90 font-bold gap-1"
                                    >
                                        <Instagram size={12} />
                                        Instagram
                                    </a>
                                )}

                                {/* Video Clips */}
                                {((user.organizerProfile?.youtubeUrls || user.comedianProfile?.youtubeUrls || []) as string[]).map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 gap-1">
                                        <Video size={12} />
                                        Video
                                    </a>
                                ))}
                                {((user.organizerProfile?.instagramUrls || user.comedianProfile?.instagramUrls || []) as string[]).map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 rounded bg-pink-50 text-pink-700 text-xs hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50 gap-1">
                                        <Film size={12} />
                                        Reel
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                    {isOwner && (
                        <button
                            onClick={() => router.push('/profile/edit')}
                            className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-sm font-semibold flex items-center justify-center gap-2"
                        >
                            <Settings size={14} /> Edit Profile
                        </button>
                    )}

                    {isOwner && !isProfileComplete && (
                        <button
                            onClick={() => router.push('/profile/edit')}
                            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
                        >
                            Complete Your Profile
                        </button>
                    )}

                    {isOwner && user.role === 'ORGANIZER_UNVERIFIED' && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Your organizer account is pending verification. You'll be able to list shows once approved.
                            </p>
                        </div>
                    )}

                    {isOwner && user.role !== 'ADMIN' && (
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full mt-4 border border-destructive/50 text-destructive px-4 py-2 rounded-md hover:bg-destructive/10 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} /> Delete Account
                        </button>
                    )}

                    <DeleteAccountModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        userRole={user.role}
                    />
                </div>
            </div>
        </div>
    );
}
