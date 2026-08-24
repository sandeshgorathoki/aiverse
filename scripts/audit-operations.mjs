import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/mega-tools";
const registry = fs.readFileSync(path.join(root, "client/src/lib/tools.ts"), "utf8");
const workspace = fs.readFileSync(path.join(root, "client/src/components/ToolWorkspace.tsx"), "utf8");
const matches = [...registry.matchAll(/\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g)];
const rows = matches.map(([, slug, name, , operation]) => ({
  slug,
  name,
  operation,
  implemented: workspace.includes(`"${operation}"`) || (["length", "weight", "speed", "storage"].includes(operation) && workspace.includes("converterUnits[operation]")),
}));
const missing = rows.filter((row) => !row.implemented);
const categories = new Map();
for (const row of rows) {
  const area = row.slug.includes("pdf") ? "PDF / file" : row.slug.includes("image") || row.slug.includes("jpg") || row.slug.includes("png") || row.slug.includes("webp") ? "Image" : "Registered utility";
  categories.set(area, (categories.get(area) ?? 0) + 1);
}
const report = [
  "# Tool Operation Coverage Audit",
  "",
  `Registered routes: ${rows.length}`,
  `Operations represented in workspace: ${rows.length - missing.length}`,
  `Missing implementations: ${missing.length}`,
  "",
  "| Tool | Operation | Workspace mapping |",
  "| --- | --- | --- |",
  ...rows.map((row) => `| ${row.name} | \`${row.operation}\` | ${row.implemented ? "Yes" : "No"} |`),
  "",
].join("\n");
fs.writeFileSync(path.join(root, "tool-operation-audit.md"), report);
if (missing.length) {
  console.error(`Missing operation mappings: ${missing.map((row) => row.operation).join(", ")}`);
  process.exit(1);
}
console.log(`Verified ${rows.length} registered tool routes against browser workspace operation mappings.`);
