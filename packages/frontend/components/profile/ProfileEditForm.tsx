'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ui/ImageUpload';
import { Loader2, Plus, Trash2, Youtube, Instagram, Video, Film } from 'lucide-react';
import { isValidYouTubeUrl, isValidInstagramUrl } from '@/lib/validations';

interface ProfileEditFormProps {
    user: any;
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Basic User Data
    const [formData, setFormData] = useState({
        name: user.name || "",
        phone: user.phone || "",
        age: user.age || "",
        city: user.city || "",
        language: user.language || "",
        bio: user.bio || "",
        image: user.image || "",

        // Comedian Profile
        stageName: user.comedianProfile?.stageName || "",
        comedianContact: user.comedianProfile?.contact || "",
        comedianBio: user.comedianProfile?.bio || "",
        comedianYoutubeUrls: user.comedianProfile?.youtubeUrls || [],
        comedianInstagramUrls: user.comedianProfile?.instagramUrls || [],

        // Organizer Profile
        organizerName: user.organizerProfile?.name || "",
        organizerContact: user.organizerProfile?.contact || "",
        organizerDescription: user.organizerProfile?.description || "",
        organizerVenue: user.organizerProfile?.venue || "",
        organizerYoutubeUrls: user.organizerProfile?.youtubeUrls || [],
        organizerInstagramUrls: user.organizerProfile?.instagramUrls || [],

        // Social Handles (Stored in socialLinks JSON)
        youtubeHandle: user.comedianProfile?.socialLinks?.youtube || user.organizerProfile?.socialLinks?.youtube || "",
        instagramHandle: user.comedianProfile?.socialLinks?.instagram || user.organizerProfile?.socialLinks?.instagram || "",
    });

    const [newYoutubeUrl, setNewYoutubeUrl] = useState("");
    const [newInstagramUrl, setNewInstagramUrl] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMediaAdd = (type: 'youtube' | 'instagram', value: string) => {
        if (!value.trim()) return;

        const role = user.role || 'AUDIENCE';
        const fieldName = role.startsWith('COMEDIAN')
            ? (type === 'youtube' ? 'comedianYoutubeUrls' : 'comedianInstagramUrls')
            : (type === 'youtube' ? 'organizerYoutubeUrls' : 'organizerInstagramUrls');

        const normalizedValue = value.trim();

        if (type === 'youtube') {
            if (!isValidYouTubeUrl(normalizedValue)) {
                alert("Please enter a valid YouTube URL starting with https://youtube.com or https://youtu.be");
                return;
            }
        }

        if (type === 'instagram') {
            if (!isValidInstagramUrl(normalizedValue)) {
                alert("Please enter a valid Instagram URL starting with https://instagram.com");
                return;
            }
        }

        const currentUrls = formData[fieldName as keyof typeof formData] as string[];
        if (type === 'youtube' && currentUrls.length >= 1) {
            alert("You can only add 1 YouTube video. Please remove the existing one to add a new one.");
            return;
        }
        if (type === 'instagram' && currentUrls.length >= 2) {
            alert("You can only add 2 Instagram reels. Please remove an existing one to add a new one.");
            return;
        }

        setFormData(prev => ({
            ...prev,
            [fieldName]: [...(prev[fieldName as keyof typeof formData] as string[]), value.trim()]
        }));

        if (type === 'youtube') setNewYoutubeUrl("");
        else setNewInstagramUrl("");
    };

    const handleMediaRemove = (type: 'youtube' | 'instagram', index: number) => {
        const role = user.role || 'AUDIENCE';
        const fieldName = role.startsWith('COMEDIAN')
            ? (type === 'youtube' ? 'comedianYoutubeUrls' : 'comedianInstagramUrls')
            : (type === 'youtube' ? 'organizerYoutubeUrls' : 'organizerInstagramUrls');

        setFormData(prev => ({
            ...prev,
            [fieldName]: (prev[fieldName as keyof typeof formData] as string[]).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Auto-add any pending URLs in the inputs before saving
        const finalFormData = { ...formData };
        const role = user.role || 'AUDIENCE';

        if (newYoutubeUrl.trim()) {
            const field = role.startsWith('COMEDIAN') ? 'comedianYoutubeUrls' : 'organizerYoutubeUrls';
            const currentCount = (finalFormData[field as keyof typeof finalFormData] as string[]).length;
            if (currentCount < 1) {
                finalFormData[field as keyof typeof finalFormData] = [...(finalFormData[field as keyof typeof finalFormData] as string[]), newYoutubeUrl.trim()];
            }
        }

        if (newInstagramUrl.trim()) {
            const field = role.startsWith('COMEDIAN') ? 'comedianInstagramUrls' : 'organizerInstagramUrls';
            const currentCount = (finalFormData[field as keyof typeof finalFormData] as string[]).length;
            if (currentCount < 2) {
                finalFormData[field as keyof typeof finalFormData] = [...(finalFormData[field as keyof typeof finalFormData] as string[]), newInstagramUrl.trim()];
            }
        }

        // Map handles to socialLinks objects for the API
        const socialLinksData = {
            youtube: formData.youtubeHandle,
            instagram: formData.instagramHandle
        };

        const payload = {
            ...finalFormData,
            comedianSocialLinks: role.startsWith('COMEDIAN') ? socialLinksData : undefined,
            organizerSocialLinks: role.startsWith('ORGANIZER') ? socialLinksData : undefined,
        };

        try {
            const response = await fetch("/api/v1/profile/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                router.push(`/profile`);
                router.refresh();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to update profile");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const isComedian = user.role?.startsWith('COMEDIAN');
    const isOrganizer = user.role?.startsWith('ORGANIZER');
    const isVerified = user.role === 'COMEDIAN_VERIFIED' || user.role === 'ORGANIZER_VERIFIED';

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                    {error}
                </div>
            )}

            {/* Profile Photo */}
            <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold text-foreground pb-2 border-b border-border">Profile Photo</h3>
                <div className="flex flex-col items-center">
                    <ImageUpload
                        currentImage={formData.image}
                        onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                        type="profile"
                        className="max-w-[200px]"
                    />
                    <p className="text-sm text-muted-foreground mt-2">Recommended: Square image, min 400x400px</p>
                </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground pb-2 border-b border-border">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                        <div className="flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground sm:text-sm">
                                +91
                            </span>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 10) setFormData(prev => ({ ...prev, phone: val }));
                                }}
                                pattern="[0-9]{10}"
                                maxLength={10}
                                required
                                className="flex-1 block w-full p-2 rounded-none rounded-r-md border border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
                                placeholder="9876543210"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">City</label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                            required
                        >
                            <option value="">Select city</option>
                            <option value="Hyderabad">Hyderabad</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Delhi">Delhi</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Bio (Publicly visible)</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                        placeholder="Tell your audience about yourself..."
                    ></textarea>
                </div>
            </div>

            {/* Comedian specific fields */}
            {isComedian && (
                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold text-foreground pb-2 border-b border-border">Comedian Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Stage Name *</label>
                            <input
                                type="text"
                                name="stageName"
                                value={formData.stageName}
                                onChange={handleChange}
                                placeholder="How you appear on posters"
                                required={isComedian}
                                className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Organizer specific fields */}
            {isOrganizer && (
                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold text-foreground pb-2 border-b border-border">Organizer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Organization Name *</label>
                            <input
                                type="text"
                                name="organizerName"
                                value={formData.organizerName}
                                onChange={handleChange}
                                required={isOrganizer}
                                className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Primary Venue</label>
                            <input
                                type="text"
                                name="organizerVenue"
                                value={formData.organizerVenue}
                                onChange={handleChange}
                                className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Organization Description</label>
                        <textarea
                            name="organizerDescription"
                            value={formData.organizerDescription}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                            placeholder="Tell comedians why they should work with you..."
                        ></textarea>
                    </div>
                </div>
            )}

            {/* Social Media & Media Library */}
            {(isComedian || isOrganizer) && (
                <div className="space-y-6 pt-4 border-t border-border">
                    <h3 className="text-xl font-bold text-foreground">Social Media & Portfolio</h3>

                    {/* Social Handles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl border border-border">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Youtube size={16} /> YouTube Channel @handle
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-muted-foreground">@</span>
                                <input
                                    type="text"
                                    name="youtubeHandle"
                                    value={formData.youtubeHandle}
                                    onChange={handleChange}
                                    placeholder="yourhandle"
                                    className="w-full pl-8 pr-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-red-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Instagram size={16} /> Instagram @username
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-muted-foreground">@</span>
                                <input
                                    type="text"
                                    name="instagramHandle"
                                    value={formData.instagramHandle}
                                    onChange={handleChange}
                                    placeholder="yourusername"
                                    className="w-full pl-8 pr-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-pink-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-dashed border-border">
                        <h4 className="text-lg font-semibold text-foreground">Video Highlights</h4>
                        <p className="text-sm text-muted-foreground">Add links to your best performances or show reels to showcase on your profile.</p>

                        {/* YouTube Section */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2 font-bold flex items-center gap-2">
                                <Video size={16} /> Featured YouTube Clips
                            </label>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="url"
                                    value={newYoutubeUrl}
                                    onChange={e => setNewYoutubeUrl(e.target.value)}
                                    placeholder={(isComedian ? formData.comedianYoutubeUrls : formData.organizerYoutubeUrls).length >= 1 ? "Limit reached (1 video)" : "Paste YouTube URL here..."}
                                    disabled={(isComedian ? formData.comedianYoutubeUrls : formData.organizerYoutubeUrls).length >= 1}
                                    className="flex-1 p-2 border border-input rounded-md bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleMediaAdd('youtube', newYoutubeUrl)}
                                    disabled={(isComedian ? formData.comedianYoutubeUrls : formData.organizerYoutubeUrls).length >= 1}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {(isComedian ? formData.comedianYoutubeUrls : formData.organizerYoutubeUrls).map((url: string, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded border border-border">
                                        <span className="text-xs truncate max-w-[80%] text-muted-foreground">{url}</span>
                                        <button type="button" onClick={() => handleMediaRemove('youtube', i)} className="text-destructive text-xs font-bold hover:underline flex items-center gap-1">
                                            <Trash2 size={12} /> Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instagram Section */}
                        <div className="pt-4">
                            <label className="block text-sm font-medium text-foreground mb-2 font-bold flex items-center gap-2">
                                <Film size={16} /> Instagram Reels
                            </label>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="url"
                                    value={newInstagramUrl}
                                    onChange={e => setNewInstagramUrl(e.target.value)}
                                    placeholder={(isComedian ? formData.comedianInstagramUrls : formData.organizerInstagramUrls).length >= 2 ? "Limit reached (2 reels)" : "Paste Instagram Reel URL here..."}
                                    disabled={(isComedian ? formData.comedianInstagramUrls : formData.organizerInstagramUrls).length >= 2}
                                    className="flex-1 p-2 border border-input rounded-md bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleMediaAdd('instagram', newInstagramUrl)}
                                    disabled={(isComedian ? formData.comedianInstagramUrls : formData.organizerInstagramUrls).length >= 2}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {(isComedian ? formData.comedianInstagramUrls : formData.organizerInstagramUrls).map((url: string, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded border border-border">
                                        <span className="text-xs truncate max-w-[80%] text-muted-foreground">{url}</span>
                                        <button type="button" onClick={() => handleMediaRemove('instagram', i)} className="text-destructive text-xs font-bold hover:underline flex items-center gap-1">
                                            <Trash2 size={12} /> Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-border flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-bold transition-all disabled:opacity-50 shadow-lg"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} /> Saving...
                        </span>
                    ) : (
                        isVerified ? "Update Profile" : "Submit for Verification"
                    )}
                </button>
            </div>
        </form>
    );
}
