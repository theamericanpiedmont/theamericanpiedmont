import { NextResponse } from "next/server"

// TODO: import and call your real automation function here
// import { runSignalsIngestion } from "@/lib/signals/runSignalsIngestion"

export async function POST(req: Request) {
  const secret = req.headers.get("x-tap-secret") || ""
  const expected = process.env.TAP_SIGNALS_WEBHOOK_SECRET || ""

  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    // await runSignalsIngestion()
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Automation failed" },
      { status: 500 }
    )
  }
}