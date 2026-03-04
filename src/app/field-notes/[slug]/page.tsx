import Link from "next/link"
import imageUrlBuilder from "@sanity/image-url"
import { PortableText } from "@portabletext/react"
import type { PortableTextComponents } from "@portabletext/react"
import { notFound } from "next/navigation"
import { client } from "@/sanity/lib/client"
import { formatLongDate, labelize } from "@/lib/format"

export const revalidate = 60

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

type ArtifactRef = {
  _id: string
  title: string
  slug: string
  artifactType?: string
  pillar?: "crease" | "present" | "future"
  civicTag?: string
  summary?: string
  heroImage?: any
}

type FieldNote = {
  _id: string
  title: string
  lede?: string
  publishedAt?: string
  heroImage?: any
  thumbnail?: any
  body?: any[]
  authors?: Array<{ name: string }>
  section?: { title: string; slug: string }
  artifacts?: ArtifactRef[]
  pullQuote?: string
  pullQuoteAttribution?: string
}

const fieldNoteBySlugQuery = `
*[
  _type == "fieldNote" &&
  defined(slug.current) &&
  slug.current == $slug &&
  !(_id in path("drafts.**"))
][0]{
  _id,
  title,
  publishedAt,
  lede,
  heroImage,
  thumbnail,
  body,

  pullQuote,
  pullQuoteAttribution,

  "authors": authors[]-> {name},
  "section": section-> {title, "slug": slug.current},

  "artifacts": artifacts[]->{
    _id,
    title,
    "slug": slug.current,
    artifactType,
    pillar,
    civicTag,
    summary,
    heroImage
  }
}
`

function isParagraphBlock(block: any) {
  return (
    block &&
    block._type === "block" &&
    (!block.style || block.style === "normal") &&
    Array.isArray(block.children) &&
    block.children.some((c: any) => c?._type === "span" && typeof c.text === "string" && c.text.trim())
  )
}

/**
 * Inserts a "pull quote block" roughly halfway through the body,
 * at a paragraph break. We count paragraph blocks (normal blocks),
 * then insert after the halfway paragraph.
 */
function insertPullQuote(body: any[] | undefined, pullQuote?: string, attribution?: string) {
  const quote = (pullQuote || "").trim()
  if (!quote || !Array.isArray(body) || body.length === 0) return body ?? []

  const paragraphIndexes: number[] = []
  body.forEach((b, idx) => {
    if (isParagraphBlock(b)) paragraphIndexes.push(idx)
  })

  if (paragraphIndexes.length < 2) return body // not enough structure to "halfway" nicely

  const halfwayParagraph = Math.floor(paragraphIndexes.length / 2)
  const insertAfterIndex = paragraphIndexes[halfwayParagraph]

  const pullQuoteBlock = {
    _type: "tapPullQuote",
    quote,
    attribution: (attribution || "").trim(),
  }

  const next = body.slice()
  next.splice(insertAfterIndex + 1, 0, pullQuoteBlock)
  return next
}

const portableTextComponents: PortableTextComponents = {
  types: {
    tapPullQuote: ({ value }: any) => {
      const quote = value?.quote
      const attribution = value?.attribution
      if (!quote) return null

      return (
        <figure className="my-20 text-center">
          <blockquote className="mx-auto max-w-2xl text-2xl md:text-3xl leading-snug italic font-light tracking-tight">
            “{quote}”
          </blockquote>

          {attribution ? (
            <figcaption className="mt-6 text-xs tracking-[0.2em] uppercase opacity-60">
              {attribution}
            </figcaption>
          ) : null}
        </figure>
      )
    },
  },

  // ✅ Ensure PortableText links render as <a> and let CSS handle underline-only styling
  marks: {
    link: ({ value, children }) => {
      const href = value?.href as string | undefined
      const isExternal = href ? /^https?:\/\//i.test(href) : false

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      )
    },
  },
}

function canonicalFor(slug: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://theamericanpiedmont.com").replace(/\/$/, "")
  return `${base}/field-notes/${slug}`
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string }
}) {
  const rawSlug = params?.slug ?? ""
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ""
  if (!slug) return {}

  const note = await client.fetch<{
    title?: string
    lede?: string
  }>(fieldNoteBySlugQuery, { slug })

  if (!note?.title) return {}

  const title = `${note.title} — The American Piedmont`
  const description = note.lede || "A field note from The American Piedmont."

  return {
    title,
    description,
    alternates: { canonical: canonicalFor(slug) },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalFor(slug),
    },
  }
}

export default async function FieldNotePage(props: {
  params: { slug?: string } | Promise<{ slug?: string }>
}) {
  const params = await Promise.resolve(props.params)
  const rawSlug = params?.slug ?? ""
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ""

  if (!slug) notFound()

  const note = await client.fetch<FieldNote>(fieldNoteBySlugQuery, { slug })
  if (!note?._id) notFound()

  const featuredImage = note.heroImage ?? note.thumbnail
  const imgUrl = featuredImage ? urlFor(featuredImage).width(1400).quality(80).url() : null

  const bodyWithPullQuote = insertPullQuote(note.body, note.pullQuote, note.pullQuoteAttribution)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        {note.section?.title ? (
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
            {note.section.title}
          </p>
        ) : null}

        <h1 className="mt-3 font-serif text-4xl leading-tight">{note.title}</h1>

        {note.lede ? <p className="mt-3 text-lg opacity-80">{note.lede}</p> : null}

        {note.publishedAt ? (
          <p className="mt-2 text-xs tracking-[0.18em] uppercase opacity-60">
            {formatLongDate(note.publishedAt)}
          </p>
        ) : null}

        {note.authors?.length ? (
          <p className="mt-4 text-sm opacity-70">
            By {note.authors.map((a) => a.name).join(", ")}
          </p>
        ) : null}
      </header>

      {imgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt=""
          className="mb-8 w-full rounded-xl border border-black/10"
        />
      ) : null}

      {bodyWithPullQuote?.length ? (
        <article className="tap-article">
          <PortableText value={bodyWithPullQuote} components={portableTextComponents} />
        </article>
      ) : (
        <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-6">
          <p className="opacity-80">
            This field note doesn’t have a body yet. Add content in Sanity (the <code>body</code>{" "}
            field).
          </p>
        </section>
      )}

      {/* ✅ Evidence layer */}
      {note.artifacts?.length ? (
        <section className="mt-14 border-t border-black/10 pt-8">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
            Evidence used in this story
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {note.artifacts.map((a) => {
              const artifactImgUrl = a.heroImage
                ? urlFor(a.heroImage).width(900).height(650).quality(80).url()
                : null

              return (
                <Link
                  key={a._id}
                  href={`/artifacts/${a.slug}`}
                  className="group rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {artifactImgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artifactImgUrl}
                      alt={a.title}
                      className="mb-3 h-40 w-full rounded-lg border border-black/10 object-cover"
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

                  <h3 className="mt-2 font-serif text-lg leading-snug group-hover:underline">
                    {a.title}
                  </h3>

                  {a.summary ? (
                    <p className="mt-2 line-clamp-3 text-sm opacity-80">{a.summary}</p>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      <p className="mt-12 border-t border-black/10 pt-6 text-sm opacity-80">
        <span role="img" aria-label="Mail">
          ✉️
        </span>{" "}
        Respond to this field note at{" "}
        <a
          href={`mailto:rick@theamericanpiedmont.com?subject=${encodeURIComponent(
            `Response to ${note.title}`
          )}`}
          className="underline underline-offset-4"
        >
          rick@theamericanpiedmont.com
        </a>
        .
      </p>
    </main>
  )
}