import Link from "next/link"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { formatShortISO, labelize } from "@/lib/format"

export const revalidate = 60

type ArtifactListItem = {
  _id: string
  title: string
  slug: string
  artifactType?: string
  pillar?: "crease" | "present" | "future"
  civicTag?: string
  summary?: string
  dateDiscovered?: string
  _createdAt?: string
  heroImage?: any
}

const ARTIFACTS_INDEX_QUERY = /* groq */ `
*[_type == "artifact" && status == "published" && defined(slug.current)]
| order(coalesce(dateDiscovered, _createdAt) desc){
  _id,
  title,
  "slug": slug.current,
  artifactType,
  pillar,
  civicTag,
  summary,
  dateDiscovered,
  _createdAt,
  heroImage
}
`

export default async function ArtifactsPage() {
  const artifacts = await client.fetch<ArtifactListItem[]>(ARTIFACTS_INDEX_QUERY)

  return (
    <main className="mx-auto max-w-[1440px] px-10 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
          Archive
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">Artifacts</h1>
        <p className="mt-3 max-w-2xl text-base opacity-80">
          Primary-source evidence and supporting materials used across TAP essays and field notes.
        </p>
      </header>

      {artifacts?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {artifacts.map((a) => {
            const imgUrl = a.heroImage
              ? urlFor(a.heroImage).width(900).height(650).fit("crop").quality(80).url()
              : null

            const date = a.dateDiscovered || a._createdAt

            return (
              <Link
                key={a._id}
                href={`/artifacts/${a.slug}`}
                aria-label={`Open artifact: ${a.title}`}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-sm transition hover:shadow-md"
              >
                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgUrl}
                    alt={a.title || "Artifact image"}
                    className="h-48 w-full object-cover border-b border-black/10"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-48 w-full bg-black/5 border-b border-black/10" />
                )}

                <div className="p-5">
                  {/* Top meta line (matches Field Notes archive) */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black/60">
                    <span className="uppercase tracking-[0.2em]">Artifact</span>

                    {date ? <span>•</span> : null}

                    {date ? (
                      <time dateTime={date}>
                        {formatShortISO(date)}
                      </time>
                    ) : null}
                  </div>

                  <h2 className="mt-2 font-serif text-2xl leading-tight group-hover:underline underline-offset-4">
                    {a.title}
                  </h2>

                  {/* Pills (keep them, but make them match the TAP vibe) */}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] opacity-70">
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

                  {a.summary ? (
                    <p className="mt-3 text-sm leading-relaxed opacity-80 line-clamp-3">
                      {a.summary}
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
            No published artifacts yet. Set <code>status</code> to{" "}
            <code>published</code> in Sanity and publish your first one.
          </p>
        </section>
      )}
    </main>
  )
}