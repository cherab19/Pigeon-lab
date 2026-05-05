import { useEffect, useState } from "react";
import { Beaker, BookOpen, LogOut, Menu, User, Users, Library, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SuperAdminDashboardView from "@/components/dashboard/SuperAdminDashboardView";
import AdminDashboardView from "@/components/dashboard/AdminDashboardView";
import TeacherDashboardView from "@/components/dashboard/TeacherDashboardView";
import StudentDashboardView from "@/components/dashboard/StudentDashboardView";
import { getSafeUser } from "@/lib/safeAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import PigeonlabLogo from "@/components/PigeonlabLogo";

type AppRole = "super_admin" | "school_admin" | "teacher" | "student";

export default function Dashboard() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<{ full_name: string; school_id: string | null } | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [userRole, setUserRole] = useState<AppRole>("student");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getSafeUser();
        if (!user) { navigate("/login"); return; }
        const { data: prof } = await supabase.from("profiles").select("full_name, school_id").eq("user_id", user.id).single();
        if (prof) {
          setProfile(prof);
          if (prof.school_id) {
            const { data: school } = await supabase.from("schools").select("name").eq("id", prof.school_id).single();
            if (school) setSchoolName(school.name);
          }
        }
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        let resolvedRole: AppRole = "student";
        if (roles && roles.length > 0) {
          const priority: AppRole[] = ["super_admin", "school_admin", "teacher", "student"];
          const found = priority.find(r => roles.some(rd => rd.role === r));
          if (found) { setUserRole(found); resolvedRole = found; }
        }
        // Gate: school admins must have purchased seats before accessing dashboard
        if (resolvedRole === "school_admin" && prof?.school_id) {
          const { data: sub } = await supabase
            .from("school_subscriptions")
            .select("teacher_seats, student_seats, status")
            .eq("school_id", prof.school_id)
            .maybeSingle();
          const totalSeats = (sub?.teacher_seats ?? 0) + (sub?.student_seats ?? 0);
          if (totalSeats <= 0) { navigate("/subscribe?onboarding=1", { replace: true }); return; }
        }
      } finally { setLoading(false); }
    };
    load();
  }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/login"); };
  const isAdmin = userRole === "school_admin" || userRole === "super_admin";

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground">{t("common.loading")}</div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <PigeonlabLogo size="sm" />
            </Link>
            {userRole !== "super_admin" && (
              <div className="hidden md:flex items-center gap-1 ml-6">
                <Button variant="ghost" size="sm" className="text-foreground font-medium">{t("nav.dashboard")}</Button>
                {userRole === "student" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        const el = document.getElementById("choose-subject");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-1" /> {t("nav.lab")}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                      <Link to="/textbooks"><Library className="w-4 h-4 mr-1" /> {t("nav.library")}</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                      <Link to="/success-guide"><Sparkles className="w-4 h-4 mr-1" /> {t("nav.successGuide")}</Link>
                    </Button>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                      <Link to="/manage-users"><Users className="w-4 h-4 mr-1" /> {t("nav.members")}</Link>
                    </Button>
                    {userRole === "school_admin" && (
                      <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                        <Link to="/subscribe"><Sparkles className="w-4 h-4 mr-1" /> {t("nav.subscription") || "Subscription"}</Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <LogOut className="w-4 h-4 mr-1" /> {t("nav.signOut")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("dashboard.signOutConfirm")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("dashboard.signOutDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>{t("nav.signOut")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {userRole === "super_admin" && <SuperAdminDashboardView fullName={profile?.full_name || ""} />}
        {userRole === "school_admin" && <AdminDashboardView fullName={profile?.full_name || ""} schoolName={schoolName} />}
        {userRole === "teacher" && <TeacherDashboardView fullName={profile?.full_name || ""} schoolName={schoolName} />}
        {userRole === "student" && <StudentDashboardView fullName={profile?.full_name || ""} schoolName={schoolName} />}
      </main>
    </div>
  );
}
