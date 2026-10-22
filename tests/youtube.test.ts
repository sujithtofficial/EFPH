import { test } from "node:test";
import assert from "node:assert/strict";
import { findServiceVideo, parseYouTubeFeed } from "../lib/youtube-feed";

const entry = (id: string, title: string, date: string, views = 10) => `<entry><yt:videoId>${id}</yt:videoId><title>${title}</title><published>${date}</published><media:statistics views="${views}"/></entry>`;

test("the feed resolves each language to its own latest Sunday recording", () => {
  const videos = parseYouTubeFeed(`<feed>${entry("a1234567890", "Sunday Service | Tamil &amp; Kannada", "2026-10-11T04:00:00Z")}${entry("b1234567890", "Sunday Service | English &amp; Hindi", "2026-10-18T05:30:00Z")}${entry("c1234567890", "Sunday Service | Tamil &amp; Kannada", "2026-10-18T01:45:00Z")}${entry("d1234567890", "Fasting Prayer | Tamil &amp; Kannada", "2026-10-19T01:45:00Z")}</feed>`);
  assert.equal(findServiceVideo(videos, "tamil-kannada")?.id, "c1234567890");
  assert.equal(findServiceVideo(videos, "english-hindi")?.id, "b1234567890");
  assert.equal(videos[0].title, "Sunday Service | Tamil & Kannada");
});
test("invalid IDs and dates cannot reach an iframe or link", () => {
  assert.deepEqual(parseYouTubeFeed(`<feed>${entry('javascript:alert(1)', 'Sunday Service', 'bad')}${entry('a1234567890', 'Sunday Service', 'bad')}</feed>`), []);
  assert.deepEqual(parseYouTubeFeed("unavailable"), []);
});
test("missing language recordings use a fallback instead of the other language", () => {
  const videos = parseYouTubeFeed(entry("a1234567890", "Sunday Service | Tamil &amp; Kannada", "2026-10-18T01:45:00Z"));
  assert.equal(findServiceVideo(videos, "english-hindi"), undefined);
});
