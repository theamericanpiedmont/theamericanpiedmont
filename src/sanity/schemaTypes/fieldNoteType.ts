import {defineField, defineType} from 'sanity'

export const fieldNoteType = defineType({
  name: 'fieldNote',
  title: 'Field Notes',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime'}),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'author'}]}],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'reference',
      to: [{type: 'section'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
        name: "thumbnail",
        title: "Thumbnail",
        type: "image",
        options: { hotspot: true },
        description: "Small image used on the homepage rail and lists."
    }),

defineField({
  name: "heroImage",
  title: "Hero image",
  type: "image",
  options: {hotspot: true},
  description: "Centerpiece image used on the Field Note page and in the center well.",
}),

defineField({
  name: "fieldNotePullQuote",
  title: "Pull quote",
  type: "text",
  rows: 3,
  description:
    "Optional. If set, it will be inserted about halfway through the story.",
}),

defineField({
  name: "pullQuoteAttribution",
  title: "Pull quote attribution",
  type: "string",
  description: 'Optional. E.g., "— Russell Duncan" or "— TAP"',
}),

    defineField({
      name: 'lede',
      title: 'Lede',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}],
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
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
  ],
})
