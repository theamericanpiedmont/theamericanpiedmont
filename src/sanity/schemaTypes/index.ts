console.log("✅ sanity.config.ts LOADED (TAP)")

import { type SchemaTypeDefinition } from "sanity"

import { authorType } from "./authorType"
import { sectionType } from "./sectionType"
import { blockContentType } from "./blockContentType"
import { sectionBreak } from "./sectionBreak"

import { essayType } from "./essayType"
import { fieldNoteType } from "./fieldNoteType"
import { marginaliaType } from "./marginaliaType"
import { marginaliaSignalType } from "./marginaliaSignalType"
import { artifactType } from "./artifactType"
import { signalRunType } from "./signalRun"

// New types
import { pullQuoteType } from "./pullQuoteType"
import { artifactEmbedType } from "./artifactEmbedType"
import { storyImageType } from "./storyImageType"
import { galleryType } from "./galleryType"
import { sidenoteType } from "./sidenoteType"

const typePairs: Array<{ key: string; val: SchemaTypeDefinition | undefined }> = [
  { key: "authorType", val: authorType },
  { key: "sectionType", val: sectionType },

  { key: "blockContentType", val: blockContentType },

  // Register sectionBreak early since blockContent uses it
  { key: "sectionBreak", val: sectionBreak },

  { key: "essayType", val: essayType },
  { key: "signalRunType", val: signalRunType },
  { key: "fieldNoteType", val: fieldNoteType },
  { key: "artifactType", val: artifactType },
  { key: "marginaliaType", val: marginaliaType },
  { key: "marginaliaSignalType", val: marginaliaSignalType },

  { key: "sidenoteType", val: sidenoteType },
  { key: "pullQuoteType", val: pullQuoteType },
  { key: "artifactEmbedType", val: artifactEmbedType },
  { key: "storyImageType", val: storyImageType },
  { key: "galleryType", val: galleryType },
]

// ---- TEMP DEBUG: make schema errors readable ----
const schemaNames = typePairs.map((t) => ({
  key: t.key,
  name: (t.val as any)?.name,
  type: (t.val as any)?.type,
}))

const missing = schemaNames.filter((x) => !x.name)
if (missing.length) {
  throw new Error(
    "Sanity schema types missing/undefined (key:name:type): " +
      JSON.stringify(schemaNames, null, 2)
  )
}

const counts = schemaNames.reduce((acc: Record<string, number>, x) => {
  acc[x.name] = (acc[x.name] || 0) + 1
  return acc
}, {})

const dupes = Object.entries(counts).filter(([, n]) => n > 1)
if (dupes.length) {
  throw new Error(
    "Duplicate Sanity schema type names found: " +
      JSON.stringify(dupes, null, 2) +
      "\n\nFull list (key:name:type):\n" +
      JSON.stringify(schemaNames, null, 2)
  )
}
// ---- END TEMP DEBUG ----

export const schema: { types: SchemaTypeDefinition[] } = {
  types: typePairs.map((t) => t.val!) as SchemaTypeDefinition[],
}