/**
 * This configuration is used for the Sanity Studio that’s mounted on the
 * `/app/studio/[[...tool]]/page.tsx` route
 */

import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"

import { apiVersion, dataset, projectId } from "./src/sanity/env"
import { schema } from "./src/sanity/schemaTypes"
import { structure } from "./src/sanity/structure"

import {
  publishNowAction,
  rejectNowAction,
} from "./src/sanity/documentActions/marginaliaSignalActions"

console.log("SANITY_SCHEMA_TYPE_NAMES", schema?.types?.map((t: any) => t?.name))
import { assertNoDuplicateSchemaNames } from "./src/sanity/schemaTypes/_debugSchema"
assertNoDuplicateSchemaNames()

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,

  schema,

  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  document: {
    actions: (prev, context) => {
      const { schemaType } = context

      if (schemaType === "marginaliaSignal") {
        // Put our buttons at the front, keep the defaults after
        return [publishNowAction, rejectNowAction, ...prev]
      }

      return prev
    },
  },
})