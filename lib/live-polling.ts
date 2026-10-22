import { isLiveSnapshot, type LiveSnapshot } from "./live-services";

export function startLivePolling(options: {
  fetchSnapshot: (signal: AbortSignal) => Promise<unknown>;
  onSnapshot: (snapshot: LiveSnapshot) => void;
  onFailure: () => void;
  isActive: () => boolean;
  intervalMs?: number;
}) {
  let stopped = false;
  let active: Promise<void> | undefined;
  let controller: AbortController | undefined;
  async function refresh(): Promise<void> {
    if (stopped || !options.isActive()) return;
    if (active) return active;
    controller = new AbortController();
    const request = controller;
    const timeout = setTimeout(() => request.abort(), 12000);
    active = (async () => {
      try {
        const snapshot = await options.fetchSnapshot(request.signal);
        if (!isLiveSnapshot(snapshot)) throw new Error("Invalid live status response");
        if (!stopped) options.onSnapshot(snapshot);
      } catch { if (!stopped) options.onFailure(); }
      finally { clearTimeout(timeout); active = undefined; }
    })();
    return active;
  }
  const timer = setInterval(() => { void refresh(); }, options.intervalMs ?? 30000);
  void refresh();
  return { refresh, stop() { stopped = true; clearInterval(timer); controller?.abort(); } };
}
