import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/v1/:path*',
                destination: 'http://localhost:4000/api/v1/:path*',
            },
            {
                source: '/api/admin-secure/:path*',
                destination: 'http://localhost:4000/api/admin-secure/:path*',
            },
        ]
    },
};

export default nextConfig;
