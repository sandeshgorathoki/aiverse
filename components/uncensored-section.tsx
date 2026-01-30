"use client"

import Link from "next/link"
import { Unlock, AlertTriangle } from "lucide-react"
import { ToolCard } from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import { uncensoredTools } from "@/lib/uncensored-tools"

const featured = uncensoredTools.slice(0, 8)

export function UncensoredSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Unlock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Uncensored AI
              </h2>
              <p className="mt-2 text-muted-foreground">
                Unfiltered AI tools for adult content — chat, roleplay, and image generation without content restrictions
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-sm text-muted-foreground">18+ only</span>
              </div>
            </div>
          </div>
          <Link href="/uncensored" className="shrink-0">
            <Button variant="outline" className="border-amber-500/30 text-foreground hover:bg-amber-500/10 hover:border-amber-500/50">
              View all {uncensoredTools.length} tools →
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  )
}
