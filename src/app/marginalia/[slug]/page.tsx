import { client } from "@/sanity/lib/client"

export const dynamic = "force-dynamic"

type MarginaliaPost = {
  title: string
  publishedAt?: string
  section?: { title?: string; slug?: string }
  items: Array<{ headline: string; url: string; source?: string; note?: string }>
}

async function getMarginalia(slug: string): Promise<MarginaliaPost | null> {
  return client.fetch(
    /* groq */ `*[
      _type == "marginalia" &&
      slug.current == $slug
    ][0]{
      title,
      publishedAt,
      "section": section->{title, "slug": slug.current},
      items[]{
        headline,
        url,
        source,
        note
      }
    }`,
    { slug }
  )
}

export default async function MarginaliaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getMarginalia(slug)

  if (!post) return null

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/60">
          <span className="uppercase tracking-[0.2em] opacity-80">
            Marginalia
          </span>
          {post.section?.title ? <span>•</span> : null}
          {post.section?.title ? (
            <span className="uppercase tracking-[0.2em] opacity-60">
              {post.section.title}
            </span>
          ) : null}
          {post.publishedAt ? <span>•</span> : null}
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          ) : null}
        </div>

        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
          {post.title}
        </h1>
      </header>

      <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-6">
        <div className="space-y-5">
          {(post.items ?? []).map((it, idx) => (
            <div key={idx} className="border-b border-black/5 pb-5 last:border-b-0 last:pb-0">
              <a
                className="text-base font-semibold underline underline-offset-4"
                href={it.url}
                target="_blank"
                rel="noreferrer"
              >
                {it.headline}
              </a>
              {it.source ? (
                <div className="mt-1 text-xs text-black/60">{it.source}</div>
              ) : null}
              {it.note ? (
                <p className="mt-2 text-sm opacity-80 leading-relaxed">
                  {it.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-black/10 pt-6">
        <a
          className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
          href="/marginalia"
        >
          ← Back to Marginalia
        </a>
        <p className="mt-6 text-xs opacity-60">The American Piedmont™</p>
      </footer>
    </main>
  )
}