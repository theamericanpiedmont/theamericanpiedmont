import { ImageResponse } from "next/og"

export const runtime = "edge"

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 64,
          fontWeight: 800,
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        The American Piedmont
      </div>
    ),
    { width: 1200, height: 630 }
  )
}