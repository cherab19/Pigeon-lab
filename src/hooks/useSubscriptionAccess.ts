import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";

export function useSubscriptionAccess() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const user = await getSafeUser();
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Super admins always have access
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roles?.some(r => r.role === "super_admin")) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase.rpc("check_subscription_access", { _user_id: user.id });
      setHasAccess(!!data);
      setLoading(false);
    };
    check();
  }, []);

  return { hasAccess, loading };
}
