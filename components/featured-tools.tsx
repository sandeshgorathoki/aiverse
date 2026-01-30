"use client"

import { useState } from "react"
import Link from "next/link"
import { ToolCard } from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import { aiTools } from "@/lib/data"

const filters = [
  { id: "featured", name: "Featured" },
  { id: "trending", name: "Trending" },
  { id: "new", name: "New Releases" },
  { id: "free", name: "Free Tools" },
]

export function FeaturedTools() {
  const [activeFilter, setActiveFilter] = useState("featured")

  const filteredTools = aiTools.filter((tool) => {
    if (activeFilter === "featured") return tool.featured
    if (activeFilter === "trending") return tool.trending
    if (activeFilter === "new") return tool.new
    if (activeFilter === "free") return tool.pricing === "free"
    return true
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Discover AI Tools
          </h2>
          <p className="mt-2 text-muted-foreground">
            Handpicked AI tools to supercharge your workflow
          </p>
        </div>
        <Link
          href="/tools"
          className="hidden text-sm font-medium text-accent hover:text-accent/80 sm:block"
        >
          View all tools →
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.id)}
            className={activeFilter === filter.id ? "" : "text-muted-foreground"}
          >
            {filter.name}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredTools.slice(0, 8).map((tool) => (
          <ToolCard key={tool.id} tool={tool} featured={tool.featured} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools">
          <Button size="lg" variant="outline">
            Browse All Tools
          </Button>
        </Link>
      </div>
    </section>
  )
}
