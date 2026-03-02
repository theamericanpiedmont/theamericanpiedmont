import { NextResponse } from "next/server"
import { isValidSignature } from "@sanity/webhook"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function siteBaseUrl() {
  // Prefer explicit site URL if you set it
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")

  // Vercel provides VERCEL_URL without protocol
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel}`

  // Fallback
  return "https://www.theamericanpiedmont.com"
}

export async function POST(req: Request) {
  const secret = process.env.TAP_SIGNALS_WEBHOOK_SECRET || ""
  const signature = req.headers.get("sanity-signature") || ""
  const body = await req.text()

  const valid = isValidSignature(body, signature, secret)
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
  }

  // This is the key your cron route expects (?key=...)
  const cronKey = (process.env.CRON_SECRET || "").trim()

  // If CRON_SECRET is set in the cron route, we must provide it.
  if (!cronKey) {
    return NextResponse.json(
      { ok: false, error: "Missing CRON_SECRET env var (required to run /api/cron/marginalia)" },
      { status: 500 }
    )
  }

  try {
    const url = new URL("/api/cron/marginalia", siteBaseUrl())
    url.searchParams.set("key", cronKey)
    url.searchParams.set("stage", "write") // actually writes marginaliaSignal docs

    const resp = await fetch(url.toString(), {
      method: "GET",
      // Avoid cached responses between runs
      cache: "no-store",
    })

    const text = await resp.text()

    if (!resp.ok) {
      return NextResponse.json(
        { ok: false, error: `marginalia job failed: ${resp.status}`, detail: text },
        { status: 500 }
      )
    }

    // Pass through the job response so you can see created counts quickly
    return new NextResponse(text, {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Automation failed" },
      { status: 500 }
    )
  }
}