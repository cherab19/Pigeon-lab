import withPWA from "next-pwa";
const nextConfig = { output: "standalone", transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"], images: { remotePatterns: [] } };
export default withPWA({ dest: "public", disable: process.env.NODE_ENV === "development" })(nextConfig);
