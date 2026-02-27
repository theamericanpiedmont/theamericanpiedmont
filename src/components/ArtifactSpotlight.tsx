import Link from "next/link"
import {client} from "@/sanity/lib/client"
import imageUrlBuilder from "@sanity/image-url"

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

type ArtifactSpotlightItem = {
  _id: string
  title: string
  slug: string
  artifactType?: string
  pillar?: "crease" | "present" | "future"
  civicTag?: string
  summary?: string
  heroImage?: any
}

const latestArtifactQuery = `
*[_type == "artifact" && status == "published"]
| order(coalesce(dateDiscovered, _createdAt) desc)[0]{
  _id,
  title,
  "slug": slug.current,
  artifactType,
  pillar,
  civicTag,
  summary,
  heroImage
}
`

function labelize(value?: string) {
  if (!value) return ""
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function ArtifactSpotlight() {
  const artifact = await client.fetch<ArtifactSpotlightItem | null>(latestArtifactQuery)

  if (!artifact?.slug) return null

  const imgUrl = artifact.heroImage
    ? urlFor(artifact.heroImage).width(900).height(650).quality(80).url()
    : null

  return (
    <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
          Artifact Spotlight
        </h2>
        <Link href="/artifacts" className="text-xs underline underline-offset-4 opacity-70">
          All
        </Link>
      </div>

      <Link href={`/artifacts/${artifact.slug}`} className="group block">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt={artifact.title}
            className="mb-3 h-40 w-full rounded-lg border border-black/10 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-black/5 text-xs opacity-70">
            No image
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-[11px] opacity-70">
          {artifact.pillar ? (
            <span className="rounded-full border border-black/10 px-2 py-0.5">
              {labelize(artifact.pillar)}
            </span>
          ) : null}
          {artifact.civicTag ? (
            <span className="rounded-full border border-black/10 px-2 py-0.5">
              {artifact.civicTag}
            </span>
          ) : null}
          {artifact.artifactType ? (
            <span className="rounded-full border border-black/10 px-2 py-0.5">
              {labelize(artifact.artifactType)}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 font-serif text-lg leading-snug group-hover:underline">
          {artifact.title}
        </h3>

        {artifact.summary ? (
          <p className="mt-2 line-clamp-3 text-sm opacity-80">{artifact.summary}</p>
        ) : null}
      </Link>
    </section>
  )
}