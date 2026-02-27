// src/lib/format.ts

export function formatShortISO(dateString?: string) {
  if (!dateString) return ""
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10) // YYYY-MM-DD, deterministic
}

export function formatLongDate(dateString?: string) {
  if (!dateString) return ""
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return ""

  // Deterministic formatting across server/client
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

export function labelize(value?: string) {
  if (!value) return ""
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}