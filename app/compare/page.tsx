"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  X,
  Star,
  Users,
  BadgeCheck,
  Check,
  ExternalLink,
  Search,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { aiTools, type AITool } from "@/lib/data"

const MAX_COMPARE = 4

export default function ComparePage() {
  const [selectedTools, setSelectedTools] = useState<AITool[]>([
    aiTools[0],
    aiTools[1],
  ])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredTools = aiTools.filter(
    (tool) =>
      !selectedTools.find((t) => t.id === tool.id) &&
      (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const addTool = (tool: AITool) => {
    if (selectedTools.length < MAX_COMPARE) {
      setSelectedTools([...selectedTools, tool])
      setIsDialogOpen(false)
      setSearchQuery("")
    }
  }

  const removeTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== toolId))
  }

  const pricingColors: Record<string, string> = {
    free: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    freemium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    subscription: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "pay-per-use": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "one-time": "bg-rose-500/10 text-rose-400 border-rose-500/20",
    enterprise: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Compare AI Tools</h1>
          <p className="mt-2 text-muted-foreground">
            Compare features, pricing, and ratings side by side
          </p>
        </div>

        {/* Tool Selection Row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {selectedTools.map((tool) => (
            <div
              key={tool.id}
              className="relative rounded-xl border border-border bg-card p-4"
            >
              <button
                onClick={() => removeTool(tool.id)}
                className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-foreground">
                  {tool.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">{tool.name}</span>
                    {tool.verified && (
                      <BadgeCheck className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {tool.rating}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {selectedTools.length < MAX_COMPARE && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-4 text-muted-foreground transition-colors hover:border-accent hover:text-accent">
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Add Tool</span>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Add Tool to Compare</DialogTitle>
                </DialogHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-secondary pl-10"
                  />
                </div>
                <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
                  {filteredTools.slice(0, 10).map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => addTool(tool)}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-secondary"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-foreground">
                        {tool.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{tool.name}</span>
                          {tool.verified && (
                            <BadgeCheck className="h-4 w-4 text-accent" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {tool.shortDescription}
                        </p>
                      </div>
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                  {filteredTools.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                      No tools found
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Comparison Table */}
        {selectedTools.length >= 2 ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Feature
                  </th>
                  {selectedTools.map((tool) => (
                    <th
                      key={tool.id}
                      className="p-4 text-center text-sm font-medium text-foreground"
                    >
                      {tool.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Rating */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Rating</td>
                  {selectedTools.map((tool) => (
                    <td key={tool.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-foreground">{tool.rating}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Reviews */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Reviews</td>
                  {selectedTools.map((tool) => (
                    <td
                      key={tool.id}
                      className="p-4 text-center font-medium text-foreground"
                    >
                      {tool.reviews.toLocaleString()}
                    </td>
                  ))}
                </tr>

                {/* Users */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Active Users</td>
                  {selectedTools.map((tool) => (
                    <td
                      key={tool.id}
                      className="p-4 text-center font-medium text-foreground"
                    >
                      {tool.users}
                    </td>
                  ))}
                </tr>

                {/* Pricing */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Pricing</td>
                  {selectedTools.map((tool) => (
                    <td key={tool.id} className="p-4 text-center">
                      <Badge
                        variant="outline"
                        className={pricingColors[tool.pricing] || ""}
                      >
                        {tool.priceRange || "Free"}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Category</td>
                  {selectedTools.map((tool) => (
                    <td
                      key={tool.id}
                      className="p-4 text-center text-sm text-foreground"
                    >
                      {tool.subcategory}
                    </td>
                  ))}
                </tr>

                {/* Verified */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Verified</td>
                  {selectedTools.map((tool) => (
                    <td key={tool.id} className="p-4 text-center">
                      {tool.verified ? (
                        <Check className="mx-auto h-5 w-5 text-emerald-400" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Features */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Key Features</td>
                  {selectedTools.map((tool) => (
                    <td key={tool.id} className="p-4">
                      <ul className="space-y-1 text-center text-sm text-foreground">
                        {tool.features.slice(0, 4).map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Pros */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Pros</td>
                  {selectedTools.map((tool) => (
                    <td key={tool.id} className="p-4">
                      <ul className="space-y-1">
                        {tool.pros.map((pro) => (
                          <li
                            key={pro}
                            className="flex items-start gap-1.5 text-sm text-foreground"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Cons */}
                <tr className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">Cons</td>
                  {selectedTools.map((tool) => (
                    <td key={tool.id} className="p-4">
                      <ul className="space-y-1">
                        {tool.cons.map((con) => (
                          <li
                            key={con}
                            className="flex items-start gap-1.5 text-sm text-foreground"
                          >
                            <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-4 text-sm text-muted-foreground">Action</td>
                  {selectedTools.map((tool) => (
                    <td key={tool.id} className="p-4 text-center">
                      <div className="flex flex-col gap-2">
                        <Link href={`/tool/${tool.id}`}>
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            View Details
                          </Button>
                        </Link>
                        <Button size="sm" className="w-full gap-1">
                          Visit
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Select at least 2 tools to compare
              </h3>
              <p className="mt-2 text-muted-foreground">
                Add tools using the cards above to start comparing
              </p>
            </div>
          </div>
        )}

        {/* Suggested Comparisons */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-foreground">Popular Comparisons</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { tools: ["ChatGPT Pro", "Claude AI"], category: "Chatbots" },
              { tools: ["Midjourney", "Stable Diffusion"], category: "Image Generation" },
              { tools: ["Cursor", "GitHub Copilot"], category: "Code Generation" },
              { tools: ["Runway ML", "Synthesia"], category: "Video Generation" },
              { tools: ["Jasper", "Copy.ai"], category: "Copywriting" },
              { tools: ["ElevenLabs", "Descript"], category: "Audio" },
            ].map((comparison, index) => (
              <button
                key={index}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-accent"
                onClick={() => {
                  const tool1 = aiTools.find((t) => t.name === comparison.tools[0])
                  const tool2 = aiTools.find((t) => t.name === comparison.tools[1])
                  if (tool1 && tool2) {
                    setSelectedTools([tool1, tool2])
                  }
                }}
              >
                <div>
                  <div className="font-medium text-foreground">
                    {comparison.tools[0]} vs {comparison.tools[1]}
                  </div>
                  <div className="text-sm text-muted-foreground">{comparison.category}</div>
                </div>
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
