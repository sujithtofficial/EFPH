import { NextRequest, NextResponse } from "next/server";

const CHANNEL_ID = "UC3c9fhwTB3Wg2JvfcXZKoUw";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const maxResults = Number(searchParams.get("maxResults") ?? "6");
  const order = searchParams.get("order") ?? "viewCount"; // viewCount = most popular
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  if (!apiKey || apiKey === "placeholder") {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("channelId", CHANNEL_ID);
    url.searchParams.set("part", "snippet,id");
    url.searchParams.set("order", order);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(maxResults));

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("YouTube API fetch error:", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
