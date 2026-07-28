import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { AppRole } from "@prisma/client";
import { storeLocal } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    await requireRole(AppRole.super_admin);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pathName = formData.get("path") as string;

    if (!file || !pathName) {
      return NextResponse.json({ error: "file and path are required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const publicUrl = await storeLocal(pathName, uint8);

    return NextResponse.json({ success: true, publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
