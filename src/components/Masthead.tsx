import Link from "next/link"

const nav = [
  { href: "/essays", label: "Essays" },
  { href: "/field-notes", label: "Field Notes" },
  { href: "/artifacts", label: "Artifacts" },
  { href: "/signals", label: "Signals" },
  { href: "/about-the-author", label: "About the Author" },
]

export default function Masthead() {
  return (
    <header className="bg-[#fbfaf7] text-[#111113]">
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <div className="h-px w-full bg-black/10" />

        <div className="flex items-center justify-center gap-3 py-6 md:gap-4">
          {/* Contour mark */}
          <svg
            className="h-10 w-10 md:h-12 md:w-12"
            viewBox="0 0 64 64"
            role="img"
            aria-label="Piedmont contour mark"
          >
            <path
              d="M10 40 C18 28, 28 26, 36 30 C44 34, 50 33, 54 26"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 46 C20 35, 30 33, 38 37 C46 41, 52 40, 56 33"
              fill="none"
              stroke="#7b2f23"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <path
              d="M14 52 C22 42, 32 40, 40 44 C48 48, 54 47, 58 41"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Title */}
          <Link
            href="/"
            className="font-serif text-[28px] font-bold uppercase tracking-[0.18em] leading-none md:text-[44px] md:tracking-[0.18em]"
            aria-label="The American Piedmont — Home"
          >
            The American Piedmont
          </Link>
        </div>

        <div className="pb-3 text-center">
          <p className="font-serif text-sm font-semibold tracking-[0.06em] text-black/65">
            Where memory meets power.
          </p>
        </div>

        <nav
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 pb-5 text-[13px]"
          aria-label="Primary navigation"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="opacity-80 hover:opacity-100 hover:text-[#7b2f23] transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="h-px w-full bg-black/10" />
      </div>
    </header>
  )
}
