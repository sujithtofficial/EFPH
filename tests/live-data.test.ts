import { test } from "node:test";
import assert from "node:assert/strict";
import { liveDiscoverySeconds, readLiveSnapshot, type LiveCache } from "../lib/live-data";
import type { BroadcastVideo } from "../lib/live-services";
import type { createYouTubeApi } from "../lib/youtube-api";

const channelId = "UC0123456789";
const sunday = Date.parse("2026-10-25T05:30:00Z");
const video = (id: string, title: string, state: BroadcastVideo["state"] = "replay"): BroadcastVideo => ({ id, title, state, publishedAt: "2026-10-25T01:00:00Z", startedAt: "2026-10-25T01:45:00Z", views: 0, embeddable: true });
const tamil = video("t1234567890", "Sunday Worship Service | Tamil & Kannada");
const english = video("e1234567890", "Sunday Service | English & Hindi");

// A deterministic cache implements the production contract: expired successful
// values survive failed refreshes, with their original verification timestamps.
function harness(initial = [tamil, english]) {
  let now = sunday;
  let videos = initial;
  let uploads = initial.map(video => video.id);
  let fail = false;
  let liveIds: string[] = [];
  let lists: Record<string, string[]> = {};
  const records = new Map<string, { value: unknown; saved: number }>();
  const pending = new Map<string, Promise<unknown>>();
  const requested: string[][] = [];
  const cache: LiveCache = <T,>(name: string, seconds: number, read: () => Promise<T>): Promise<T> => {
    const record = records.get(name);
    if (record && now - record.saved < seconds * 1000) return Promise.resolve(record.value as T);
    if (pending.has(name)) return pending.get(name) as Promise<T>;
    const task = read().then(value => { records.set(name, { value, saved: now }); return value; }).catch(error => { if (record) return record.value as T; throw error; }).finally(() => pending.delete(name));
    pending.set(name, task);
    return task;
  };
  const api: ReturnType<typeof createYouTubeApi> = {
    async videos(ids) { requested.push(ids); if (fail) throw new Error("outage"); return videos.filter(video => ids.includes(video.id)); },
    async playlistIds(id) { if (fail) throw new Error("outage"); return id.startsWith("UU") ? uploads : lists[id] ?? []; },
    async liveIds() { if (fail) throw new Error("quota"); return liveIds; },
  };
  return {
    read: (options: Partial<Parameters<typeof readLiveSnapshot>[0]> = {}) => readLiveSnapshot({ api, cache, feed: [], channelId, now: () => now, ...options }), requested,
    advance: (ms: number) => { now += ms; },
    setVideos: (value: BroadcastVideo[]) => { videos = value; },
    setUploads: (value: string[]) => { uploads = value; },
    setOutage: () => { fail = true; },
    setLiveIds: (value: string[]) => { liveIds = value; },
    setLists: (value: Record<string, string[]>) => { lists = value; },
  };
}

test("Sunday discovery uses IST and a shared quota-aware search cadence", () => {
  assert.equal(liveDiscoverySeconds(Date.parse("2026-10-25T01:29:00Z")), 3600);
  assert.equal(liveDiscoverySeconds(Date.parse("2026-10-25T01:30:00Z")), 300);
  assert.equal(liveDiscoverySeconds(Date.parse("2026-10-25T07:29:00Z")), 300);
  assert.equal(liveDiscoverySeconds(Date.parse("2026-10-25T07:30:00Z")), 3600);
  assert.equal(liveDiscoverySeconds(Date.parse("2026-10-26T05:30:00Z")), 3600);
});

test("a cold public feed discovers archives and active streams outside its finite window", async () => {
  const h = harness();
  const liveEnglish = { ...english, id: "l1234567890", state: "live" as const };
  h.setVideos([tamil, english, liveEnglish]);
  h.setLiveIds([liveEnglish.id]);
  const data = await h.read();
  assert.equal(data.verified, true);
  assert.equal(data.services[0].video?.id, tamil.id);
  assert.equal(data.services[1].video?.id, liveEnglish.id);
  assert.equal(data.services[1].status, "live");
});

test("known streams change live to processing to replay without waiting for catalogue discovery", async () => {
  const h = harness([{ ...tamil, state: "live" }, english]);
  assert.equal((await h.read()).services[0].status, "live");
  h.advance(31000);
  h.setVideos([{ ...tamil, state: "processing", endedAt: "2026-10-25T05:30:00Z" }, english]);
  assert.equal((await h.read()).services[0].status, "processing");
  h.advance(31000);
  h.setVideos([tamil, english]);
  assert.equal((await h.read()).services[0].status, "replay");
});

test("each language keeps its last successful archive when busy uploads displace it", async () => {
  const h = harness();
  assert.equal((await h.read()).services[1].video?.id, english.id);
  h.advance(301000);
  h.setUploads(["b1234567890"]);
  h.setVideos([tamil, english, video("b1234567890", "Friday Bible Study")]);
  const data = await h.read();
  assert.equal(data.services[0].video?.id, tamil.id);
  assert.equal(data.services[1].video?.id, english.id);
  assert.equal(data.verified, true);
});

test("provider outages keep known recordings but expire cached live verification", async () => {
  const h = harness([{ ...tamil, state: "live" }, english]);
  const first = await h.read();
  h.setOutage(); h.advance(301000);
  const fallback = await h.read();
  assert.equal(fallback.verified, false);
  assert.equal(fallback.checkedAt, first.checkedAt, "reading stale cache never renews its verification time");
  assert.equal(fallback.services[0].status, "unknown");
  assert.equal(fallback.services[1].video?.id, english.id);
});

test("deleted IDs are not resurrected by a successful old archive cache", async () => {
  const h = harness(); await h.read();
  h.advance(31000); h.setVideos([english]);
  const data = await h.read();
  assert.equal(data.services[0].video, undefined);
  assert.ok(data.unavailableIds.includes(tamil.id));
});

test("dedicated playlists and pinned IDs discover title-independent services with matching metadata", async () => {
  const special = video("s1234567890", "A special worship gathering", "live");
  const h = harness([special, english]);
  h.setUploads([english.id]);
  h.setLists({ PL0123456789: [special.id] });
  const data = await h.read({ playlists: { "tamil-kannada": "PL0123456789" } });
  assert.equal(data.services[0].video?.id, special.id);
  assert.equal(data.services[0].video?.title, special.title);
  const pinned = await harness([special]).read({ pinned: { "tamil-kannada": special.id } });
  assert.equal(pinned.services[0].video?.id, special.id);
  assert.equal(pinned.services[1].video, undefined);
});
