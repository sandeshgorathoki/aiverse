/** MEGA TOOLS style reminder — each tool page is an honest workbench: output first, explanation offset alongside. */
import { ArrowLeft, ArrowUpRight, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolCard } from "@/components/ToolCard";
import { SeoHead, toolSeo } from "@/lib/seo";
import { getTool, tools } from "@/lib/tools";
import NotFound from "./NotFound";

const guidance: Record<string, { use: string[]; explanation: string }> = {
  "pdf-merger": { use: ["Choose the PDFs in the order you want them combined.", "Select Process PDF.", "Your merged PDF downloads directly from the browser."], explanation: "Merge PDF copies every page from the files you choose into a new PDF document. It is useful when an application, archive, or sharing workflow needs a single file." },
  "json-formatter": { use: ["Paste valid JSON into the input field.", "Select Run tool to format and validate it.", "Copy or download the formatted result."], explanation: "JSON formatting adds indentation and line breaks without changing the underlying keys, values, arrays, or objects. It is an easy way to inspect API payloads and configuration files." },
};

export default function ToolPage() {
  const [, params] = useRoute("/tools/:slug");
  const tool = getTool(params?.slug ?? "");
  if (!tool) return <NotFound />;
  const seo = toolSeo(tool);
  const localAction = tool.mode === "pdf" ? "The PDF is read and rewritten in this browser tab; download the resulting file when processing finishes." : tool.mode === "image" ? "The image is decoded on this device, transformed on a local canvas, and returned as a download or Base64 value." : tool.mode === "calculator" ? "The figures are calculated in this browser from the values you enter. Check the stated formula before relying on an estimate." : tool.mode === "converter" ? "The selected conversion formula runs locally and the result is shown at the precision supported by the chosen units." : tool.mode === "generator" ? "The value is generated or decoded in this browser. No account is involved and no server-side history is created." : "Pasted text is processed in the active browser tab. Copy or download the exact result from the output panel.";
  const detail = guidance[tool.slug] ?? { use: [tool.mode === "pdf" || tool.mode === "image" ? "Choose the file or files this operation accepts." : "Enter the exact value or text you want to work with.", "Run the named action in the working canvas.", tool.mode === "pdf" || tool.mode === "image" ? "Save the file created by the browser." : "Copy or download the resulting value."], explanation: localAction };
  const related = tools.filter((candidate) => candidate.category === tool.category && candidate.slug !== tool.slug).slice(0, 3);
  return <div className="site-shell tool-page"><SeoHead {...seo} /><SiteHeader /><main className="tool-main">
    <div className="breadcrumb"><Link href="/tools"><ArrowLeft size={14} /> All tools</Link><span>/</span><span>{tool.category}</span></div>
    <section className="tool-intro"><div><span className="eyebrow"><span /> {tool.category}</span><h1>{tool.name}</h1><p>{tool.description}</p></div><div className="tool-trust"><span><ShieldCheck size={16} /> Browser-first</span><span><LockKeyhole size={16} /> No account required</span></div></section>
    <section className="tool-workbench"><ToolWorkspace tool={tool} /><aside className="workbench-aside"><div className="aside-note"><span className="aside-label">How to use it</span><ol>{detail.use.map((step) => <li key={step}>{step}</li>)}</ol></div><div className="aside-note subtle"><span className="aside-label">A practical note</span><p>{detail.explanation}</p></div></aside></section>
    <section className="tool-confidence"><CheckCircle2 size={22} /><div><strong>Input stays in the working canvas. Output is yours to keep.</strong><p>{localAction}</p></div></section>
    <section className="tool-knowledge" aria-labelledby="about-tool"><div className="knowledge-intro"><span className="eyebrow"><span /> About this tool</span><h2 id="about-tool">What {tool.name} does</h2><p>{seo.explanation}</p></div><div className="faq-list"><span className="aside-label">Common questions</span>{seo.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>
    {related.length > 0 && <section className="related-section"><div><span className="eyebrow"><span /> Continue your work</span><h2>Related utilities</h2></div><Link href="/tools" className="related-all">See every tool <ArrowUpRight size={15} /></Link><div className="tool-grid related-grid">{related.map((candidate, index) => <ToolCard key={candidate.slug} tool={candidate} index={index} />)}</div></section>}
  </main></div>;
}
