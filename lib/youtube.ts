import "server-only";
import { unstable_cache } from "next/cache";
import { ASSETS } from "./assets";
import { parseYouTubeFeed } from "./youtube-feed";

// Throw inside the cache on failure: Next retains its last successful value.
// Returning [] here would overwrite working recordings during an outage.
const readFeed = unstable_cache(async () => {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ASSETS.youtubeChannelId}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Church video feed unavailable");
  const videos = parseYouTubeFeed(await response.text());
  if (!videos.length) throw new Error("Church video feed is empty");
  return videos;
}, ["church-video-feed-v2", ASSETS.youtubeChannelId], { revalidate: 60 });

export async function getChurchVideos() {
  try { return await readFeed(); }
  catch { return []; } // No successful cache yet; language-specific links remain.
}
