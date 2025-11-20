/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "fra.cloud.appwrite.io",
                pathname: "/v1/storage/buckets/**",
            },
        ],
    },

    // ✅ Skip ESLint errors during build
    eslint: {
        ignoreDuringBuilds: true,
    },

    // ✅ Skip TypeScript errors during build
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;