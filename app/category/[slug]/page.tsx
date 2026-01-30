"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, Search } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { aiTools, categories } from "@/lib/data"

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  const category = categories.find((c) => c.id === slug)

  const filteredTools = useMemo(() => {
    let tools = aiTools.filter((tool) => tool.category === slug)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      tools = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      )
    }

    if (selectedSubcategory) {
      tools = tools.filter((tool) => tool.subcategory === selectedSubcategory)
    }

    return tools
  }, [slug, searchQuery, selectedSubcategory])

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Category not found</h1>
          <Link href="/tools">
            <Button className="mt-4">Browse all tools</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/tools"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        </div>

        {/* Subcategories */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedSubcategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSubcategory(null)}
          >
            All
          </Button>
          {category.subcategories.map((sub) => (
            <Button
              key={sub}
              variant={selectedSubcategory === sub ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubcategory(sub)}
            >
              {sub}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search ${category.name.toLowerCase()} tools...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary pl-10"
          />
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredTools.length} tools
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">No tools found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filter
              </p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedSubcategory(null)
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
