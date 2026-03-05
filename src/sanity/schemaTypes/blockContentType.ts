import { defineType, defineArrayMember } from "sanity"
import { ImageIcon } from "@sanity/icons"

export const blockContentType = defineType({
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H1", value: "h1" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [{ title: "Bullet", value: "bullet" }],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
              },
            ],
          },
        ],
      },
    }),

    // Existing inline image (keep if you want)
    defineArrayMember({
      type: "image",
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
        },
      ],
    }),

    // ✅ NEW: Pull Quote block
    defineArrayMember({
      type: "pullQuote",
    }),

    // ✅ NEW: Artifact Embed block
    defineArrayMember({
      type: "artifactEmbed",
    }),

    // ✅ NEW: Story Image block (image + caption/credit + align)
    defineArrayMember({
      type: "storyImage",
    }),

    // ✅ NEW: Gallery block (carousel on frontend)
    defineArrayMember({
      type: "gallery",
    }),
  ],
})