import { getChurchVideos } from "@/lib/youtube";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const maxResults = Number(params.get("maxResults") ?? "6");
  const order = params.get("order") ?? "viewCount";
  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 12 || !["date", "viewCount"].includes(order)) {
    return Response.json({ error: "Invalid video query" }, { status: 400 });
  }
  const videos = await getChurchVideos();
  if (order === "viewCount") videos.sort((a, b) => b.views - a.views);
  return Response.json({ items: videos.slice(0, maxResults) }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
