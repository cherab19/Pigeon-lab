export async function getSafeUser() {
  try {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return null;
    const session = await res.json();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      roles: session.user.roles || [],
      schoolId: session.user.schoolId,
    };
  } catch (err) {
    console.error("getSafeUser failed:", err);
    return null;
  }
}

export async function getSafeSession() {
  try {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return null;
    const session = await res.json();
    if (!session?.user) return null;
    return session;
  } catch (err) {
    console.error("getSafeSession failed:", err);
    return null;
  }
}
