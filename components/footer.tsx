import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  Product: [
    { name: "All Tools", href: "/tools" },
    { name: "Categories", href: "/tools" },
    { name: "Compare", href: "/compare" },
    { name: "Uncensored AI", href: "/uncensored" },
    { name: "Free Tools", href: "/tools?filter=free" },
  ],
  Resources: [
    { name: "Blog", href: "https://blog.whitemouse.ai" },
    { name: "Documentation", href: "https://docs.whitemouse.ai" },
    { name: "Help Center", href: "https://help.whitemouse.ai" },
    { name: "Community", href: "https://community.whitemouse.ai" },
    { name: "Changelog", href: "https://changelog.whitemouse.ai" },
  ],
  Company: [
    { name: "About", href: "https://whitemouse.ai/about" },
    { name: "Careers", href: "https://whitemouse.ai/careers" },
    { name: "Contact", href: "https://whitemouse.ai/contact" },
    { name: "Privacy", href: "https://whitemouse.ai/privacy" },
    { name: "Terms", href: "https://whitemouse.ai/terms" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
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
            <p className="mt-4 text-sm text-muted-foreground">
              The definitive AI marketplace. Discover, compare, and use the best AI tools.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} whitemouse AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
