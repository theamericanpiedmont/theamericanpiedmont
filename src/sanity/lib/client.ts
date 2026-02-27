import { createClient } from "next-sanity"

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "").trim()
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || "").trim()
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01").trim()

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})