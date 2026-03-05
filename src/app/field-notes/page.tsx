import Link from "next/link"
import imageUrlBuilder from "@sanity/image-url"
import { client } from "@/sanity/lib/client"
import { formatShortISO } from "@/lib/format"

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

export const revalidate = 60

type FieldNoteListItem = {
  _id: string
  title: string
  slug: string
  publishedAt?: string
  lede?: string
  heroImage?: any
  thumbnail?: any
  section?: { title: string; slug: string }
}

const fieldNotesIndexQuery = `
*[
  _type == "fieldNote" &&
  defined(publishedAt) &&
  defined(slug.current) &&
  !(_id in path("drafts.**"))
]
| order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  lede,
  heroImage,
  thumbnail,
  "section": section->{title, "slug": slug.current}
}
`

export default async function FieldNotesIndexPage() {
  const notes = await client.fetch<FieldNoteListItem[]>(fieldNotesIndexQuery)

  return (
    <main className="mx-auto max-w-[1440px] px-10 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
          Archive
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">Field Notes</h1>
        <p className="mt-3 max-w-2xl text-base opacity-80">
          Reporting-in-progress and lived observations — fast, grounded, and documented.
        </p>
      </header>

      {notes?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => {
            const img = n.heroImage ?? n.thumbnail
            const imgUrl = img
              ? urlFor(img).width(900).height(650).fit("crop").quality(80).url()
              : null

            return (
              <Link
                key={n._id}
                href={`/field-notes/${n.slug}`}
                aria-label={`Read field note: ${n.title}`}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-sm transition hover:shadow-md"
              >
                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgUrl}
                    alt={n.title || "Field note image"}
                    className="h-48 w-full object-cover border-b border-black/10"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-48 w-full bg-black/5 border-b border-black/10" />
                )}

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black/60">
                    <span className="uppercase tracking-[0.2em]">Field Note</span>

                    {n.publishedAt ? <span>•</span> : null}

                    {n.publishedAt ? (
  <time dateTime={n.publishedAt}>
    {formatShortISO(n.publishedAt)}
  </time>
) : null}
                  </div>

                  <h2 className="mt-2 font-serif text-2xl leading-tight group-hover:underline underline-offset-4">
                    {n.title}
                  </h2>

                  {n.lede ? (
                    <p className="mt-3 text-sm leading-relaxed opacity-80 line-clamp-3">
                      {n.lede}
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
            No published field notes yet. Add a <code>publishedAt</code> date in Sanity and
            publish your first one.
          </p>
        </section>
      )}
    </main>
  )
}