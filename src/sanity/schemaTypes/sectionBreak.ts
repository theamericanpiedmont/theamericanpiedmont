import { defineType, defineField } from "sanity"

export const sectionBreak = defineType({
  name: "sectionBreak",
  title: "Section Break",
  type: "object",
  fields: [
    defineField({
      name: "marker",
      type: "string",
      hidden: true,
      initialValue: "~",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Section Break (~)",
      }
    },
  },
})