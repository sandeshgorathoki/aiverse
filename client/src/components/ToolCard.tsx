/** MEGA TOOLS style reminder — utility cards are quiet paper modules; cobalt appears only at the active edge. */
import {
  ArrowUpRight, BadgeCheck, Binary, Braces, Calculator, CaseSensitive, Code2, CodeXml, Combine, Crop, FileArchive,
  FileCog, FileDown, FileImage, FileJson, FileOutput, FileText, FlipHorizontal, Hash, Image, KeyRound, LucideIcon,
  Minimize2, Percent, QrCode, RotateCw, ScanText, Scissors, ShieldCheck, Shuffle, Sparkles, Split, Timer, Wrench,
} from "lucide-react";
import { Link } from "wouter";
import type { Tool } from "@/lib/tools";

const iconMap: Record<string, LucideIcon> = {
  "PDF Tools": FileText,
  "Image Tools": Image,
  "Developer Tools": Code2,
  Calculators: Calculator,
  "Text Tools": ScanText,
  Converters: Braces,
  "Security & Generators": KeyRound,
};

const operationIconMap: Record<string, LucideIcon> = {
  merge: Combine, split: Split, compress: FileArchive, "to-jpg": FileImage, "from-jpg": FileOutput, rotate: RotateCw, extract: Scissors, "to-text": ScanText,
  "jpg-to-png": FileImage, "png-to-jpg": FileImage, webp: Image, resize: Minimize2, crop: Crop, flip: FlipHorizontal, base64: Binary,
  "json-format": FileJson, "json-validate": ShieldCheck, "json-minify": Minimize2, "base64-encode": Binary, "base64-decode": Binary, uuid: QrCode,
  "url-encode": CodeXml, "url-decode": CodeXml, "html-format": Code2, "css-format": Code2, "js-format": Code2, regex: ScanText, timestamp: Timer,
  age: Timer, percentage: Percent, loan: Calculator, mortgage: Calculator, salary: Calculator, gst: Percent, tip: Percent, discount: Percent, bmi: Calculator, time: Timer, date: Timer, compound: Calculator,
  "word-count": ScanText, "character-count": CaseSensitive, case: CaseSensitive, dedupe: Combine, sort: Shuffle, reverse: Shuffle, slug: Hash, lorem: FileText,
  length: Braces, weight: Braces, temperature: Braces, speed: Braces, storage: FileCog, timezone: Timer, base: Binary,
  password: KeyRound, sha256: ShieldCheck, "random-number": Hash, "random-string": Sparkles, jwt: KeyRound,
};

const operationLabel: Record<string, string> = {
  merge: "Combine", split: "Separate", compress: "Optimize", "to-jpg": "Render", "from-jpg": "Assemble", rotate: "Rotate", extract: "Extract", "to-text": "Read",
  "jpg-to-png": "Convert", "png-to-jpg": "Convert", webp: "Convert", resize: "Scale", crop: "Frame", flip: "Mirror", base64: "Encode",
  "json-format": "Format", "json-validate": "Verify", "json-minify": "Minify", "base64-encode": "Encode", "base64-decode": "Decode", uuid: "Generate",
  "url-encode": "Encode", "url-decode": "Decode", "html-format": "Format", "css-format": "Format", "js-format": "Format", regex: "Test", timestamp: "Convert",
};

export function ToolCard({ tool, index = 0 }: { tool: Tool; index?: number }) {
  const CategoryIcon = iconMap[tool.icon] ?? Wrench;
  const ActionIcon = operationIconMap[tool.operation] ?? CategoryIcon;
  return (
    <Link href={`/tools/${tool.slug}`} className={`tool-card mode-${tool.mode}`} style={{ "--delay": `${Math.min(index, 8) * 35}ms` } as React.CSSProperties}>
      <span className="tool-card-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="tool-card-icon"><ActionIcon size={19} strokeWidth={1.9} /></span>
      <span className="tool-card-copy">
        <span className="tool-card-topline"><small><CategoryIcon size={11} /> {tool.category}</small><span className="operation-chip">{operationLabel[tool.operation] ?? "Run"}</span></span>
        <strong>{tool.name}</strong>
        <span className="tool-card-description">{tool.description}</span>
        <span className="tool-card-support"><BadgeCheck size={12} /> Browser tool</span>
      </span>
      <span className="tool-card-arrow"><ArrowUpRight size={16} /></span>
    </Link>
  );
}
