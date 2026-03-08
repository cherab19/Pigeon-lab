import { useEffect, useState } from "react";
import { Beaker, BookOpen, LogOut, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardView from "@/components/dashboard/AdminDashboardView";
import TeacherDashboardView from "@/components/dashboard/TeacherDashboardView";
import StudentDashboardView from "@/components/dashboard/StudentDashboardView";

type AppRole = "super_admin" | "school_admin" | "teacher" | "student";

export default function Dashboard() {
  const [profile, setProfile] = useState<{ full_name: string; school_id: string | null } | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [userRole, setUserRole] = useState<AppRole>("student");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, school_id")
        .eq("user_id", user.id)
        .single();

      if (prof) {
        setProfile(prof);
        if (prof.school_id) {
          const { data: school } = await supabase
            .from("schools")
            .select("name")
            .eq("id", prof.school_id)
            .single();
          if (school) setSchoolName(school.name);
        }
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roles && roles.length > 0) {
        // Priority: super_admin > school_admin > teacher > student
        const priority: AppRole[] = ["super_admin", "school_admin", "teacher", "student"];
        const found = priority.find(r => roles.some(rd => rd.role === r));
        if (found) setUserRole(found);
      }

      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isAdmin = userRole === "school_admin" || userRole === "super_admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Beaker className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">EthioLab</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-6">
              <Button variant="ghost" size="sm" className="text-foreground font-medium">Dashboard</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link to="/lab"><BookOpen className="w-4 h-4 mr-1" /> Lab</Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                  <Link to="/manage-users"><Users className="w-4 h-4 mr-1" /> Members</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <LogOut className="w-4 h-4 mr-1" /> Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure you want to sign out of your account?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
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
        {isAdmin && (
          <AdminDashboardView fullName={profile?.full_name || ""} schoolName={schoolName} />
        )}
        {userRole === "teacher" && (
          <TeacherDashboardView fullName={profile?.full_name || ""} schoolName={schoolName} />
        )}
        {userRole === "student" && (
          <StudentDashboardView fullName={profile?.full_name || ""} schoolName={schoolName} />
        )}
      </main>
    </div>
  );
}
