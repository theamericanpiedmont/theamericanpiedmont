// sanity/schemaTypes/galleryType.ts
import { defineType, defineField, defineArrayMember } from "sanity"

export const galleryType = defineType({
  name: "gallery",
  title: "Gallery",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        defineArrayMember({
          name: "galleryImage",
          title: "Gallery Image",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption (optional)",
              type: "string",
            }),
            defineField({
              name: "credit",
              title: "Credit (optional)",
              type: "string",
            }),
          ],
          preview: {
            select: { media: "image", title: "caption" },
            prepare({ media, title }) {
              return { media, title: title || "Gallery image" }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).max(12),
    }),
  ],
  preview: {
    select: { images: "images" },
    prepare({ images }) {
      const count = Array.isArray(images) ? images.length : 0
      return { title: `Gallery (${count} image${count === 1 ? "" : "s"})` }
    },
  },
})