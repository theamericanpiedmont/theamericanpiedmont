import { defineType } from "sanity"

export const sectionBreak = defineType({
  name: "sectionBreak",
  title: "Section Break",
  type: "object",
  fields: [],
  preview: {
    prepare() {
      return { title: "Section Break (~)" }
    },
  },
})