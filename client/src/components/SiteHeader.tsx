/** MEGA TOOLS style reminder — a paper-white, editorial header with decisive cobalt only for the primary path. */
import { Grid2X2, HelpCircle, LayoutList, Menu, Plus, Search, Sparkle, Workflow } from "lucide-react";
import { Link, useLocation } from "wouter";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  const [location] = useLocation();
  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/tools" className={location.startsWith("/tools") ? "nav-active" : ""}><LayoutList size={14} /> Browse tools</Link>
          <a href="/#categories"><Grid2X2 size={14} /> Categories</a>
          <a href="/#how-it-works"><Workflow size={14} /> How it works</a>
        </nav>
        <div className="header-actions">
          <span className="header-tool-count"><Sparkle size={13} /> 62 tools</span>
          <Link href="/tools" className="search-link"><Search size={16} /> <span>Find a tool</span><kbd>⌘ K</kbd></Link>
          <Link href="/tools" className="suggest-link"><Plus size={15} /> Suggest a tool</Link>
          <button className="mobile-menu" aria-label="Open menu"><Menu size={20} /></button>
        </div>
      </div>
    </header>
  );
}
