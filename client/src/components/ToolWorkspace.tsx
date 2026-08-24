/**
 * MEGA TOOLS style reminder — Utility Ledger workspaces foreground the input/output task.
 * Every action has an honest browser-side implementation and a clear state.
 */
import imageCompression from "browser-image-compression";
import { PDFDocument, degrees } from "pdf-lib";
import { format as prettierFormat } from "prettier/standalone";
import * as prettierBabel from "prettier/plugins/babel";
import * as prettierEstree from "prettier/plugins/estree";
import * as prettierHtml from "prettier/plugins/html";
import * as prettierPostcss from "prettier/plugins/postcss";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import { ArrowLeftRight, Braces, Calculator, Check, CircleDot, Copy, Download, FileCode2, FileImage, FileText, FileUp, Image as ImageIcon, KeyRound, LoaderCircle, LockKeyhole, RefreshCcw, ScanText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tool } from "@/lib/tools";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const normalizeBase64 = (value: string) => {
  const normalized = value.trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!normalized || /[^A-Za-z0-9+/=]/.test(normalized)) throw new Error("Enter valid Base64 text.");
  return normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
};
const decodeUnicode = (value: string) => decoder.decode(Uint8Array.from(atob(normalizeBase64(value)), (char) => char.charCodeAt(0)));
const encodeUnicode = (value: string) => btoa(Array.from(encoder.encode(value), (byte) => String.fromCharCode(byte)).join(""));

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
}

function downloadText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Your browser blocked clipboard access");
  }
}

const titleCase = (value: string) => value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
const sentenceCase = (value: string) => value.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase());
const words = (value: string) => value.trim().match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? [];
const slugify = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function formatHtml(value: string) {
  const tokens = value.replace(/>\s*</g, "><").replace(/></g, ">\n<").split("\n");
  let depth = 0;
  return tokens.map((line) => {
    if (/^<\//.test(line)) depth = Math.max(0, depth - 1);
    const formatted = `${"  ".repeat(depth)}${line.trim()}`;
    if (/^<[^!/][^>]*[^/]?>$/.test(line) && !/^<\/(?:)/.test(line) && !/<(?:meta|link|img|input|br|hr)\b/i.test(line)) depth += 1;
    return formatted;
  }).join("\n");
}

function formatCss(value: string) {
  return value.replace(/\s*{\s*/g, " {\n  ").replace(/;\s*/g, ";\n  ").replace(/\s*}\s*/g, "\n}\n\n").replace(/\n  \n}/g, "\n}").trim();
}

function formatJs(value: string) {
  return value.replace(/\{\s*/g, "{\n  ").replace(/;\s*/g, ";\n  ").replace(/\s*}/g, "\n}").replace(/\n\s*\n/g, "\n").trim();
}

function CodeWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [aux, setAux] = useState(tool.operation === "regex" ? "\\b\\w+\\b" : "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const noInput = tool.operation === "uuid";
  const execute = async () => {
    setError("");
    try {
      if (!noInput && !input.trim()) throw new Error("Enter or paste an input before running this tool.");
      let result = "";
      switch (tool.operation) {
        case "json-format": result = JSON.stringify(JSON.parse(input), null, 2); break;
        case "json-validate": JSON.parse(input); result = "✓ This is valid JSON."; break;
        case "json-minify": result = JSON.stringify(JSON.parse(input)); break;
        case "base64-encode": result = encodeUnicode(input); break;
        case "base64-decode": result = decodeUnicode(input.trim()); break;
        case "url-encode": result = encodeURIComponent(input); break;
        case "url-decode": result = decodeURIComponent(input); break;
        case "html-format": result = await prettierFormat(input, { parser: "html", plugins: [prettierHtml] }); break;
        case "css-format": result = await prettierFormat(input, { parser: "css", plugins: [prettierPostcss] }); break;
        case "js-format": result = await prettierFormat(input, { parser: "babel", plugins: [prettierBabel, prettierEstree as never] }); break;
        case "uuid": result = crypto.randomUUID(); break;
        case "regex": {
          if (!aux.trim()) throw new Error("Enter a regular expression pattern.");
          const expression = new RegExp(aux, "g");
          const matches = Array.from(input.matchAll(expression)).map((match, index) => `${index + 1}. “${match[0]}” at index ${match.index}`);
          result = matches.length ? `${matches.length} match${matches.length === 1 ? "" : "es"}\n\n${matches.join("\n")}` : "No matches found.";
          break;
        }
        case "timestamp": {
          const numeric = Number(input.trim());
          if (!Number.isFinite(numeric)) throw new Error("Enter a valid Unix timestamp.");
          const date = new Date(numeric < 1e12 ? numeric * 1000 : numeric);
          if (Number.isNaN(date.getTime())) throw new Error("That timestamp is out of range.");
          result = `Local: ${date.toLocaleString()}\nISO: ${date.toISOString()}\nUnix seconds: ${Math.floor(date.getTime() / 1000)}\nUnix milliseconds: ${date.getTime()}`;
          break;
        }
        default: result = input;
      }
      setOutput(result);
    } catch (exception) {
      setOutput("");
      setError(exception instanceof Error ? exception.message : "Could not process that input.");
    }
  };
  return <div className="workspace-card code-workspace">
    <div className="workspace-toolbar"><span>{tool.operation === "regex" ? "Pattern and test text" : noInput ? "Local generator" : "Input"}</span><div>{!noInput && <button onClick={() => setInput("")} className="quiet-button"><Trash2 size={14} /> Clear</button>}</div></div>
    {tool.operation === "regex" && <label className="inline-field"><span>Regular expression</span><input value={aux} onChange={(event) => setAux(event.target.value)} placeholder="e.g. \b\w+\b" /></label>}
    {!noInput && <textarea value={input} onChange={(event) => setInput(event.target.value)} className="workspace-textarea" placeholder={tool.operation.startsWith("json") ? '{ "example": true }' : tool.operation === "timestamp" ? "e.g. 1710000000" : "Paste or write here…"} spellCheck={false} />}
    {noInput && <div className="no-input-panel"><span>A secure v4 UUID will be generated in this browser.</span></div>}
    <div className="workspace-actions"><button onClick={execute} className="primary-action">{tool.operation === "uuid" ? "Generate UUID" : tool.operation === "regex" ? "Test expression" : "Run tool"}</button>{output && <button onClick={() => copyText(output)} className="secondary-action"><Copy size={14} /> Copy output</button>}</div>
    {error && <div className="tool-error">{error}</div>}
    {output && <div className="output-panel"><div className="output-header"><span>Output</span><button onClick={() => downloadText(output, `${tool.slug}.txt`)}><Download size={14} /> Download</button></div><pre>{output}</pre></div>}
  </div>;
}

function TextWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState("upper");
  const [output, setOutput] = useState("");
  const stats = useMemo(() => {
    const allWords = words(input); const chars = input.length; const sentences = input.trim() ? input.split(/[.!?]+/).filter(Boolean).length : 0; const paragraphs = input.trim() ? input.split(/\n\s*\n/).filter(Boolean).length : 0;
    return { words: allWords.length, chars, charsNoSpaces: input.replace(/\s/g, "").length, sentences, paragraphs, reading: Math.max(1, Math.ceil(allWords.length / 200)) };
  }, [input]);
  const transform = () => {
    let result = input;
    switch (tool.operation) {
      case "word-count": case "character-count": result = input; break;
      case "case": {
        const list = input.trim().split(/[^A-Za-z0-9]+/).filter(Boolean);
        result = style === "upper" ? input.toUpperCase() : style === "lower" ? input.toLowerCase() : style === "title" ? titleCase(input) : style === "sentence" ? sentenceCase(input) : style === "camel" ? list.map((word, index) => index ? titleCase(word) : word.toLowerCase()).join("") : style === "pascal" ? list.map(titleCase).join("") : style === "snake" ? list.map((word) => word.toLowerCase()).join("_") : list.map((word) => word.toLowerCase()).join("-"); break;
      }
      case "dedupe": result = Array.from(new Map(input.split(/\r?\n/).map((line) => [line.trim().toLocaleLowerCase(), line])).values()).join("\n"); break;
      case "sort": result = input.split(/\r?\n/).filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })).join("\n"); break;
      case "reverse": result = Array.from(input).reverse().join(""); break;
      case "slug": result = slugify(input); break;
      case "lorem": {
        const paragraphs = Math.min(Math.max(Number(input) || 3, 1), 12); const seed = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquet, tellus a semper ultricies, eros nisi gravida tellus, vel luctus lacus augue eget erat. Donec tincidunt tellus a mauris cursus, a imperdiet erat sodales.";
        result = Array.from({ length: paragraphs }, () => seed).join("\n\n"); break;
      }
    }
    setOutput(result);
  };
  const isCounter = tool.operation === "word-count" || tool.operation === "character-count";
  return <div className="workspace-card">
    <div className="workspace-toolbar"><span>{tool.operation === "lorem" ? "Paragraph count" : "Text input"}</span><button onClick={() => { setInput(""); setOutput(""); }} className="quiet-button"><Trash2 size={14} /> Clear</button></div>
    {tool.operation === "case" && <label className="inline-field"><span>Conversion</span><select value={style} onChange={(event) => setStyle(event.target.value)}><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="title">Title Case</option><option value="sentence">Sentence case</option><option value="camel">camelCase</option><option value="pascal">PascalCase</option><option value="snake">snake_case</option><option value="kebab">kebab-case</option></select></label>}
    {tool.operation === "lorem" ? <input type="number" min="1" max="12" value={input} onChange={(event) => setInput(event.target.value)} className="large-input" placeholder="3" /> : <textarea value={input} onChange={(event) => setInput(event.target.value)} className="workspace-textarea" placeholder="Paste or write here…" />}
    {isCounter && <div className="stat-grid"><div><b>{stats.words}</b><span>Words</span></div><div><b>{stats.chars}</b><span>Characters</span></div><div><b>{stats.charsNoSpaces}</b><span>No spaces</span></div><div><b>{stats.sentences}</b><span>Sentences</span></div><div><b>{stats.paragraphs}</b><span>Paragraphs</span></div><div><b>{stats.reading} min</b><span>Reading time</span></div></div>}
    {!isCounter && <div className="workspace-actions"><button onClick={transform} className="primary-action">{tool.operation === "lorem" ? "Generate text" : "Transform text"}</button>{output && <button onClick={() => copyText(output)} className="secondary-action"><Copy size={14} /> Copy output</button>}</div>}
    {!isCounter && output && <div className="output-panel"><div className="output-header"><span>Result</span><button onClick={() => downloadText(output, `${tool.slug}.txt`)}><Download size={14} /> Download</button></div><pre>{output}</pre></div>}
  </div>;
}

type Field = { key: string; label: string; type?: string; defaultValue?: string };
const calcFields: Record<string, Field[]> = {
  age: [{ key: "birth", label: "Date of birth", type: "date" }], percentage: [{ key: "value", label: "Number", defaultValue: "100" }, { key: "percent", label: "Percentage", defaultValue: "15" }], loan: [{ key: "principal", label: "Loan amount", defaultValue: "10000" }, { key: "rate", label: "Annual interest rate (%)", defaultValue: "6.5" }, { key: "years", label: "Term (years)", defaultValue: "5" }], mortgage: [{ key: "principal", label: "Mortgage amount", defaultValue: "350000" }, { key: "rate", label: "Annual interest rate (%)", defaultValue: "6.5" }, { key: "years", label: "Term (years)", defaultValue: "30" }], salary: [{ key: "annual", label: "Annual salary", defaultValue: "60000" }, { key: "hours", label: "Hours per week", defaultValue: "40" }], gst: [{ key: "amount", label: "Amount before GST", defaultValue: "100" }, { key: "rate", label: "GST rate (%)", defaultValue: "10" }], tip: [{ key: "bill", label: "Bill amount", defaultValue: "85" }, { key: "rate", label: "Tip (%)", defaultValue: "18" }, { key: "people", label: "People", defaultValue: "2" }], discount: [{ key: "price", label: "Original price", defaultValue: "120" }, { key: "discount", label: "Discount (%)", defaultValue: "20" }], bmi: [{ key: "weight", label: "Weight (kg)", defaultValue: "72" }, { key: "height", label: "Height (cm)", defaultValue: "175" }], time: [{ key: "hours", label: "Hours", defaultValue: "1" }, { key: "minutes", label: "Minutes", defaultValue: "45" }], date: [{ key: "start", label: "First date", type: "date" }, { key: "end", label: "Second date", type: "date" }], compound: [{ key: "principal", label: "Starting amount", defaultValue: "1000" }, { key: "rate", label: "Annual rate (%)", defaultValue: "7" }, { key: "years", label: "Years", defaultValue: "10" }, { key: "periods", label: "Compounds per year", defaultValue: "12" }],
};

function CalculatorWorkspace({ tool }: { tool: Tool }) {
  const fields = calcFields[tool.operation] ?? [];
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ""])));
  const [result, setResult] = useState<string[]>([]);
  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const calculate = () => {
    const n = (key: string) => Number(values[key]);
    try {
      let outcome: string[] = [];
      const money = (number: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(number);
      if (tool.operation === "age") { const birth = new Date(values.birth); if (Number.isNaN(birth.getTime())) throw new Error("Choose a date of birth."); const today = new Date(); let years = today.getFullYear() - birth.getFullYear(); let months = today.getMonth() - birth.getMonth(); let days = today.getDate() - birth.getDate(); if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); } if (months < 0) { years--; months += 12; } outcome = [`${years} years, ${months} months, ${days} days`, `Born on ${birth.toLocaleDateString()}`]; }
      if (tool.operation === "percentage") outcome = [`${n("percent")}% of ${n("value")} = ${(n("value") * n("percent")) / 100}`, `Formula: number × percentage ÷ 100`];
      if (tool.operation === "loan" || tool.operation === "mortgage") { const r = n("rate") / 100 / 12; const months = n("years") * 12; const payment = r === 0 ? n("principal") / months : n("principal") * (r * (1 + r) ** months) / ((1 + r) ** months - 1); outcome = [`Estimated monthly payment: ${money(payment)}`, `Total repaid: ${money(payment * months)}`, `Total interest: ${money(payment * months - n("principal"))}`, `Formula: P × [r(1+r)^n] ÷ [(1+r)^n − 1]`]; }
      if (tool.operation === "salary") outcome = [`Monthly: ${money(n("annual") / 12)}`, `Weekly: ${money(n("annual") / 52)}`, `Hourly: ${money(n("annual") / (n("hours") * 52))}`, `Assumes ${n("hours")} hours each week, 52 weeks per year.`];
      if (tool.operation === "gst") { const tax = n("amount") * n("rate") / 100; outcome = [`GST: ${money(tax)}`, `Total including GST: ${money(n("amount") + tax)}`, `Formula: amount × GST rate ÷ 100`]; }
      if (tool.operation === "tip") { const tip = n("bill") * n("rate") / 100; const total = n("bill") + tip; outcome = [`Tip: ${money(tip)}`, `Total: ${money(total)}`, `Per person: ${money(total / Math.max(n("people"), 1))}`]; }
      if (tool.operation === "discount") { const saving = n("price") * n("discount") / 100; outcome = [`You save: ${money(saving)}`, `Sale price: ${money(n("price") - saving)}`, `Formula: original price − (original price × discount ÷ 100)`]; }
      if (tool.operation === "bmi") { const bmi = n("weight") / (n("height") / 100) ** 2; const label = bmi < 18.5 ? "underweight range" : bmi < 25 ? "healthy range" : bmi < 30 ? "overweight range" : "obesity range"; outcome = [`BMI: ${bmi.toFixed(1)}`, `Classification: ${label}`, `Formula: kg ÷ m²`]; }
      if (tool.operation === "time") { const total = n("hours") * 60 + n("minutes"); outcome = [`${total} total minutes`, `${(total / 60).toFixed(2)} decimal hours`, `Formula: hours × 60 + minutes`]; }
      if (tool.operation === "date") { const start = new Date(values.start); const end = new Date(values.end); if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("Choose both dates."); const days = Math.round(Math.abs(end.getTime() - start.getTime()) / 86_400_000); outcome = [`${days} calendar days apart`, `${(days / 7).toFixed(1)} weeks apart`, `Difference is calculated from midnight to midnight.`]; }
      if (tool.operation === "compound") { const future = n("principal") * (1 + n("rate") / 100 / n("periods")) ** (n("periods") * n("years")); outcome = [`Estimated future value: ${money(future)}`, `Interest earned: ${money(future - n("principal"))}`, `Formula: P(1 + r/n)^(nt)`]; }
      if (outcome.some((item) => item.includes("NaN") || item.includes("Infinity"))) throw new Error("Use valid positive numbers for every field.");
      setResult(outcome);
    } catch (exception) { toast.error(exception instanceof Error ? exception.message : "Please check the values."); setResult([]); }
  };
  const financial = ["loan", "mortgage", "salary", "gst", "tip", "discount", "compound"].includes(tool.operation);
  return <div className="workspace-card calculator-workspace"><div className="field-grid">{fields.map((field) => <label key={field.key} className="form-field"><span>{field.label}</span><input type={field.type ?? "number"} step="any" value={values[field.key] ?? ""} onChange={(event) => setValue(field.key, event.target.value)} /></label>)}</div><div className="workspace-actions"><button onClick={calculate} className="primary-action">Calculate</button><button onClick={() => { setValues(Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ""]))); setResult([]); }} className="secondary-action"><RefreshCcw size={14} /> Reset</button></div>{result.length > 0 && <div className="calculation-result"><span>Result</span>{result.map((line) => <p key={line}>{line}</p>)}</div>}{financial && <p className="tool-note">This calculator provides an estimate for planning only. Actual rates, fees, tax treatment, and lender calculations can differ.</p>}</div>;
}

const converterUnits: Record<string, Record<string, number>> = { length: { metres: 1, kilometres: 1000, centimetres: 0.01, miles: 1609.344, feet: 0.3048, inches: 0.0254 }, weight: { kilograms: 1, grams: 0.001, pounds: 0.45359237, ounces: 0.028349523125 }, speed: { "metres / second": 1, "kilometres / hour": 0.2777777778, mph: 0.44704, knots: 0.5144444444 }, storage: { bytes: 1, kilobytes: 1000, megabytes: 1_000_000, gigabytes: 1_000_000_000, terabytes: 1_000_000_000_000 } };
const unitNames: Record<string, string> = { length: "Length", weight: "Weight", speed: "Speed", storage: "Data storage" };

function ConverterWorkspace({ tool }: { tool: Tool }) {
  const operation = tool.operation;
  const keys = operation === "temperature" ? ["Celsius", "Fahrenheit", "Kelvin"] : operation === "base" ? ["Binary", "Octal", "Decimal", "Hexadecimal"] : operation === "timezone" ? ["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney", "UTC"] : Object.keys(converterUnits[operation] ?? {});
  const [amount, setAmount] = useState(operation === "timezone" ? new Date().toISOString().slice(0, 16) : "1");
  const [from, setFrom] = useState(keys[0]); const [to, setTo] = useState(keys[1] ?? keys[0]); const [result, setResult] = useState("");
  const convert = () => {
    try { let outcome = "";
      if (operation === "timezone") { const date = new Date(amount); if (Number.isNaN(date.getTime())) throw new Error("Choose a valid date and time."); outcome = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "long", timeZone: to }).format(date); }
      else if (operation === "base") { const baseFrom = { Binary: 2, Octal: 8, Decimal: 10, Hexadecimal: 16 }[from] ?? 10; const baseTo = { Binary: 2, Octal: 8, Decimal: 10, Hexadecimal: 16 }[to] ?? 10; const parsed = Number.parseInt(amount, baseFrom); if (Number.isNaN(parsed)) throw new Error(`“${amount}” is not valid ${from.toLowerCase()}.`); outcome = parsed.toString(baseTo).toUpperCase(); }
      else if (operation === "temperature") { const value = Number(amount); if (!Number.isFinite(value)) throw new Error("Enter a valid number."); const celsius = from === "Celsius" ? value : from === "Fahrenheit" ? (value - 32) * 5 / 9 : value - 273.15; const converted = to === "Celsius" ? celsius : to === "Fahrenheit" ? celsius * 9 / 5 + 32 : celsius + 273.15; outcome = `${Number(converted.toFixed(8))} ${to}`; }
      else { const value = Number(amount); if (!Number.isFinite(value)) throw new Error("Enter a valid number."); outcome = `${Number(((value * converterUnits[operation][from]) / converterUnits[operation][to]).toPrecision(12))} ${to}`; }
      setResult(outcome);
    } catch (exception) { toast.error(exception instanceof Error ? exception.message : "Could not convert that value."); setResult(""); }
  };
  return <div className="workspace-card converter-workspace"><div className="converter-row"><label className="form-field"><span>{operation === "timezone" ? "Date and time" : operation === "base" ? "Number" : `${unitNames[operation] ?? "Value"} value`}</span><input type={operation === "timezone" ? "datetime-local" : "text"} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>{operation !== "timezone" && <label className="form-field"><span>From</span><select value={from} onChange={(event) => setFrom(event.target.value)}>{keys.map((item) => <option key={item}>{item}</option>)}</select></label>}<label className="form-field"><span>{operation === "timezone" ? "Show in time zone" : "To"}</span><select value={to} onChange={(event) => setTo(event.target.value)}>{keys.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="workspace-actions"><button onClick={convert} className="primary-action">Convert</button></div>{result && <div className="conversion-result"><span>Converted value</span><strong>{result}</strong><button onClick={() => copyText(result)}><Copy size={14} /> Copy</button></div>}</div>;
}

function GeneratorWorkspace({ tool }: { tool: Tool }) {
  const [value, setValue] = useState(tool.operation === "random-number" ? "1" : tool.operation === "random-string" || tool.operation === "password" ? "16" : "");
  const [second, setSecond] = useState(tool.operation === "random-number" ? "100" : "");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async () => { try { setBusy(true); let result = "";
    if (tool.operation === "password" || tool.operation === "random-string") { const alphabet = tool.operation === "password" ? "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?" : "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; const bytes = crypto.getRandomValues(new Uint32Array(Math.min(Math.max(Number(value) || 16, 4), 128))); result = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join(""); }
    if (tool.operation === "random-number") { const min = Math.ceil(Number(value)); const max = Math.floor(Number(second)); if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) throw new Error("Set a valid minimum and maximum."); result = String(crypto.getRandomValues(new Uint32Array(1))[0] % (max - min + 1) + min); }
    if (tool.operation === "sha256") { if (!value) throw new Error("Enter text to hash."); const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value)); result = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
    if (tool.operation === "jwt") { const parts = value.trim().split("."); if (parts.length < 2) throw new Error("Paste a JWT with a header and payload."); const decodePart = (part: string) => JSON.stringify(JSON.parse(decodeUnicode(part.replace(/-/g, "+").replace(/_/g, "/"))), null, 2); result = `HEADER\n${decodePart(parts[0])}\n\nPAYLOAD\n${decodePart(parts[1])}`; }
    setOutput(result);
  } catch (exception) { toast.error(exception instanceof Error ? exception.message : "Could not generate output."); setOutput(""); } finally { setBusy(false); } };
  const inputLabel = tool.operation === "sha256" ? "Text to hash" : tool.operation === "jwt" ? "JWT token" : tool.operation === "random-number" ? "Minimum" : "Length";
  return <div className="workspace-card generator-workspace"><label className="form-field"><span>{inputLabel}</span>{["sha256", "jwt"].includes(tool.operation) ? <textarea className="workspace-textarea compact" value={value} onChange={(event) => setValue(event.target.value)} placeholder={tool.operation === "jwt" ? "eyJhbGciOi…" : "Write or paste text"} /> : <input type="number" value={value} onChange={(event) => setValue(event.target.value)} />}</label>{tool.operation === "random-number" && <label className="form-field"><span>Maximum</span><input type="number" value={second} onChange={(event) => setSecond(event.target.value)} /></label>}<div className="workspace-actions"><button onClick={run} className="primary-action" disabled={busy}>{busy && <LoaderCircle className="spin" size={15} />}{tool.operation === "sha256" ? "Create hash" : tool.operation === "jwt" ? "Decode token" : "Generate"}</button>{output && <button onClick={() => copyText(output)} className="secondary-action"><Copy size={14} /> Copy</button>}</div>{output && <div className="output-panel"><div className="output-header"><span>Output</span><button onClick={() => downloadText(output, `${tool.slug}.txt`)}><Download size={14} /> Download</button></div><pre>{output}</pre></div>}<p className="tool-note">{tool.operation === "jwt" ? "This reads the token structure locally. It does not verify the signature." : "Generated and processed locally in your browser."}</p></div>;
}

function ImageWorkspace({ tool }: { tool: Tool }) {
  const [files, setFiles] = useState<File[]>([]); const [preview, setPreview] = useState(""); const [width, setWidth] = useState("1200"); const [height, setHeight] = useState("800"); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [dataOutput, setDataOutput] = useState("");
  useEffect(() => { if (!files[0]) { setPreview(""); return; } const url = URL.createObjectURL(files[0]); setPreview(url); return () => URL.revokeObjectURL(url); }, [files]);
  const fileName = (extension: string) => `${files[0]?.name.replace(/\.[^.]+$/, "") ?? "image"}.${extension}`;
  const render = async () => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = URL.createObjectURL(files[0]); }); return image;
  };
  const process = async () => { if (!files.length) return toast.error("Add an image first."); try { setBusy(true); setMessage(""); setDataOutput(""); const file = files[0];
    if (tool.operation === "base64") { const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read the file.")); reader.readAsDataURL(file); }); setDataOutput(data); setMessage("Base64 data is ready. Copy or download it below."); return; }
    if (tool.operation === "compress") { const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 2500, useWebWorker: true }); downloadBlob(compressed, `compressed-${file.name}`); setMessage(`Downloaded ${(compressed.size / 1024).toFixed(0)} KB file (original ${(file.size / 1024).toFixed(0)} KB).`); return; }
    const img = await render(); const canvas = document.createElement("canvas"); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is not available in this browser."); let outWidth = img.naturalWidth; let outHeight = img.naturalHeight; const rotation = tool.operation === "rotate" ? 90 : 0; if (tool.operation === "resize") { outWidth = Math.max(1, Number(width)); outHeight = Math.max(1, Number(height)); } if (tool.operation === "crop") { outWidth = outHeight = Math.min(img.naturalWidth, img.naturalHeight); } if (rotation) { canvas.width = outHeight; canvas.height = outWidth; context.translate(outHeight / 2, outWidth / 2); context.rotate(Math.PI / 2); context.drawImage(img, -outWidth / 2, -outHeight / 2, outWidth, outHeight); } else { canvas.width = outWidth; canvas.height = outHeight; if (tool.operation === "png-to-jpg") { context.fillStyle = "#fff"; context.fillRect(0, 0, outWidth, outHeight); } if (tool.operation === "flip") { context.translate(outWidth, 0); context.scale(-1, 1); context.drawImage(img, 0, 0, outWidth, outHeight); } else if (tool.operation === "crop") { const offsetX = (img.naturalWidth - outWidth) / 2; const offsetY = (img.naturalHeight - outHeight) / 2; context.drawImage(img, offsetX, offsetY, outWidth, outHeight, 0, 0, outWidth, outHeight); } else context.drawImage(img, 0, 0, outWidth, outHeight); }
    const type = tool.operation === "jpg-to-png" ? "image/png" : tool.operation === "png-to-jpg" ? "image/jpeg" : tool.operation === "webp" ? "image/webp" : file.type || "image/png"; const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not create the image.")), type, .92)); const extension = type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png"; downloadBlob(blob, fileName(extension)); setMessage(`Done — ${outWidth} × ${outHeight}px downloaded.`);
  } catch (exception) { toast.error(exception instanceof Error ? exception.message : "Could not process this image."); } finally { setBusy(false); } };
  const needsDimensions = tool.operation === "resize";
  return <div className="workspace-card file-workspace"><FileInput files={files} setFiles={setFiles} accept="image/*" multiple={false} /><div className="file-preview">{preview ? <img src={preview} alt="Selected image preview" /> : <span>Select an image to inspect it here.</span>}</div>{needsDimensions && <div className="dimension-row"><label className="form-field"><span>Width (px)</span><input type="number" value={width} onChange={(event) => setWidth(event.target.value)} /></label><label className="form-field"><span>Height (px)</span><input type="number" value={height} onChange={(event) => setHeight(event.target.value)} /></label></div>}<div className="workspace-actions"><button onClick={process} disabled={busy} className="primary-action">{busy && <LoaderCircle className="spin" size={15} />}{busy ? "Processing" : tool.operation === "base64" ? "Create Base64" : "Process image"}</button><button onClick={() => { setFiles([]); setMessage(""); setDataOutput(""); }} className="secondary-action"><RefreshCcw size={14} /> Reset</button></div>{message && <div className="success-message"><Check size={16} /> {message}</div>}{dataOutput && <div className="output-panel"><div className="output-header"><span>Base64 output</span><span><button onClick={() => copyText(dataOutput)}><Copy size={14} /> Copy</button><button onClick={() => downloadText(dataOutput, `${fileName("base64")}.txt`)}><Download size={14} /> Download</button></span></div><pre>{dataOutput}</pre></div>}<p className="tool-note">Images are processed locally in the browser; files are not sent to a MEGA TOOLS server.</p></div>;
}

function FileInput({ files, setFiles, accept, multiple }: { files: File[]; setFiles: (files: File[]) => void; accept: string; multiple: boolean }) {
  const [dragging, setDragging] = useState(false);
  const receive = (incoming: FileList | null) => { const selection = Array.from(incoming ?? []); setFiles(multiple ? selection : selection.slice(0, 1)); };
  const drop = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setDragging(false); receive(event.dataTransfer.files); };
  return <label className={`drop-zone ${dragging ? "drop-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}><FileUp size={25} /><strong>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Drop files here or choose from your device"}</strong><span>{files.length ? files.map((file) => file.name).join(", ") : multiple ? "Choose one or more files" : "Choose a file"}</span><input type="file" accept={accept} multiple={multiple} onChange={(event) => receive(event.target.files)} /></label>;
}

function parsePageSpec(value: string, maximum: number) { const found = new Set<number>(); value.split(",").forEach((part) => { const [start, end] = part.trim().split("-").map(Number); if (!Number.isFinite(start)) return; for (let page = start; page <= (Number.isFinite(end) ? end : start); page++) if (page >= 1 && page <= maximum) found.add(page - 1); }); return Array.from(found).sort((a, b) => a - b); }

function PdfWorkspace({ tool }: { tool: Tool }) {
  const imageMode = tool.operation === "from-jpg"; const [files, setFiles] = useState<File[]>([]); const [pages, setPages] = useState("1"); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [textOutput, setTextOutput] = useState("");
  const process = async () => { if (!files.length) return toast.error(`Add ${imageMode ? "an image" : "a PDF"} first.`); try { setBusy(true); setMessage(""); setTextOutput("");
    if (tool.operation === "from-jpg") { const doc = await PDFDocument.create(); for (const file of files) { const bytes = await file.arrayBuffer(); const isPng = file.type === "image/png" || /\.png$/i.test(file.name); const source = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes); const page = doc.addPage([source.width, source.height]); page.drawImage(source, { x: 0, y: 0, width: source.width, height: source.height }); } downloadBlob(new Blob([await doc.save()], { type: "application/pdf" }), "images-to-pdf.pdf"); setMessage("Your PDF has been downloaded."); return; }
    if (tool.operation === "merge") { const output = await PDFDocument.create(); for (const file of files) { const source = await PDFDocument.load(await file.arrayBuffer()); const copied = await output.copyPages(source, source.getPageIndices()); copied.forEach((page) => output.addPage(page)); } downloadBlob(new Blob([await output.save()], { type: "application/pdf" }), "merged.pdf"); setMessage(`Merged ${files.length} PDF files.`); return; }
    const sourceBytes = await files[0].arrayBuffer(); const source = await PDFDocument.load(sourceBytes); const pageCount = source.getPageCount();
    if (tool.operation === "split") { for (let index = 0; index < pageCount; index++) { const output = await PDFDocument.create(); const [page] = await output.copyPages(source, [index]); output.addPage(page); downloadBlob(new Blob([await output.save()], { type: "application/pdf" }), `page-${index + 1}.pdf`); } setMessage(`${pageCount} individual PDF files were downloaded.`); return; }
    if (tool.operation === "compress") { const output = await PDFDocument.load(sourceBytes); downloadBlob(new Blob([await output.save({ useObjectStreams: true })], { type: "application/pdf" }), "optimized.pdf"); setMessage("Rewritten PDF downloaded with optimized object streams. Actual savings depend on the original file."); return; }
    if (tool.operation === "rotate") { source.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + 90) % 360))); downloadBlob(new Blob([await source.save()], { type: "application/pdf" }), "rotated.pdf"); setMessage("Rotated PDF downloaded."); return; }
    if (tool.operation === "extract") { const indices = parsePageSpec(pages, pageCount); if (!indices.length) throw new Error(`Enter a valid page number between 1 and ${pageCount}.`); const output = await PDFDocument.create(); const selected = await output.copyPages(source, indices); selected.forEach((page) => output.addPage(page)); downloadBlob(new Blob([await output.save()], { type: "application/pdf" }), "extracted-pages.pdf"); setMessage(`${indices.length} page${indices.length === 1 ? "" : "s"} extracted.`); return; }
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString(); const pdf = await pdfjs.getDocument({ data: sourceBytes }).promise;
    if (tool.operation === "to-jpg") { for (let index = 1; index <= pdf.numPages; index++) { const page = await pdf.getPage(index); const viewport = page.getViewport({ scale: 1.65 }); const canvas = document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is not available in this browser."); await page.render({ canvas, canvasContext: context, viewport }).promise; const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not render this page.")), "image/jpeg", .9)); downloadBlob(blob, `page-${index}.jpg`); } setMessage(`${pdf.numPages} JPG image${pdf.numPages === 1 ? "" : "s"} downloaded.`); return; }
    if (tool.operation === "to-text") { const strings: string[] = []; for (let index = 1; index <= pdf.numPages; index++) { const page = await pdf.getPage(index); const content = await page.getTextContent(); strings.push(`— Page ${index} —\n${content.items.map((item) => "str" in item ? item.str : "").join(" ")}`); } const output = strings.join("\n\n"); setTextOutput(output); downloadText(output, "pdf-text.txt"); setMessage(output.trim().replace(/— Page \d+ —/g, "").trim() ? "Text extracted and downloaded. A preview is shown below." : "No embedded text was found. This PDF may be an image scan."); return; }
  } catch (exception) { toast.error(exception instanceof Error ? exception.message : "Could not process this PDF."); } finally { setBusy(false); } };
  return <div className="workspace-card file-workspace"><FileInput files={files} setFiles={setFiles} accept={imageMode ? "image/jpeg,image/png" : "application/pdf"} multiple={tool.operation === "merge" || imageMode} />{tool.operation === "extract" && <label className="inline-field"><span>Pages to extract</span><input value={pages} onChange={(event) => setPages(event.target.value)} placeholder="e.g. 1-3, 5" /></label>}<div className="workspace-actions"><button onClick={process} disabled={busy} className="primary-action">{busy && <LoaderCircle className="spin" size={15} />}{busy ? "Working" : tool.operation === "split" ? "Split PDF" : "Process PDF"}</button><button onClick={() => { setFiles([]); setMessage(""); setTextOutput(""); }} className="secondary-action"><RefreshCcw size={14} /> Reset</button></div>{message && <div className="success-message"><Check size={16} /> {message}</div>}{textOutput && <div className="output-panel"><div className="output-header"><span>Extracted text</span><span><button onClick={() => copyText(textOutput)}><Copy size={14} /> Copy</button><button onClick={() => downloadText(textOutput, "pdf-text.txt")}><Download size={14} /> Download</button></span></div><pre>{textOutput}</pre></div>}<p className="tool-note">PDF processing happens locally in this browser. Large or encrypted PDFs may need more time or may be rejected by your browser.</p></div>;
}

const workspaceIdentity: Record<Tool["mode"], { icon: typeof FileCode2; label: string; note: string }> = {
  code: { icon: FileCode2, label: "Developer canvas", note: "Parse, format, or inspect an exact value" },
  text: { icon: ScanText, label: "Text canvas", note: "Measure or transform editable text" },
  calculator: { icon: Calculator, label: "Calculation canvas", note: "Set values and read a clear local estimate" },
  converter: { icon: ArrowLeftRight, label: "Conversion canvas", note: "Move a value precisely between units" },
  generator: { icon: KeyRound, label: "Local generator", note: "Create or decode a value in this tab" },
  image: { icon: ImageIcon, label: "Image canvas", note: "Choose a file, make a change, keep the output" },
  pdf: { icon: FileText, label: "Document canvas", note: "Work directly with selected files" },
};

function WorkspaceIdentity({ tool }: { tool: Tool }) {
  const item = workspaceIdentity[tool.mode];
  const Icon = item.icon;
  return <div className={`workspace-identity mode-${tool.mode}`}><span className="workspace-identity-icon"><Icon size={18} /></span><span className="workspace-identity-copy"><small>{item.label}</small><strong>{item.note}</strong></span><span className="workspace-identity-status"><CircleDot size={12} /> Ready in browser</span><span className="workspace-identity-local"><LockKeyhole size={12} /> Local</span></div>;
}

export function ToolWorkspace({ tool }: { tool: Tool }) {
  const content = tool.mode === "code" ? <CodeWorkspace tool={tool} />
    : tool.mode === "text" ? <TextWorkspace tool={tool} />
      : tool.mode === "calculator" ? <CalculatorWorkspace tool={tool} />
        : tool.mode === "converter" ? <ConverterWorkspace tool={tool} />
          : tool.mode === "generator" ? <GeneratorWorkspace tool={tool} />
            : tool.mode === "image" ? <ImageWorkspace tool={tool} />
              : <PdfWorkspace tool={tool} />;
  return <div className={`workspace-shell mode-${tool.mode}`}><WorkspaceIdentity tool={tool} />{content}</div>;
}
