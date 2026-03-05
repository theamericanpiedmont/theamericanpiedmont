import { defineType, defineField } from "sanity"

export const sidenoteType = defineType({
  name: "sidenote",
  title: "Sidenote",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label (optional)",
      type: "string",
      description: "Short kicker, e.g. “Freedmen’s Bureau, 1868”",
    }),
    defineField({
      name: "text",
      title: "Note",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source (optional)",
      type: "string",
      description: "Optional citation line (archive, box/folder, URL, etc.)",
    }),
  ],
  preview: {
    select: { label: "label", text: "text" },
    prepare({ label, text }) {
      const t = typeof text === "string" ? text : ""
      return {
        title: label || "Sidenote",
        subtitle: t ? t.slice(0, 80) : "",
      }
    },
  },
})