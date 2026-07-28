import { NextResponse } from "next/server";
import { completeSchoolSignup } from "@/lib/db/complete-school-signup";
export async function POST(request:Request){try{const {tx_ref}=await request.json();if(typeof tx_ref!=="string")throw new Error("tx_ref is required");const userId=await completeSchoolSignup(tx_ref);return NextResponse.json({success:true,user_id:userId})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to finalize signup"},{status:400})}}
