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
    { name: "Blog", href: "https://blog.aiverse.com" },
    { name: "Documentation", href: "https://docs.aiverse.com" },
    { name: "Help Center", href: "https://help.aiverse.com" },
    { name: "Community", href: "https://community.aiverse.com" },
    { name: "Changelog", href: "https://changelog.aiverse.com" },
  ],
  Company: [
    { name: "About", href: "https://aiverse.com/about" },
    { name: "Careers", href: "https://aiverse.com/careers" },
    { name: "Contact", href: "https://aiverse.com/contact" },
    { name: "Privacy", href: "https://aiverse.com/privacy" },
    { name: "Terms", href: "https://aiverse.com/terms" },
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
                alt="aiverse logo" 
                width={32} 
                height={32}
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-xl font-bold text-foreground">aiverse</span>
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
            © {new Date().getFullYear()} aiverse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
