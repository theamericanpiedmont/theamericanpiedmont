import type { Metadata } from "next"
import { Spectral } from "next/font/google"
import "./globals.css"
import Masthead from "@/components/Masthead"
import Footer from "@/components/Footer"


const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "The American Piedmont",
  description: "Where memory meets power.",

icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },

openGraph: {
    images: ["/og"]
  }

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spectral.variable} antialiased`}>
  <Masthead />
  {children}
  <Footer />
</body>
    </html>
  );
}
