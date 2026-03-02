import { NextResponse } from "next/server"
import { isValidSignature } from "@sanity/webhook"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  console.log("[signals/run] hit", {
    hasSig: !!req.headers.get("sanity-signature"),
    host: req.headers.get("host"),
  })

  try {
    const secret = process.env.TAP_SIGNALS_WEBHOOK_SECRET || ""
    const signature = req.headers.get("sanity-signature") || ""
    const body = await req.text()

    if (!secret) {
      console.error("[signals/run] missing TAP_SIGNALS_WEBHOOK_SECRET")
      return NextResponse.json({ ok: false, error: "Missing webhook secret" }, { status: 500 })
    }

    const valid = isValidSignature(body, signature, secret)
    if (!valid) {
      console.error("[signals/run] invalid signature")
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
    }

    // TEMP: prove we get here
    console.log("[signals/run] signature valid")
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[signals/run] crashed", e)
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    )
  }
}