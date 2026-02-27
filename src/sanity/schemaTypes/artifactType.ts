import {defineField, defineType} from 'sanity'

export const artifactType = defineType({
  name: 'artifact',
  title: 'Artifacts',
  type: 'document',
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Rejected', value: 'rejected'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

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
      name: 'artifactType',
      title: 'Artifact type',
      type: 'string',
      options: {
        list: [
          {title: 'Photograph', value: 'photograph'},
          {title: 'Newspaper clipping', value: 'newspaper_clipping'},
          {title: 'Letter', value: 'letter'},
          {title: 'Official record', value: 'official_record'},
          {title: 'Etching/Illustration', value: 'etching'},
          {title: 'Map', value: 'map'},
          {title: 'Legislation', value: 'legislation'},
          {title: 'Transcript', value: 'transcript'},
          {title: 'Other', value: 'other'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'pillar',
      title: 'Pillar',
      type: 'string',
      options: {
        list: [
          {title: 'The Crease', value: 'crease'},
          {title: 'Present Tense', value: 'present'},
          {title: 'Memories of the Future', value: 'future'},
        ],
      },
    }),

    defineField({
      name: 'civicTag',
      title: 'Civic tag',
      type: 'string',
      description: 'Short tag used for grouping and browsing (e.g., "Reconstruction", "Education", "Voting").',
    }),

    defineField({
      name: 'summary',
      title: 'What it is (short)',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.max(500),
    }),

    defineField({
      name: 'provenance',
      title: 'Provenance (where it came from)',
      type: 'text',
      rows: 4,
    }),

    defineField({
      name: 'dateCreated',
      title: 'Date created',
      type: 'date',
    }),

    defineField({
      name: 'dateDiscovered',
      title: 'Date discovered',
      type: 'date',
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: {hotspot: true},
    }),

    defineField({
      name: 'heroFile',
      title: 'File (PDF, scan, etc.)',
      type: 'file',
    }),

    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
    }),

    defineField({
      name: 'archiveRef',
      title: 'Archive reference',
      type: 'string',
      description: 'Box/Folder, call number, collection name, etc.',
    }),

    defineField({
      name: 'transcription',
      title: 'Transcription',
      type: 'text',
      rows: 8,
    }),

    defineField({
      name: 'keyExcerpt',
      title: 'Key excerpt',
      type: 'text',
      rows: 6,
      validation: (Rule) => Rule.max(800),
    }),

    defineField({
      name: 'relatedPeople',
      title: 'Related people',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'author'}]}],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'heroImage',
      artifactType: 'artifactType',
      status: 'status',
    },
    prepare(selection) {
      const {title, media, artifactType, status} = selection as {
        title?: string
        media?: any
        artifactType?: string
        status?: string
      }

      const typeLabel = artifactType ? artifactType.replace(/_/g, ' ') : 'artifact'
      const statusLabel = status ? `• ${status}` : ''

      return {
        title: title || 'Untitled artifact',
        subtitle: `${typeLabel}${statusLabel}`,
        media,
      }
    },
  },
})