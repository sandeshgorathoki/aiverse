import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategoryGrid } from "@/components/category-grid"
import { FeaturedTools } from "@/components/featured-tools"
import { UncensoredSection } from "@/components/uncensored-section"
import { Footer } from "@/components/footer"

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
