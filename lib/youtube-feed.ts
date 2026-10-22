export type ServiceId = "tamil-kannada" | "english-hindi";
export type ChurchVideo = { id: string; title: string; publishedAt: string; views: number };

function decodeXml(text: string) {
  return text.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, (entity) => {
    const named: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };
    if (named[entity]) return named[entity];
    const code = entity.startsWith("&#x") ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10);
    return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  });
}

// Extract only the known Atom fields from YouTube's fixed feed, never HTML or
// arbitrary URLs. Only validated YouTube IDs become links or iframe sources.
export function parseYouTubeFeed(xml: string): ChurchVideo[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(([, entry]) => {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    const views = Number(entry.match(/<media:statistics\s+views="(\d+)"/)?.[1] ?? 0);
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id) || !title || !publishedAt || !Number.isFinite(Date.parse(publishedAt))) return [];
    return [{ id, title: decodeXml(title), publishedAt, views }];
  });
}

export function matchesServiceTitle(title: string, service: ServiceId): boolean {
  const language = service === "tamil-kannada" ? /tamil|kannada|தமிழ்|ಕನ್ನಡ/i : /english|hindi|हिन्दी|हिंदी/i;
  return /\bsunday\b/i.test(title) && /\b(service|worship)\b/i.test(title) && language.test(title);
}

// Recording discovery only. Actual live state is checked with videos.list.
export function findServiceVideo(videos: ChurchVideo[], service: ServiceId) {
  return [...videos].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).find((video) => matchesServiceTitle(video.title, service));
}
