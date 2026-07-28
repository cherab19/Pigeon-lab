import { useEffect, useState } from "react";
import { getSafeUser } from "@/lib/session-client";

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

      if (user.roles?.includes("super_admin")) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/rpc/check-subscription-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setHasAccess(!!data);
        } else {
          setHasAccess(false);
        }
      } catch (err) {
        console.error(err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  return { hasAccess, loading };
}
