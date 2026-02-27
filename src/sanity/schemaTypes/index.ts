import {type SchemaTypeDefinition} from 'sanity'

import {authorType} from './authorType'
import {sectionType} from './sectionType'
import {blockContentType} from './blockContentType'
import {essayType} from './essayType'
import {fieldNoteType} from './fieldNoteType'
import {marginaliaType} from './marginaliaType'
import {marginaliaSignalType} from './marginaliaSignalType'
import {artifactType} from './artifactType'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    authorType,
    sectionType,
    blockContentType,
    essayType,
    fieldNoteType,
    artifactType,
    marginaliaType,
    marginaliaSignalType,
  ],
}