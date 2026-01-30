"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Unlock, AlertTriangle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { Input } from "@/components/ui/input"
import { uncensoredTools } from "@/lib/uncensored-tools"

export default function UncensoredPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return uncensoredTools
    const q = searchQuery.toLowerCase()
    return uncensoredTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Uncensored AI</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Unlock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Uncensored AI</h1>
              <p className="mt-1 text-muted-foreground">
                Unfiltered AI tools for adult content — chat, roleplay, and image generation without content restrictions
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              This section lists AI tools that allow uncensored or adult-oriented content. You must be 18+ to use these tools.
              Visit each tool&apos;s website directly for terms and access.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search uncensored tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredTools.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No uncensored tools match your search.</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 text-sm font-medium text-accent hover:text-accent/80"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
