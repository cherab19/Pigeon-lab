import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  School, Users, GraduationCap, BookOpen, Activity, Shield,
  MapPin, Mail, Phone, CreditCard, DollarSign, AlertTriangle,
  CheckCircle, Clock, Pause, Edit2, ChevronDown, ChevronUp, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { totalExperiments } from "./SharedDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import SuperAdminSchoolManager from "./SuperAdminSchoolManager";
import SuperAdminUserManager from "./SuperAdminUserManager";
import SuperAdminAnalyticsCharts from "./SuperAdminAnalyticsCharts";

interface SubscriptionData {
  id: string;
  school_id: string;
  school_name: string;
  school_location: string | null;
  school_email: string | null;
  school_phone: string | null;
  status: string;
  student_count: number;
  price_per_student: number;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  activated_at: string | null;
  suspended_at: string | null;
  notes: string | null;
  total_members: number;
  monthly_revenue: number;
}

interface SubStats {
  total_active: number;
  total_expired: number;
  total_suspended: number;
  total_trial: number;
  total_revenue: number;
  total_paying_students: number;
  subscriptions: SubscriptionData[];
}

interface PlatformStats {
  total_schools: number;
  total_users: number;
  total_students: number;
  total_teachers: number;
}

interface Props {
  fullName: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
  trial: { label: "Trial", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Clock },
  expired: { label: "Expired", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle },
  suspended: { label: "Suspended", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Pause },
};

export default function SuperAdminDashboardView({ fullName }: Props) {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [subStats, setSubStats] = useState<SubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSchool, setEditingSchool] = useState<SubscriptionData | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editStudentCount, setEditStudentCount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [statsRes, subRes] = await Promise.all([
      supabase.rpc("get_super_admin_stats"),
      supabase.rpc("get_subscription_stats"),
    ]);
    if (statsRes.data) setPlatformStats(statsRes.data as unknown as PlatformStats);
    if (subRes.data) setSubStats(subRes.data as unknown as SubStats);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openEdit = (school: SubscriptionData) => {
    setEditingSchool(school);
    setEditStatus(school.status);
    setEditStudentCount(school.student_count.toString());
    setEditNotes(school.notes || "");
  };

  const handleSave = async () => {
    if (!editingSchool) return;
    setSaving(true);
    const { error } = await supabase.rpc("update_school_subscription", {
      _school_id: editingSchool.school_id,
      _status: editStatus,
      _student_count: parseInt(editStudentCount) || 0,
      _notes: editNotes || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to update subscription");
      return;
    }
    toast.success("Subscription updated");
    setEditingSchool(null);
    setLoading(true);
    await loadData();
  };

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Platform Admin</span>
        </div>
        <h1 className="text-3xl font-display font-bold">
          Welcome{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          EthioLab platform overview · {totalExperiments} experiments available
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* Platform KPIs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Schools", value: platformStats?.total_schools ?? 0, icon: School, color: "text-primary" },
                { label: "Total Users", value: platformStats?.total_users ?? 0, icon: Users, color: "text-secondary" },
                { label: "Students", value: platformStats?.total_students ?? 0, icon: GraduationCap, color: "text-accent" },
                { label: "Teachers", value: platformStats?.total_teachers ?? 0, icon: BookOpen, color: "text-primary" },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="bg-card rounded-xl p-5 border border-border shadow-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                    <span className="text-2xl font-display font-bold">{c.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Revenue mini KPIs */}
          {subStats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { label: "Monthly Revenue", value: `${subStats.total_revenue} ETB`, icon: DollarSign, color: "text-primary" },
                  { label: "Paying Students", value: subStats.total_paying_students, icon: CreditCard, color: "text-secondary" },
                  { label: "Active", value: subStats.total_active, icon: CheckCircle, color: "text-emerald-600" },
                  { label: "Trial", value: subStats.total_trial, icon: Clock, color: "text-blue-600" },
                  { label: "Expired", value: subStats.total_expired, icon: AlertTriangle, color: "text-red-600" },
                  { label: "Suspended", value: subStats.total_suspended, icon: Pause, color: "text-amber-600" },
                ].map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                    className="bg-card rounded-xl p-4 border border-border shadow-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <c.icon className={`w-4 h-4 ${c.color}`} />
                      <span className="text-xl font-display font-bold">{c.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tabbed Management Section */}
          <Tabs defaultValue="schools" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="schools" className="gap-1.5">
                <School className="w-4 h-4" /> Schools
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-1.5">
                <DollarSign className="w-4 h-4" /> Subscriptions
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1.5">
                <Users className="w-4 h-4" /> Users
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5">
                <BarChart3 className="w-4 h-4" /> Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schools">
              <SuperAdminSchoolManager
                subscriptions={subStats?.subscriptions || []}
                onRefresh={async () => { setLoading(true); await loadData(); }}
              />
            </TabsContent>

            <TabsContent value="subscriptions">
              <SubscriptionManager
                subStats={subStats}
                statusConfig={statusConfig}
                onEdit={openEdit}
              />
            </TabsContent>

            <TabsContent value="users">
              <SuperAdminUserManager />
            </TabsContent>

            <TabsContent value="analytics">
              <SuperAdminAnalyticsCharts />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Edit Subscription Dialog */}
      <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription — {editingSchool?.school_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Paying Students</label>
              <Input
                type="number"
                min="0"
                value={editStudentCount}
                onChange={(e) => setEditStudentCount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Revenue: {(parseInt(editStudentCount) || 0) * (editingSchool?.price_per_student ?? 30)} ETB/month
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <Textarea
                placeholder="Internal notes about this school..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSchool(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Extracted subscription list component
function SubscriptionManager({
  subStats,
  statusConfig,
  onEdit,
}: {
  subStats: SubStats | null;
  statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }>;
  onEdit: (s: SubscriptionData) => void;
}) {
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  if (!subStats?.subscriptions.length) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
        <School className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="font-medium">No subscriptions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subStats.subscriptions.map((school, i) => {
        const cfg = statusConfig[school.status] || statusConfig.trial;
        const StatusIcon = cfg.icon;
        const isExpanded = expandedSchool === school.school_id;

        return (
          <motion.div
            key={school.school_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
          >
            <div
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedSchool(isExpanded ? null : school.school_id)}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <School className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold truncate">{school.school_name}</h3>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>{school.total_members} members</span>
                  <span>·</span>
                  <span>{school.student_count} paying students</span>
                </div>
              </div>
              <Badge variant="outline" className={`${cfg.color} border shrink-0`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {cfg.label}
              </Badge>
              <div className="text-right shrink-0 hidden sm:block">
                <span className="font-display font-bold">{school.monthly_revenue} ETB</span>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="border-t border-border px-4 pb-4 pt-3"
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                  {school.school_location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" /> {school.school_location}
                    </div>
                  )}
                  {school.school_email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" /> {school.school_email}
                    </div>
                  )}
                  {school.school_phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" /> {school.school_phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="w-3.5 h-3.5" />
                    {school.price_per_student} ETB × {school.student_count} students
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Billing Period</span>
                    <p className="font-mono text-xs mt-0.5">
                      {new Date(school.current_period_start).toLocaleDateString()} — {new Date(school.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                  {school.notes && (
                    <div>
                      <span className="text-xs text-muted-foreground">Notes</span>
                      <p className="text-xs mt-0.5">{school.notes}</p>
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => onEdit(school)}>
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Subscription
                </Button>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
