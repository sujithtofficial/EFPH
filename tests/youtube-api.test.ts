import { test } from "node:test";
import assert from "node:assert/strict";
import { createYouTubeApi } from "../lib/youtube-api";
const channel = "UC_church";
const item = (id: string, channelId = channel) => ({ id, snippet: { channelId, title: "Sunday Worship | Tamil", publishedAt: "2026-10-25T01:45:00Z" }, status: { uploadStatus: "processed", embeddable: true }, contentDetails: { duration: "PT1H" } });

test("video metadata is batched, channel checked, deduplicated, and keeps the key in a server header", async () => {
  const calls: URL[] = [];
  const ids = Array.from({ length: 52 }, (_, index) => `v${String(index).padStart(10, "0")}`);
  const api = createYouTubeApi("server-secret", channel, async (input, init) => {
    const url = new URL(String(input)); calls.push(url);
    assert.equal(url.origin, "https://www.googleapis.com");
    assert.equal(url.searchParams.has("key"), false);
    assert.equal(new Headers(init?.headers).get("X-Goog-Api-Key"), "server-secret");
    assert.equal(init?.cache, "no-store");
    const batch = url.searchParams.get("id")!.split(",");
    assert.ok(batch.length <= 50);
    return Response.json({ items: [...batch.map(id => item(id)), item("x1234567890"), item(batch[0], "other-channel")] });
  });
  const videos = await api.videos([...ids, ids[0], "https://invalid-url"]);
  assert.equal(videos.length, 52);
  assert.equal(calls.length, 2);
});

test("playlist pagination and live discovery supply IDs for metadata verification", async () => {
  const calls: URL[] = [];
  const api = createYouTubeApi("key", channel, async input => {
    const url = new URL(String(input)); calls.push(url);
    if (url.pathname.endsWith("/search")) {
      assert.equal(url.searchParams.get("channelId"), channel);
      assert.equal(url.searchParams.get("eventType"), "live");
      return Response.json({ items: [{ id: { videoId: "l1234567890" } }, { id: { videoId: "bad" } }] });
    }
    return Response.json({ items: [{ contentDetails: { videoId: url.searchParams.has("pageToken") ? "b1234567890" : "a1234567890" } }, null], ...(url.searchParams.has("pageToken") ? {} : { nextPageToken: "next" }) });
  });
  assert.deepEqual(await api.playlistIds("PL0123456789", 3), ["a1234567890", "b1234567890"]);
  assert.equal(calls[1].searchParams.get("pageToken"), "next");
  assert.deepEqual(await api.liveIds(), ["l1234567890"]);
  assert.deepEqual(await api.playlistIds("invalid"), []);
});

test("API failures and malformed payloads are rejected without leaking provider errors or credentials", async () => {
  for (const response of [new Response("provider error server-secret", { status: 403 }), Response.json({ error: "bad key" }), Response.json(null)]) {
    const api = createYouTubeApi("server-secret", channel, async () => response);
    await assert.rejects(api.videos(["v1234567890"]), error => error instanceof Error && !error.message.includes("server-secret") && !error.message.includes("bad key"));
  }
});
