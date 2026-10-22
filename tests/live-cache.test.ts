import { test } from "node:test";
import assert from "node:assert/strict";
import { createLiveReadGuard } from "../lib/live-cache";

test("simultaneous cache revalidations share one upstream request", async () => {
  const guard = createLiveReadGuard();
  let calls = 0;
  let release: (value: string) => void = () => {};
  const load = () => { calls++; return new Promise<string>(resolve => { release = resolve; }); };
  const first = guard("metadata", 30, load);
  const second = guard("metadata", 30, load);
  assert.equal(first, second);
  await Promise.resolve(); assert.equal(calls, 1);
  release("verified"); assert.deepEqual(await Promise.all([first, second]), ["verified", "verified"]);
});

test("failed provider refreshes back off for their cache interval then allow recovery", async () => {
  let now = 0, calls = 0;
  const guard = createLiveReadGuard(() => now);
  const fail = async () => { calls++; throw new Error("provider unavailable"); };
  await assert.rejects(guard("search", 300, fail));
  await assert.rejects(guard("search", 300, fail));
  assert.equal(calls, 1);
  now = 300000;
  assert.equal(await guard("search", 300, async () => "recovered"), "recovered");
  assert.equal(await guard("metadata", 30, async () => "independent"), "independent");
});
