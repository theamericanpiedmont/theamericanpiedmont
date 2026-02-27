import Link from "next/link"
import { client } from "@/sanity/lib/client"

export const dynamic = "force-dynamic"

type RandomEssay = {
  title: string
  slug: string
  sectionTitle?: string
}

async function getRandomEssay(): Promise<RandomEssay | null> {
  // Pull a reasonable pool, then pick randomly server-side
  const essays = await client.fetch<
    Array<{ title: string; slug: string; sectionTitle?: string }>
  >(
    `*[
      _type == "essay" &&
      defined(slug.current) &&
      defined(publishedAt)
    ] | order(publishedAt desc)[0...50]{
      title,
      "slug": slug.current,
      "sectionTitle": section->title
    }`
  )

  if (!essays?.length) return null
  const pick = essays[Math.floor(Math.random() * essays.length)]
  return pick ?? null
}

export default async function NotFound() {
  const pick = await getRandomEssay()

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <header className="mb-10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
          404 — Not Found
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
          This page wandered off into the woods.
        </h1>
        <p className="mt-4 text-sm opacity-75">
          If you’re here by mistake, you’re in good company.
        </p>
      </header>

      <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-6 md:p-8">
        {pick ? (
          <>
            <p className="text-sm opacity-75">
              Feeling lucky? Check out this essay about…
            </p>

            <h2 className="mt-3 font-serif text-2xl leading-snug md:text-3xl">
              <Link
                href={`/essays/${pick.slug}`}
                className="hover:underline underline-offset-4"
              >
                {pick.title}
              </Link>
            </h2>

            {pick.sectionTitle ? (
              <p className="mt-2 text-xs font-semibold tracking-[0.2em] uppercase opacity-60">
                {pick.sectionTitle}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/essays/${pick.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
              >
                Read it <span aria-hidden>→</span>
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-white/80"
              >
                Go to the front page
              </Link>

              {/* Optional "Back" */}
              <BackButton />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm opacity-75">
              Feeling lucky? We don’t have any published essays to recommend
              yet.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
              >
                Go to the front page <span aria-hidden>→</span>
              </Link>
              <BackButton />
            </div>
          </>
        )}
      </section>

      <footer className="mt-10 border-t border-black/10 pt-6">
        <p className="text-xs opacity-60">
          The American Piedmont™
        </p>
        <p className="mt-1 text-xs opacity-50">
          © {new Date().getFullYear()} The American Piedmont. All rights reserved.
        </p>
      </footer>
    </main>
  )
}

// This is a small client component import (see file below)
import BackButton from "@/components/BackButton"