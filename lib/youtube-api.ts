import { validVideoId, validPlaylistId, parseYouTubeVideo, type BroadcastVideo } from "./live-services";

export function createYouTubeApi(key: string, channelId: string, fetcher: typeof fetch = fetch) {
  async function list(resource: string, params: Record<string, string>): Promise<{ items: unknown[]; nextPageToken?: string }> {
    const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
    for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
    const response = await fetcher(url, { headers: { "X-Goog-Api-Key": key }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("YouTube data unavailable");
    const data = await response.json();
    if (!data || !Array.isArray(data.items)) throw new Error("Invalid YouTube response");
    return { items: data.items, ...(typeof data.nextPageToken === "string" ? { nextPageToken: data.nextPageToken } : {}) };
  }
  return {
    async videos(ids: string[]): Promise<BroadcastVideo[]> {
      const unique = [...new Set(ids.filter(validVideoId))].sort();
      const result: BroadcastVideo[] = [];
      for (let index = 0; index < unique.length; index += 50) {
        const batch = unique.slice(index, index + 50);
        const data = await list("videos", { part: "snippet,liveStreamingDetails,status,contentDetails,statistics", id: batch.join(",") });
        for (const item of data.items) {
          const video = parseYouTubeVideo(item, channelId);
          if (video && batch.includes(video.id)) result.push(video);
        }
      }
      return result;
    },
    async playlistIds(playlistId: string, maxPages = 1): Promise<string[]> {
      if (!validPlaylistId(playlistId)) return [];
      const ids: string[] = [];
      let pageToken: string | undefined;
      for (let page = 0; page < maxPages; page++) {
        const data = await list("playlistItems", { part: "contentDetails", playlistId, maxResults: "50", ...(pageToken ? { pageToken } : {}) });
        for (const item of data.items) {
          const id = (item as { contentDetails?: { videoId?: unknown } })?.contentDetails?.videoId;
          if (validVideoId(id)) ids.push(id);
        }
        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }
      return [...new Set(ids)];
    },
    async liveIds(): Promise<string[]> {
      const data = await list("search", { part: "snippet", channelId, type: "video", eventType: "live", maxResults: "10" });
      return data.items.flatMap(item => {
        const id = (item as { id?: { videoId?: unknown } })?.id?.videoId;
        return validVideoId(id) ? [id] : [];
      });
    },
  };
}
