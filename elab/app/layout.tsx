import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
export const metadata: Metadata = { title: "Pigeonlab", description: "Virtual science labs for Ethiopian secondary schools", manifest: "/manifest.json" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
