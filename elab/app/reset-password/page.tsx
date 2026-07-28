"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PigeonlabLogo from "@/components/PigeonlabLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/password-reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(token ? { action: "confirm", token, password } : { email }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to reset password");
      setLoading(false);
      setSent(true);
      toast.success(token ? "Password updated. You can now sign in." : "Reset link sent if the account exists.");
    } catch (error) {
      setLoading(false);
      toast.error(error instanceof Error ? error.message : "Unable to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <header className="p-4 flex justify-between items-center">
        <Link href="/">
          <PigeonlabLogo size="sm" />
        </Link>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display font-bold">Reset Password</CardTitle>
            <CardDescription>
              {sent ? (token ? "Your password has been updated." : "Check your email for the recovery link.") : (token ? "Choose a new password for your account." : "Enter your email address to receive a password reset link.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {token ? <div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></div> : <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email") || "Email"}</Label>
                  <Input id="email" type="email" placeholder="admin@school.edu.et" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {token ? "Update Password" : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="text-center pt-2">
                {!token && <Button variant="outline" className="w-full" onClick={() => setSent(false)}>Resend Email</Button>}
              </div>
            )}

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Pigeonlab. All rights reserved.
      </footer>
    </div>
  );
}
