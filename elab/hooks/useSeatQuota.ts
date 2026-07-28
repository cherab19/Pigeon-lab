import { useCallback, useEffect, useState } from "react";

export type SeatQuota = {
  teacher_seats: number;
  student_seats: number;
  used_teachers: number;
  used_students: number;
  available_teachers: number;
  available_students: number;
};

export function useSeatQuota(schoolId: string | null | undefined) {
  const [quota, setQuota] = useState<SeatQuota | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/rpc/can-invite-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_id: schoolId, role: "student" }),
      });
      if (res.ok) {
        const d = await res.json();
        setQuota({
          teacher_seats: d.teacher_seats ?? 0,
          student_seats: d.student_seats ?? 0,
          used_teachers: d.used_teachers ?? 0,
          used_students: d.used_students ?? 0,
          available_teachers: d.available_teachers ?? 0,
          available_students: d.available_students ?? 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { quota, loading, refresh };
}
