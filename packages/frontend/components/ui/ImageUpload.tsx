'use client';

import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    onUpload: (url: string, publicId: string) => void;
    currentImage?: string;
    type: 'show' | 'comedian' | 'profile';
    className?: string;
    variant?: 'circle' | 'rectangle';
}

export default function ImageUpload({ onUpload, currentImage, type, className = "", variant = 'circle' }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Auto upload
            await handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const response = await fetch('/api/v1/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                onUpload(result.url, result.publicId);
                // Keep preview
            } else {
                const error = await response.json();
                alert(error.error || 'Upload failed');
                setPreview(null); // Reset preview on failure
            }
        } catch (error) {
            alert('Upload failed');
            setPreview(null);
        } finally {
            setIsUploading(false);
            // Reset input value so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload("", ""); // Clear in parent
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`w-full h-full ${className}`}>
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                {(preview || currentImage) ? (
                    <div className={`relative group w-full h-full flex justify-center items-center ${variant === 'rectangle' ? 'absolute inset-0' : ''}`}>
                        <img
                            src={preview || currentImage}
                            alt="Preview"
                            className={`object-cover border-border ${variant === 'circle' ? 'w-48 h-48 rounded-full border-4' : 'w-full h-full rounded-[2rem]'} ${isUploading ? 'opacity-50' : ''}`}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="bg-background/80 text-foreground px-4 py-2 rounded-full text-sm font-medium animate-pulse flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    Uploading...
                                </div>
                            </div>
                        )}
                        {!isUploading && (
                            <button
                                onClick={handleRemove}
                                type="button"
                                className={`absolute bg-destructive text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 z-20 ${variant === 'circle' ? 'top-2 right-1/4 translate-x-1/2' : 'top-4 right-4'}`}
                                title="Remove Image"
                            >
                                <X size={16} />
                            </button>
                        )}
                        {variant === 'rectangle' && (
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                                <label
                                    htmlFor={`file-input-${type}`}
                                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/20 cursor-pointer transition-all text-sm font-bold uppercase tracking-wider"
                                >
                                    Change Photo
                                </label>
                                <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">
                                    JPG, PNG or WebP (max 5MB)
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className={`border-2 border-dashed border-border flex items-center justify-center ${variant === 'circle' ? 'w-48 h-48 rounded-full bg-muted' : 'w-full h-full rounded-inherit bg-transparent border-none'}`}>
                            <div className="text-center">
                                <Camera className={`mx-auto text-muted-foreground mb-2 ${variant === 'circle' ? 'h-12 w-12' : 'h-16 w-16 opacity-20'}`} />
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                                    {variant === 'circle' ? 'No image' : 'Upload Poster'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* File Input for Circle variant (below image) */}
            {variant === 'circle' && (
                <div className="max-w-[200px] mx-auto mt-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`file-input-${type}`}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor={`file-input-${type}`}
                        className={`block w-full text-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 cursor-pointer transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        {preview || currentImage ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                        JPG, PNG or WebP (max 5MB)
                    </p>
                </div>
            )}

            {/* Hidden Input for Rectangle variant (triggered via labels) */}
            {variant === 'rectangle' && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`file-input-${type}`}
                    disabled={isUploading}
                />
            )}
        </div>
    );
}
