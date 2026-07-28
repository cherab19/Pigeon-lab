"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import PigeonlabLogo from "@/components/PigeonlabLogo";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage(); const router = useRouter(); const { status } = useSession();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (status === "authenticated") router.replace("/dashboard"); }, [router, status]);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); const result = await signIn("credentials", { email, password, redirect: false }); setLoading(false); if (result?.error) setError(t("login.failed")); else router.replace("/dashboard"); }
  return <div className="min-h-screen bg-background flex">
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12"><div className="text-primary-foreground max-w-md"><div className="flex items-center gap-3 mb-8"><PigeonlabLogo size="lg" /></div><h2 className="text-2xl font-display font-bold mb-4">{t("login.welcomeBack")}</h2><p className="opacity-80">{t("login.accessLab")}</p></div></div>
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8"><div className="w-full max-w-md space-y-8"><div className="flex justify-end"><LanguageToggle /></div><div className="text-center lg:text-left"><div className="lg:hidden flex justify-center mb-6"><PigeonlabLogo size="md" /></div><h1 className="text-2xl font-display font-bold">{t("login.signIn")}</h1><p className="text-sm text-muted-foreground mt-2">{t("login.credentials")}</p></div><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t("common.email")}</label><input id="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="email" placeholder="admin@school.edu.et" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">{t("login.password")}</label><input id="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<button className="w-full h-10 rounded-md bg-gradient-hero text-primary-foreground font-medium disabled:opacity-50" disabled={loading}>{loading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : <><LogIn className="inline w-4 h-4 mr-2" />{t("login.signInBtn")}</>}</button></form><p className="text-center text-sm text-muted-foreground">{t("login.noAccount")} <Link href="/signup" className="text-primary font-medium hover:underline">{t("login.registerSchool")}</Link></p><p className="text-center"><Link href="/reset-password" className="text-xs text-muted-foreground hover:text-foreground">Reset password</Link></p></div></div>
  </div>;
}
