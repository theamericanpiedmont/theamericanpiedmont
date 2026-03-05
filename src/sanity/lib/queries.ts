// sanity/lib/queries.ts

export const homeQuery = /* groq */ `
{
  "leadEssay": *[
    _type == "essay" &&
    defined(publishedAt) &&
    !(_id in path("drafts.**"))
  ] | order(publishedAt desc)[0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    dek,
    preview,
    heroImage,
    body,
    "section": section->{ "title": title, "slug": slug.current }
  },

  "latestFieldNotes": *[
    _type == "fieldNote" &&
    defined(publishedAt) &&
    defined(slug.current) &&
    !(_id in path("drafts.**"))
  ] | order(publishedAt desc)[0...6]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    lede,
    heroImage,
    thumbnail,
    section->{ title, "slug": slug.current }
  },

  "publishedSignals": *[
    _type == "marginaliaSignal" &&
    (!defined(status) || status in ["published","approved"]) &&
    defined(coalesce(publishedAt, _updatedAt)) &&
    defined(headline) &&
    defined(url) &&
    !(_id in path("drafts.**"))
  ] | order(coalesce(publishedAt, _updatedAt) desc)[0...20]{
    _id,
    headline,
    url,
    source,
    sourceDomain,
    pillar,
    civicTag,
    score,
    publishedAt,
    sourceUrl
  },

  "artifactPool": *[
    _type == "artifact" &&
    status == "published" &&
    defined(slug.current) &&
    !(_id in path("drafts.**"))
  ] | order(_updatedAt desc)[0...60]{
    _id,
    title,
    "slug": slug.current,
    summary,
    heroImage,
    "heroImageUrl": heroImage.asset->url,
    pillar,
    civicTag,
    artifactType
  }
}
`

export const essaysIndexQuery = /* groq */ `
*[
  _type == "essay" &&
  defined(slug.current) &&
  defined(publishedAt) &&
  !(_id in path("drafts.**"))
] | order(publishedAt desc)[0...50]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  dek,
  preview,
  heroImage,
  "section": section->{ title, "slug": slug.current }
}
`

export const fieldNotesIndexQuery = /* groq */ `
*[
  _type == "fieldNote" &&
  defined(slug.current) &&
  defined(publishedAt) &&
  !(_id in path("drafts.**"))
] | order(publishedAt desc)[0...50]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  lede,
  heroImage,
  thumbnail,
  "section": section->{ title, "slug": slug.current }
}
`

export const signalsIndexQuery = /* groq */ `
*[
  _type == "marginaliaSignal" &&
  status in ["published","approved"] &&
  defined(coalesce(publishedAt, _updatedAt)) &&
  defined(headline) &&
  defined(url) &&
  !(_id in path("drafts.**"))
] | order(coalesce(publishedAt, _updatedAt) desc)[0...200]{
  _id,
  headline,
  url,
  source,
  sourceDomain,
  pillar,
  civicTag,
  score,
  publishedAt,
  sourceUrl
}
`

export const artifactsIndexQuery = /* groq */ `
*[
  _type == "artifact" &&
  status == "published" &&
  defined(slug.current) &&
  !(_id in path("drafts.**"))
] | order(_updatedAt desc)[0...200]{
  _id,
  title,
  "slug": slug.current,
  summary,
  heroImage,
  "heroImageUrl": heroImage.asset->url,
  pillar,
  civicTag,
  artifactType
}
`

// ✅ Export this so your essay slug page can import it
export const essayBySlugQuery = /* groq */ `
*[
  _type == "essay" &&
  defined(slug.current) &&
  slug.current == $slug &&
  !(_id in path("drafts.**"))
][0]{
  title,
  dek,
  publishedAt,
  heroImage,
  body[]{
    ...,
    _type == "artifactEmbed" => {
      ...,
      "artifact": artifact->{
        _id,
        title,
        "slug": slug.current,
        artifactType,
        pillar,
        civicTag,
        summary,
        provenance,
        dateCreated,
        dateDiscovered,
        archiveRef,
        heroImage,
        "heroImageUrl": heroImage.asset->url,
        "heroFileUrl": heroFile.asset->url,
        sourceUrl,
        transcription,
        keyExcerpt
      }
    }
  },
  "authors": authors[]-> { name },
  "section": section-> { title, "slug": slug.current },
  "artifacts": artifacts[]->{
    _id,
    title,
    "slug": slug.current,
    artifactType,
    pillar,
    civicTag,
    summary,
    provenance,
    dateCreated,
    dateDiscovered,
    archiveRef,
    heroImage,
    "heroImageUrl": heroImage.asset->url,
    "heroFileUrl": heroFile.asset->url,
    sourceUrl,
    transcription,
    keyExcerpt
  }
}
`