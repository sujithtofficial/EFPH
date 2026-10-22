import type { createYouTubeApi } from "./youtube-api";
import { makeLiveSnapshot, SERVICE_IDS, videoBelongsToService, videoTime, type BroadcastVideo } from "./live-services";
import type { ChurchVideo, ServiceId } from "./youtube-feed";

export type LiveCache = <T>(name: string, seconds: number, read: () => Promise<T>) => Promise<T>;

// Public discovery uses a shared cache, never one search request per viewer.
// Known IDs are checked every 30s; discovery of broadcasts absent from the feed
// is slower to respect YouTube's separate search quota.
export function liveDiscoverySeconds(now: number) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", hourCycle: "h23" }).formatToParts(now);
  const weekday = parts.find(part => part.type === "weekday")?.value;
  const hour = Number(parts.find(part => part.type === "hour")?.value);
  return weekday === "Sun" && hour >= 7 && hour < 13 ? 300 : 3600;
}

export async function readLiveSnapshot({ api, cache, feed, channelId, playlists = {}, pinned = {}, now = Date.now }: {
  api: ReturnType<typeof createYouTubeApi>;
  cache: LiveCache;
  feed: ChurchVideo[];
  channelId: string;
  playlists?: Partial<Record<ServiceId, string>>;
  pinned?: Partial<Record<ServiceId, string>>;
  now?: () => number;
}) {
  const feedVideos: BroadcastVideo[] = feed.map(video => ({ ...video, state: "unknown", embeddable: true }));
  const metadata = (ids: string[]) => {
    const unique = [...new Set(ids)].sort();
    return cache(`metadata:${unique.join(",")}`, 30, async () => ({ videos: await api.videos(unique), checkedAt: new Date(now()).toISOString() }));
  };
  const catalogue = () => cache("catalogue", 300, async () => {
    const uploadsId = channelId.replace(/^UC/, "UU");
    const sources = await Promise.allSettled([
      api.playlistIds(uploadsId, 3),
      ...SERVICE_IDS.map(id => playlists[id] ? api.playlistIds(playlists[id]!) : Promise.resolve([])),
    ]);
    const ids: string[] = [...feed.map(video => video.id), ...Object.values(pinned)];
    const assignments = new Map<string, ServiceId[]>();
    sources.forEach((source, index) => {
      if (source.status !== "fulfilled") return;
      ids.push(...source.value);
      if (index > 0) for (const videoId of source.value) assignments.set(videoId, [...assignments.get(videoId) ?? [], SERVICE_IDS[index - 1]]);
    });
    for (const id of SERVICE_IDS) if (pinned[id]) assignments.set(pinned[id]!, [...assignments.get(pinned[id]!) ?? [], id]);
    const result = await metadata(ids);
    if (!result.videos.length) throw new Error("No church video catalogue available");
    return result.videos.map(video => ({ ...video, ...(assignments.has(video.id) ? { services: assignments.get(video.id) } : {}) }));
  });
  const archives = (id: ServiceId) => cache(`archive:${id}`, 300, async () => {
    const videos = (await catalogue()).filter(video => video.state === "replay" && videoBelongsToService(video, id)).sort((a, b) => videoTime(b) - videoTime(a)).slice(0, 2);
    if (!videos.length) throw new Error("No new service archive found");
    return videos;
  });
  const discoverySeconds = liveDiscoverySeconds(now());
  const [catalogueResult, tamilArchive, englishArchive, liveResult] = await Promise.allSettled([
    catalogue(), archives("tamil-kannada"), archives("english-hindi"),
    cache(`active-broadcasts:${discoverySeconds}`, discoverySeconds, () => api.liveIds()),
  ]);
  const known = catalogueResult.status === "fulfilled" ? catalogueResult.value : [];
  const previous = [tamilArchive, englishArchive].flatMap(result => result.status === "fulfilled" ? result.value : []);
  const liveIds = liveResult.status === "fulfilled" ? liveResult.value : [];
  const candidates = new Map<string, BroadcastVideo>();
  for (const video of [...feedVideos, ...known, ...previous]) {
    if (video.services?.length || SERVICE_IDS.some(id => videoBelongsToService(video, id))) candidates.set(video.id, video);
  }
  const assignments = new Map<string, ServiceId[]>();
  for (const video of [...known, ...previous]) if (video.services) assignments.set(video.id, video.services);
  for (const id of SERVICE_IDS) if (pinned[id]) assignments.set(pinned[id]!, [...assignments.get(pinned[id]!) ?? [], id]);
  // Only recent archives and active/upcoming candidates need frequent checking.
  const recent: string[] = [];
  for (const id of SERVICE_IDS) {
    const matching = [...candidates.values()].filter(video => videoBelongsToService(video, id));
    recent.push(...matching.filter(video => video.state === "replay").sort((a, b) => videoTime(b) - videoTime(a)).slice(0, 2).map(video => video.id));
    recent.push(...matching.filter(video => ["live", "processing"].includes(video.state)).sort((a, b) => videoTime(b) - videoTime(a)).slice(0, 4).map(video => video.id));
    recent.push(...matching.filter(video => video.state === "upcoming").sort((a, b) => videoTime(a) - videoTime(b)).slice(0, 4).map(video => video.id));
  }
  const ids = [...new Set([...recent, ...feed.map(video => video.id), ...liveIds, ...Object.values(pinned)])];
  try {
    const result = await metadata(ids);
    const videos = result.videos.map(video => ({ ...video, ...(assignments.has(video.id) ? { services: assignments.get(video.id) } : {}) }));
    // A successful response omitting a previously known ID means unavailable;
    // do not resurrect private/deleted videos from the archive cache.
    const returned = new Set(videos.map(video => video.id));
    return makeLiveSnapshot(videos, true, result.checkedAt, playlists, now(), ids.filter(id => !returned.has(id)));
  } catch {
    return makeLiveSnapshot([...candidates.values()], false, null, playlists, now());
  }
}
