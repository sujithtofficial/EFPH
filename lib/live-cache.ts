// Coalesce the actual cache refresh, including Next's background revalidation.
// Failed refreshes back off without replacing the persistent last good value.
export function createLiveReadGuard(clock = Date.now) {
  const pending = new Map<string, Promise<unknown>>();
  const retryAfter = new Map<string, number>();
  return function read<T>(key: string, seconds: number, load: () => Promise<T>): Promise<T> {
    const existing = pending.get(key);
    if (existing) return existing as Promise<T>;
    if ((retryAfter.get(key) ?? 0) > clock()) return Promise.reject(new Error("Video refresh backing off"));
    retryAfter.delete(key);
    const task = Promise.resolve().then(load).catch(error => {
      if (retryAfter.size >= 256) retryAfter.delete(retryAfter.keys().next().value!);
      retryAfter.set(key, clock() + seconds * 1000);
      throw error;
    }).finally(() => pending.delete(key));
    pending.set(key, task);
    return task;
  };
}
