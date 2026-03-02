// src/app/api/cron/marginalia/route.ts
import { runSignalsIngestion } from "@/lib/signals/runSignalsIngestion"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    const dryRun = url.searchParams.get("dryRun") === "1"
    const debug = url.searchParams.get("debug") === "1"
    const stage = (url.searchParams.get("stage") || (dryRun ? "rss" : "write")) as "rss" | "score" | "write"
    const key = (url.searchParams.get("key") || "").trim()

    const result = await runSignalsIngestion({ dryRun, debug, stage, cronKey: key })
    return Response.json(result)
  } catch (err: any) {
    return Response.json(
      {
        ok: false,
        error: err?.message ? String(err.message) : String(err),
        stack: err?.stack ? String(err.stack) : undefined,
      },
      { status: err?.message?.includes("Unauthorized") ? 401 : 500 }
    )
  }
}