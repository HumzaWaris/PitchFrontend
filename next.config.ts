/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // Allows all domains (or specify exact domains)
            },
        ],
    },
};

module.exports = nextConfig;
