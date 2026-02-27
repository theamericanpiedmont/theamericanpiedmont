import Link from "next/link";

type ImageLike = any;

type EssayCard = {
  _id: string;
  title: string;
  slug: { current: string };
  preview?: string;
  publishedAt?: string;
  authorName?: string;
  sectionTitle?: string;
  mainImage?: ImageLike;
};

type NoteCard = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
};

type MarginaliaCard = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
};

export function HomepageMagazine({
  leadEssay,
  moreEssays,
  fieldNotes,
  marginalia,
}: {
  leadEssay?: EssayCard;
  moreEssays: EssayCard[];
  fieldNotes: NoteCard[];
  marginalia: MarginaliaCard[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      {/* Masthead row */}
      <div className="pt-8 pb-6 border-b border-black/10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              The American Piedmont
            </h1>
            <p className="mt-1 text-sm text-black/70">
              Essays • Field Notes • Marginalia
            </p>
          </div>
          <div className="text-sm text-black/60 hidden md:block">
            A modern newsroom for longform and local civic intelligence
          </div>
        </div>
      </div>

      {/* Two-column magazine grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main well */}
        <main className="lg:col-span-8">
          {/* Lead story */}
          {leadEssay ? (
            <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/60">
                  {leadEssay.sectionTitle ? (
                    <span className="uppercase tracking-wider">
                      {leadEssay.sectionTitle}
                    </span>
                  ) : null}
                  {leadEssay.publishedAt ? <span>•</span> : null}
                  {leadEssay.publishedAt ? (
                    <time dateTime={leadEssay.publishedAt}>
                      {new Date(leadEssay.publishedAt).toLocaleDateString()}
                    </time>
                  ) : null}
                  {leadEssay.authorName ? <span>•</span> : null}
                  {leadEssay.authorName ? <span>{leadEssay.authorName}</span> : null}
                </div>

                <h2 className="mt-3 text-2xl md:text-3xl font-semibold leading-tight">
                  <Link
                    href={`/essays/${leadEssay.slug.current}`}
                    className="hover:underline underline-offset-4"
                  >
                    {leadEssay.title}
                  </Link>
                </h2>

                {leadEssay.preview ? (
                  <p className="mt-4 text-base md:text-lg leading-relaxed text-black/80">
                    {leadEssay.preview}
                  </p>
                ) : null}

                <div className="mt-6">
                  <Link
                    href={`/essays/${leadEssay.slug.current}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
                  >
                    Read the essay <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          {/* Secondary essays grid */}
          <section className="mt-10">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">More Essays</h3>
              <Link href="/essays" className="text-sm text-black/60 hover:text-black">
                View all →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {moreEssays.map((e) => (
                <article
                  key={e._id}
                  className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-5"
                >
                  <div className="text-xs text-black/60 flex items-center gap-2">
                    {e.sectionTitle ? (
                      <span className="uppercase tracking-wider">{e.sectionTitle}</span>
                    ) : null}
                    {e.publishedAt ? <span>•</span> : null}
                    {e.publishedAt ? (
                      <time dateTime={e.publishedAt}>
                        {new Date(e.publishedAt).toLocaleDateString()}
                      </time>
                    ) : null}
                  </div>

                  <h4 className="mt-2 text-lg font-semibold leading-snug">
                    <Link
                      href={`/essays/${e.slug.current}`}
                      className="hover:underline underline-offset-4"
                    >
                      {e.title}
                    </Link>
                  </h4>

                  {e.preview ? (
                    <p className="mt-2 text-sm leading-relaxed text-black/75 line-clamp-3">
                      {e.preview}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          {/* Marginalia band */}
          <section className="mt-10">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">Marginalia</h3>
              <Link href="/marginalia" className="text-sm text-black/60 hover:text-black">
                View all →
              </Link>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {marginalia.map((m) => (
                <Link
                  key={m._id}
                  href={`/marginalia/${m.slug.current}`}
                  className="shrink-0 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm hover:bg-white"
                >
                  {m.title}
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* Right rail */}
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">Field Notes</h3>
                <Link href="/daily" className="text-sm text-black/60 hover:text-black">
                  View all →
                </Link>
              </div>

              <ul className="mt-4 space-y-3">
                {fieldNotes.map((n) => (
                  <li key={n._id} className="border-b border-black/5 pb-3 last:border-b-0 last:pb-0">
                    <Link
                      href={`/daily/${n.slug.current}`}
                      className="block hover:underline underline-offset-4"
                    >
                      <div className="text-sm font-medium leading-snug">{n.title}</div>
                      {n.publishedAt ? (
                        <div className="mt-1 text-xs text-black/60">
                          {new Date(n.publishedAt).toLocaleDateString()}
                        </div>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white/60 shadow-sm p-5">
              <h3 className="text-lg font-semibold">Respond</h3>
              <p className="mt-2 text-sm text-black/75 leading-relaxed">
                Thoughtful replies welcome. Tell me what you’re seeing in your corner of the Piedmont.
              </p>
              <a
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-white/80"
                href="mailto:rick@theamericanpiedmont.com?subject=Letter%20to%20TAP"
              >
                Write a letter <span aria-hidden>→</span>
              </a>
            </section>

            

          </div>
        </aside>
      </div>
    </div>
  );
}