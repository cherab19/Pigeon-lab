import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    // We use the can_invite_member RPC with role='student' to fetch counts (it returns all fields)
    const { data } = await supabase.rpc("can_invite_member", { _school_id: schoolId, _role: "student" });
    if (data) {
      const d = data as any;
      setQuota({
        teacher_seats: d.teacher_seats ?? 0,
        student_seats: d.student_seats ?? 0,
        used_teachers: d.used_teachers ?? 0,
        used_students: d.used_students ?? 0,
        available_teachers: d.available_teachers ?? 0,
        available_students: d.available_students ?? 0,
      });
    }
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { quota, loading, refresh };
}
