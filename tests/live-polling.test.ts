import { test } from "node:test";
import assert from "node:assert/strict";
import { startLivePolling } from "../lib/live-polling";
import { makeLiveSnapshot } from "../lib/live-services";
const data = makeLiveSnapshot([], false, null);
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

test("open pages poll every 30s, pause when inactive, resume and clean up on navigation", async t => {
  t.mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  let active = true, calls = 0, updates = 0;
  const poller = startLivePolling({ fetchSnapshot: async () => { calls++; return data; }, onSnapshot: () => updates++, onFailure: () => assert.fail("unexpected failure"), isActive: () => active });
  await flush(); assert.equal(calls, 1);
  t.mock.timers.tick(30000); await flush(); assert.equal(updates, 2);
  active = false;
  t.mock.timers.tick(60000); await flush(); assert.equal(calls, 2);
  active = true; await poller.refresh(); assert.equal(calls, 3);
  poller.stop(); t.mock.timers.tick(60000); await flush(); assert.equal(calls, 3);
});

test("concurrent refreshes share a request and stopping aborts without replacing data", async () => {
  let calls = 0, updates = 0, failures = 0;
  let signal: AbortSignal | undefined;
  let release: (value: unknown) => void = () => {};
  const poller = startLivePolling({ fetchSnapshot: async request => { calls++; signal = request; return new Promise(resolve => { release = resolve; }); }, onSnapshot: () => updates++, onFailure: () => failures++, isActive: () => true });
  const pending = poller.refresh();
  assert.equal(calls, 1);
  poller.stop(); assert.equal(signal?.aborted, true);
  release(data); await pending;
  assert.equal(updates, 0); assert.equal(failures, 0);
});

test("malformed responses, network errors and timeouts report failure and allow a later retry", async t => {
  t.mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  let calls = 0, failures = 0, updates = 0;
  const poller = startLivePolling({
    fetchSnapshot: async signal => {
      calls++;
      if (calls === 1) return { broken: true };
      if (calls === 2) throw new Error("offline");
      if (calls === 3) return new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("timeout"))));
      return data;
    }, onSnapshot: () => updates++, onFailure: () => failures++, isActive: () => true,
  });
  await flush(); assert.equal(failures, 1);
  await poller.refresh(); assert.equal(failures, 2);
  const slow = poller.refresh(); t.mock.timers.tick(12000); await slow;
  assert.equal(failures, 3); assert.equal(updates, 0);
  await poller.refresh(); assert.equal(updates, 1);
  poller.stop();
});
