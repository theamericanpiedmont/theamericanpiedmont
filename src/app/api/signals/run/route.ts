// src/app/api/signals/run/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs"; // safer for rss-parser + crypto libs
export const dynamic = "force-dynamic"; // avoid caching weirdness

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET() {
  // Helps debugging in-browser (no more “404 means missing route” confusion)
  return json({
    ok: true,
    route: "/api/signals/run",
    hasWebhookSecret: Boolean(process.env.TAP_SIGNALS_WEBHOOK_SECRET?.trim()),
    hasCronSecret: Boolean(process.env.CRON_SECRET?.trim()),
    hasOpenAI: Boolean(process.env.OPENAI_API_KEY?.trim()),
    hasSanityWrite: Boolean(process.env.SANITY_API_WRITE_TOKEN?.trim()),
  });
}

export async function POST(req: NextRequest) {
  const webhookSecret = (process.env.TAP_SIGNALS_WEBHOOK_SECRET || "").trim();
  const cronSecret = (process.env.CRON_SECRET || "").trim();

  if (!webhookSecret) return json({ ok: false, error: "Missing TAP_SIGNALS_WEBHOOK_SECRET" }, 500);
  if (!cronSecret) return json({ ok: false, error: "Missing CRON_SECRET" }, 500);

  // --- AUTH (simple + robust) ---
  // Configure your Sanity button/webhook to send: x-tap-secret: <TAP_SIGNALS_WEBHOOK_SECRET>
  const provided = (req.headers.get("x-tap-secret") || "").trim();
  if (provided !== webhookSecret) {
    return json({ ok: false, error: "Unauthorized (bad x-tap-secret)" }, 401);
  }

  // Optional: accept a JSON body if you want to pass flags later
  // (but don’t require it; Sanity can send empty body)
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  // --- TRIGGER INGESTION ---
  // Call the real ingestion route from the server (so CRON_SECRET stays hidden).
  const origin = req.nextUrl.origin;

  // You can tweak these defaults:
  const stage = body?.stage || "write"; // write creates docs
  const debug = body?.debug ?? 1;
  const dryRun = body?.dryRun ?? 0;

  const url =
    `${origin}/api/cron/marginalia` +
    `?key=${encodeURIComponent(cronSecret)}` +
    `&stage=${encodeURIComponent(stage)}` +
    `&debug=${encodeURIComponent(String(debug))}` +
    `&dryRun=${encodeURIComponent(String(dryRun))}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "accept": "application/json" },
    // Important: don’t cache internal fetch
    cache: "no-store",
  });

  const text = await res.text();

  // If cron route returns JSON, pass it through.
  // If it returns plain text, still return it to you for visibility.
  let payload: any = text;
  try {
    payload = JSON.parse(text);
  } catch {}

  if (!res.ok) {
    return json(
      {
        ok: false,
        error: "Ingestion failed",
        status: res.status,
        ingestionUrl: url.replace(cronSecret, "***"), // don’t leak secret in logs
        payload,
      },
      500
    );
  }

  return json({
    ok: true,
    triggered: true,
    stage,
    dryRun,
    ingestionUrl: url.replace(cronSecret, "***"),
    result: payload,
  });
}