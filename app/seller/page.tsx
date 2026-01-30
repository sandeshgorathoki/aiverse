"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  DollarSign,
  Users,
  Eye,
  ArrowUpRight,
  Plus,
  Settings,
  HelpCircle,
  Sparkles,
  Check,
  Star,
  TrendingUp,
  Upload,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { categories, pricingFilters } from "@/lib/data"

const stats = [
  {
    name: "Total Views",
    value: "124,892",
    change: "+12.5%",
    icon: Eye,
  },
  {
    name: "Total Users",
    value: "8,432",
    change: "+8.2%",
    icon: Users,
  },
  {
    name: "Revenue",
    value: "$45,231",
    change: "+23.1%",
    icon: DollarSign,
  },
  {
    name: "Avg. Rating",
    value: "4.8",
    change: "+0.3",
    icon: Star,
  },
]

const myTools = [
  {
    id: "1",
    name: "AI Writing Assistant",
    status: "published",
    views: 45230,
    users: 2341,
    rating: 4.7,
    revenue: 12450,
  },
  {
    id: "2",
    name: "Code Helper Pro",
    status: "published",
    views: 32100,
    users: 1890,
    rating: 4.9,
    revenue: 18900,
  },
  {
    id: "3",
    name: "Image Generator X",
    status: "review",
    views: 0,
    users: 0,
    rating: 0,
    revenue: 0,
  },
]

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 tool listing",
      "Basic analytics",
      "Community support",
      "Standard placement",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing AI businesses",
    features: [
      "10 tool listings",
      "Advanced analytics",
      "Priority support",
      "Featured placement",
      "API access",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited listings",
      "Dedicated support",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "Account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your AI tools and track performance
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Submit New Tool
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tools">My Tools</TabsTrigger>
            <TabsTrigger value="submit">Submit Tool</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.name}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Your Tools</h2>
                <div className="space-y-4">
                  {myTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
                          {tool.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{tool.name}</div>
                          <Badge
                            variant="outline"
                            className={
                              tool.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }
                          >
                            {tool.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {tool.views.toLocaleString()} views
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tool.users.toLocaleString()} users
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full bg-transparent">
                  View All Tools
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4 text-left transition-colors hover:bg-secondary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Plus className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Submit Tool</div>
                      <div className="text-xs text-muted-foreground">Add a new AI tool</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4 text-left transition-colors hover:bg-secondary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <BarChart3 className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Analytics</div>
                      <div className="text-xs text-muted-foreground">View detailed stats</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4 text-left transition-colors hover:bg-secondary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Settings className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Settings</div>
                      <div className="text-xs text-muted-foreground">Manage your account</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4 text-left transition-colors hover:bg-secondary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <HelpCircle className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Help</div>
                      <div className="text-xs text-muted-foreground">Get support</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">My Tools</h2>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Tool
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {myTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-foreground">
                        {tool.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{tool.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={
                              tool.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }
                          >
                            {tool.status}
                          </Badge>
                          {tool.rating > 0 && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {tool.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">
                          {tool.views.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">
                          {tool.users.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">
                          ${tool.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="submit">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Submit a New AI Tool</h2>
              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tool Name</Label>
                    <Input id="name" placeholder="Enter tool name" className="bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input id="website" placeholder="https://example.com" className="bg-secondary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short-desc">Short Description</Label>
                  <Input
                    id="short-desc"
                    placeholder="Brief description (max 100 characters)"
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of your AI tool..."
                    className="min-h-32 bg-secondary"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pricing Model</Label>
                    <Select>
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Select pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingFilters.slice(1).map((pricing) => (
                          <SelectItem key={pricing.id} value={pricing.id}>
                            {pricing.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="AI, Writing, Productivity"
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 p-8">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Submit for Review
                  </Button>
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="pricing" id="pricing">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground">Seller Plans</h2>
              <p className="mt-2 text-muted-foreground">
                Choose the plan that fits your business needs
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border bg-card p-6 ${
                    plan.popular
                      ? "border-accent ring-1 ring-accent"
                      : "border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-6 w-full ${
                      plan.popular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
