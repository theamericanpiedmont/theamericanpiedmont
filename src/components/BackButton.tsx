"use client"

import { useRouter } from "next/navigation"

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm hover:bg-white/80"
    >
      Go back
    </button>
  )
}