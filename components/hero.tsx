"use client"

import { useState } from "react"
import { Search, ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { categories } from "@/lib/data"

const totalTools = categories.reduce((s, c) => s + c.toolCount, 0)

const stats = [
  { label: "AI Tools", value: totalTools.toLocaleString() },
  { label: "Active Users", value: "10M+" },
  { label: "Categories", value: String(categories.length) },
  { label: "Countries", value: "195" },
]

const trustedBy = [
  "Microsoft",
  "Google",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Stripe",
  "Shopify",
]

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            The definitive AI marketplace
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Everything AI.
            <br />
            <span className="text-accent">One Marketplace.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Discover, compare, and use over {totalTools.toLocaleString()} AI tools. From chatbots to image generators,
            find the perfect AI solution for any task.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by task, industry, or tool name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-full bg-secondary pl-12 pr-4 text-base"
              />
            </div>
            <Link href="/tools">
              <Button size="lg" className="h-14 gap-2 rounded-full px-8">
                Explore Tools
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              Instant access
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-400" />
              Verified tools
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-blue-400" />
              Global coverage
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trusted by */}
        <div className="mt-20">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Trusted by teams at
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {trustedBy.map((company) => (
              <span
                key={company}
                className="text-lg font-semibold text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
