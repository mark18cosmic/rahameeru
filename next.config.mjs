/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: import.meta.dirname,
  // Emits .next/standalone — a self-contained server with only the node_modules
  // it actually uses, which is what the Docker runtime stage copies.
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
