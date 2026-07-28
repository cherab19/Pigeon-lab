import { useEffect, useRef, useCallback } from "react";
import { getSafeUser } from "@/lib/session-client";

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

      try {
        await fetch("/api/progress-tracker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "start",
            experimentId,
            subject,
            grade: Number(grade),
          }),
        });
      } catch (err) {
        console.error("Failed to track start:", err);
      }
    };
    trackStart();
  }, [experimentId, subject, grade]);

  const markComplete = useCallback(async () => {
    if (!experimentId) return;
    const user = await getSafeUser();
    if (!user) return;

    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    try {
      await fetch("/api/progress-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          experimentId,
          timeSpentSeconds: elapsed,
        }),
      });
    } catch (err) {
      console.error("Failed to track completion:", err);
    }
  }, [experimentId]);

  return { markComplete };
}
