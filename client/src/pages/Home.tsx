/** MEGA TOOLS style reminder — an asymmetric white editorial workbench, not a centered SaaS hero. */
import { ArrowRight, Binary, Box, Check, ChevronRight, Code2, Command, FileCheck2, FileStack, FileText, Image, Layers3, LockKeyhole, Search, ShieldCheck, Sparkles, WandSparkles, Zap } from "lucide-react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolCard } from "@/components/ToolCard";
import { SeoHead, homeSeo } from "@/lib/seo";
import { categories, tools } from "@/lib/tools";

const featured = tools.filter((tool) => tool.featured).slice(0, 6);

export default function Home() {
  return (
    <div className="site-shell">
      <SeoHead {...homeSeo} />
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-gridline" />
          <div className="hero-copy">
            <div className="eyebrow"><span /> The useful internet, organized.</div>
            <h1>Make the file do<br /><em>what you mean.</em></h1>
            <p>Fast, focused online utilities for the practical work in front of you. No accounts. No detours. Your work stays in your browser whenever it can.</p>
            <div className="hero-cta-row">
              <Link href="/tools" className="primary-action">Browse all tools <ArrowRight size={17} /></Link>
              <a href="#how-it-works" className="text-action">How it works <ChevronRight size={16} /></a>
            </div>
          </div>
          <div className="hero-search-area">
            <div className="hero-visual" aria-hidden="true"><img src="/manus-storage/mega-tools-hero-texture_bf959805.png" alt="" /></div>
            <div className="hero-workbench" aria-hidden="true"><div className="hero-workbench-head"><span className="split-square" /><strong>LIVE UTILITY SHELF</strong><small>62 MODULES</small></div><div className="hero-workbench-row is-active"><span><FileText size={16} /></span><strong>Merge PDF</strong><small>COMBINE FILES</small><i>01</i></div><div className="hero-workbench-row"><span><Code2 size={16} /></span><strong>Format JSON</strong><small>VERIFY STRUCTURE</small><i>02</i></div><div className="hero-workbench-row"><span><Image size={16} /></span><strong>Resize image</strong><small>SET DIMENSIONS</small><i>03</i></div><div className="hero-workbench-foot"><span>SEARCH · SELECT · OUTPUT</span><b>READY</b></div></div>
            <div className="hero-orbit" aria-hidden="true"><span className="orbit-node orbit-one"><FileStack size={18} /></span><span className="orbit-node orbit-two"><Binary size={16} /></span><span className="orbit-node orbit-three"><Image size={17} /></span><span className="orbit-center"><Box size={19} /></span></div>
            <Link href="/tools" className="hero-search">
              <Search size={21} /><span>What do you need to get done?</span><kbd><Command size={12} /> K</kbd>
            </Link>
            <div className="quick-picks"><span>QUICK PICKS</span><Link href="/tools/pdf-merger">Merge PDF</Link><Link href="/tools/json-formatter">Format JSON</Link><Link href="/tools/image-resizer">Resize image</Link></div>
            <div className="hero-signal-row"><span><FileCheck2 size={14} /> Working outputs</span><span><LockKeyhole size={14} /> Browser-first</span><span><Layers3 size={14} /> 7 categories</span></div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Product principles">
          <span><ShieldCheck size={17} /> Browser-first processing</span>
          <span><Zap size={17} /> No sign-up for core tools</span>
          <span><Check size={17} /> Clear inputs. Clear outputs.</span>
        </section>

        <section className="catalog-section" id="categories">
          <aside className="catalog-rail">
            <span className="eyebrow"><span /> Tool library</span>
            <h2>A good tool is<br />a quiet advantage.</h2>
            <p>Every utility has a purpose, a plain interface, and an individual link you can return to.</p>
            <Link href="/tools" className="rail-link">Open the full catalog <ArrowRight size={16} /></Link>
          </aside>
          <div className="catalog-body">
            <div className="category-tabs">
              {categories.map((category, index) => <Link key={category} href={`/tools?category=${encodeURIComponent(category)}`} className={index === 0 ? "tab-active" : ""}><span className="category-tab-dot">{String(index + 1).padStart(2, "0")}</span>{category.replace(" Tools", "")}</Link>)}
            </div>
            <div className="tool-grid">
              {featured.map((tool, index) => <ToolCard key={tool.slug} tool={tool} index={index} />)}
            </div>
            <Link href="/tools" className="catalog-cta">See all {tools.length} tools <ArrowRight size={17} /></Link>
          </div>
        </section>

        <section className="workflow-section" id="how-it-works">
          <div className="workflow-illustration"><img src="/manus-storage/mega-tools-workflow-texture_68f225b4.png" alt="Abstract illustration of a simple file transformation workflow" /></div>
          <div className="workflow-copy">
            <span className="eyebrow"><span /> Built for the work, not the wait.</span>
            <h2>One purposeful step<br />after another.</h2>
            <div className="workflow-steps">
              <div><b>01</b><i><WandSparkles size={17} /></i><span><strong>Pick the right tool.</strong><small>Each page opens directly to its useful task.</small></span></div>
              <div><b>02</b><i><Layers3 size={17} /></i><span><strong>Add your input.</strong><small>Paste text, set the values, or drop in a file.</small></span></div>
              <div><b>03</b><i><FileCheck2 size={17} /></i><span><strong>Keep the result.</strong><small>Copy it, download it, or make the next move.</small></span></div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} MEGA TOOLS</span><span>Practical work, made lighter.</span><Link href="/tools">All tools</Link>
      </footer>
    </div>
  );
}
