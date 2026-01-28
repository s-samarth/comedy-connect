'use client';

import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    onUpload: (url: string, publicId: string) => void;
    currentImage?: string;
    type: 'show' | 'comedian' | 'profile';
    className?: string;
}

export default function ImageUpload({ onUpload, currentImage, type, className = "" }: ImageUploadProps) {
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
        <div className={`space-y-4 ${className}`}>
            {/* Current/Preview Image */}
            <div className="relative">
                {(preview || currentImage) ? (
                    <div className="relative group w-full flex justify-center">
                        <img
                            src={preview || currentImage}
                            alt="Preview"
                            className={`w-48 h-48 object-cover rounded-full border-4 border-border ${isUploading ? 'opacity-50' : ''}`}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center">
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
                                className="absolute top-2 right-1/4 translate-x-1/2 bg-destructive text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                                title="Remove Image"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full flex justify-center">
                        <div className="w-48 h-48 bg-muted border-2 border-dashed border-border rounded-full flex items-center justify-center">
                            <div className="text-center">
                                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">No image</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* File Input */}
            <div className="max-w-[200px] mx-auto">
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
        </div>
    );
}
