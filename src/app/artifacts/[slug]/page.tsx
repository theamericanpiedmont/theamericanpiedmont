import Link from "next/link"
import {notFound} from "next/navigation"
import {client} from "@/sanity/lib/client"
import imageUrlBuilder from "@sanity/image-url"

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

export const revalidate = 60

type UsedInItem = {
  _id: string
  title: string
  slug: string
  publishedAt?: string
}

type ArtifactDetail = {
  _id: string
  title: string
  slug: string
  status: "draft" | "published" | "rejected"
  artifactType: string
  pillar?: "crease" | "present" | "future"
  civicTag?: string
  summary?: string
  provenance?: string
  archiveRef?: string
  sourceUrl?: string
  dateCreated?: string
  dateDiscovered?: string
  heroImage?: any
  heroFile?: any
  transcription?: string
  keyExcerpt?: string
  _createdAt?: string
}

const artifactDetailQuery = `
{
  "artifact": *[_type == "artifact" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    status,
    artifactType,
    pillar,
    civicTag,
    summary,
    provenance,
    archiveRef,
    sourceUrl,
    dateCreated,
    dateDiscovered,
    heroImage,
    heroFile,
    transcription,
    keyExcerpt,
    _createdAt
  },

  "usedInEssays": *[_type == "essay" && references(^.artifact._id)] | order(publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    publishedAt
  },

  "usedInFieldNotes": *[_type == "fieldNote" && references(^.artifact._id)] | order(publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    publishedAt
  }
}
`

function labelize(value?: string) {
  if (!value) return ""
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function ArtifactPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params

  if (!slug) notFound()

  const data = await client.fetch<{
    artifact: ArtifactDetail | null
    usedInEssays: UsedInItem[]
    usedInFieldNotes: UsedInItem[]
  }>(artifactDetailQuery, {slug})

  const artifact = data?.artifact
  if (!artifact) notFound()

  // public: only published artifacts
  if (artifact.status !== "published") notFound()

  const imgUrl = artifact.heroImage
    ? urlFor(artifact.heroImage).width(2000).quality(85).url()
    : null

  return (
    <main className="mx-auto max-w-[1440px] px-10 py-10">
      <header className="mb-6">
        <div className="mb-3 flex flex-wrap gap-2 text-xs opacity-80">
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

        <h1 className="font-serif text-4xl leading-tight">{artifact.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm opacity-70">
          {artifact.dateCreated ? <span>Created: {artifact.dateCreated}</span> : null}
          {artifact.dateDiscovered ? <span>Discovered: {artifact.dateDiscovered}</span> : null}
          {!artifact.dateDiscovered && artifact._createdAt ? (
            <span>Added: {new Date(artifact._createdAt).toISOString().slice(0, 10)}</span>
          ) : null}
        </div>

        {artifact.sourceUrl ? (
          <div className="mt-4">
            <a
              href={artifact.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm shadow-sm hover:shadow"
            >
              Read source <span aria-hidden>↗</span>
            </a>
          </div>
        ) : null}
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            {imgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgUrl}
                alt={artifact.title}
                className="w-full rounded-xl border border-black/10 object-contain"
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-xl bg-black/5 text-sm opacity-70">
                No image attached.
              </div>
            )}

            {artifact.summary ? (
              <div className="mt-5">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                  What this is
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{artifact.summary}</p>
              </div>
            ) : null}

            {artifact.keyExcerpt ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                  Key excerpt
                </h2>
                <p className="mt-3 whitespace-pre-wrap rounded-xl border border-black/10 bg-black/5 p-4 text-sm">
                  {artifact.keyExcerpt}
                </p>
              </div>
            ) : null}

            {artifact.provenance ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                  Provenance
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{artifact.provenance}</p>
              </div>
            ) : null}

            {artifact.archiveRef ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                  Archive reference
                </h2>
                <p className="mt-2 text-sm opacity-80">{artifact.archiveRef}</p>
              </div>
            ) : null}

            {artifact.transcription ? (
              <details className="mt-6 rounded-xl border border-black/10 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Transcription
                </summary>
                <p className="mt-3 whitespace-pre-wrap text-sm opacity-80">{artifact.transcription}</p>
              </details>
            ) : null}
          </div>
        </section>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
              Used in
            </h2>

            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Essays
              </h3>
              {data.usedInEssays?.length ? (
                <ul className="mt-2 space-y-2">
                  {data.usedInEssays.map((e) => (
                    <li key={e._id}>
                      <Link href={`/essays/${e.slug}`} className="text-sm underline-offset-4 hover:underline">
                        {e.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm opacity-70">Not referenced in any essays yet.</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Field Notes
              </h3>
              {data.usedInFieldNotes?.length ? (
                <ul className="mt-2 space-y-2">
                  {data.usedInFieldNotes.map((f) => (
                    <li key={f._id}>
                      <Link
                        href={`/daily/${f.slug}`}
                        className="text-sm underline-offset-4 hover:underline"
                      >
                        {f.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm opacity-70">Not referenced in any field notes yet.</p>
              )}
            </div>

            <div className="mt-8">
              <Link href="/artifacts" className="text-sm underline-offset-4 hover:underline">
                ← Back to all artifacts
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}