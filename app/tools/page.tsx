"use client"

import type { Metadata } from "next"
import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal, Grid, List, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { aiTools, categories, pricingFilters, sortOptions } from "@/lib/data"

export const metadata: Metadata = {
  title: "Free AI Tools Directory – Browse & Compare AI Tools",
  description:
    "Browse and compare the best free AI tools for writing, images, video, coding, productivity, and business. Updated AI tools directory.",
}

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPricing, setSelectedPricing] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredTools = useMemo(() => {
    let tools = [...aiTools]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      tools = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    if (selectedCategories.length > 0) {
      tools = tools.filter((tool) =>
        selectedCategories.includes(tool.category)
      )
    }

    if (selectedPricing.length > 0) {
      tools = tools.filter((tool) =>
        selectedPricing.includes(tool.pricing)
      )
    }

    switch (sortBy) {
      case "rating":
        tools.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        tools.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0))
        break
      case "trending":
        tools.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0))
        break
      default:
        tools.sort((a, b) => b.reviews - a.reviews)
    }

    return tools
  }, [searchQuery, selectedCategories, selectedPricing, sortBy])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const togglePricing = (pricingId: string) => {
    setSelectedPricing((prev) =>
      prev.includes(pricingId)
        ? prev.filter((id) => id !== pricingId)
        : [...prev, pricingId]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPricing([])
    setSearchQuery("")
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPricing.length > 0 ||
    searchQuery

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <span className="flex-1 text-muted-foreground">
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {category.toolCount}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Pricing
        </h3>
        <div className="space-y-2">
          {pricingFilters.slice(1).map((pricing) => (
            <label
              key={pricing.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selectedPricing.includes(pricing.id)}
                onCheckedChange={() => togglePricing(pricing.id)}
              />
              <span className="text-muted-foreground">
                {pricing.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            All AI Tools
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse our collection of {aiTools.length}+ AI tools across all categories
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Filters</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-0 text-xs text-accent"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-secondary pl-10"
                />
              </div>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredTools.length} tools
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
