import { client } from "@/sanity/lib/client"
import { signalsIndexQuery } from "@/sanity/lib/queries"
import { formatShortISO, labelize } from "@/lib/format"

export const revalidate = 60

export const metadata = {
  title: "Signals — The American Piedmont",
  description:
    "Incoming data. The queue. The pulse. Curated signals across Crease, Present, Future.",
}

type Signal = {
  _id: string
  headline: string
  url: string
  source?: string
  sourceDomain?: string
  pillar?: string
  civicTag?: string
  score?: number
  publishedAt?: string
}

function faviconSrc(s: Signal) {
  if (s.sourceDomain) {
    return `https://www.google.com/s2/favicons?domain=${s.sourceDomain}&sz=64`
  }
  try {
    const u = new URL(s.url)
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`
  } catch {
    return ""
  }
}

export default async function SignalsPage() {
  const signals = await client.fetch<Signal[]>(signalsIndexQuery)

  return (
    <main className="mx-auto max-w-[1440px] px-10 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
          Archive
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">Signals</h1>
        <p className="mt-3 max-w-2xl text-base opacity-80">
          Curated incoming links and notes — the newsroom intake for the Piedmont’s power and memory.
        </p>
      </header>

      {signals?.length ? (
        <div className="grid gap-4">
          {signals.map((s) => {
            const icon = faviconSrc(s)
            const date = s.publishedAt

            return (
              <a
                key={s._id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-black/10 bg-white/60 shadow-sm transition hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* favicon */}
                    <div className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
                      {icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" src={icon} className="h-8 w-8" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* meta line */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black/60">
                        <span className="uppercase tracking-[0.2em]">Signal</span>

                        {s.source ? <span>•</span> : null}
                        {s.source ? <span>{s.source}</span> : null}

                        {date ? <span>•</span> : null}
                        {date ? (
                          <time dateTime={date}>{formatShortISO(date)}</time>
                        ) : null}

                        {typeof s.score === "number" ? <span>•</span> : null}
                        {typeof s.score === "number" ? <span>score {s.score}</span> : null}
                      </div>

                      {/* headline */}
                      <h2 className="mt-2 font-serif text-2xl leading-tight group-hover:underline underline-offset-4">
                        {s.headline}
                      </h2>

                      {/* chips */}
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] opacity-70">
                        {s.pillar ? (
                          <span className="rounded-full border border-black/10 px-2 py-0.5">
                            {labelize(s.pillar)}
                          </span>
                        ) : null}
                        {s.civicTag ? (
                          <span className="rounded-full border border-black/10 px-2 py-0.5">
                            {s.civicTag}
                          </span>
                        ) : null}

                        {/* optional hint that it opens externally */}
                        <span className="rounded-full border border-black/10 px-2 py-0.5">
                          Opens ↗
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      ) : (
        <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-6">
          <p className="opacity-80">
            No published signals yet. Publish a few <code>marginaliaSignal</code> items in Sanity
            and they’ll appear here.
          </p>
        </section>
      )}
    </main>
  )
}