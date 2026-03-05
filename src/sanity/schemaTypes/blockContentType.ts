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
  {title: 'Normal', value: 'normal'},
  {title: 'H2', value: 'h2'},
  {title: 'H3', value: 'h3'},
  {title: 'Blockquote', value: 'blockquote'},
  {title: 'Indented Quote', value: 'quoteIndent'},
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
    
    // ✅ NEW: Story Image block (image + caption/credit + align)
    defineArrayMember({
      type: "storyImage",
    }),

// ✅ NEW: Pull Quote block
    defineArrayMember({
      type: "tapPullQuote",
    }),

    // ✅ NEW: Artifact Embed block
    defineArrayMember({
      type: "artifactEmbed",
    }),

    defineArrayMember({ type: "sidenote" }),

    // ✅ NEW: Gallery block (carousel on frontend)
    defineArrayMember({
      type: "gallery",
    }),
    // ✅ NEW: Section break (A big cenetered tilda)
    defineArrayMember({
      type: "sectionBreak",
    }),

  ],
})