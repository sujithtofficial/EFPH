import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { ASSETS } from "./assets";
import { createYouTubeApi } from "./youtube-api";
import { getChurchVideos } from "./youtube";
import { makeLiveSnapshot, SERVICE_IDS, validPlaylistId, validVideoId, type BroadcastVideo } from "./live-services";
import { readLiveSnapshot } from "./live-data";
import { createLiveReadGuard } from "./live-cache";
import type { ServiceId } from "./youtube-feed";

const guardRead = createLiveReadGuard();
function cached<T>(namespace: string, name: string, seconds: number, read: () => Promise<T>): Promise<T> {
  const key = `${namespace}:${name}`;
  return unstable_cache(() => guardRead(key, seconds, read), ["live-services-v1", namespace, name], { revalidate: seconds })();
}

export async function getLiveSnapshot() {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  const configuredPlaylists = { "tamil-kannada": process.env.YOUTUBE_TAMIL_KANNADA_PLAYLIST_ID, "english-hindi": process.env.YOUTUBE_ENGLISH_HINDI_PLAYLIST_ID };
  const configuredVideos = { "tamil-kannada": process.env.YOUTUBE_TAMIL_KANNADA_VIDEO_ID, "english-hindi": process.env.YOUTUBE_ENGLISH_HINDI_VIDEO_ID };
  const playlists: Partial<Record<ServiceId, string>> = {};
  const pinned: Partial<Record<ServiceId, string>> = {};
  for (const id of SERVICE_IDS) {
    if (validPlaylistId(configuredPlaylists[id])) playlists[id] = configuredPlaylists[id];
    if (validVideoId(configuredVideos[id])) pinned[id] = configuredVideos[id];
  }
  const feed = await getChurchVideos();
  const feedVideos: BroadcastVideo[] = feed.map(video => ({ ...video, state: "unknown", embeddable: true }));
  if (!key) return makeLiveSnapshot(feedVideos, false, null, playlists);

  const namespace = createHash("sha256").update(JSON.stringify({ key, playlists, pinned, channel: ASSETS.youtubeChannelId })).digest("hex");
  const api = createYouTubeApi(key, ASSETS.youtubeChannelId);
  return readLiveSnapshot({ api, feed, channelId: ASSETS.youtubeChannelId, playlists, pinned, cache: (name, seconds, read) => cached(namespace, name, seconds, read) });
}
