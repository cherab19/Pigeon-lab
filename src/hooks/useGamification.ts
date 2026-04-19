import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";
import { toast } from "sonner";

export interface GamificationState {
  xp: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  badges: string[];
}

const BADGE_DEFS: Record<string, { name: string; description: string; icon: string }> = {
  first_reflection: { name: "Reflective Mind", description: "Wrote your first weekly reflection", icon: "📝" },
  first_routine: { name: "Routine Builder", description: "Built your first daily routine", icon: "🗓️" },
  streak_3: { name: "On Fire", description: "3-day activity streak", icon: "🔥" },
  streak_7: { name: "Week Warrior", description: "7-day activity streak", icon: "⚡" },
  xp_100: { name: "Rising Star", description: "Earned 100 XP", icon: "⭐" },
  xp_500: { name: "Champion", description: "Earned 500 XP", icon: "🏆" },
  quiz_pass: { name: "Quiz Master", description: "Passed a chapter quiz", icon: "🎯" },
};

export function getBadgeInfo(key: string) {
  return BADGE_DEFS[key] || { name: key, description: "", icon: "🏅" };
}

export function useGamification() {
  const [state, setState] = useState<GamificationState | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const user = await getSafeUser();
    if (!user) { setLoading(false); return; }
    const [g, b] = await Promise.all([
      supabase.from("student_gamification").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("student_badges").select("badge_key").eq("user_id", user.id),
    ]);
    setState({
      xp: g.data?.xp ?? 0,
      current_streak: g.data?.current_streak ?? 0,
      longest_streak: g.data?.longest_streak ?? 0,
      last_active_date: g.data?.last_active_date ?? null,
      badges: b.data?.map((x: any) => x.badge_key) ?? [],
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const awardXP = useCallback(async (amount: number, badgeKeys: string[] = []) => {
    const user = await getSafeUser();
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const { data: existing } = await supabase.from("student_gamification").select("*").eq("user_id", user.id).maybeSingle();

    let newStreak = 1;
    let longestStreak = existing?.longest_streak ?? 0;
    if (existing?.last_active_date === today) {
      newStreak = existing.current_streak;
    } else if (existing?.last_active_date === yesterday) {
      newStreak = (existing.current_streak ?? 0) + 1;
    }
    longestStreak = Math.max(longestStreak, newStreak);
    const newXP = (existing?.xp ?? 0) + amount;

    await supabase.from("student_gamification").upsert({
      user_id: user.id,
      xp: newXP,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_active_date: today,
    }, { onConflict: "user_id" });

    // Auto badges
    const autoBadges: string[] = [...badgeKeys];
    if (newStreak >= 3) autoBadges.push("streak_3");
    if (newStreak >= 7) autoBadges.push("streak_7");
    if (newXP >= 100) autoBadges.push("xp_100");
    if (newXP >= 500) autoBadges.push("xp_500");

    for (const key of new Set(autoBadges)) {
      const { error } = await supabase.from("student_badges").insert({ user_id: user.id, badge_key: key });
      if (!error) {
        const info = getBadgeInfo(key);
        toast.success(`${info.icon} Badge earned: ${info.name}`, { description: info.description });
      }
    }
    toast.success(`+${amount} XP earned!`);
    await load();
  }, [load]);

  return { state, loading, awardXP, reload: load };
}
