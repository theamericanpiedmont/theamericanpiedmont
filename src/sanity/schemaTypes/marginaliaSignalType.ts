import { defineField, defineType } from "sanity"

export const marginaliaSignalType = defineType({
  name: "marginaliaSignal",
  title: "Signals",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
    }),

    // ✅ NEW: publisher domain for favicon + attribution (esp. for Google News)
    defineField({
      name: "sourceDomain",
      title: "Source Domain",
      type: "string",
      description:
        "Publisher domain used for favicon/branding (e.g., nytimes.com). For Google News items, this should be the original publisher, not news.google.com.",
    }),

    defineField({
      name: "pillar",
      title: "Pillar",
      type: "string",
      options: {
        list: [
          { title: "Crease", value: "crease" },
          { title: "Present", value: "present" },
          { title: "Future", value: "future" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "civicTag",
      title: "Civic Tag",
      type: "string",
      options: {
        list: [
          { title: "Education", value: "education" },
          { title: "Archives", value: "archives" },
          { title: "Monuments", value: "monuments" },
          { title: "Records", value: "records" },
          { title: "Platforms", value: "platforms" },
          { title: "Surveillance", value: "surveillance" },
          { title: "Textbooks", value: "textbooks" },
          { title: "Libraries", value: "libraries" },
          { title: "Commemoration", value: "commemoration" },
          { title: "Elections", value: "elections" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "memoryRelevance",
      title: "Why it matters (memory/power)",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "score",
      title: "Score",
      type: "number",
    }),

    // ✅ Queue / publishing workflow
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "suggested",
      options: {
        list: [
          { title: "Suggested (Queue)", value: "suggested" },
          { title: "Published", value: "published" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "suggestedForDate",
      title: "Suggested For Date",
      type: "date",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description: "Set when you publish. Homepage only shows signals with status=published.",
    }),

    // internal
    defineField({
      name: "dedupeKey",
      title: "Dedupe Key",
      type: "string",
      readOnly: true,
    }),
  ],
})