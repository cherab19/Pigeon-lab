import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AppRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Auth.js otherwise rejects reverse-proxy and Docker host headers. Route
  // authorization still happens through the server-side helpers below.
  trustHost: true,
  adapter: PrismaAdapter(prisma), session: { strategy: "jwt" },
  providers: [Credentials({ name: "Email and password", credentials: { email: {}, password: {} }, async authorize(c) { const email = String(c?.email || "").toLowerCase(); const user = await prisma.user.findUnique({ where: { email }, include: { profile: true, roles: true } }); if (!user?.passwordHash || !await bcrypt.compare(String(c?.password || ""), user.passwordHash)) return null; return { id: user.id, email: user.email, name: user.profile?.fullName, roles: user.roles.map(r => r.role), schoolId: user.profile?.schoolId }; } }), Google({ clientId: process.env.GOOGLE_CLIENT_ID || "", clientSecret: process.env.GOOGLE_CLIENT_SECRET || "" })],
  callbacks: { async jwt({ token, user }) { if (user?.id) { const data = await prisma.user.findUnique({ where: { id: user.id }, include: { profile: true, roles: true } }); token.roles = data?.roles.map(r => r.role) || []; token.schoolId = data?.profile?.schoolId || null; } return token; }, session({ session, token }) { session.user.id = token.sub!; session.user.roles = (token.roles || []) as AppRole[]; session.user.schoolId = token.schoolId as string | null; return session; } }
});
export async function requireUser() { const session = await auth(); if (!session?.user?.id) throw new Error("Unauthorized"); return session.user; }
export async function requireRole(role: AppRole) { const user = await requireUser(); if (!user.roles?.includes(role)) throw new Error("Forbidden"); return user; }
export async function requireSchoolAdmin() { return requireRole(AppRole.school_admin); }
export async function requireSameSchool(schoolId: string) { const user = await requireUser(); if (user.schoolId !== schoolId && !user.roles?.includes(AppRole.super_admin)) throw new Error("Forbidden"); return user; }
