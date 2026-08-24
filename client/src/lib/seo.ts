/**
 * MEGA TOOLS style reminder — Utility Ledger SEO copy is factual, task-specific, and clear.
 * Metadata describes the working utility honestly; it never promises an unavailable result.
 */
import { useEffect } from "react";
import type { Tool } from "./tools";

const fallbackSiteUrl = "https://mega-tools.manus.space";

export type SeoEntry = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  structuredData?: Record<string, unknown>[];
};

export type FAQ = { question: string; answer: string };

export const getSiteUrl = () => typeof window === "undefined" ? fallbackSiteUrl : window.location.origin;
export const absoluteUrl = (path: string) => new URL(path, getSiteUrl()).href;

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SeoHead({ title, description, path, keywords, structuredData }: SeoEntry) {
  useEffect(() => {
    const canonical = absoluteUrl(path);
    const fullTitle = title.includes("MEGA TOOLS") ? title : `${title} | MEGA TOOLS`;
    document.title = fullTitle;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="keywords"]', "name", "keywords", keywords.join(", "));
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonical);
    setMeta('meta[property="og:type"]', "property", "og:type", path === "/" ? "website" : "article");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;
    const scriptId = "mega-tools-structured-data";
    document.getElementById(scriptId)?.remove();
    if (structuredData?.length) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData.length === 1 ? structuredData[0] : structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, path, keywords, structuredData]);
  return null;
}

const modeDescription: Record<Tool["mode"], string> = {
  pdf: "It processes the selected PDF or image files in the browser and prepares a real downloadable result.",
  image: "It works from the image file you choose and produces a transformed image or copyable data value locally in the browser.",
  code: "It evaluates the pasted text in the browser and returns a result you can inspect, copy, or download.",
  calculator: "It applies the displayed formula to the values you provide and presents the calculation clearly.",
  text: "It transforms or measures the text you enter directly in the current browser tab.",
  converter: "It converts the value you enter using the selected units or number system in the current browser tab.",
  generator: "It generates, hashes, or decodes the requested value locally using browser capabilities.",
};

const inputDescription: Record<Tool["mode"], string> = {
  pdf: "a supported PDF or image file",
  image: "an image file from your device",
  code: "text, code, or a data value",
  calculator: "the values requested by the formula",
  text: "the text you want to work with",
  converter: "a value and source/target units",
  generator: "a length, range, token, or text value when the tool requests one",
};

export function toolFaqs(tool: Tool): FAQ[] {
  const input = inputDescription[tool.mode];
  return [
    { question: `How do I use the ${tool.name}?`, answer: `Provide ${input}, then select the action in the working canvas. ${modeDescription[tool.mode]} Copy or download the result when the operation is complete.` },
    { question: `Does the ${tool.name} require an account?`, answer: `No. The ${tool.name} is available directly in the browser without a MEGA TOOLS account.` },
    { question: `Where is my input processed?`, answer: tool.mode === "pdf" || tool.mode === "image" ? `The ${tool.name} processes supported files in your browser where possible. Large, encrypted, or unsupported files can be rejected by the browser.` : `The ${tool.name} processes the value you enter in the active browser tab.` },
  ];
}

export function toolSeo(tool: Tool): SeoEntry & { faqs: FAQ[]; explanation: string } {
  const path = `/tools/${tool.slug}`;
  const faqs = toolFaqs(tool);
  const title = `Free ${tool.name} Online`;
  const description = `${tool.description} Use this free ${tool.name.toLowerCase()} in your browser with no account required.`;
  const explanation = `${tool.name} is built for one focused task: ${tool.description.charAt(0).toLowerCase()}${tool.description.slice(1)} ${modeDescription[tool.mode]}`;
  const url = absoluteUrl(path);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web browser",
    url,
    description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MEGA TOOLS", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "All tools", item: absoluteUrl("/tools") },
      { "@type": "ListItem", position: 3, name: tool.name, item: url },
    ],
  };
  return { title, description, path, explanation, faqs, keywords: [tool.name, `free ${tool.name.toLowerCase()}`, `${tool.name.toLowerCase()} online`, tool.category.toLowerCase(), "MEGA TOOLS"], structuredData: [softwareSchema, faqSchema, breadcrumbSchema] };
}

export const homeSeo: SeoEntry = {
  title: "MEGA TOOLS — Free Online Tools for Everyday Work",
  description: "Use practical online tools for PDF files, images, developer tasks, calculations, text, conversions, and generators. Browser-first and no account required for core tools.",
  path: "/",
  keywords: ["free online tools", "PDF tools", "image tools", "JSON formatter", "calculators", "text tools", "MEGA TOOLS"],
  structuredData: [{ "@context": "https://schema.org", "@type": "WebSite", name: "MEGA TOOLS", url: absoluteUrl("/"), description: "Free browser-first online utilities for everyday digital work." }],
};

export const librarySeo: SeoEntry = {
  title: "All Free Online Tools",
  description: "Browse the MEGA TOOLS library of browser-first PDF, image, developer, calculator, text, converter, and security utilities.",
  path: "/tools",
  keywords: ["online tool library", "free utility tools", "PDF tools", "image converters", "developer utilities", "MEGA TOOLS"],
  structuredData: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "MEGA TOOLS tool library", url: absoluteUrl("/tools"), description: "A categorized collection of browser-first online utilities." }],
};
