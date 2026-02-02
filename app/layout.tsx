import React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "WhiteMouseAI – Free AI Tools Marketplace",
    template: "%s | WhiteMouseAI",
  },

  description:
    "WhiteMouseAI is an AI tools marketplace to discover, compare, and use free AI tools for text, image, video, code, business, automation, and productivity.",

  keywords: [
    "white mouse ai",
    "white mouse",
    "whitemouse ai",
    "white mouse artificial intelligence",
    "ai tools marketplace",
    "free ai tools",
    "ai tools directory",
    "ai image generator",
    "ai tools for productivity",
    "ai tools for students",
  ],

  generator: "v0.app",

  openGraph: {
    title: "WhiteMouseAI – Free AI Tools Marketplace",
    description:
      "Discover the best free AI tools for text, image, video, code, and productivity — all in one place.",
    url: "https://whitemouseai.com",
    siteName: "WhiteMouseAI",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "WhiteMouseAI – Free AI Tools Marketplace",
    description:
      "Find and compare the best free AI tools with WhiteMouseAI.",
  },

  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
