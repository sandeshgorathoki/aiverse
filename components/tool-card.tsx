"use client"

import Link from "next/link"
import { Star, Users, BadgeCheck, TrendingUp, Sparkles, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AITool } from "@/lib/data"

interface ToolCardProps {
  tool: AITool
  featured?: boolean
}

export function ToolCard({ tool, featured = false }: ToolCardProps) {
  const pricingColors: Record<string, string> = {
    free: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    freemium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    subscription: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "pay-per-use": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "one-time": "bg-rose-500/10 text-rose-400 border-rose-500/20",
    enterprise: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  }

  return (
    <Link href={`/tool/${tool.id}`}>
      <div
        className={`group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/5 ${
          featured ? "ring-1 ring-accent/50" : ""
        }`}
      >
        {tool.trending && (
          <div className="absolute -top-2 right-4 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            <TrendingUp className="h-3 w-3" />
            Trending
          </div>
        )}

        {tool.new && (
          <div className="absolute -top-2 right-4 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
            <Sparkles className="h-3 w-3" />
            New
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-xl font-bold text-foreground">
            {tool.name.charAt(0)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault()
              // Handle favorite
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{tool.name}</h3>
            {tool.verified && (
              <BadgeCheck className="h-4 w-4 text-accent" />
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {tool.shortDescription}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tool.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-secondary text-xs text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-foreground">{tool.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">{tool.users}</span>
            </div>
          </div>

          <Badge
            variant="outline"
            className={pricingColors[tool.pricing] || ""}
          >
            {tool.pricing === "free" ? "Free" : tool.priceRange}
          </Badge>
        </div>
      </div>
    </Link>
  )
}
