import { defineType, defineField } from "sanity"

export const artifactEmbedType = defineType({
  name: "artifactEmbed",
  title: "Artifact Embed",
  type: "object",
  fields: [
    defineField({
      name: "artifact",
      title: "Artifact",
      type: "reference",
      to: [{ type: "artifact" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption (optional)",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "artifact.title", subtitle: "caption" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Artifact Embed",
        subtitle: subtitle || "Embedded artifact",
      }
    },
  },
})