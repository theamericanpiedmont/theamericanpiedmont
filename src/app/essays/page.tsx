import Link from "next/link"
import imageUrlBuilder from "@sanity/image-url"
import { client } from "@/sanity/lib/client"
import { essaysIndexQuery } from "@/sanity/lib/queries"
import { formatShortISO } from "@/lib/format"

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

export const revalidate = 60

export const metadata = {
  title: "Essays — The American Piedmont",
  description: "Deep narrative reporting across Crease, Present, and Future.",
}

type EssayCard = {
  _id: string
  title: string
  slug: string
  publishedAt?: string
  dek?: string
  preview?: string
  heroImage?: any
  section?: { title?: string; slug?: string }
}

export default async function EssaysIndexPage() {
  const essays = await client.fetch<EssayCard[]>(essaysIndexQuery)

  return (
    <main className="mx-auto max-w-[1440px] px-10 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
          Archive
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">Essays</h1>
        <p className="mt-3 max-w-2xl text-base opacity-80">
          Deep narrative work — the long arc of the Piedmont: Crease, Present, Future.
        </p>
      </header>

      {essays?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {essays.map((e) => {
            const imgUrl = e.heroImage
              ? urlFor(e.heroImage).width(900).height(650).fit("crop").quality(80).url()
              : null

            return (
              <Link
                key={e._id}
                href={`/essays/${e.slug}`}
                aria-label={`Read essay: ${e.title}`}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-sm transition hover:shadow-md"
              >
                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgUrl}
                    alt={e.title || "Essay image"}
                    className="h-48 w-full object-cover border-b border-black/10"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-48 w-full bg-black/5 border-b border-black/10" />
                )}

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black/60">
                    <span className="uppercase tracking-[0.2em]">
                      {e.section?.title ? e.section.title : "Essay"}
                    </span>

                    {e.publishedAt ? <span>•</span> : null}

                    {e.publishedAt ? (
                      <time dateTime={e.publishedAt}>
                        {formatShortISO(e.publishedAt)}
                      </time>
                    ) : null}
                  </div>

                  <h2 className="mt-2 font-serif text-2xl leading-tight group-hover:underline underline-offset-4">
                    {e.title}
                  </h2>

                  {e.dek ? (
                    <p className="mt-3 text-sm leading-relaxed opacity-80 line-clamp-3">
                      {e.dek}
                    </p>
                  ) : e.preview ? (
                    <p className="mt-3 text-sm leading-relaxed opacity-80 line-clamp-3">
                      {e.preview}
                    </p>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-6">
          <p className="opacity-80">
            No published essays yet. Add a <code>publishedAt</code> date in Sanity and publish your first one.
          </p>
        </section>
      )}
    </main>
  )
}