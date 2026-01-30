"use client"

import React from "react"

import Link from "next/link"
import {
  Type,
  ImageIcon,
  Video,
  Code,
  TrendingUp,
  Bot,
  BarChart3,
  GraduationCap,
  Shield,
  Building2,
  Unlock,
} from "lucide-react"
import { categories } from "@/lib/data"

const iconMap: Record<string, React.ElementType> = {
  Type: Type,
  ImageIcon: ImageIcon,
  Video: Video,
  Code: Code,
  TrendingUp: TrendingUp,
  Bot: Bot,
  BarChart3: BarChart3,
  GraduationCap: GraduationCap,
  Shield: Shield,
  Building2: Building2,
  Unlock: Unlock,
}

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore AI tools across all categories
          </p>
        </div>
        <Link
          href="/tools"
          className="hidden text-sm font-medium text-accent hover:text-accent/80 sm:block"
        >
          View all categories →
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Type
          return (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{category.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.toolCount} tools
              </p>
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
