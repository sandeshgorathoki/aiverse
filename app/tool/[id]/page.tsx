"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Star,
  Users,
  BadgeCheck,
  ExternalLink,
  Heart,
  Share2,
  Check,
  X,
  MessageSquare,
  ThumbsUp,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { aiTools, categories } from "@/lib/data"
import { uncensoredTools } from "@/lib/uncensored-tools"

const mockReviews = [
  {
    id: "1",
    user: "Alex Thompson",
    avatar: "A",
    rating: 5,
    date: "2 weeks ago",
    title: "Game changer for my workflow",
    content:
      "This tool has completely transformed how I work. The AI capabilities are incredible and save me hours every day. Highly recommend for anyone looking to boost productivity.",
    helpful: 42,
  },
  {
    id: "2",
    user: "Sarah Chen",
    avatar: "S",
    rating: 4,
    date: "1 month ago",
    title: "Great but has room for improvement",
    content:
      "Overall very impressed with the quality. The interface is intuitive and results are consistently good. Would love to see more customization options in future updates.",
    helpful: 28,
  },
  {
    id: "3",
    user: "Michael Davis",
    avatar: "M",
    rating: 5,
    date: "1 month ago",
    title: "Worth every penny",
    content:
      "Been using this for 3 months now and it's become an essential part of my toolkit. Customer support is also excellent - they responded to my questions within hours.",
    helpful: 35,
  },
]

export default function ToolPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [isFavorite, setIsFavorite] = useState(false)

  const tool = aiTools.find((t) => t.id === id) || uncensoredTools.find((t) => t.id === id)
  const category = categories.find((c) => c.id === tool?.category)
  const allTools = [...aiTools, ...uncensoredTools]
  const relatedTools = allTools
    .filter((t) => t.category === tool?.category && t.id !== id)
    .slice(0, 4)

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Tool not found</h1>
          <Link href="/tools">
            <Button className="mt-4">Browse all tools</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
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
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-foreground">Tools</Link>
          {category && (
            <>
              <span>/</span>
              <Link href={`/category/${category.id}`} className="hover:text-foreground">{category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{tool.name}</span>
        </nav>
        <Link
          href="/tools"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all tools
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-2xl font-bold text-foreground">
                    {tool.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
                      {tool.verified && (
                        <BadgeCheck className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-foreground">{tool.rating}</span>
                        <span className="text-muted-foreground">
                          ({tool.reviews.toLocaleString()} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{tool.users} users</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={isFavorite ? "text-rose-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-6 text-muted-foreground">{tool.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Tabs defaultValue="features" className="mt-8">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="comparison">Pros & Cons</TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="mt-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tool.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3"
                      >
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-6">
                    {mockReviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-lg border border-border bg-secondary/30 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
                              {review.avatar}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{review.user}</div>
                              <div className="text-xs text-muted-foreground">{review.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h4 className="mt-3 font-medium text-foreground">{review.title}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                        <div className="mt-4 flex items-center gap-4">
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Helpful ({review.helpful})
                          </button>
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-6 w-full bg-transparent">
                    Load more reviews
                  </Button>
                </TabsContent>

                <TabsContent value="comparison" className="mt-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                        <Check className="h-5 w-5 text-emerald-400" />
                        Pros
                      </h3>
                      <ul className="space-y-2">
                        {tool.pros.map((pro) => (
                          <li
                            key={pro}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                        <X className="h-5 w-5 text-rose-400" />
                        Cons
                      </h3>
                      <ul className="space-y-2">
                        {tool.cons.map((con) => (
                          <li
                            key={con}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pricing</span>
                <Badge
                  variant="outline"
                  className={pricingColors[tool.pricing] || ""}
                >
                  {tool.pricing.charAt(0).toUpperCase() + tool.pricing.slice(1)}
                </Badge>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-foreground">
                  {tool.priceRange || "Free"}
                </span>
              </div>
              {tool.website ? (
                <Button asChild className="mt-6 w-full gap-2">
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button className="mt-6 w-full gap-2" disabled>
                  Visit Website (coming soon)
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Link href={`/compare?tools=${tool.id}`}>
                <Button variant="outline" className="mt-3 w-full bg-transparent">
                  Compare with others
                </Button>
              </Link>
            </div>

            {/* Category Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <span className="text-sm text-muted-foreground">Category</span>
              <Link
                href={`/category/${category?.id}`}
                className="mt-2 block font-medium text-foreground hover:text-accent"
              >
                {category?.name}
              </Link>
              <span className="text-sm text-muted-foreground">
                {tool.subcategory}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Quick Stats</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {tool.rating}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-medium text-foreground">
                    {tool.reviews.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-medium text-foreground">{tool.users}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="font-medium text-foreground">
                    {tool.verified ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Related Tools</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((relatedTool) => (
                <ToolCard key={relatedTool.id} tool={relatedTool} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
