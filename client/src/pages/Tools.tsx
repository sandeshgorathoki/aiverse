/** MEGA TOOLS style reminder — catalog views use paper-white space, functional filtering, and compact ledger metadata. */
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolCard } from "@/components/ToolCard";
import { librarySeo, SeoHead } from "@/lib/seo";
import { categories, tools } from "@/lib/tools";

export default function Tools() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All tools");
  const found = useMemo(() => tools.filter((tool) => {
    const matchesCategory = category === "All tools" || tool.category === category;
    const haystack = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [category, query]);
  return (
    <div className="site-shell catalog-page">
      <SeoHead {...librarySeo} />
      <SiteHeader />
      <main className="catalog-main">
        <section className="catalog-header">
          <span className="eyebrow"><span /> MEGA TOOLS library</span>
          <h1>Find a reliable way<br /><em>through the task.</em></h1>
          <p>{tools.length} browser-first utilities, each with a focused working surface.</p>
        </section>
        <section className="library-layout">
          <aside className="library-rail" aria-label="Tool categories">
            <div className="rail-heading"><SlidersHorizontal size={14} /><span>Index by task</span></div>
            {["All tools", ...categories].map((item, index) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "rail-active" : ""}><small>{String(index).padStart(2, "0")}</small><span>{item}</span></button>)}
          </aside>
          <div className="library-content">
            <section className="catalog-controls" aria-label="Tool filters">
              <label className="tool-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools, formats, or tasks" /><kbd>⌘ K</kbd></label>
              <div className="filter-label"><SlidersHorizontal size={15} /> Current ledger</div>
              <div className="ledger-key"><span>NAME</span><span>WHAT IT DOES</span><span>LINK</span></div>
            </section>
            <section className="results-section">
              <div className="results-meta"><span>{found.length} {found.length === 1 ? "tool" : "tools"} indexed</span>{(query || category !== "All tools") && <button onClick={() => { setQuery(""); setCategory("All tools"); }}><X size={14} /> Clear filters</button>}</div>
              {found.length ? <div className="tool-grid full-grid tool-ledger">{found.map((tool, index) => <ToolCard tool={tool} index={index} key={tool.slug} />)}</div> : <div className="empty-state"><strong>No close match yet.</strong><p>Try a simpler term or return to the full library.</p><button onClick={() => { setQuery(""); setCategory("All tools"); }}>Reset filters</button></div>}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
