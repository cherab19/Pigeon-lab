import "next-auth";
import { AppRole } from "@prisma/client";
declare module "next-auth" { interface User { roles?: AppRole[]; schoolId?: string | null } interface Session { user: { id: string; roles?: AppRole[]; schoolId?: string | null } & DefaultSession["user"] } }
declare module "next-auth/jwt" { interface JWT { roles?: AppRole[]; schoolId?: string | null } }
