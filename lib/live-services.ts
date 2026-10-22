import { CHURCH } from "./church";
import { matchesServiceTitle, type ChurchVideo, type ServiceId } from "./youtube-feed";

export type BroadcastState = "upcoming" | "live" | "processing" | "replay" | "unknown" | "unavailable";
export type BroadcastVideo = ChurchVideo & {
  state: BroadcastState;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  embeddable: boolean;
  services?: ServiceId[];
};
export type ServiceView = {
  id: ServiceId;
  label: string;
  time: string;
  status: BroadcastState;
  video?: BroadcastVideo;
  replay?: BroadcastVideo;
  upcoming?: BroadcastVideo;
  playlistUrl?: string;
};
export type LiveSnapshot = { services: ServiceView[]; videos: BroadcastVideo[]; unavailableIds: string[]; verified: boolean; checkedAt: string | null };
export type PlaybackSession = { serviceId: ServiceId; video: BroadcastVideo };
export const SERVICE_IDS: ServiceId[] = ["tamil-kannada", "english-hindi"];
export const STATUS_LABELS: Record<BroadcastState, string> = {
  upcoming: "Upcoming", live: "Live now", processing: "Replay being prepared", replay: "Watch replay", unknown: "Status unavailable", unavailable: "Service unavailable",
};
export const validVideoId = (value: unknown): value is string => typeof value === "string" && /^[\w-]{11}$/.test(value);
export const validPlaylistId = (value: unknown): value is string => typeof value === "string" && /^[\w-]{10,80}$/.test(value);
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const date = (value: unknown): string | undefined => typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : undefined;
const time = (value: string | undefined) => value ? Date.parse(value) : 0;
export const videoTime = (video: BroadcastVideo) => time(video.startedAt ?? video.scheduledAt ?? video.publishedAt);
export const isVerificationFresh = (checkedAt: string | null, now = Date.now()) => !!checkedAt && now - Date.parse(checkedAt) <= 90000 && Date.parse(checkedAt) <= now + 10000;

export function videoBelongsToService(video: BroadcastVideo, service: ServiceId) {
  return video.services?.includes(service) || matchesServiceTitle(video.title, service);
}

export function parseYouTubeVideo(value: unknown, channelId: string): BroadcastVideo | undefined {
  const item = object(value), snippet = object(item.snippet), status = object(item.status), details = object(item.liveStreamingDetails);
  if (!validVideoId(item.id) || snippet.channelId !== channelId || typeof snippet.title !== "string" || !date(snippet.publishedAt)) return;
  const startedAt = date(details.actualStartTime), endedAt = date(details.actualEndTime), scheduledAt = date(details.scheduledStartTime);
  const duration = object(item.contentDetails).duration;
  const hasDuration = typeof duration === "string" && /[1-9]/.test(duration);
  let state: BroadcastState = "unknown";
  if (status.privacyStatus === "private" || ["failed", "rejected", "deleted"].includes(String(status.uploadStatus))) state = "unavailable";
  // An end timestamp takes precedence even if YouTube's snippet temporarily
  // retains its live flag while an archive is being processed.
  else if (endedAt) state = status.uploadStatus === "processed" && hasDuration ? "replay" : "processing";
  else if (snippet.liveBroadcastContent === "live") state = "live";
  else if (snippet.liveBroadcastContent === "upcoming") state = "upcoming";
  else if (startedAt) state = "processing";
  else if (status.uploadStatus === "processed" && hasDuration && !scheduledAt) state = "replay";
  else if (scheduledAt) state = "upcoming";
  return {
    id: item.id, title: snippet.title.slice(0, 1000), publishedAt: snippet.publishedAt as string,
    views: Math.max(0, Number(object(item.statistics).viewCount) || 0), state,
    embeddable: status.embeddable === true, ...(startedAt ? { startedAt } : {}), ...(endedAt ? { endedAt } : {}), ...(scheduledAt ? { scheduledAt } : {}),
  };
}

export function makeLiveSnapshot(videos: BroadcastVideo[], verified: boolean, checkedAt: string | null, playlists: Partial<Record<ServiceId, string>> = {}, now = Date.now(), unavailableIds: string[] = []): LiveSnapshot {
  verified = verified && isVerificationFresh(checkedAt, now);
  videos = videos.map(video => !verified && ["live", "upcoming", "processing"].includes(video.state) ? { ...video, state: "unknown" as const } : video);
  const services = SERVICE_IDS.map((id, index): ServiceView => {
    const candidates = videos.filter(video => video.state !== "unavailable" && videoBelongsToService(video, id));
    const live = candidates.filter(v => v.state === "live").sort((a, b) => videoTime(b) - videoTime(a))[0];
    const replay = candidates.filter(v => v.state === "replay").sort((a, b) => videoTime(b) - videoTime(a))[0];
    const processing = candidates.filter(v => v.state === "processing").sort((a, b) => time(b.endedAt ?? b.startedAt) - time(a.endedAt ?? a.startedAt))[0];
    const upcoming = candidates.filter(v => v.state === "upcoming").sort((a, b) => time(a.scheduledAt) - time(b.scheduledAt))[0];
    const imminent = upcoming && time(upcoming.scheduledAt) <= now + 24 * 60 * 60 * 1000;
    const recentProcessing = processing && (!replay || videoTime(processing) >= videoTime(replay));
    const unknown = candidates.filter(v => v.state === "unknown").sort((a, b) => time(b.publishedAt) - time(a.publishedAt))[0];
    const video = live ?? (recentProcessing ? processing : undefined) ?? (imminent ? upcoming : undefined) ?? replay ?? upcoming ?? unknown;
    const playlist = playlists[id];
    return { id, label: CHURCH.services[index].lang, time: CHURCH.services[index].time, status: video?.state ?? "unavailable", ...(video ? { video } : {}), ...(replay ? { replay } : {}), ...(upcoming ? { upcoming } : {}), ...(validPlaylistId(playlist) ? { playlistUrl: `https://www.youtube.com/playlist?list=${playlist}` } : {}) };
  });
  return { services, videos, unavailableIds: unavailableIds.filter(validVideoId), verified, checkedAt };
}

export function defaultServiceId(snapshot: LiveSnapshot): ServiceId {
  const live = snapshot.services.filter(s => s.status === "live").sort((a, b) => videoTime(b.video!) - videoTime(a.video!))[0];
  const upcoming = snapshot.services.filter(s => s.status === "upcoming").sort((a, b) => time(a.video?.scheduledAt) - time(b.video?.scheduledAt))[0];
  return (live ?? upcoming ?? snapshot.services.filter(s => s.video).sort((a, b) => videoTime(b.video!) - videoTime(a.video!))[0] ?? snapshot.services[0]).id;
}

export function selectedServiceId(snapshot: LiveSnapshot, explicit: ServiceId | undefined, playback: PlaybackSession | null): ServiceId {
  return explicit ?? playback?.serviceId ?? defaultServiceId(snapshot);
}

export function displayedVideo(service: ServiceView, playback: PlaybackSession | null, snapshot: LiveSnapshot): BroadcastVideo | undefined {
  if (!playback || playback.serviceId !== service.id) return service.video;
  if (snapshot.verified && snapshot.unavailableIds.includes(playback.video.id)) return { ...playback.video, state: "unavailable", embeddable: false };
  const current = snapshot.videos.find(video => video.id === playback.video.id);
  if (current) return current;
  // A playing ID can eventually leave the recent discovery window. Retain its
  // player/metadata, but never reuse a captured live flag without a fresh check.
  return ["live", "upcoming", "processing"].includes(playback.video.state) ? { ...playback.video, state: "unknown" } : playback.video;
}

export function watchUrl(service: ServiceView, video = service.video): string {
  return video && validVideoId(video.id) ? `https://www.youtube.com/watch?v=${video.id}` : service.playlistUrl ?? `${CHURCH.social.youtube}/search?query=${encodeURIComponent(service.label + " Sunday service")}`;
}

export function isLiveSnapshot(value: unknown): value is LiveSnapshot {
  const data = object(value);
  const validVideo = (value: unknown) => {
    const video = object(value);
    return validVideoId(video.id) && typeof video.title === "string" && !!date(video.publishedAt) && typeof video.embeddable === "boolean" && Object.hasOwn(STATUS_LABELS, String(video.state)) && [video.startedAt, video.endedAt, video.scheduledAt].every(value => value === undefined || !!date(value));
  };
  const services = data.services;
  return typeof data.verified === "boolean" && (data.checkedAt === null || !!date(data.checkedAt)) && Array.isArray(data.videos) && data.videos.every(validVideo) && Array.isArray(data.unavailableIds) && data.unavailableIds.every(validVideoId) && Array.isArray(services) && services.length === 2 && SERVICE_IDS.every(id => services.some((entry: unknown) => {
    const service = object(entry);
    return service.id === id && typeof service.label === "string" && typeof service.time === "string" && Object.hasOwn(STATUS_LABELS, String(service.status)) && [service.video, service.replay, service.upcoming].every(video => video === undefined || validVideo(video));
  }));
}
