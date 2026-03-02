import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function baseUrl() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "")
  if (site) return site
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "https://theamericanpiedmont.com"
}

export async function POST() {
  const cron = (process.env.CRON_SECRET || "").trim()
  if (!cron) {
    return NextResponse.json({ ok: false, error: "Missing CRON_SECRET" }, { status: 500 })
  }

  const url = new URL("/api/cron/marginalia", baseUrl())
  url.searchParams.set("key", cron)
  url.searchParams.set("stage", "write")
  url.searchParams.set("debug", "1")

  const resp = await fetch(url.toString(), { cache: "no-store" })
  const text = await resp.text()

  return new NextResponse(text, {
    status: resp.status,
    headers: { "content-type": resp.headers.get("content-type") || "application/json" },
  })
}