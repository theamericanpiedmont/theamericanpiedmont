export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from "next/link"
import imageUrlBuilder from "@sanity/image-url"
import { client } from "@/sanity/lib/client"
import { homeQuery } from "@/sanity/lib/queries"

// ✅ NEW: hotspot-aware crop helper
import { imageWithHotspot } from "@/lib/images"

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

function getDomain(href: string) {
  try {
    return new URL(href).hostname
  } catch {
    return ""
  }
}

function faviconUrl(href: string) {
  const domain = getDomain(href)
  if (!domain) return ""
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

function slugHref(base: string, slug: unknown) {
  const s =
    typeof slug === "string"
      ? slug
      : slug && typeof slug === "object" && "current" in (slug as any)
        ? (slug as any).current
        : ""
  const clean = typeof s === "string" ? s.trim().replace(/^\/+|\/+$/g, "") : ""
  return clean ? `/${base}/${clean}` : `/${base}`
}

type ArtifactSpotlightItem = {
  _id: string
  title: string
  slug: string
  summary?: string
  heroImage?: any
  pillar?: "crease" | "present" | "future"
  civicTag?: string
  artifactType?: string
}

type HomeData = {
  leadEssay: null | {
    _id: string
    title: string
    slug: any
    publishedAt?: string
    dek?: string
    preview?: string
    heroImage?: any
    body?: any[]
    section?: { title: string; slug: string }
  }
  latestFieldNotes: Array<{
    _id: string
    title: string
    slug: any
    publishedAt?: string
    lede?: string
    heroImage?: any
    thumbnail?: any
    section?: { title: string; slug: string }
  }>
  publishedSignals: Array<{
    _id: string
    headline: string
    url: string
    source?: string
    sourceDomain?: string
    pillar: "crease" | "present" | "future"
    civicTag?: string
    score?: number
    publishedAt?: string
  }>
  // pool for right-rail spotlight
  artifactPool?: ArtifactSpotlightItem[]
}

function firstParagraphText(body: any[] | undefined) {
  if (!body) return ""
  const firstBlock = body.find((b) => b?._type === "block" && Array.isArray(b.children))
  if (!firstBlock) return ""
  return firstBlock.children
    .filter((c: any) => c?._type === "span" && typeof c.text === "string")
    .map((c: any) => c.text)
    .join("")
}

function truncate(text: string, max = 240) {
  const t = (text || "").trim()
  if (!t) return ""
  if (t.length <= max) return t
  return t.slice(0, max).trimEnd() + "…"
}

function toTime(publishedAt?: string) {
  if (!publishedAt) return 0
  const t = new Date(publishedAt).getTime()
  return Number.isFinite(t) ? t : 0
}

function labelize(value?: string) {
  if (!value) return ""
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * ✅ Hydration-safe “two unique picks”:
 * - NO Math.random()
 * - Deterministic based on a stable seed (edition date)
 */
function pickTwoUniqueDeterministic<T extends { _id: string }>(
  items: T[] | undefined,
  seed: string
) {
  const pool = (items ?? []).slice()
  if (pool.length <= 2) return pool

  // simple deterministic hash
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const idx1 = Math.abs(h) % pool.length
  const first = pool.splice(idx1, 1)[0]
  const idx2 = Math.abs(Math.imul(h, 31)) % pool.length
  const second = pool.splice(idx2, 1)[0]
  return [first, second]
}

function SpotlightCard({ a }: { a: ArtifactSpotlightItem }) {
  // ✅ Hotspot-aware crop (4:3-ish card)
  const imgUrl = a.heroImage ? imageWithHotspot(a.heroImage, 900, 520) : null

  return (
    <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
            Artifact Spotlight
          </h3>
          <Link
            href="/artifacts"
            className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-90"
          >
            View all →
          </Link>
        </div>

        <div className="mt-4">
          <Link href={`/artifacts/${a.slug}`} className="group block">
            {imgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgUrl}
                alt={a.title}
                className="mb-3 h-40 w-full rounded-xl border border-black/10 object-cover"
                loading="lazy"
              />
            ) : null}

            <div className="flex flex-wrap gap-2 text-[11px] opacity-70">
              {a.pillar ? (
                <span className="rounded-full border border-black/10 px-2 py-0.5">
                  {labelize(a.pillar)}
                </span>
              ) : null}
              {a.civicTag ? (
                <span className="rounded-full border border-black/10 px-2 py-0.5">
                  {a.civicTag}
                </span>
              ) : null}
              {a.artifactType ? (
                <span className="rounded-full border border-black/10 px-2 py-0.5">
                  {labelize(a.artifactType)}
                </span>
              ) : null}
            </div>

            <h4 className="mt-2 font-serif text-lg leading-snug group-hover:underline underline-offset-4">
              {a.title}
            </h4>

            {a.summary ? <p className="mt-2 text-sm opacity-80 line-clamp-3">{a.summary}</p> : null}
          </Link>
        </div>
      </div>
    </section>
  )
}

function EssayCard({
  lead,
  leadKicker,
  leadExcerpt,
  featured = false,
  imageHeight = "h-48 md:h-56",
}: {
  lead: HomeData["leadEssay"]
  leadKicker: string
  leadExcerpt: string
  featured?: boolean
  imageHeight?: string
}) {
  if (!lead) {
    return (
      <article className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-6">
        <p className="opacity-80">
          No published essays yet. (Set a <code>publishedAt</code> date in Sanity to make one
          appear.)
        </p>
      </article>
    )
  }

  const essayHref = slugHref("essays", lead.slug)

  const cardClass = featured
    ? "rounded-2xl border border-black/15 bg-white shadow-md overflow-hidden"
    : "rounded-2xl border border-black/10 bg-white/60 shadow-sm overflow-hidden"

  // ✅ Hotspot-aware crop for lead hero (16:9)
  const leadImgUrl = lead.heroImage ? imageWithHotspot(lead.heroImage, 1800, 900) : null

  return (
    <article className={cardClass}>
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/60">
          <span className="uppercase tracking-[0.2em]">{leadKicker}</span>
          {lead.publishedAt ? <span>•</span> : null}
          {lead.publishedAt ? (
            <time dateTime={lead.publishedAt}>
              {new Date(lead.publishedAt).toLocaleDateString("en-US")}
            </time>
          ) : null}
        </div>

        <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-tight">
          <Link href={essayHref} className="hover:underline underline-offset-4">
            {lead.title}
          </Link>
        </h2>

        {leadExcerpt ? <p className="mt-4 text-base md:text-lg leading-relaxed opacity-80">{leadExcerpt}</p> : null}

        <div className="mt-6">
          <Link
            href={essayHref}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
          >
            Read The American Piedmont essay <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {leadImgUrl ? (
        <Link href={essayHref} aria-label={lead.title} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={leadImgUrl}
            alt=""
            className={`w-full border-t border-black/10 object-cover ${imageHeight}`}
          />
        </Link>
      ) : null}
    </article>
  )
}

function FieldNoteCard({
  note,
  featured = false,
  ledeMax = 240,
  imageHeight = "h-48 md:h-56",
}: {
  note: HomeData["latestFieldNotes"][number] | null
  featured?: boolean
  ledeMax?: number
  imageHeight?: string
}) {
  if (!note) return null

  const noteHref = slugHref("field-notes", note.slug)
  const featuredImage = note.heroImage ?? note.thumbnail

  const cardClass = featured
    ? "rounded-2xl border border-black/15 bg-white shadow-md overflow-hidden"
    : "rounded-2xl border border-black/10 bg-white/60 shadow-sm overflow-hidden"

  // ✅ Hotspot-aware crop for field note hero (16:9)
  const noteImgUrl = featuredImage ? imageWithHotspot(featuredImage, 1800, 900) : null

  return (
    <article className={cardClass}>
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/60">
          <span className="uppercase tracking-[0.2em]">Field Note</span>
          {note.publishedAt ? <span>•</span> : null}
          {note.publishedAt ? (
            <time dateTime={note.publishedAt}>
              {new Date(note.publishedAt).toLocaleDateString("en-US")}
            </time>
          ) : null}
        </div>

        <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-tight">
          <Link href={noteHref} className="hover:underline underline-offset-4">
            {note.title}
          </Link>
        </h2>

        {note.lede ? (
          <p className="mt-4 text-base md:text-lg leading-relaxed opacity-80">
            {truncate(note.lede, ledeMax)}
          </p>
        ) : null}

        <div className="mt-6">
          <Link
            href={noteHref}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
          >
            Read Field Note <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {noteImgUrl ? (
        <Link href={noteHref} aria-label={note.title} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={noteImgUrl}
            alt=""
            className={`w-full border-t border-black/10 object-cover ${imageHeight}`}
          />
        </Link>
      ) : null}
    </article>
  )
}

export default async function HomePage() {
  const data = await client.fetch<HomeData>(homeQuery)

  const lead = data.leadEssay

  const LEAD_EXCERPT_MAX = 1000
  const NOTE_LEDE_MAX = 300

  const leadExcerpt = lead
    ? truncate(
        (lead.preview && lead.preview.trim()) ||
          (lead.dek && lead.dek.trim()) ||
          firstParagraphText(lead.body),
        LEAD_EXCERPT_MAX
      )
    : ""

  const leadKicker = (lead?.section?.title && lead.section.title) || "Lead Essay"

  const notes = data.latestFieldNotes ?? []
  const featuredNote = notes[0] ?? null

  const signals = data.publishedSignals?.slice(0, 13) ?? []

  const essayTime = toTime(lead?.publishedAt)
  const noteTime = toTime(featuredNote?.publishedAt)
  const newestIsFieldNote = noteTime > essayTime

  const editionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const picked = pickTwoUniqueDeterministic(data.artifactPool, editionDate)
  const a1 = picked[0]
  const a2 = picked[1]

  return (
    <main className="mx-auto max-w-[1440px] px-10 pb-16">
      {/* Masthead / edition header */}
      <header className="pt-8 pb-5">
        <div className="mb-5 h-[30px] w-full bg-[#D64B2A]" />

        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
            Edition {editionDate}
          </p>

          <Link
            href="/essays/the-view-from-the-middle"
            className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-90"
          >
            Read the manifesto →
          </Link>
        </div>
      </header>

      {/* Magazine grid */}
      <section className="mt-8 border-b border-black/10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left rail: Signals */}
          <aside className="lg:col-span-3 order-2 lg:order-1 flex flex-col h-full">
            <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-5 h-full">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                  Signals
                </h3>
                <Link
                  href="/signals"
                  className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-90"
                >
                  View all →
                </Link>
              </div>

              {signals.length ? (
                <ul className="mt-4 space-y-3">
                  {signals.map((s) => (
                    <li
                      key={s._id}
                      className="border-b border-black/5 pb-3 last:border-b-0 last:pb-0"
                    >
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex gap-3 hover:underline underline-offset-4"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg border border-black/10 bg-white flex items-center justify-center overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              s.sourceDomain
                                ? `https://www.google.com/s2/favicons?domain=${s.sourceDomain}&sz=64`
                                : faviconUrl(s.url)
                            }
                            alt=""
                            className="h-6 w-6"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-medium leading-snug line-clamp-2">
                            {s.headline}
                          </div>

                          <div className="mt-1 text-[11px] text-black/60 flex gap-2 flex-wrap items-center">
                            {s.source ? (
                              <span className="truncate max-w-[12rem]">{s.source}</span>
                            ) : null}

                            <span className="opacity-60">•</span>
                            <span className="uppercase tracking-[0.15em] opacity-70">
                              {s.pillar}
                            </span>

                            {s.civicTag ? (
                              <>
                                <span className="opacity-60">•</span>
                                <span className="uppercase tracking-[0.12em] opacity-70">
                                  {s.civicTag}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm opacity-70">
                  No published signals yet. Publish a few from the Morning Queue in Sanity.
                </p>
              )}
            </section>
          </aside>

          {/* Center well: strict edition (two stories only), newest on top */}
          <section className="lg:col-span-6 order-1 lg:order-2 flex flex-col space-y-8">
            {newestIsFieldNote ? (
              <>
                <FieldNoteCard note={featuredNote} featured ledeMax={NOTE_LEDE_MAX} imageHeight="h-80 md:h-128" />
                <EssayCard lead={lead} leadKicker={leadKicker} leadExcerpt={leadExcerpt} imageHeight="h-40 md:h-63" />
              </>
            ) : (
              <>
                <EssayCard lead={lead} leadKicker={leadKicker} leadExcerpt={leadExcerpt} featured imageHeight="h-96 md:h-128" />
                <FieldNoteCard note={featuredNote} ledeMax={NOTE_LEDE_MAX} imageHeight="h-40 md:h-63" />
              </>
            )}
          </section>

          {/* Right rail: two deterministic artifacts + Submissions + Respond */}
          <aside className="lg:col-span-3 order-3 flex flex-col h-full">
            <div className="h-full flex flex-col space-y-6">
              {a1 ? <SpotlightCard a={a1} /> : null}
              {a2 ? <SpotlightCard a={a2} /> : null}

              {/* Submissions */}
              <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-5">
                <h3 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                  Submissions
                </h3>

                <p className="mt-2 text-sm opacity-75 leading-relaxed">
                  Have an essay you want considered for{" "}
                  <span className="font-semibold">The American Piedmont</span>? We’re looking for
                  tangible stories about the battle for collective memory.
                </p>

                <ul className="mt-4 space-y-2 text-sm opacity-80">
                  <li>• Send a link (Google Doc is fine) or paste.</li>
                  <li>• Include a 2–3 sentence pitch + brief bio.</li>
                  <li>• If it’s time-sensitive, say so in the subject.</li>
                </ul>

                <a
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
                  href="mailto:rick@theamericanpiedmont.com?subject=Submission%20to%20The%20American%20Piedmont&body=Hi%20Rick%2C%0A%0ATitle%3A%20%0AFormat%3A%20Essay%20%7C%20Field%20Note%20%7C%20Marginalia%0AWord%20count%3A%20%0AWhy%20this%20matters%20(now)%3A%20%0A%0ALink%20to%20draft%3A%20%0A%0ABio%20(2%E2%80%933%20sentences)%3A%20%0A%0AThanks%2C%0A"
                >
                  Submit an essay <span aria-hidden>→</span>
                </a>

                <p className="mt-3 text-xs opacity-60">
                  Note: submissions may be edited for clarity and length. We can’t respond to
                  every pitch.
                </p>
              </section>

              {/* Respond */}
              <section className="mt-auto rounded-2xl border border-black/10 bg-white/60 shadow-sm p-5">
                <h3 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                  Respond
                </h3>
                <p className="mt-2 text-sm opacity-75 leading-relaxed">
                  Thoughtful replies welcome. Tell us what you think about our work, or where
                  you&apos;d like us to go.
                </p>
                <a
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-white/80"
                  href="mailto:rick@theamericanpiedmont.com?subject=Letter%20to%20TAP"
                >
                  Write a letter <span aria-hidden>→</span>
                </a>
              </section>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}