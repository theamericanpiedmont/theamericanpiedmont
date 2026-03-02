import { NextResponse } from "next/server"
import { isValidSignature } from "@sanity/webhook"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const secret = (process.env.TAP_SIGNALS_WEBHOOK_SECRET || "").trim()
    if (!secret) {
      console.error("Missing TAP_SIGNALS_WEBHOOK_SECRET env var")
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
      return NextResponse.json(
        { ok: false, error: "Signature validation error" },
        { status: 400 }
      )
    }

    if (!valid) {
      console.warn("Invalid signature")
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
    }

    // ✅ TEMP: prove we got past validation
    console.log("Webhook OK: passed signature validation")

    // TODO: call ingestion here later
    // await fetch(`${base}/api/cron/marginalia?key=${process.env.CRON_SECRET}&stage=write`, { cache: "no-store" })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("Unhandled error in /api/signals/run:", e?.message || e, e?.stack)
    return NextResponse.json(
      { ok: false, error: e?.message || "Unhandled error" },
      { status: 500 }
    )
  }
}