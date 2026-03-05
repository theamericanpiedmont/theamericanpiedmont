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
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "attribution",
      title: "Attribution (optional)",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "attribution" },
    prepare({ title, subtitle }) {
      return {
        title: title ? String(title).slice(0, 60) : "Pull Quote",
        subtitle: subtitle ? `— ${subtitle}` : "Pull Quote",
      }
    },
  },
})