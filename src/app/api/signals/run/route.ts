import { NextResponse } from "next/server"
import { isValidSignature } from "@sanity/webhook"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function baseUrl() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "")
  if (site) return site
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "https://theamericanpiedmont.com"
}

export async function POST(req: Request) {
  try {
    // --- Verify request is really from Sanity ---
    const secret = (process.env.TAP_SIGNALS_WEBHOOK_SECRET || "").trim()
    if (!secret) {
      console.error("Missing TAP_SIGNALS_WEBHOOK_SECRET")
      return NextResponse.json(
        { ok: false, error: "Server misconfigured: missing webhook secret" },
        { status: 500 }
      )
    }

    const signature = req.headers.get("sanity-signature") || ""
    const body = await req.text()

    let valid = false
    try {
      valid = isValidSignature(body, signature, secret)
    } catch (e: any) {
      console.error("Signature validation threw:", e?.message || e)
      return NextResponse.json({ ok: false, error: "Signature validation error" }, { status: 400 })
    }

    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
    }

    // --- Call ingestion route ---
    const cron = (process.env.CRON_SECRET || "").trim()
    if (!cron) {
      console.error("Missing CRON_SECRET")
      return NextResponse.json({ ok: false, error: "Missing CRON_SECRET" }, { status: 500 })
    }

    const url = new URL("/api/cron/marginalia", baseUrl())
    url.searchParams.set("key", cron)
    url.searchParams.set("stage", "write")
    url.searchParams.set("debug", "1")

    const resp = await fetch(url.toString(), { cache: "no-store" })
    const text = await resp.text()

    // Pass through response (handy for debugging in Vercel logs)
    return new NextResponse(text, {
      status: resp.status,
      headers: { "content-type": resp.headers.get("content-type") || "application/json" },
    })
  } catch (e: any) {
    console.error("Unhandled error in /api/signals/run:", e?.message || e, e?.stack)
    return NextResponse.json({ ok: false, error: e?.message || "Unhandled error" }, { status: 500 })
  }
}