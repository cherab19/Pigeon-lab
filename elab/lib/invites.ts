import { SignJWT, jwtVerify } from "jose";
import { AppRole } from "@prisma/client";
const secret=()=>new TextEncoder().encode(process.env.INVITE_TOKEN_SECRET||process.env.NEXTAUTH_SECRET||"development-only-change-me");
export type InvitePayload={email:string;fullName:string;schoolId:string;role:AppRole};
export async function signInvite(payload:InvitePayload){return new SignJWT(payload).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(secret())}
export async function verifyInvite(token:string){const {payload}=await jwtVerify(token,secret());return payload as unknown as InvitePayload}
