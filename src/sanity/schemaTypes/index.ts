import { type SchemaTypeDefinition } from "sanity"

import { authorType } from "./authorType"
import { sectionType } from "./sectionType"
import { blockContentType } from "./blockContentType"
import { essayType } from "./essayType"
import { fieldNoteType } from "./fieldNoteType"
import { marginaliaType } from "./marginaliaType"
import { marginaliaSignalType } from "./marginaliaSignalType"
import { artifactType } from "./artifactType"
import { signalRunType } from "./signalRun"

// Temporarily disable new schema imports
import { pullQuoteType } from "./pullQuoteType"
// import { artifactEmbedType } from "./artifactEmbedType"
// import { storyImageType } from "./storyImageType"
// import { galleryType } from "./galleryType"

const typePairs: Array<{ key: string; val: SchemaTypeDefinition | undefined }> = [
  { key: "authorType", val: authorType },
  { key: "sectionType", val: sectionType },
  { key: "blockContentType", val: blockContentType },
  { key: "essayType", val: essayType },
  { key: "signalRunType", val: signalRunType },
  { key: "fieldNoteType", val: fieldNoteType },
  { key: "artifactType", val: artifactType },
  { key: "marginaliaType", val: marginaliaType },
  { key: "marginaliaSignalType", val: marginaliaSignalType },

  // Temporarily disable new schema types
  { key: "pullQuoteType", val: pullQuoteType },
  // { key: "artifactEmbedType", val: artifactEmbedType },
  // { key: "storyImageType", val: storyImageType },
  // { key: "galleryType", val: galleryType },
]

// Throw readable errors instead of Sanity’s generic SchemaError
const names = new Map<string, string>() // name -> key

for (const t of typePairs) {
  if (!t.val) throw new Error(`Sanity schema type import is undefined: ${t.key}`)

  const name = (t.val as any).name
  if (!name) throw new Error(`Sanity schema type missing "name": ${t.key}`)

  if (names.has(name)) {
    throw new Error(
      `Duplicate Sanity schema type name "${name}" from "${t.key}" and "${names.get(name)}"`
    )
  }
  names.set(name, t.key)
}

export const schema: { types: SchemaTypeDefinition[] } = {
  types: typePairs.map((t) => t.val!) as SchemaTypeDefinition[],
}