// src/sanity/schemaTypes/pullQuoteType.ts
import { defineType, defineField } from "sanity"

export const pullQuoteType = defineType({
  name: "pullQuote",
  title: "Pull Quote",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Quote",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "attribution",
      title: "Attribution (optional)",
      type: "string",
    }),
  ],
  preview: {
    select: {
      text: "text",
      attribution: "attribution",
    },
    prepare({ text, attribution }) {
      const t = typeof text === "string" ? text : ""
      return {
        title: t ? t.slice(0, 60) : "Pull Quote",
        subtitle: attribution ? `— ${attribution}` : "Pull Quote",
      }
    },
  },
})