import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/db/rpc/get-public-stats";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getPublicStats()); }
