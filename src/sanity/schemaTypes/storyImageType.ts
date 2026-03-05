import { defineType, defineField } from "sanity"

export const storyImageType = defineType({
  name: "storyImage",
  title: "Story Image",
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

    defineField({
      name: "align",
      title: "Align",
      type: "string",
      options: {
        list: [
          { title: "Center", value: "center" },
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "center",
    }),

    // ✅ NEW
    defineField({
      name: "displaySize",
      title: "Display Size",
      type: "string",
      options: {
        list: [
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large", value: "large" },
        ],
        layout: "radio",
      },
      initialValue: "medium",
    }),
  ],

  preview: {
    select: {
      media: "image",
      title: "caption",
      subtitle: "credit",
    },
    prepare({ media, title, subtitle }) {
      return {
        media,
        title: title || "Story Image",
        subtitle: subtitle || "",
      }
    },
  },
})