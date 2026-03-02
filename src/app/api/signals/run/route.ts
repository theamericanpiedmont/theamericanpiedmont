import { NextResponse } from "next/server"
import { isValidSignature } from "@sanity/webhook"
import { runSignalsIngestion } from "@/lib/signals/runSignalsIngestion"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const secret = process.env.TAP_SIGNALS_WEBHOOK_SECRET || ""
  const signature = req.headers.get("sanity-signature") || ""
  const body = await req.text()

  const valid = isValidSignature(body, signature, secret)
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
  }

  try {
    // In production, this should do the real write.
    const result = await runSignalsIngestion({ stage: "write", dryRun: false, debug: false })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Automation failed" },
      { status: 500 }
    )
  }
}