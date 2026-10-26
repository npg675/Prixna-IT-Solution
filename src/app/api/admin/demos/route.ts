import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DEFAULT_DEMOS, SoftwareDemo } from "@/lib/demos-store";

export const dynamic = "force-dynamic";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "software-demos.json");
const PUBLIC_FILE_PATH = path.join(process.cwd(), "public", "data", "software-demos.json");

export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.demos)) {
        return NextResponse.json({ demos: parsed.demos });
      }
    }
  } catch (err) {
    console.error("[/api/admin/demos] Read error:", err);
  }
  return NextResponse.json({ demos: DEFAULT_DEMOS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const demos: SoftwareDemo[] = Array.isArray(body?.demos) ? body.demos : [];

    if (!demos.length) {
      return NextResponse.json({ error: "No demos provided" }, { status: 400 });
    }

    const payload = {
      updatedAt: new Date().toISOString(),
      note: "Updated from Admin Dashboard. Syncs across Demo Theatre, AI Chat, and site cards.",
      demos,
    };

    const serialized = JSON.stringify(payload, null, 2);

    // Save to data/software-demos.json
    fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
    fs.writeFileSync(DATA_FILE_PATH, serialized, "utf-8");

    // Also sync to public/data/software-demos.json
    fs.mkdirSync(path.dirname(PUBLIC_FILE_PATH), { recursive: true });
    fs.writeFileSync(PUBLIC_FILE_PATH, serialized, "utf-8");

    return NextResponse.json({ success: true, count: demos.length, updatedAt: payload.updatedAt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/admin/demos] Write error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
