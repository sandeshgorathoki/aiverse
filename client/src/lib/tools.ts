/**
 * MEGA TOOLS style reminder — Utility Ledger: controlled white space, ink typography,
 * compact metadata, and Archive Cobalt reserved for action and active states.
 */
export type ToolMode = "pdf" | "image" | "code" | "calculator" | "text" | "converter" | "generator";

export type Tool = {
  slug: string;
  name: string;
  category: string;
  description: string;
  mode: ToolMode;
  operation: string;
  icon: string;
  featured?: boolean;
};

const define = (
  category: string,
  mode: ToolMode,
  data: Array<[string, string, string, string]>,
): Tool[] =>
  data.map(([slug, name, description, operation]) => ({
    slug,
    name,
    description,
    operation,
    category,
    mode,
    icon: category,
  }));

export const tools: Tool[] = [
  ...define("PDF Tools", "pdf", [
    ["pdf-merger", "PDF Merger", "Combine multiple PDF documents into one orderly file.", "merge"],
    ["pdf-splitter", "PDF Splitter", "Save every page of a PDF as its own document.", "split"],
    ["pdf-compressor", "PDF Compressor", "Rewrite a PDF with optimized object streams for a lighter download.", "compress"],
    ["pdf-to-jpg", "PDF to JPG", "Render PDF pages to ready-to-download JPEG images.", "to-jpg"],
    ["jpg-to-pdf", "JPG to PDF", "Turn one or more JPG images into a single PDF.", "from-jpg"],
    ["pdf-rotator", "PDF Rotator", "Rotate every page in a PDF by 90 degrees.", "rotate"],
    ["pdf-page-extractor", "PDF Page Extractor", "Extract a page range into a fresh PDF document.", "extract"],
    ["pdf-to-text", "PDF to Text", "Read selectable PDF text directly in your browser.", "to-text"],
  ]),
  ...define("Image Tools", "image", [
    ["jpg-to-png", "JPG to PNG", "Convert JPG files into crisp PNG images.", "jpg-to-png"],
    ["png-to-jpg", "PNG to JPG", "Flatten PNG artwork into compact JPG files.", "png-to-jpg"],
    ["webp-converter", "WebP Converter", "Export common image formats as modern WebP.", "webp"],
    ["image-compressor", "Image Compressor", "Compress image files locally before sharing them.", "compress"],
    ["image-resizer", "Image Resizer", "Resize an image to exact pixel dimensions.", "resize"],
    ["image-cropper", "Image Cropper", "Create a centred square crop from an image.", "crop"],
    ["image-rotator", "Image Rotator", "Rotate an image by a precise 90-degree increment.", "rotate"],
    ["image-flipper", "Image Flipper", "Mirror an image horizontally without uploading it.", "flip"],
    ["image-to-base64", "Image to Base64", "Turn an image file into a portable Base64 data URI.", "base64"],
  ]),
  ...define("Developer Tools", "code", [
    ["json-formatter", "JSON Formatter", "Indent and organize JSON for easier reading.", "json-format"],
    ["json-validator", "JSON Validator", "Check whether JSON is valid and readable.", "json-validate"],
    ["json-minifier", "JSON Minifier", "Remove JSON whitespace without changing its data.", "json-minify"],
    ["base64-encoder", "Base64 Encoder", "Encode Unicode-safe text as Base64.", "base64-encode"],
    ["base64-decoder", "Base64 Decoder", "Decode Base64 text back into readable content.", "base64-decode"],
    ["uuid-generator", "UUID Generator", "Create a new cryptographically secure UUID v4.", "uuid"],
    ["url-encoder", "URL Encoder", "Escape text safely for use in a URL.", "url-encode"],
    ["url-decoder", "URL Decoder", "Decode percent-encoded URL text.", "url-decode"],
    ["html-formatter", "HTML Formatter", "Indent HTML tags into a readable document.", "html-format"],
    ["css-formatter", "CSS Formatter", "Format CSS blocks and declarations for review.", "css-format"],
    ["javascript-formatter", "JavaScript Formatter", "Apply a readable block layout to JavaScript.", "js-format"],
    ["regex-tester", "Regex Tester", "Test a regular expression against real text.", "regex"],
    ["timestamp-converter", "Timestamp Converter", "Convert Unix seconds or milliseconds into local time.", "timestamp"],
  ]),
  ...define("Calculators", "calculator", [
    ["age-calculator", "Age Calculator", "Calculate age in years, months, and days.", "age"],
    ["percentage-calculator", "Percentage Calculator", "Find a percentage of any number.", "percentage"],
    ["loan-calculator", "Loan Calculator", "Estimate monthly loan payments and total interest.", "loan"],
    ["mortgage-calculator", "Mortgage Calculator", "Estimate principal-and-interest mortgage payments.", "mortgage"],
    ["salary-calculator", "Salary Calculator", "Turn an annual salary into monthly and hourly figures.", "salary"],
    ["gst-calculator", "GST Calculator", "Add or remove GST from an amount.", "gst"],
    ["tip-calculator", "Tip Calculator", "Split a tip and total bill between people.", "tip"],
    ["discount-calculator", "Discount Calculator", "Calculate a sale price and savings amount.", "discount"],
    ["bmi-calculator", "BMI Calculator", "Calculate body mass index from height and weight.", "bmi"],
    ["time-calculator", "Time Calculator", "Add hours and minutes into a usable total.", "time"],
    ["date-calculator", "Date Calculator", "Count the calendar days between two dates.", "date"],
    ["compound-interest-calculator", "Compound Interest Calculator", "Estimate compound growth over time.", "compound"],
  ]),
  ...define("Text Tools", "text", [
    ["word-counter", "Word Counter", "Count words, characters, sentences, and reading time.", "word-count"],
    ["character-counter", "Character Counter", "Measure characters with and without spaces.", "character-count"],
    ["case-converter", "Case Converter", "Convert text across common naming conventions.", "case"],
    ["remove-duplicate-lines", "Remove Duplicate Lines", "Keep the first occurrence of each text line.", "dedupe"],
    ["text-sorter", "Text Sorter", "Alphabetize lines in ascending order.", "sort"],
    ["text-reverser", "Text Reverser", "Reverse a string without changing its characters.", "reverse"],
    ["slug-generator", "Slug Generator", "Create a clean URL-ready slug from a title.", "slug"],
    ["lorem-ipsum-generator", "Lorem Ipsum Generator", "Generate clean placeholder paragraphs on demand.", "lorem"],
  ]),
  ...define("Converters", "converter", [
    ["length-converter", "Length Converter", "Convert metres, miles, feet, and more.", "length"],
    ["weight-converter", "Weight Converter", "Convert kilograms, pounds, grams, and ounces.", "weight"],
    ["temperature-converter", "Temperature Converter", "Convert Celsius, Fahrenheit, and Kelvin.", "temperature"],
    ["speed-converter", "Speed Converter", "Convert km/h, mph, metres per second, and knots.", "speed"],
    ["data-storage-converter", "Data Storage Converter", "Convert bytes through terabytes.", "storage"],
    ["time-zone-converter", "Time Zone Converter", "See any date and time in a selected time zone.", "timezone"],
    ["number-base-converter", "Number Base Converter", "Translate a number between binary, decimal, and hex.", "base"],
  ]),
  ...define("Security & Generators", "generator", [
    ["password-generator", "Password Generator", "Create a strong password from local randomness.", "password"],
    ["sha-256-generator", "SHA-256 Generator", "Generate a SHA-256 digest using your browser.", "sha256"],
    ["random-number-generator", "Random Number Generator", "Generate a random whole number in a range.", "random-number"],
    ["random-string-generator", "Random String Generator", "Make a random alphanumeric string.", "random-string"],
    ["jwt-decoder", "JWT Decoder", "Read a JWT header and payload locally without verifying it.", "jwt"],
  ]),
].map((tool, index) => ({ ...tool, featured: index < 12 || ["json-formatter", "pdf-merger", "image-resizer"].includes(tool.slug) }));

export const categories = Array.from(new Set(tools.map((tool) => tool.category)));

export const getTool = (slug: string) => tools.find((tool) => tool.slug === slug);
