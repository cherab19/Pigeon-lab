import withPWA from "next-pwa";

const nextConfig = {
  output: "standalone",
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  images: { remotePatterns: [] },
  // CloudLinux shared hosting accounts can impose a very low child-process
  // limit. Keep Next's production build to one worker in that environment.
  experimental: {
    cpus: 1,
  },
};
export default withPWA({ dest: "public", disable: process.env.NODE_ENV === "development" })(nextConfig);
