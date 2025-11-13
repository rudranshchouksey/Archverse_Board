/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'fra.cloud.appwrite.io',
                // This pathname restricts the matching to your specific Appwrite file path
                pathname: '/v1/storage/buckets/**', 
            },
        ],
    },
};

export default nextConfig;