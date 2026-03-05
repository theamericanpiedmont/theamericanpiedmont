import { schema } from "./index"

export function assertNoDuplicateSchemaNames() {
  const types = schema.types as any[]
  const names = types.map((t) => t?.name).filter(Boolean)

  const counts = new Map<string, number>()
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1)

  const dupes = [...counts.entries()].filter(([, c]) => c > 1)
  if (dupes.length) {
    throw new Error("Duplicate Sanity schema type names: " + JSON.stringify(dupes))
  }
}