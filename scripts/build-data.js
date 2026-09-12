const fs = require("fs");
const path = require("path");

const SOURCE = path.join(__dirname, "..", "content", "properties");
const OUTPUT_DIR = path.join(__dirname, "..", "data");
const OUTPUT = path.join(OUTPUT_DIR, "properties.json");

function normalizeFotos(fotos) {
  if (!Array.isArray(fotos)) return [];
  return fotos
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return item.image || item.src || item.url || "";
      }
      return "";
    })
    .filter(Boolean);
}

function loadProperties() {
  if (!fs.existsSync(SOURCE)) return [];

  return fs
    .readdirSync(SOURCE)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(SOURCE, file), "utf8");
      const data = JSON.parse(raw);
      data.fotos = normalizeFotos(data.fotos);
      data.slug = path.basename(file, ".json");
      return data;
    })
    .sort((a, b) => {
      if (Boolean(a.destaque) !== Boolean(b.destaque)) {
        return a.destaque ? -1 : 1;
      }
      return String(a.titulo || "").localeCompare(String(b.titulo || ""), "pt-BR");
    });
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(loadProperties(), null, 2) + "\n");
console.log(`Wrote ${OUTPUT}`);
