import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        const apiUrl = process.env.API_URL
        if (!apiUrl) throw new Error('API_URL environment variable is not defined')

        return [
            {
                source: '/api/v1/:path*',
                destination: `${apiUrl}/api/v1/:path*`,
            },
            {
                source: '/api/admin-secure/:path*',
                destination: `${apiUrl}/api/admin-secure/:path*`,
            },
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            }
        ]
    },
};

export default nextConfig;
