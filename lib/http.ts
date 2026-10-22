import { InputError, record } from "./validation";

// Best-effort per-instance protection. Add Vercel Firewall rate limiting for
// deployment-wide protection across serverless instances (see ENV_SETUP.md).
const buckets = new Map<string, { count: number; expires: number }>();

export function checkRateLimit(key: string, limit: number, now = Date.now()) {
  for (const [id, bucket] of buckets) if (bucket.expires <= now) buckets.delete(id);
  const bucket = buckets.get(key);
  if (bucket && bucket.count >= limit) throw new InputError("Too many requests. Please try again in a few minutes.", 429);
  if (bucket) bucket.count++;
  else {
    if (buckets.size >= 10000) throw new InputError("Please try again shortly.", 429);
    buckets.set(key, { count: 1, expires: now + 10 * 60 * 1000 });
  }
}

export async function readSubmission(req: Request, scope: string, limit: number) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) throw new InputError("Request origin is not allowed", 403);
  if (req.headers.get("sec-fetch-site") === "cross-site") throw new InputError("Request origin is not allowed", 403);
  if (req.headers.get("content-type")?.split(";")[0].trim() !== "application/json") throw new InputError("Expected application/json", 415);
  const ip = process.env.VERCEL ? req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ?? "unknown" : "local";
  checkRateLimit(`${scope}:${ip}`, limit);
  try { return record(JSON.parse(await readLimitedText(req))); }
  catch (error) { if (error instanceof InputError) throw error; throw new InputError("Invalid JSON body"); }
}

export async function readLimitedText(req: Request, maxBytes = 16384): Promise<string> {
  if (Number(req.headers.get("content-length")) > maxBytes) throw new InputError("Request too large", 413);
  const reader = req.body?.getReader();
  if (!reader) throw new InputError("Missing request body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new InputError("Request too large", 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return new TextDecoder().decode(bytes);
  } finally { reader.releaseLock(); }
}

export function apiError(error: unknown, fallback: string) {
  const status = error instanceof InputError ? error.status : 500;
  return Response.json({ error: error instanceof InputError ? error.message : fallback }, {
    status,
    headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "600" } : {}) },
  });
}
