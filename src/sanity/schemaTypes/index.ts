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

import { pullQuoteType } from "./pullQuoteType"
import { artifactEmbedType } from "./artifactEmbedType"
import { storyImageType } from "./storyImageType"
import { galleryType } from "./galleryType"

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

  // New ones
  { key: "pullQuoteType", val: pullQuoteType },
  { key: "artifactEmbedType", val: artifactEmbedType },
  { key: "storyImageType", val: storyImageType },
  { key: "galleryType", val: galleryType },
]

// Throw a readable error instead of Sanity’s generic SchemaError
for (const t of typePairs) {
  if (!t.val) throw new Error(`Sanity schema type import is undefined: ${t.key}`)
  // @ts-expect-error Sanity types are structurally typed; name should exist
  if (!t.val.name) throw new Error(`Sanity schema type missing "name": ${t.key}`)
}

export const schema: { types: SchemaTypeDefinition[] } = {
  types: typePairs.map((t) => t.val!) as SchemaTypeDefinition[],
}