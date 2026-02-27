'use client'

import {NextStudio} from 'next-sanity/studio'

export default function StudioClient({config}: {config: any}) {
  return <NextStudio config={config} />
}