import { supabase } from "@/integrations/supabase/client";

const isInvalidRefreshTokenError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "refresh_token_not_found" ||
    maybeError.message?.toLowerCase().includes("invalid refresh token")
  );
};

const clearBrokenSession = async () => {
  await supabase.auth.signOut({ scope: "local" });
};

export async function getSafeUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        await clearBrokenSession();
        return null;
      }
      console.error("getUser failed:", error);
      return null;
    }
    return data.user ?? null;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearBrokenSession();
      return null;
    }
    console.error("getUser unexpected failure:", error);
    return null;
  }
}

export async function getSafeSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        await clearBrokenSession();
        return null;
      }
      console.error("getSession failed:", error);
      return null;
    }
    return data.session ?? null;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearBrokenSession();
      return null;
    }
    console.error("getSession unexpected failure:", error);
    return null;
  }
}
