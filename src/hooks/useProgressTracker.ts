import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";

export function useProgressTracker(experimentId: string | undefined, subject: string | undefined, grade: string | undefined) {
  const startTime = useRef<number>(Date.now());
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (!experimentId || !subject || !grade) return;
    if (tracked.current === experimentId) return;
    tracked.current = experimentId;
    startTime.current = Date.now();

    const trackStart = async () => {
      const user = await getSafeUser();
      if (!user) return;

      await supabase
        .from("experiment_progress")
        .upsert({
          user_id: user.id,
          experiment_id: experimentId,
          subject,
          grade: Number(grade),
          status: "started",
          started_at: new Date().toISOString(),
        }, { onConflict: "user_id,experiment_id" });
    };
    trackStart();
  }, [experimentId, subject, grade]);

  const markComplete = useCallback(async () => {
    if (!experimentId) return;
    const user = await getSafeUser();
    if (!user) return;

    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    await supabase
      .from("experiment_progress")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        time_spent_seconds: elapsed,
      })
      .eq("user_id", user.id)
      .eq("experiment_id", experimentId);
  }, [experimentId]);

  return { markComplete };
}
