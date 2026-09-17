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

const SITE_SOURCE = path.join(__dirname, "..", "content", "site.json");
const SITE_OUTPUT = path.join(OUTPUT_DIR, "site.json");

function normalizeImage(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") {
    return value.image || value.src || value.url || fallback;
  }
  return String(value);
}

function normalizeList(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return String(item.item || item.nome || item.label || "").trim();
      }
      return "";
    })
    .filter(Boolean);
}

function loadSite() {
  const fallback = { foto: "/images/robson.png", capa_hero: "/images/hero-rj.png" };
  if (!fs.existsSync(SITE_SOURCE)) return fallback;
  try {
    const data = JSON.parse(fs.readFileSync(SITE_SOURCE, "utf8"));
    data.foto = normalizeImage(data.foto, fallback.foto);
    data.capa_hero = normalizeImage(data.capa_hero, fallback.capa_hero);
    data.regioes = normalizeList(data.regioes);
    data.hero_bullets = normalizeList(data.hero_bullets);
    return data;
  } catch {
    return fallback;
  }
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(loadProperties(), null, 2) + "\n");
fs.writeFileSync(SITE_OUTPUT, JSON.stringify(loadSite(), null, 2) + "\n");
console.log(`Wrote ${OUTPUT}`);
console.log(`Wrote ${SITE_OUTPUT}`);
