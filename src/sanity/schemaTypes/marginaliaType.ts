import {defineField, defineType} from 'sanity'

export const marginaliaType = defineType({
  name: 'marginalia',
  title: 'Marginalia',
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
      name: 'section',
      title: 'Section',
      type: 'reference',
      to: [{type: 'section'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'marginaliaItem',
          title: 'Marginalia item',
          fields: [
            defineField({name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required()}),
            defineField({name: 'source', title: 'Source', type: 'string'}),
            defineField({name: 'note', title: 'Your note', type: 'text', rows: 3}),
          ],
        },
      ],
      validation: (Rule) => Rule.min(1).max(10),
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
