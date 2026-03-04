export default function manifest() {
  return {
    name: "The American Piedmont",
    short_name: "Piedmont",
    description: "Essays and signals from the American Piedmont",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#D64B2A",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}