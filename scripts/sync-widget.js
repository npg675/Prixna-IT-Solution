/* Syncs the canonical Prixna AI widget (root js/ + css/) into Next.js public/.
   Run: npm run sync:widget  (also runs automatically before dev/build)
   Root files stay canonical for the static site; public/ copies use absolute paths. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const jobs = [
  { from: "js/prixna-ai.js", to: "public/js/prixna-ai.js", absCss: true },
  { from: "js/prixna-notify.js", to: "public/js/prixna-notify.js", absCss: false },
  { from: "css/prixna-ai.css", to: "public/css/prixna-ai.css", absCss: false },
  { from: "data/software-demos.json", to: "public/data/software-demos.json", absCss: false },
];

for (const j of jobs) {
  const src = path.join(root, j.from);
  const dst = path.join(root, j.to);
  if (!fs.existsSync(src)) {
    console.error("missing source: " + j.from);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  let s = fs.readFileSync(src, "utf8");
  if (j.absCss) s = s.split("css/prixna-ai.css").join("/css/prixna-ai.css");
  fs.writeFileSync(dst, s);
  console.log("synced " + j.from + " -> " + j.to);
}
