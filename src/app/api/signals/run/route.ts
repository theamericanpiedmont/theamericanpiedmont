import { NextResponse } from "next/server"
import { isValidSignature } from "@sanity/webhook"

export async function POST(req: Request) {
  const secret = process.env.TAP_SIGNALS_WEBHOOK_SECRET!
  const signature = req.headers.get("sanity-signature") || ""
  const body = await req.text()

  const valid = isValidSignature(body, signature, secret)

  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
  }

  try {
    // 🔥 Call your real signals automation here
    // await runSignalsIngestion()

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Automation failed" },
      { status: 500 }
    )
  }
}