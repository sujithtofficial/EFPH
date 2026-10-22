import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultServiceId, displayedVideo, isLiveSnapshot, isVerificationFresh, makeLiveSnapshot, parseYouTubeVideo, selectedServiceId, watchUrl, type BroadcastVideo } from "../lib/live-services";
import { matchesServiceTitle } from "../lib/youtube-feed";

const now = Date.parse("2026-10-25T05:30:00Z");
const checked = new Date(now).toISOString();
const channel = "UC_church";
const tamil = (overrides: Partial<BroadcastVideo> = {}): BroadcastVideo => ({ id: "t1234567890", title: "Sunday Worship Service | Tamil & Kannada", publishedAt: "2026-10-25T01:00:00Z", startedAt: "2026-10-25T01:45:00Z", state: "replay", embeddable: true, views: 0, ...overrides });
const english = (overrides: Partial<BroadcastVideo> = {}): BroadcastVideo => tamil({ id: "e1234567890", title: "Sunday Service | English & Hindi", startedAt: "2026-10-25T05:30:00Z", ...overrides });
const snapshot = (videos: BroadcastVideo[]) => makeLiveSnapshot(videos, true, checked, {}, now);

function item(overrides: Record<string, unknown> = {}) {
  return { id: "t1234567890", snippet: { channelId: channel, title: "LIVE Sunday Worship | Tamil", publishedAt: checked, liveBroadcastContent: "none" }, status: { privacyStatus: "public", uploadStatus: "processed", embeddable: true }, contentDetails: { duration: "PT0S" }, ...overrides };
}

test("official timestamps and processing state control the complete Sunday lifecycle", () => {
  const scheduledStartTime = "2026-10-25T01:45:00Z";
  const snippet = { channelId: channel, title: "Sunday Worship | Tamil", publishedAt: checked, liveBroadcastContent: "upcoming" };
  const scheduled = item({ snippet, liveStreamingDetails: { scheduledStartTime } });
  assert.equal(parseYouTubeVideo(scheduled, channel)?.state, "upcoming");
  const live = { ...scheduled, snippet: { ...snippet, liveBroadcastContent: "live" }, liveStreamingDetails: { scheduledStartTime, actualStartTime: scheduledStartTime } };
  assert.equal(parseYouTubeVideo(live, channel)?.state, "live");
  const ended = { ...live, liveStreamingDetails: { ...live.liveStreamingDetails, actualEndTime: "2026-10-25T04:00:00Z" } };
  assert.equal(parseYouTubeVideo(ended, channel)?.state, "processing", "end overrides a stale live flag");
  assert.equal(parseYouTubeVideo({ ...ended, contentDetails: { duration: "PT2H15M" } }, channel)?.state, "replay");
  assert.equal(parseYouTubeVideo(item(), channel)?.state, "unknown", "LIVE in a title never proves a broadcast is live");
  assert.equal(parseYouTubeVideo(item({ contentDetails: { duration: "PT1H" } }), channel)?.state, "replay");
});

test("future uploads never displace an active service and English live becomes the default", () => {
  const liveEnglish = english({ state: "live" });
  const futureEnglish = english({ id: "f1234567890", state: "upcoming", publishedAt: "2026-10-25T05:31:00Z", scheduledAt: "2026-11-01T05:30:00Z", startedAt: undefined });
  const data = snapshot([tamil(), liveEnglish, futureEnglish]);
  assert.equal(data.services[1].video?.id, liveEnglish.id);
  assert.equal(defaultServiceId(data), "english-hindi");
  assert.equal(selectedServiceId(data, "tamil-kannada", null), "tamil-kannada");
  assert.equal(selectedServiceId(data, undefined, { serviceId: "tamil-kannada", video: tamil() }), "tamil-kannada");
});

test("upcoming, ended processing and ready replay retain their own exact video and previous recording", () => {
  const old = tamil({ id: "o1234567890", startedAt: "2026-10-18T01:45:00Z" });
  const scheduled = tamil({ state: "upcoming", scheduledAt: "2026-10-25T06:30:00Z", startedAt: undefined });
  assert.equal(snapshot([old, scheduled]).services[0].status, "upcoming");
  const ended = tamil({ state: "processing", endedAt: "2026-10-25T04:00:00Z" });
  const processing = snapshot([old, ended]).services[0];
  assert.equal(processing.status, "processing");
  assert.equal(processing.replay?.id, old.id);
  assert.equal(watchUrl(processing), "https://www.youtube.com/watch?v=t1234567890");
  const farFuture = tamil({ id: "f1234567890", state: "upcoming", startedAt: undefined, scheduledAt: "2026-11-01T01:45:00Z" });
  assert.equal(snapshot([tamil(), farFuture]).services[0].video?.id, "t1234567890");
  const republished = tamil({ id: "r1234567890", publishedAt: "2026-10-26T01:45:00Z", startedAt: "2026-10-11T01:45:00Z" });
  assert.equal(snapshot([tamil(), republished]).services[0].video?.id, "t1234567890", "service start beats upload date");
});

test("refreshes keep playback and metadata on the watched ID while its state can advance", () => {
  const playing = tamil({ id: "o1234567890", state: "live" });
  const session = { serviceId: "tamil-kannada" as const, video: playing };
  const current = snapshot([tamil({ state: "live" }), { ...playing, state: "processing" }, english({ state: "live" })]);
  const shown = displayedVideo(current.services[0], session, current)!;
  assert.equal(shown.id, playing.id);
  assert.equal(shown.state, "processing");
  assert.equal(watchUrl(current.services[0], shown), `https://www.youtube.com/watch?v=${playing.id}`);
  assert.equal(selectedServiceId(current, undefined, session), "tamil-kannada");
  current.unavailableIds.push(playing.id);
  assert.equal(displayedVideo(current.services[0], session, current)?.state, "unavailable");
  const later = snapshot([tamil(), english()]);
  assert.equal(displayedVideo(later.services[0], session, later)?.state, "unknown", "a captured live flag expires when its ID leaves the checked set");
});

test("stale checks and outages cannot leave a false live badge, but preserve known replay data", () => {
  assert.equal(isVerificationFresh(checked, now + 90001), false);
  assert.equal(isVerificationFresh("invalid", now), false);
  assert.equal(isVerificationFresh(new Date(now + 20000).toISOString(), now), false);
  const stale = makeLiveSnapshot([tamil({ state: "live" }), english()], true, checked, {}, now + 90001);
  assert.equal(stale.verified, false);
  assert.equal(stale.services[0].status, "unknown");
  assert.equal(stale.services[1].status, "replay");
  assert.equal(makeLiveSnapshot([tamil({ state: "live" })], false, null, {}, now).services[0].status, "unknown");
});

test("language matching accepts worship titles, configured playlists and precise language fallbacks", () => {
  for (const title of ["Sunday Worship Service – Tamil / Kannada", "Tamil | Sunday Morning Worship", "Sunday Service | தமிழ்", "Sunday Worship | ಕನ್ನಡ"]) assert.equal(matchesServiceTitle(title, "tamil-kannada"), true);
  assert.equal(matchesServiceTitle("Sunday Worship Service | English / हिन्दी", "english-hindi"), true);
  assert.equal(matchesServiceTitle("Friday Worship | Tamil", "tamil-kannada"), false);
  const data = makeLiveSnapshot([tamil({ title: "A special church service", services: ["tamil-kannada"] })], true, checked, { "tamil-kannada": "PL0123456789" }, now);
  assert.equal(data.services[0].video?.id, "t1234567890");
  assert.equal(watchUrl(data.services[0]), "https://www.youtube.com/watch?v=t1234567890", "a playlist never replaces the selected video");
  assert.match(watchUrl(data.services[1]), /English.*Hindi/);
  assert.doesNotMatch(watchUrl(data.services[1]), /channel\/live/);
  assert.equal(data.services[1].video, undefined);
});

test("unavailable/private videos and other channels cannot become a playable service", () => {
  assert.equal(parseYouTubeVideo(item({ snippet: { channelId: "other", title: "Sunday Service | Tamil", publishedAt: checked } }), channel), undefined);
  assert.equal(parseYouTubeVideo(item({ id: "javascript:bad" }), channel), undefined);
  const privateVideo = parseYouTubeVideo(item({ status: { privacyStatus: "private", uploadStatus: "processed", embeddable: true } }), channel)!;
  assert.equal(privateVideo.state, "unavailable");
  assert.equal(snapshot([privateVideo]).services[0].video, undefined);
  const noEmbed = parseYouTubeVideo(item({ status: { privacyStatus: "public", uploadStatus: "processed", embeddable: false }, contentDetails: { duration: "PT1H" } }), channel)!;
  assert.equal(noEmbed.embeddable, false);
});

test("the browser rejects malformed live responses before replacing a usable snapshot", () => {
  const data = snapshot([tamil(), english()]);
  assert.equal(isLiveSnapshot(data), true);
  assert.equal(isLiveSnapshot({ ...data, services: [data.services[0], data.services[0]] }), false);
  assert.equal(isLiveSnapshot({ ...data, videos: [{ ...tamil(), scheduledAt: "invalid" }] }), false);
  assert.equal(isLiveSnapshot({ ...data, unavailableIds: ["https://bad"] }), false);
  assert.equal(isLiveSnapshot(null), false);
});
