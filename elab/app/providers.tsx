"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SessionProvider } from "next-auth/react";
export default function Providers({ children }: { children: React.ReactNode }) { const [client] = useState(() => new QueryClient()); return <SessionProvider><LanguageProvider><QueryClientProvider client={client}>{children}<Toaster richColors /></QueryClientProvider></LanguageProvider></SessionProvider>; }
