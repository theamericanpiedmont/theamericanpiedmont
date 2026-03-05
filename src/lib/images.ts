import imageUrlBuilder from "@sanity/image-url"
import { client } from "@/sanity/lib/client"

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

export function imageWithHotspot(image: any, w: number, h: number) {
  const hs = image?.hotspot

  // If hotspot exists, crop around it
  if (hs?.x != null && hs?.y != null) {
    return urlFor(image)
      .width(w)
      .height(h)
      .fit("crop")
      .crop("focalpoint")
      .focalPoint(hs.x, hs.y)
      .quality(80)
      .auto("format")
      .url()
  }

  // fallback (still crops, but centered)
  return urlFor(image)
    .width(w)
    .height(h)
    .fit("crop")
    .quality(80)
    .auto("format")
    .url()
}