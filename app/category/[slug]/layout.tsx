import type { Metadata } from "next"

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const formatted = params.slug.replace(/-/g, " ")

  // Special SEO for Writing category (Day 2 focus)
  if (params.slug === "writing") {
    return {
      title: "AI Writing Tools – Best Tools for Content, Blogs & Copywriting",
      description:
        "Discover the best AI writing tools for content creation, blogging, copywriting, emails, and SEO. Browse free and premium AI writing tools.",
    }
  }

  // Default SEO for other categories
  return {
    title: `AI Tools for ${formatted} – WhiteMouseAI`,
    description: `Discover the best AI tools for ${formatted}. Browse free and premium AI tools curated by WhiteMouseAI.`,
  }
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
