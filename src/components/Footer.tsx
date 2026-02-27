export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-[#fbfaf7]">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm opacity-75">
        <p className="font-serif">
          © {new Date().getFullYear()} The American Piedmont, by Shift Shift Creative
        </p>
        <p className="mt-2">
          American memory, identity and power — told through the Piedmont.
        </p>
      </div>
    </footer>
  )
}
