// src/app/essays/[slug]/page.tsx
import Link from "next/link"
import { notFound } from "next/navigation"
import { PortableText } from "@portabletext/react"
import type { PortableTextComponents } from "@portabletext/react"
import imageUrlBuilder from "@sanity/image-url"
import { client } from "@/sanity/lib/client"
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

const essayBySlugQuery = /* groq */ `
*[
  _type == "essay" &&
  defined(slug.current) &&
  slug.current == $slug &&
  !(_id in path("drafts.**"))
][0]{
  title,
  dek,
  publishedAt,
  heroImage,
  body,
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

function canonicalFor(slug: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://theamericanpiedmont.com").replace(/\/$/, "")
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

  const essay = await client.fetch<Pick<Essay, "title" | "dek" | "publishedAt">>(
    essayBySlugQuery,
    { slug }
  )
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

// ✅ Link styling only for links inside article PortableText
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
      <h2 className="mt-10 scroll-mt-24 font-serif text-2xl leading-snug">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 scroll-mt-24 font-serif text-xl leading-snug">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-black/20 pl-5 italic opacity-90">
        {children}
      </blockquote>
    ),
  },

  types: {
    pullQuote: ({ value }) => {
      return (
        <figure className="my-10 rounded-2xl border border-black/10 bg-white/70 p-6 text-center shadow-sm">
          <blockquote className="font-serif text-2xl leading-snug">
            “{value?.text}”
          </blockquote>
          {value?.attribution ? (
            <figcaption className="mt-4 text-sm opacity-70">
              — {value.attribution}
            </figcaption>
          ) : null}
        </figure>
      )
    },

    storyImage: ({ value }) => {
      const align = value?.align || "center"
      const img = value?.image

      if (!img) return null

      // width: center can go a bit wider, left/right stays in column
      const wrapperClass =
        align === "center"
          ? "my-10 mx-auto max-w-5xl"
          : "my-8 max-w-3xl"

      const imgClass =
        align === "left"
          ? "mr-auto"
          : align === "right"
          ? "ml-auto"
          : "mx-auto"

      return (
        <figure className={wrapperClass}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(img).width(1800).quality(80).url()}
            alt={value?.caption || ""}
            className={`w-full rounded-xl border border-black/10 ${imgClass}`}
            loading="lazy"
          />
          {(value?.caption || value?.credit) ? (
            <figcaption className="mt-3 text-sm opacity-70">
              {value?.caption ? <span>{value.caption}</span> : null}
              {value?.caption && value?.credit ? <span> · </span> : null}
              {value?.credit ? <span>{value.credit}</span> : null}
            </figcaption>
          ) : null}
        </figure>
      )
    },

    gallery: ({ value }) => {
      const images = Array.isArray(value?.images) ? value.images : []
      if (!images.length) return null

      return (
        <section className="my-10 mx-auto max-w-5xl">
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
                <figure
                  key={idx}
                  className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[45%]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlFor(img).width(1600).quality(80).url()}
                    alt={item?.caption || ""}
                    className="w-full rounded-xl border border-black/10 object-cover"
                    loading="lazy"
                  />
                  {(item?.caption || item?.credit) ? (
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

          {/* subtle hint only when it’s actually scrollable */}
          {images.length >= 3 ? (
            <p className="mt-2 text-xs tracking-[0.18em] uppercase opacity-50">
              Scroll →
            </p>
          ) : null}
        </section>
      )
    },

    artifactEmbed: ({ value }) => {
      // v1: simplest approach = query already includes artifacts[] at end,
      // but embeds need data too. We'll solve this in the query in Step 5.
      const a = value?.artifact
      if (!a) return null

      const imgUrl = a.heroImage
        ? urlFor(a.heroImage).width(1200).height(700).quality(80).url()
        : null

      return (
        <aside className="my-10 rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
              Evidence
            </p>
            <Link
              href={`/artifacts/${a.slug}`}
              className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-90"
            >
              View →
            </Link>
          </div>

          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt={a.title}
              className="mt-4 h-56 w-full rounded-xl border border-black/10 object-cover"
              loading="lazy"
            />
          ) : null}

          <h4 className="mt-4 font-serif text-xl leading-snug">{a.title}</h4>

          {value?.caption ? (
            <p className="mt-2 text-sm opacity-80">{value.caption}</p>
          ) : a.summary ? (
            <p className="mt-2 text-sm opacity-80">{a.summary}</p>
          ) : null}

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
        </aside>
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
  if (!slug) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
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
          <p className="mt-4 text-sm opacity-70">
            By {essay.authors.map((a) => a.name).join(", ")}
          </p>
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

      {/* Only links inside this article body will get the “webby” underline style */}
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
              const imgUrl = a.heroImage
                ? urlFor(a.heroImage).width(900).height(650).quality(80).url()
                : null

              return (
                <Link
                  key={a._id}
                  href={`/artifacts/${a.slug}`}
                  className="group rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
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
        <span role="img" aria-label="Mail">✉️</span>{" "}
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