// src/lib/signals/runSignalsIngestion.ts
import OpenAI from "openai"
import Parser from "rss-parser"
import crypto from "crypto"
import { createClient } from "@sanity/client"

export const runtime = "nodejs"

type FeedItem = {
  title?: string
  link?: string
  contentSnippet?: string
  content?: string
  isoDate?: string
  pubDate?: string
}

type Pillar = "crease" | "present" | "future"

type CivicTag =
  | "education"
  | "archives"
  | "monuments"
  | "records"
  | "platforms"
  | "surveillance"
  | "textbooks"
  | "libraries"
  | "commemoration"
  | "elections"

type SignalDraft = {
  headline: string
  url: string
  source: string
  sourceDomain?: string
  pillar: Pillar
  civicTag: CivicTag
  summary: string
  memoryRelevance: string
  score: number
}

type Candidate = {
  headline: string
  url: string
  source: string
  sourceDomain?: string
  snippet: string
  defaultPillar?: Pillar
  pubDate?: string | null
  ageHours?: number | null
}

type FeedStat = {
  source: string
  url: string
  parseOk: boolean
  fetched: number
  afterAgeFilter: number
  afterDedupe: number
  error?: string | null
}

type FeedConfig = {
  source: string
  url: string
  defaultPillar?: Pillar
  weight?: number
  maxFromFeed?: number
}

// --- CONFIG: feeds (copied from your file) ---
function googleNewsRss(q: string) {
  const encoded = encodeURIComponent(q)
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`
}

const FEEDS: FeedConfig[] = [
  { source: "NARA Education Updates", url: "https://education.blogs.archives.gov/feed/", defaultPillar: "crease", weight: 1.2, maxFromFeed: 10 },
  { source: "Teaching Hard History", url: "https://hardhistory.libsyn.com/rss", defaultPillar: "crease", weight: 1.0, maxFromFeed: 8 },
  { source: "Library of Congress – Blog", url: "https://blogs.loc.gov/feed/", defaultPillar: "crease", weight: 1.2, maxFromFeed: 10 },
  { source: "Google News – Monuments", url: googleNewsRss('("monument" OR memorial OR commemoration OR renaming) ("historic" OR statue OR plaque)'), defaultPillar: "crease", weight: 0.6, maxFromFeed: 8 },

  { source: "Georgia Recorder", url: "https://georgiarecorder.com/feed/", defaultPillar: "present", weight: 1.1, maxFromFeed: 10 },
  { source: "NPR – Education", url: "https://feeds.npr.org/1013/rss.xml", defaultPillar: "present", weight: 1.0, maxFromFeed: 10 },
  { source: "The Marshall Project", url: "https://www.themarshallproject.org/rss", defaultPillar: "present", weight: 1.1, maxFromFeed: 10 },
  { source: "Google News – History Education", url: googleNewsRss('("history education" OR curriculum OR "social studies standards") (school OR district OR "school board")'), defaultPillar: "present", weight: 0.6, maxFromFeed: 8 },
  { source: "Google News – Book Bans", url: googleNewsRss('("book ban" OR "banned book" OR "library board") (school OR district OR county)'), defaultPillar: "present", weight: 0.6, maxFromFeed: 8 },
  { source: "Google News – Public Records", url: googleNewsRss('("open records" OR FOIA OR "public records request") (school OR university OR county OR state)'), defaultPillar: "present", weight: 0.6, maxFromFeed: 8 },

  { source: "AI Now Institute", url: "https://ainowinstitute.org/category/news/feed", defaultPillar: "future", weight: 1.0, maxFromFeed: 8 },
  { source: "EFF Updates", url: "https://www.eff.org/rss/updates.xml", defaultPillar: "future", weight: 1.2, maxFromFeed: 10 },
  { source: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", defaultPillar: "future", weight: 0.9, maxFromFeed: 8 },
]

const TARGET_PER_PILLAR: Record<Pillar, number> = { crease: 4, present: 5, future: 3 }
const TARGET_TOTAL = TARGET_PER_PILLAR.crease + TARGET_PER_PILLAR.present + TARGET_PER_PILLAR.future

const FINAL_CAP = 12
const MAX_MODEL_CANDIDATES = 30
const MAX_CANDIDATES = 120
const MAX_ITEMS_PER_FEED_EXAMINED = 60
const MAX_AGE_HOURS = 24 * 14
const ACCEPT_MIN = 65
const MAX_PER_SOURCE_FINAL = 3
const MAX_PER_SOURCE_TO_MODEL = 10

function sha1(input: string) {
  return crypto.createHash("sha1").update(input).digest("hex")
}

function normalizeUrl(url: string) {
  try {
    const u = new URL(url)
    u.hash = ""
    ;["utm_source","utm_medium","utm_campaign","utm_term","utm_content","utm_id","fbclid","gclid"].forEach((p) =>
      u.searchParams.delete(p)
    )
    return u.toString()
  } catch {
    return url
  }
}

function hoursSince(dateStr?: string) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return (Date.now() - d.getTime()) / 36e5
}

function todayISO_ET(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const yyyy = parts.find((p) => p.type === "year")?.value ?? "1970"
  const mm = parts.find((p) => p.type === "month")?.value ?? "01"
  const dd = parts.find((p) => p.type === "day")?.value ?? "01"
  return `${yyyy}-${mm}-${dd}`
}

function pickText(item: FeedItem) {
  return (
    (item.contentSnippet || "").trim() ||
    (item.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
    ""
  )
}

function isGoogleNewsFeed(sourceName: string) {
  return sourceName.toLowerCase().startsWith("google news")
}

function hostnameFromUrl(u?: string) {
  if (!u) return null
  try {
    return new URL(u).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

function extractPublisherUrlFromGoogleNewsItem(it: FeedItem) {
  const html = (it.content || "") + "\n" + (it.contentSnippet || "")
  if (!html) return null
  const urls = html.match(/https?:\/\/[^\s"'<>]+/g) || []
  for (const u of urls) {
    const host = hostnameFromUrl(u)
    if (!host) continue
    if (host.endsWith("google.com") || host.endsWith("news.google.com")) continue
    return u
  }
  return null
}

function extractPublisherFromGoogleNewsItem(anyItem: any): { name?: string; url?: string } | null {
  const src = anyItem?.source
  if (!src) return null
  if (typeof src === "string") return { name: src }
  if (typeof src === "object") {
    const name =
      (src.title as string) ||
      (src._ as string) ||
      (src["#text"] as string) ||
      (src.content as string) ||
      ""
    const url = (src.url as string) || (src.href as string) || (src.$?.url as string) || ""
    return { name: name?.trim() || undefined, url: url?.trim() || undefined }
  }
  return null
}

function isClearlyInScope(headline: string, snippet: string) {
  const text = `${headline}\n${snippet}`.toLowerCase()
  const outOfScope = ["state of the union","polling","campaign","rally","attacks democrats","boosts allies","steel plant","touts","message on immigration","pre-state of the union","affordability woes"]
  if (outOfScope.some((w) => text.includes(w))) return false

  const strongAnchors = [
    "curriculum","standards","social studies","history class","book ban","banned book","school board","department of education","textbook",
    "public records","open records","foia","records request","archive","archives","archival","library","libraries","museum","monument","memorial","commemoration","rename","renaming","historic site",
    "election board","voter registration","voter rolls","ballot","absentee","signature verification","audit","recount","certification","tabulator","warehouse",
    "content moderation","training data","dataset","search ranking","algorithm","age verification","facial recognition","biometric","alpr","license plate reader","surveillance","data retention",
  ]
  return strongAnchors.some((w) => text.includes(w))
}

const SOURCE_QUALITY: Record<string, number> = {
  "EFF Updates": 10,
  "Library of Congress – Blog": 10,
  "NARA Education Updates": 9,
  "The Marshall Project": 8,
  "Georgia Recorder": 7,
  "NPR – Education": 7,
  "MIT Technology Review": 6,
  "AI Now Institute": 6,
}

function heuristicScore(c: Candidate, feedWeight = 1.0): number {
  const text = `${c.headline}\n${c.snippet}`.toLowerCase()
  const strong = ["foia","open records","public records","records request","archives","archival","library","museum","curriculum","standards","textbook","school board","banned book","book ban","monument","memorial","commemoration","rename","renaming","audit","recount","certification","voter rolls","ballot","tabulator","facial recognition","biometric","surveillance","license plate reader","data retention","algorithm","search ranking","training data","dataset","content moderation"]
  let s = 0
  for (const w of strong) if (text.includes(w)) s += 6

  const weak = ["best of","top 10","things to know","what to watch","gallery","photos","quiz","opinion:"]
  for (const w of weak) if (text.includes(w)) s -= 10

  if (c.ageHours != null) {
    if (c.ageHours <= 24) s += 10
    else if (c.ageHours <= 72) s += 6
    else if (c.ageHours <= 168) s += 2
    else s -= 4
  }

  s += SOURCE_QUALITY[c.source] ?? 0
  if (c.defaultPillar === "future" && (text.includes("ai") || text.includes("algorithm") || text.includes("dataset"))) s += 6
  if (c.defaultPillar === "crease" && (text.includes("archives") || text.includes("museum") || text.includes("monument"))) s += 6
  if (c.defaultPillar === "present" && (text.includes("school board") || text.includes("foia") || text.includes("public records"))) s += 6

  return Math.round(s * feedWeight)
}

function capPerSource<T extends { source: string }>(items: T[], maxPerSource: number) {
  const out: T[] = []
  const counts = new Map<string, number>()
  for (const it of items) {
    const n = counts.get(it.source) ?? 0
    if (n >= maxPerSource) continue
    counts.set(it.source, n + 1)
    out.push(it)
  }
  return out
}

function capPerSourceFinal(items: SignalDraft[], maxPerSource = 4) {
  const sorted = [...items].sort((a, b) => b.score - a.score)
  const out: SignalDraft[] = []
  const counts = new Map<string, number>()
  for (const it of sorted) {
    const n = counts.get(it.source) ?? 0
    if (n >= maxPerSource) continue
    counts.set(it.source, n + 1)
    out.push(it)
  }
  return out
}

function enforceMixFill(items: SignalDraft[]) {
  const sorted = [...items].sort((a, b) => b.score - a.score)
  const buckets: Record<Pillar, SignalDraft[]> = { crease: [], present: [], future: [] }
  for (const it of sorted) buckets[it.pillar].push(it)

  const out: SignalDraft[] = []
  const used = new Set<string>()

  ;(["crease", "present", "future"] as const).forEach((p) => {
    for (const it of buckets[p].slice(0, TARGET_PER_PILLAR[p])) {
      out.push(it)
      used.add(it.url)
    }
  })

  for (const it of sorted) {
    if (out.length >= TARGET_TOTAL) break
    if (used.has(it.url)) continue
    out.push(it)
    used.add(it.url)
  }

  return out.slice(0, FINAL_CAP)
}

function sanityWriteClient() {
  const projectId = (process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "").trim()
  const dataset = (process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "").trim()
  const apiVersion = (process.env.SANITY_API_VERSION || process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01").trim()
  const token = (process.env.SANITY_API_WRITE_TOKEN || "").trim()

  if (!projectId || !dataset) {
    throw new Error("Missing Sanity projectId/dataset env vars (SANITY_PROJECT_ID/SANITY_DATASET or NEXT_PUBLIC equivalents)")
  }
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN")

  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
}

async function existingDedupeKeys(client: ReturnType<typeof sanityWriteClient>, keys: string[]) {
  return await client.fetch(`*[_type=="marginaliaSignal" && dedupeKey in $keys].dedupeKey`, { keys })
}

async function alreadyExists(client: ReturnType<typeof sanityWriteClient>, dedupeKey: string) {
  const existing = await client.fetch(`count(*[_type=="marginaliaSignal" && dedupeKey==$dedupeKey])`, { dedupeKey })
  return Number(existing) > 0
}

function makeOpenAIClient() {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim()
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY")
  return new OpenAI({ apiKey })
}

type BatchInput = Candidate & { id: string }

async function classifyBatchWithOpenAI(
  client: OpenAI,
  items: BatchInput[]
): Promise<Array<{ id: string; draft: SignalDraft | null; raw?: any; rejectReason?: string }>> {
  const system = `
You are curating "Marginalia Signals" for The American Piedmont (TAP).
TAP thesis: Memory is civic infrastructure.
Only CIVIC / CULTURAL / INSTITUTIONAL memory counts.
Return STRICT JSON only with:
{ "results": [ { "id": "...", "reject": true, "reason": "..." } OR { "id": "...", "pillar": "crease|present|future", "civicTag": "...", "summary": "...", "memoryRelevance": "...", "score": 0-100 } ] }
Rules:
- If civicTag is "none", you MUST reject.
- If the civic-memory link is not explicit in headline/snippet, reject.
- If unsure, reject.
`.trim()

  const payload = items.map((it) => ({
    id: it.id,
    headline: it.headline,
    url: it.url,
    source: it.source,
    snippet: it.snippet.slice(0, 700),
    defaultPillar: it.defaultPillar || null,
  }))

  const resp = await client.responses.create({
    model: "gpt-5-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify({ items: payload }) },
    ],
  })

  const text = resp.output_text?.trim() || ""
  if (!text) return items.map((it) => ({ id: it.id, draft: null, rejectReason: "empty_model_output" }))

  let parsed: any
  try {
    parsed = JSON.parse(text)
  } catch {
    return items.map((it) => ({ id: it.id, draft: null, rejectReason: "invalid_json" }))
  }

  const byId = new Map<string, any>()
  for (const r of parsed?.results || []) if (r?.id) byId.set(String(r.id), r)

  const allowedCivicTags = new Set([
    "education","archives","monuments","records","platforms","surveillance","textbooks","libraries","commemoration","elections","none",
  ])

  const out: Array<{ id: string; draft: SignalDraft | null; raw?: any; rejectReason?: string }> = []

  for (const it of items) {
    const r = byId.get(it.id)
    if (!r) { out.push({ id: it.id, draft: null, rejectReason: "missing_result_row" }); continue }

    if (r?.reject) { out.push({ id: it.id, draft: null, raw: r, rejectReason: String(r?.reason || "model_reject") }); continue }

    const pillar = String(r?.pillar || "").trim() as Pillar
    const civicTag = String(r?.civicTag || "").trim()
    const summary = String(r?.summary || "").trim()
    const memoryRelevance = String(r?.memoryRelevance || "").trim()
    const scoreNum = Number(r?.score)

    if (!pillar || !summary || !memoryRelevance || !Number.isFinite(scoreNum) || !civicTag) {
      out.push({ id: it.id, draft: null, raw: r, rejectReason: "missing_fields" })
      continue
    }
    if (!["crease","present","future"].includes(pillar)) { out.push({ id: it.id, draft: null, raw: r, rejectReason: "bad_pillar" }); continue }
    if (!allowedCivicTags.has(civicTag)) { out.push({ id: it.id, draft: null, raw: r, rejectReason: "bad_civic_tag" }); continue }
    if (civicTag === "none") { out.push({ id: it.id, draft: null, raw: r, rejectReason: "civic_none" }); continue }

    const score = Math.max(0, Math.min(100, Math.round(scoreNum)))

    out.push({
      id: it.id,
      raw: r,
      draft: {
        headline: it.headline,
        url: it.url,
        source: it.source,
        sourceDomain: it.sourceDomain,
        pillar,
        civicTag: civicTag as CivicTag,
        summary,
        memoryRelevance,
        score,
      },
    })
  }

  return out
}

export type RunSignalsOptions = {
  dryRun?: boolean
  debug?: boolean
  stage?: "rss" | "score" | "write"
  // If provided, enforce cron key check (used by cron route only)
  cronKey?: string
}

export async function runSignalsIngestion(opts: RunSignalsOptions = {}) {
  const dryRun = !!opts.dryRun
  const debug = !!opts.debug
  const stage = (opts.stage || (dryRun ? "rss" : "write")) as "rss" | "score" | "write"

  // Only cron route should use this guard; webhook route doesn’t need it.
  const cronSecret = (process.env.CRON_SECRET || "").trim()
  if (cronSecret) {
    const key = (opts.cronKey || "").trim()
    if (key !== cronSecret) throw new Error("Unauthorized (bad cron key)")
  }

  const suggestedForDate = todayISO_ET()

  const parser = new Parser({
    headers: { "User-Agent": "TAP-MarginaliaBot/1.0 (+theamericanpiedmont.com)" },
    customFields: { item: [["source", "source"]] },
  })

  const feedStats: FeedStat[] = []
  const feedErrors: Array<{ source: string; url: string; error: string }> = []

  const rawCandidates: Candidate[] = []

  for (const f of FEEDS) {
    try {
      const feed = await parser.parseURL(f.url)
      const items = (feed.items || []) as FeedItem[]

      let fetched = 0
      let afterAge = 0
      let pushed = 0
      const perFeedCap = Math.max(1, Math.min(30, f.maxFromFeed ?? 12))

      for (const it of items.slice(0, MAX_ITEMS_PER_FEED_EXAMINED)) {
        fetched += 1
        if (pushed >= perFeedCap) break

        let link = it.link ? normalizeUrl(it.link) : ""
        const title = (it.title || "").trim()
        if (!link || !title) continue

        let sourceName = f.source
        let sourceDomain: string | undefined = undefined

        if (isGoogleNewsFeed(f.source)) {
          const pub = extractPublisherFromGoogleNewsItem(it as any)
          if (pub?.name) sourceName = pub.name
          const pubDomainFromSource = hostnameFromUrl(pub?.url || "")
          if (pubDomainFromSource) sourceDomain = pubDomainFromSource

          const publisherUrl = extractPublisherUrlFromGoogleNewsItem(it)
          if (publisherUrl) {
            link = normalizeUrl(publisherUrl)
            sourceDomain = sourceDomain || hostnameFromUrl(link) || undefined
          }
        } else {
          sourceDomain = hostnameFromUrl(link) || undefined
        }

        const a = hoursSince(it.isoDate)
        const b = hoursSince(it.pubDate)
        const age = a === null && b === null ? null : Math.min(a ?? Infinity, b ?? Infinity)
        if (age !== null && age > MAX_AGE_HOURS) continue
        afterAge += 1

        const snippet = pickText(it)
        if (!isClearlyInScope(title, snippet)) continue

        rawCandidates.push({
          headline: title,
          url: link,
          source: sourceName,
          sourceDomain,
          snippet,
          defaultPillar: f.defaultPillar,
          pubDate: it.isoDate || it.pubDate || null,
          ageHours: age,
        })

        pushed += 1
      }

      feedStats.push({ source: f.source, url: f.url, parseOk: true, fetched, afterAgeFilter: afterAge, afterDedupe: 0, error: null })
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : String(e)
      feedStats.push({ source: f.source, url: f.url, parseOk: false, fetched: 0, afterAgeFilter: 0, afterDedupe: 0, error: msg })
      feedErrors.push({ source: f.source, url: f.url, error: msg })
    }
  }

  const seen = new Set<string>()
  const uniqueAll = rawCandidates.filter((c) => (seen.has(c.url) ? false : (seen.add(c.url), true)))

  const byFeed = new Map<string, number>()
  for (const c of uniqueAll) byFeed.set(c.source, (byFeed.get(c.source) ?? 0) + 1)
  for (const s of feedStats) s.afterDedupe = byFeed.get(s.source) ?? 0

  const intake = uniqueAll.slice(0, MAX_CANDIDATES)

  if (dryRun && stage === "rss") {
    return {
      ok: true,
      dryRun: true,
      stage,
      suggestedForDate,
      feedStats,
      totals: { fetched: rawCandidates.length, unique: uniqueAll.length, intakePool: intake.length },
      feedErrors: debug ? feedErrors : undefined,
    }
  }

  const feedWeightBySource = new Map<string, number>()
  for (const f of FEEDS) feedWeightBySource.set(f.source, f.weight ?? 1.0)

  const ranked = [...intake].sort((a, b) => {
    const wa = feedWeightBySource.get(a.source) ?? 1.0
    const wb = feedWeightBySource.get(b.source) ?? 1.0
    return heuristicScore(b, wb) - heuristicScore(a, wa)
  })

  const rankedCapped = capPerSource(ranked, MAX_PER_SOURCE_TO_MODEL)
  let toModel = rankedCapped.slice(0, MAX_MODEL_CANDIDATES)

  let sanity: ReturnType<typeof sanityWriteClient> | null = null
  if (!dryRun && stage === "write") {
    sanity = sanityWriteClient()
    const keys = toModel.map((c) => sha1(c.url))
    const existingKeys = new Set(await existingDedupeKeys(sanity, keys))
    toModel = toModel.filter((c) => !existingKeys.has(sha1(c.url)))
  }

  const oai = makeOpenAIClient()

  const scored: SignalDraft[] = []
  const rejectionCounts = { modelReject: 0, invalidJsonOrFields: 0, belowMinScore: 0, accepted: 0, civicNone: 0 }

  const withIds: BatchInput[] = toModel.map((c, i) => ({ ...c, id: `${i}` }))
  const batchSize = 12

  for (let i = 0; i < withIds.length; i += batchSize) {
    if (scored.length >= FINAL_CAP * 2) break
    const batch = withIds.slice(i, i + batchSize)
    const results = await classifyBatchWithOpenAI(oai, batch)

    for (const r of results) {
      const c = batch.find((x) => x.id === r.id)!

      if (!r.draft) {
        const reason = r.rejectReason || "model_reject"
        if (["invalid_json","missing_fields","bad_pillar","bad_civic_tag","empty_model_output","missing_result_row"].includes(reason)) rejectionCounts.invalidJsonOrFields += 1
        else if (reason === "civic_none") rejectionCounts.civicNone += 1
        else rejectionCounts.modelReject += 1
        continue
      }

      if (r.draft.score < ACCEPT_MIN) {
        rejectionCounts.belowMinScore += 1
        continue
      }

      rejectionCounts.accepted += 1
      scored.push(r.draft)
    }
  }

  const scoredCapped = capPerSourceFinal(scored, MAX_PER_SOURCE_FINAL)
  const mixed = enforceMixFill(scoredCapped)

  if (dryRun || stage === "score") {
    return {
      ok: true,
      dryRun: true,
      stage: "score",
      suggestedForDate,
      feedStats,
      totals: {
        fetched: rawCandidates.length,
        unique: uniqueAll.length,
        intakePool: intake.length,
        toModel: toModel.length,
        scored: scored.length,
        scoredAfterSourceCap: scoredCapped.length,
        mixed: mixed.length,
      },
      rejectionCounts,
      feedErrors: debug ? feedErrors : undefined,
    }
  }

  if (!sanity) sanity = sanityWriteClient()

  let created = 0
  for (const d of mixed.slice(0, FINAL_CAP)) {
    const dedupeKey = sha1(d.url)
    if (await alreadyExists(sanity, dedupeKey)) continue

    await sanity.create({
      _type: "marginaliaSignal",
      headline: d.headline,
      url: d.url,
      source: d.source,
      pillar: d.pillar,
      civicTag: d.civicTag,
      summary: d.summary,
      memoryRelevance: d.memoryRelevance,
      score: d.score,
      status: "suggested",
      suggestedForDate,
      publishedAt: null,
      dedupeKey,
    })

    created += 1
  }

  return {
    ok: true,
    stage: "write",
    suggestedForDate,
    feedStats,
    totals: {
      fetched: rawCandidates.length,
      unique: uniqueAll.length,
      intakePool: intake.length,
      toModel: toModel.length,
      scored: scored.length,
      mixed: mixed.length,
      created,
      finalCap: FINAL_CAP,
    },
    rejectionCounts,
    feedErrors: debug ? feedErrors : undefined,
  }
}