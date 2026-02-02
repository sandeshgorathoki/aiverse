import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategoryGrid } from "@/components/category-grid"
import { FeaturedTools } from "@/components/featured-tools"
import { UncensoredSection } from "@/components/uncensored-section"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "WhiteMouseAI – Free AI Tools Marketplace",
  description:
    "Discover the best free AI tools for text, image, video, code, business, and automation. Compare and use AI tools in one place.",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <CategoryGrid />
        <FeaturedTools />
        <UncensoredSection />
      </main>
      <Footer />
    </div>
  )
}
