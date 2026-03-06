import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Beaker, School, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolName: "",
    schoolLocation: "",
    schoolPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          school_name: form.schoolName,
          school_location: form.schoolLocation,
          school_phone: form.schoolPhone,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Please check your email to confirm your account." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Beaker className="w-7 h-7" />
            </div>
            <span className="font-display font-bold text-3xl">EthioLab</span>
          </div>
          <h2 className="text-2xl font-display font-bold mb-4">Register Your School</h2>
          <p className="opacity-80">Set up your school's virtual science laboratory in minutes. As admin, you'll manage teachers, students, and lab access.</p>
          <div className="mt-8 space-y-3 text-sm opacity-70">
            <p>✓ 49 interactive lab simulations</p>
            <p>✓ Physics, Chemistry & Biology</p>
            <p>✓ Grades 9–12 Ethiopian curriculum</p>
            <p>✓ Subscription plan included after registration</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Beaker className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">EthioLab</span>
            </div>
            <h1 className="text-2xl font-display font-bold">Create your school account</h1>
            <p className="text-sm text-muted-foreground mt-2">Fill in your details to register as a School Admin</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Admin info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Information</p>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Abebe Kebede" value={form.fullName} onChange={e => update("fullName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@school.edu.et" value={form.email} onChange={e => update("email", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={e => update("password", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} required />
                </div>
              </div>
            </div>

            {/* School info */}
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pt-2">
                <School className="w-3.5 h-3.5" /> School Information
              </p>
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input id="schoolName" placeholder="Addis Ababa Science Academy" value={form.schoolName} onChange={e => update("schoolName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolLocation">Location / City</Label>
                <Input id="schoolLocation" placeholder="Addis Ababa" value={form.schoolLocation} onChange={e => update("schoolLocation", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolPhone">Phone Number</Label>
                <Input id="schoolPhone" type="tel" placeholder="+251 9XX XXX XXXX" value={form.schoolPhone} onChange={e => update("schoolPhone", e.target.value)} />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : <><UserPlus className="w-4 h-4 mr-2" /> Register School</>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
          <p className="text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
