/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["storage.googleapis.com"], // ✅ Allows Firebase Storage images
    },
};

module.exports = nextConfig;
