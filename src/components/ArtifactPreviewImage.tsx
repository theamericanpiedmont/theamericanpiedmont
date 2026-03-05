import Image from "next/image"
import imageUrlBuilder from "@sanity/image-url"
import { client } from "@/sanity/lib/client"

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

export default function ArtifactPreviewImage({
  image,
  alt,
}: {
  image: any
  alt?: string
}) {
  const src = urlFor(image).width(2000).height(1400).fit("crop").url()

  return (
    <div className="relative aspect-[4/3] w-full">
      <Image
        src={src}
        alt={alt || ""}
        fill
        sizes="(max-width: 1024px) 92vw, 720px"
        className="object-cover"
      />
    </div>
  )
}