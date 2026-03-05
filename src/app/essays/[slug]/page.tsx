// src/app/essays/[slug]/page.tsx
import Link from "next/link"
import { notFound } from "next/navigation"
import { PortableText } from "@portabletext/react"
import type { PortableTextComponents } from "@portabletext/react"
import imageUrlBuilder from "@sanity/image-url"
import { client } from "@/sanity/lib/client"
import { essayBySlugQuery } from "@/sanity/lib/queries"
import { formatLongDate, labelize } from "../../../lib/format"

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

  heroImageUrl?: string
  heroFileUrl?: string
  sourceUrl?: string
  transcription?: string
  keyExcerpt?: string
  provenance?: string
  archiveRef?: string
  dateCreated?: string
  dateDiscovered?: string
}

type Essay = {
  title: string
  dek?: string
  publishedAt?: string
  heroImage?: any
  body: any[]
  authors?: Array<{ name: string }>
  section?: { title: string; slug: string }
  artifacts?: ArtifactRef[]
}

function canonicalFor(slug: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://theamericanpiedmont.com").replace(
    /\/$/,
    ""
  )
  return `${base}/essays/${slug}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const resolved = await Promise.resolve(params)
  const slug = decodeURIComponent(resolved.slug || "")
  if (!slug) return {}

  const essay = await client.fetch<Pick<Essay, "title" | "dek" | "publishedAt">>(essayBySlugQuery, {
    slug,
  })
  if (!essay?.title) return {}

  const title = `${essay.title} — The American Piedmont`
  const description = essay.dek || "An essay from The American Piedmont."

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

/**
 * PortableText renderers
 */
const portableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href as string | undefined
      const isExternal = href ? /^https?:\/\//i.test(href) : false

      return (
        <a
          href={href}
          className="underline underline-offset-2 hover:decoration-2"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      )
    },
  },


  
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 scroll-mt-24 font-serif text-2xl leading-snug">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 scroll-mt-24 font-serif text-xl leading-snug">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-black/20 pl-5 italic opacity-90">
        {children}
      </blockquote>
    ),

    // NEW: indented narrative quote
  quoteIndent: ({ children }) => (
  <blockquote className="my-8 border-l border-black/10 pl-5 text-[18px] leading-relaxed opacity-85">
    {children}
  </blockquote>
),
  },

  types: {
    tapPullQuote: ({ value }) => {
      return (
        <figure className="my-12 mx-auto max-w-5xl text-center">
          <blockquote className="font-serif text-3xl leading-snug tracking-tight">
            “{value?.text}”
          </blockquote>

          {value?.attribution && (
            <figcaption className="mt-4 text-sm uppercase tracking-[0.18em] opacity-60">
              {value.attribution}
            </figcaption>
          )}
        </figure>
      )
    },

    sectionBreak: () => {
  return (
    <div className="my-12 text-center text-3xl opacity-70 tracking-[0.3em]">
      ~
    </div>
  )
},

    sidenote: ({ value }) => {
      if (!value?.text) return null

      return (
        <aside className="my-8">
          <div className="relative left-1/2 -translate-x-1/2 w-[110vw] max-w-5xl">
            <div className="lg:ml-auto lg:w-[320px] rounded-xl border border-black/10 bg-white/60 p-4 shadow-sm">
              {value?.label ? (
                <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                  {value.label}
                </p>
              ) : null}

              <p className="mt-2 text-sm leading-relaxed opacity-85">{value.text}</p>

              {value?.source ? (
                <p className="mt-3 text-xs tracking-[0.18em] uppercase opacity-60">
                  {value.source}
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      )
    },

    storyImage: ({ value }) => {
  const align = (value?.align as "left" | "right" | "center" | undefined) ?? "center"
  const size = (value?.displaySize as "small" | "medium" | "large" | undefined) ?? "medium"
  const img = value?.image

  if (!img) return null

  // Width presets
  let baseWidth = "max-w-[560px]" // medium default
  if (size === "small") baseWidth = "max-w-[420px]"
  if (size === "large") baseWidth = "max-w-[760px]"

  const wrapClass =
    align === "left"
      ? `my-10 mr-auto w-full ${baseWidth}`
      : align === "right"
        ? `my-10 ml-auto w-full ${baseWidth}`
        : `my-10 mx-auto w-full ${baseWidth}`

  return (
    <figure className={wrapClass}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urlFor(img).width(1600).quality(85).auto("format").url()}
        alt={value?.caption || ""}
        className="w-full rounded-xl border border-black/10 object-cover"
        loading="lazy"
      />

      {value?.caption || value?.credit ? (
        <figcaption className="mt-3 text-xs opacity-70">
          {value?.caption ? <span>{value.caption}</span> : null}
          {value?.caption && value?.credit ? <span> · </span> : null}
          {value?.credit ? <span>{value.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
},

image: ({ value }) => {
  const img = value
  if (!img) return null

  return (
    <figure className="my-10 mx-auto w-full max-w-[560px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urlFor(img).width(1600).quality(85).auto("format").url()}
        alt={value?.alt || ""}
        className="w-full rounded-xl border border-black/10 object-cover"
        loading="lazy"
      />

      {value?.alt ? (
        <figcaption className="mt-3 text-xs opacity-70">{value.alt}</figcaption>
      ) : null}
    </figure>
  )
},

    gallery: ({ value }) => {
      const images = Array.isArray(value?.images) ? value.images : []
      if (!images.length) return null

      return (
        <section className="my-12 relative left-1/2 -translate-x-1/2 w-[110vw] max-w-5xl">
          <div
            className={[
              "flex gap-4 overflow-x-auto pb-3",
              "snap-x snap-mandatory",
              "[-ms-overflow-style:none] [scrollbar-width:none]",
              "[&::-webkit-scrollbar]:hidden",
            ].join(" ")}
          >
            {images.map((item: any, idx: number) => {
              const img = item?.image
              if (!img) return null
              return (
                <figure key={idx} className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[45%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlFor(img).width(1600).quality(80).url()}
                    alt={item?.caption || ""}
                    className="w-full rounded-xl border border-black/10 object-cover"
                    loading="lazy"
                  />
                  {item?.caption || item?.credit ? (
                    <figcaption className="mt-2 text-sm opacity-70">
                      {item?.caption ? <span>{item.caption}</span> : null}
                      {item?.caption && item?.credit ? <span> · </span> : null}
                      {item?.credit ? <span>{item.credit}</span> : null}
                    </figcaption>
                  ) : null}
                </figure>
              )
            })}
          </div>

          {images.length >= 3 ? (
            <p className="mt-2 text-xs tracking-[0.18em] uppercase opacity-50">Scroll →</p>
          ) : null}
        </section>
      )
    },

    // ✅ Artifact embed
    artifactEmbed: ({ value }) => {
  const a = value?.artifact as ArtifactRef | undefined
  if (!a?.slug) return null

  // Most reliable first: raw Sanity asset URL; fallback to builder URL
  const imgSrc =
    a.heroImageUrl ||
    (a.heroImage ? urlFor(a.heroImage).width(1200).quality(80).auto("format").url() : null)

  // Use block caption first; fallback to artifact summary (short), then nothing
  const caption = value?.caption || a.summary || ""

  return (
    <figure className="my-10">
      {/* smaller than text column */}
      <div className="mx-auto w-full max-w-[420px]">
        {/* Header row (no white card) */}
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-65">
            Evidence
          </p>

          <Link
            href={`/artifacts/${a.slug}`}
            className="text-[11px] tracking-[0.2em] uppercase opacity-55 hover:opacity-90"
          >
            View →
          </Link>
        </div>

        {/* Image (no card background) */}
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={a.title}
            className="w-full rounded-xl object-cover"
            loading="lazy"
          />
        ) : null}

        {/* Caption */}
        {caption ? (
          <figcaption className="mt-2 text-xs leading-relaxed opacity-70">
            {caption}
          </figcaption>
        ) : null}
      </div>
    </figure>
  )
},
  },
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const resolved = await Promise.resolve(params)
  const slug = decodeURIComponent(resolved.slug || "")
  if (!slug) notFound()

  const essay = await client.fetch<Essay>(essayBySlugQuery, { slug })
  if (!essay?.title) notFound()

  return (
    <main className="mx-auto max-w-[760px] px-4 py-10">
      <header className="mb-8">
        {essay.section?.title ? (
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
            {essay.section.title}
          </p>
        ) : null}

        <h1 className="mt-3 font-serif text-4xl leading-tight">{essay.title}</h1>

        {essay.dek ? <p className="mt-3 text-lg opacity-80">{essay.dek}</p> : null}

        {essay.publishedAt ? (
          <p className="mt-2 text-xs tracking-[0.18em] uppercase opacity-60">
            {formatLongDate(essay.publishedAt)}
          </p>
        ) : null}

        {essay.authors?.length ? (
          <p className="mt-4 text-sm opacity-70">By {essay.authors.map((a) => a.name).join(", ")}</p>
        ) : null}
      </header>

      {essay.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlFor(essay.heroImage).width(1400).quality(80).url()}
          alt=""
          className="mb-8 w-full rounded-xl border border-black/10"
        />
      ) : null}

      <article className="tap-article">
        <PortableText value={essay.body} components={portableTextComponents} />
      </article>

      {essay.artifacts?.length ? (
        <section className="mt-14 border-t border-black/10 pt-8">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
            Evidence used in this story
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {essay.artifacts.map((a) => {
              const imgSrc =
                a.heroImageUrl ||
                (a.heroImage ? urlFor(a.heroImage).width(900).quality(80).auto("format").url() : null)

              return (
                <Link
                  key={a._id}
                  href={`/artifacts/${a.slug}`}
                  className="group rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgSrc}
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
        Respond to this essay at{" "}
        <a
          href={`mailto:rick@theamericanpiedmont.com?subject=${encodeURIComponent(
            `Response to ${essay.title}`
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