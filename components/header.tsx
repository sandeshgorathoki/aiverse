"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Search, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { categories } from "@/lib/data"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/Logo.png" 
              alt="whitemouse AI logo" 
              width={32} 
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-xl font-bold text-foreground">whitemouse AI</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1 text-muted-foreground hover:text-foreground">
                  Categories
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link href={`/category/${category.id}`} className="flex items-center justify-between">
                      {category.name}
                      <span className="text-xs text-muted-foreground">{category.toolCount}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/tools">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                All Tools
              </Button>
            </Link>

            <Link href="/uncensored">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Uncensored AI
              </Button>
            </Link>

            <Link href="/compare">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Compare
              </Button>
            </Link>

            {/* Removed For Sellers link */}
          </nav>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search AI tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary pl-10 pr-4"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/favorites" className="hidden sm:block">
            <Button variant="outline" className="text-foreground bg-transparent">
              Favorites
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search AI tools..."
                className="w-full bg-secondary pl-10 pr-4"
              />
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/tools"
              className="rounded-md px-3 py-2 text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Tools
            </Link>
            <Link
              href="/uncensored"
              className="rounded-md px-3 py-2 text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Uncensored AI
            </Link>
            <Link
              href="/compare"
              className="rounded-md px-3 py-2 text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Compare
            </Link>
            {/* Removed For Sellers mobile link */}
            <div className="border-t border-border pt-2">
              <p className="px-3 py-2 text-sm font-medium text-muted-foreground">Categories</p>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-foreground hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                  <span className="text-xs text-muted-foreground">{category.toolCount}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
