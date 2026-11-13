/*
 * Callback requests from the audit form.
 *
 * GET  /api/lead  -> { enabled: boolean }  The site shows the callback form only when this is true.
 * POST /api/lead  -> validates the request and forwards it to the webhook in LEAD_WEBHOOK_URL.
 *
 * Environment variables (Vercel > Project > Settings > Environment Variables):
 *   LEAD_WEBHOOK_URL     Required to switch the form on. For example an n8n Webhook node's production URL.
 *   LEAD_WEBHOOK_SECRET  Optional. Sent as the X-Lead-Secret header so the webhook can reject other callers.
 *
 * Nothing is stored here and no personal data is logged.
 */

const MAX_BODY_BYTES = 4096;
const FORWARD_TIMEOUT_MS = 8000;
const MIN_FILL_TIME_MS = 2500;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;

/* Best-effort limiter. It lives in one function instance's memory, so it slows a burst
   from one address but is not a hard guarantee across instances. */
const recentRequests = new Map();

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function clean(value, maxLength) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function clientAddress(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

function isRateLimited(address, now) {
  for (const [key, times] of recentRequests) {
    if (times.every((time) => now - time > RATE_WINDOW_MS)) {
      recentRequests.delete(key);
    }
  }
  const times = (recentRequests.get(address) || []).filter((time) => now - time <= RATE_WINDOW_MS);
  if (times.length >= RATE_MAX_REQUESTS) {
    recentRequests.set(address, times);
    return true;
  }
  times.push(now);
  recentRequests.set(address, times);
  return false;
}

function isSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) {
    return true;
  }
  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

export function GET() {
  return json(200, { enabled: Boolean(process.env.LEAD_WEBHOOK_URL) });
}

export async function POST(request) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    return json(503, { ok: false, error: 'not_configured' });
  }
  if (!isSameOrigin(request)) {
    return json(403, { ok: false, error: 'forbidden' });
  }
  if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'too_large' });
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  /* Bots fill the hidden field or submit instantly. Answer as if it worked so they learn nothing. */
  const elapsed = Number(data.elapsed);
  if (clean(data.website, 200) !== '' || !Number.isFinite(elapsed) || elapsed < MIN_FILL_TIME_MS) {
    return json(200, { ok: true });
  }

  const name = clean(data.name, 80);
  const phone = clean(data.phone, 20);
  const business = clean(data.business, 60);
  const task = clean(data.task, 300);
  const digits = phone.replace(/\D/g, '');

  if (name.length < 2) {
    return json(422, { ok: false, error: 'invalid_name' });
  }
  if (!/^[0-9+()\-\s]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
    return json(422, { ok: false, error: 'invalid_phone' });
  }

  if (isRateLimited(clientAddress(request), Date.now())) {
    return json(429, { ok: false, error: 'rate_limited' });
  }

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.LEAD_WEBHOOK_SECRET) {
    headers['X-Lead-Secret'] = process.env.LEAD_WEBHOOK_SECRET;
  }

  try {
    const forwarded = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        phone,
        business,
        task,
        source: 'voxflow-website-callback',
        receivedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    if (!forwarded.ok) {
      console.error('Lead webhook answered with status', forwarded.status);
      return json(502, { ok: false, error: 'upstream_failed' });
    }
  } catch (error) {
    console.error('Lead webhook could not be reached:', error instanceof Error ? error.name : 'unknown error');
    return json(502, { ok: false, error: 'upstream_unreachable' });
  }

  return json(200, { ok: true });
}
