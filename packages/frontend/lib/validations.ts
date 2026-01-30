/**
 * Validation utilities for URLs and other fields.
 * Ported from legacy frontend with enhancements for current tech stack.
 */

/**
 * Validates a Google Maps URL.
 * Accepts formats: maps.app.goo.gl, google.com/maps, www.google.com/maps
 */
export const isValidGoogleMapsLink = (url: string): boolean => {
    if (!url) return false;
    return (
        url.startsWith('https://maps.app.goo.gl') ||
        url.startsWith('https://google.com/maps') ||
        url.startsWith('https://www.google.com/maps')
    );
};

/**
 * Validates a YouTube URL.
 * Accepts formats: youtube.com, www.youtube.com, youtu.be
 */
export const isValidYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    return (
        url.startsWith('https://youtube.com') ||
        url.startsWith('https://www.youtube.com') ||
        url.startsWith('https://youtu.be')
    );
};

/**
 * Validates an Instagram URL.
 * Accepts formats: instagram.com, www.instagram.com
 */
export const isValidInstagramUrl = (url: string): boolean => {
    if (!url) return false;
    return (
        url.startsWith('https://instagram.com') ||
        url.startsWith('https://www.instagram.com')
    );
};

/**
 * Extracts YouTube video ID from a URL.
 */
export const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Extracts Instagram Reel/Post ID from a URL.
 */
export const getInstagramId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:instagram\.com\/reel\/|instagram\.com\/p\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
};
