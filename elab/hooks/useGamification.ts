import { useEffect, useState, useCallback } from "react";
import { getSafeUser } from "@/lib/session-client";
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
    try {
      const res = await fetch("/api/gamification");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const awardXP = useCallback(async (amount: number, badgeKeys: string[] = []) => {
    const user = await getSafeUser();
    if (!user) return;

    try {
      const res = await fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, badgeKeys }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.new_badges && data.new_badges.length > 0) {
          data.new_badges.forEach((key: string) => {
            const info = getBadgeInfo(key);
            toast.success(`${info.icon} Badge earned: ${info.name}`, { description: info.description });
          });
        }
        toast.success(`+${amount} XP earned!`);
        await load();
      }
    } catch (err) {
      console.error(err);
    }
  }, [load]);

  return { state, loading, awardXP, reload: load };
}
