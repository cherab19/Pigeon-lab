import { mkdir, writeFile } from "fs/promises";
import path from "path";
export async function storeLocal(key: string, data: Uint8Array) { const target = path.join(process.cwd(), "storage", key); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, data); return `/storage/${key}`; }
export const storage = { local: { put: storeLocal }, s3: { async put() { throw new Error("S3 storage is not configured"); } } };
