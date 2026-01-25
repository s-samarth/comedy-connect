import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // API only - no pages
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb'
        }
    }
};

export default nextConfig;
