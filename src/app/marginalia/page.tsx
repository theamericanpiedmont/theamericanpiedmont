import Link from "next/link"
import { client } from "@/sanity/lib/client"

export const dynamic = "force-dynamic"

type MarginaliaListItem = {
  _id: string
  title: string
  slug: string
  publishedAt?: string
  section?: { title?: string; slug?: string }
  items?: Array<{ headline: string; url: string; source?: string; note?: string }>
}

const marginaliaIndexQuery = /* groq */ `
*[
  _type == "marginalia" &&
  defined(publishedAt) &&
  defined(slug.current)
] | order(publishedAt desc)[0...50]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  "section": section->{title, "slug": slug.current},
  items[]{
    headline,
    url,
    source,
    note
  }
}
`

export default async function MarginaliaIndexPage() {
  const posts = await client.fetch<MarginaliaListItem[]>(marginaliaIndexQuery)

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16">
      <header className="pt-8 pb-6 border-b border-black/10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
          Marginalia
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
          Notes in the margins.
        </h1>
        <p className="mt-3 max-w-3xl text-sm opacity-75">
          Curated links with commentary — signals worth tracking.
        </p>
      </header>

      {!posts?.length ? (
        <section className="mt-10 rounded-2xl border border-black/10 bg-white/60 shadow-sm p-6">
          <p className="opacity-80">
            No Marginalia posts yet. Publish one in Sanity (with a{" "}
            <code>publishedAt</code> date) and it will appear here.
          </p>
        </section>
      ) : (
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main list */}
          <div className="lg:col-span-8 space-y-6">
            {posts.map((m) => (
              <article
                key={m._id}
                className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-6"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/60">
                  {m.section?.title ? (
                    <span className="uppercase tracking-[0.2em] opacity-80">
                      {m.section.title}
                    </span>
                  ) : (
                    <span className="uppercase tracking-[0.2em] opacity-80">
                      Marginalia
                    </span>
                  )}
                  {m.publishedAt ? <span>•</span> : null}
                  {m.publishedAt ? (
                    <time dateTime={m.publishedAt}>
                      {new Date(m.publishedAt).toLocaleDateString()}
                    </time>
                  ) : null}
                </div>

                <h2 className="mt-3 font-serif text-2xl leading-snug md:text-3xl">
                  <Link
                    href={`/marginalia/${m.slug}`}
                    className="hover:underline underline-offset-4"
                  >
                    {m.title}
                  </Link>
                </h2>

                {/* preview: show first 2 headlines */}
                {m.items?.length ? (
                  <div className="mt-4 space-y-2">
                    {m.items.slice(0, 2).map((it, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="opacity-60 mr-2">•</span>
                        <span className="font-medium">{it.headline}</span>
                        {it.source ? (
                          <span className="opacity-60"> — {it.source}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5">
                  <Link
                    href={`/marginalia/${m.slug}`}
                    className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
                  >
                    Read this Marginalia →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Right rail */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-5">
                <h3 className="text-lg font-semibold">Start here</h3>
                <p className="mt-2 text-sm opacity-75 leading-relaxed">
                  Marginalia is how TAP shows its work — what we're reading, why
                  it matters, and the patterns that connect it all.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-white/80"
                >
                  Back to the front page <span aria-hidden>→</span>
                </Link>
              </section>

              <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-5">
                <h3 className="text-lg font-semibold">Send a signal</h3>
                <p className="mt-2 text-sm opacity-75 leading-relaxed">
                  Got a link we should see?
                </p>
                <a
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
                  href="mailto:rick@theamericanpiedmont.com?subject=Marginalia%20signal%20for%20TAP&body=Here%27s%20a%20link%20worth%20watching%3A%0A%0AWhy%20it%20matters%3A%0A"
                >
                  Email a link <span aria-hidden>→</span>
                </a>
              </section>

              <p className="text-xs opacity-60">The American Piedmont™</p>
            </div>
          </aside>
        </section>
      )}
    </main>
  )
}