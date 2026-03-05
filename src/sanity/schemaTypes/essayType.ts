import { defineField, defineType } from 'sanity'

export const essayType = defineType({
  name: 'essay',
  title: 'Essays',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),

    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'author' }] }],
      validation: (Rule) => Rule.min(1),
    }),

    defineField({
      name: 'section',
      title: 'Section',
      type: 'reference',
      to: [{ type: 'section' }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'dek',
      title: 'Dek / Subtitle',
      type: 'string',
    }),

    defineField({
      name: 'preview',
      title: 'Preview (Homepage excerpt)',
      type: 'text',
      rows: 4,
      description:
        'A short excerpt used on the homepage and section pages.',
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({
  name: "body",
  title: "Body",
  type: "blockContent",
  validation: (Rule) => Rule.required(),
}),

    // 🔎 NEW: Artifact references (Evidence layer)
    defineField({
      name: 'artifacts',
      title: 'Artifacts used',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'artifact' }],
        },
      ],
      description:
        'Primary source artifacts that support this essay (letters, clippings, photographs, etc.).',
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
})