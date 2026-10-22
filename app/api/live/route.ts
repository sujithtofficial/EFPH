import { getLiveSnapshot } from "@/lib/live-server";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await getLiveSnapshot(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Live status is temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" } });
  }
}
