import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/signals/run",
    hasWebhookSecret: Boolean(process.env.TAP_SIGNALS_WEBHOOK_SECRET),
    hasCronSecret: Boolean(process.env.CRON_SECRET),
    hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
    hasSanityWrite: Boolean(process.env.SANITY_API_WRITE_TOKEN),
  })
}

export async function POST() {
  return NextResponse.json({ ok: true, msg: "POST reached /api/signals/run" })
}