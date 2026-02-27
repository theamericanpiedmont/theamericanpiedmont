import {defineField, defineType} from 'sanity'

export const sectionType = defineType({
  name: 'section',
  title: 'Sections',
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
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'navOrder',
      title: 'Nav order',
      type: 'number',
      description: 'Lower numbers appear first in navigation.',
    }),
  ],
})
