import { NextResponse } from "next/server";
import { AppRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { requireSchoolAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canInvite } from "@/lib/db/rpc";
export async function POST(request:Request){try{const admin=await requireSchoolAdmin();const body=await request.json();const role=body.role as AppRole;if(role!==AppRole.teacher&&role!==AppRole.student)throw new Error("Invalid role");const quota=await canInvite(admin.schoolId!,role);if(!quota.allowed)throw new Error("Seat quota reached");const email=String(body.email).toLowerCase();const user=await prisma.user.create({data:{email,passwordHash:await bcrypt.hash(String(body.password||crypto.randomUUID()),12)}});await prisma.profile.create({data:{userId:user.id,schoolId:admin.schoolId!,fullName:String(body.full_name||"")}});await prisma.userRole.create({data:{userId:user.id,role}});return NextResponse.json({success:true,user_id:user.id})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to create member"},{status:400})}}
