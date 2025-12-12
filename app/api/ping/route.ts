import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ online: false, error: "Missing url" }, { status: 400 });
  }
  try {
    const target = new URL(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);
    let online = false;
    try {
      const res = await fetch(target.toString(), { method: "HEAD", signal: controller.signal });
      online = res.ok;
    } catch (error: any) {
      const message = String(error?.message ?? error);
      if (message.toLowerCase().includes("cors")) {
        return NextResponse.json({ online: false, error: "cors" });
      }
      online = false;
    } finally {
      clearTimeout(timeout);
    }
    return NextResponse.json({ online });
  } catch (e) {
    return NextResponse.json({ online: false, error: "Invalid URL" }, { status: 400 });
  }
}
