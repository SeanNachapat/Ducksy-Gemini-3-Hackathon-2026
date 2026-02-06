/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '../ducksy-app/out',
  images: {
    unoptimized: true,
  },
  // Disable server-side features for Electron
  trailingSlash: true,
};

export default nextConfig;
