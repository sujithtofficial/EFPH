import "server-only";
import { ASSETS } from "./assets";
import { parseYouTubeFeed } from "./youtube-feed";

export async function getChurchVideos() {
  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ASSETS.youtubeChannelId}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];
    return parseYouTubeFeed(await response.text());
  } catch { return []; }
}
