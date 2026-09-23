(function () {
  const grid = document.getElementById("properties-grid");
  const featuredGrid = document.getElementById("featured-grid");
  const featuredSection = document.getElementById("destaques");
  const empty = document.getElementById("properties-empty");
  const chipsWrap = document.getElementById("property-chips");
  const modal = document.getElementById("property-modal");
  const modalImage = document.getElementById("modal-image");
  const modalTipo = document.getElementById("modal-tipo");
  const modalTitle = document.getElementById("modal-title");
  const modalMeta = document.getElementById("modal-meta");
  const modalPrice = document.getElementById("modal-price");
  const modalDesc = document.getElementById("modal-desc");
  const modalWhatsapp = document.getElementById("modal-whatsapp");
  const galleryPrev = document.getElementById("gallery-prev");
  const galleryNext = document.getElementById("gallery-next");

  let properties = [];
  let currentFilter = "todos";
  let activeProperty = null;
  let photoIndex = 0;
  let heroStep = 1;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function photosOf(property) {
    if (!property || !Array.isArray(property.fotos)) return [];
    return property.fotos
      .map((item) => (typeof item === "string" ? item : item && (item.image || item.src)))
      .filter(Boolean);
  }

  function vagaLabel(vagas) {
    if (!vagas) return "";
    const n = Number(vagas);
    if (!Number.isNaN(n)) return n === 1 ? "1 vaga" : `${n} vagas`;
    return String(vagas);
  }

  function quartoLabel(quartos) {
    if (!quartos) return "";
    const value = String(quartos);
    if (/studio|quarto/i.test(value)) return value;
    return `${value} quarto${value === "1" ? "" : "s"}`;
  }

  function specs(property) {
    return [property.metragem, quartoLabel(property.quartos), vagaLabel(property.vagas)]
      .filter(Boolean)
      .join(" · ");
  }

  function cardHtml(property) {
    const fotos = photosOf(property);
    const cover = fotos[0] || "images/uploads/interior.png";
    const lead = String(property.descricao || "").split(".")[0];
    return `
      <button class="card-media" type="button" data-open="${encodeURIComponent(property.slug || property.titulo)}">
        <img src="${escapeHtml(cover)}" alt="${escapeHtml(property.titulo)}" />
        <span class="card-loc">${escapeHtml(property.bairro)} · RJ</span>
        <span class="badge">${escapeHtml(property.tipo)}</span>
      </button>
      <div class="card-body">
        <h3>${escapeHtml(property.titulo)}</h3>
        <p class="card-lead">${escapeHtml(lead)}</p>
        <ul>
          <li>${escapeHtml(property.bairro)}</li>
          <li>${escapeHtml(quartoLabel(property.quartos))}</li>
          <li>${escapeHtml(property.metragem)}</li>
        </ul>
        <p class="card-from">A partir de</p>
        <p class="card-price">${escapeHtml(property.faixa_preco)}</p>
        <button class="btn btn-primary" type="button" data-open="${encodeURIComponent(property.slug || property.titulo)}">
          Ver detalhes
        </button>
      </div>
    `;
  }

  function foldName(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function matchesRegion(bairro, region) {
    const hay = foldName(bairro);
    const needle = foldName(region);
    return hay === needle || hay.includes(needle);
  }

  function filteredList() {
    if (currentFilter === "todos") return properties;
    return properties.filter((item) => matchesRegion(item.bairro, currentFilter));
  }

  function bairrosFromProperties() {
    const seen = new Set();
    const list = [];
    properties.forEach((item) => {
      const name = String(item.bairro || "").trim();
      const key = foldName(name);
      if (!name || seen.has(key)) return;
      seen.add(key);
      list.push(name);
    });
    return list.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  function setSiteText(key, value, asHtml) {
    const el = document.querySelector(`[data-site="${key}"]`);
    if (!el || value == null || String(value).trim() === "") return;
    const raw = String(value).trim();
    if (asHtml) {
      const parts = raw.split(/\n+/).filter(Boolean);
      el.innerHTML = parts.map((part) => `<p>${escapeHtml(part)}</p>`).join("");
      return;
    }
    el.innerHTML = escapeHtml(raw).replace(/\n/g, "<br />");
  }

  function applySite(site) {
    if (!site) return;
    if (site.foto && aboutPhoto) aboutPhoto.src = site.foto;
    if (site.capa_hero) {
      const hero = document.querySelector(".hero");
      if (hero) {
        const path = String(site.capa_hero).replace(/\\/g, "/");
        hero.style.setProperty("--hero-image", `url("${path}")`);
      }
    }
    setSiteText("marca_sub", site.marca_sub);
    setSiteText("hero_eyebrow", site.hero_eyebrow);
    setSiteText("hero_titulo", site.hero_titulo);
    setSiteText("hero_lead", site.hero_lead);
    setSiteText("featured_titulo", site.featured_titulo);
    setSiteText("featured_texto", site.featured_texto);
    setSiteText("plantas_eyebrow", site.plantas_eyebrow);
    setSiteText("plantas_titulo", site.plantas_titulo);
    setSiteText("plantas_texto", site.plantas_texto);
    setSiteText("sobre_titulo", site.sobre_titulo);
    setSiteText("sobre_texto", site.sobre_texto, true);
    setSiteText("contato_titulo", site.contato_titulo);
    setSiteText("contato_texto", site.contato_texto);
    setSiteText("footer_linha", site.footer_linha);

    const bullets = Array.isArray(site.hero_bullets)
      ? site.hero_bullets
          .map((item) => (typeof item === "string" ? item : item && item.item))
          .filter(Boolean)
      : [];
    const bulletsEl = document.querySelector(".hero-bullets");
    if (bulletsEl && bullets.length) {
      bulletsEl.innerHTML = bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }

    const regioes = Array.isArray(site.regioes)
      ? site.regioes
          .map((item) => (typeof item === "string" ? item : item && (item.item || item.nome)))
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      : [];
    if (regioes.length) SITE.regioes = regioes;
    renderHeroRegions();
    renderBairroTabs();
  }

  function regionList() {
    return Array.isArray(SITE.regioes) && SITE.regioes.length
      ? SITE.regioes
      : bairrosFromProperties();
  }

  function renderHeroRegions() {
    const list = document.querySelector(".hero-regions");
    if (!list) return;
    list.innerHTML = regionList()
      .map((name) => `<li>${escapeHtml(name)}</li>`)
      .join("");
  }

  function renderBairroTabs() {
    if (!chipsWrap) return;
    const bairros = regionList();
    const tabs = [{ label: "Todos", value: "todos" }].concat(
      bairros.map((name) => ({ label: name, value: name }))
    );
    if (!tabs.some((tab) => tab.value === currentFilter)) currentFilter = "todos";
    chipsWrap.innerHTML = tabs
      .map((tab) => {
        const active = tab.value === currentFilter;
        return `<button class="chip${active ? " is-active" : ""}" type="button" role="tab" aria-selected="${active}" data-filter="${escapeHtml(tab.value)}">${escapeHtml(tab.label)}</button>`;
      })
      .join("");
  }

  function renderGrid() {
    const list = filteredList();
    grid.innerHTML = "";
    empty.hidden = list.length > 0;
    list.forEach((property) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = cardHtml(property);
      grid.appendChild(card);
    });
  }

  function renderFeatured() {
    const featured = properties.filter((item) => item.destaque);
    if (!featured.length) {
      featuredSection.hidden = true;
      return;
    }
    featuredSection.hidden = false;
    featuredGrid.innerHTML = "";
    featured.forEach((property) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = cardHtml(property);
      featuredGrid.appendChild(card);
    });
  }

  function fillPropertySelects() {
    const options = properties
      .map((item) => `<option value="${escapeHtml(item.titulo)}">${escapeHtml(item.titulo)}</option>`)
      .join("");
    document.querySelectorAll(".property-select").forEach((select) => {
      select.innerHTML = `<option value="">Selecione uma planta</option>${options}`;
    });
  }

  function propertyByKey(key) {
    return properties.find((item) => item.slug === key || item.titulo === key);
  }

  function showPhoto() {
    if (!activeProperty) return;
    const fotos = photosOf(activeProperty);
    modalImage.src = fotos[photoIndex] || "";
    modalImage.alt = activeProperty.titulo || "";
    const many = fotos.length > 1;
    galleryPrev.hidden = !many;
    galleryNext.hidden = !many;
  }

  function openModal(property) {
    activeProperty = property;
    photoIndex = 0;
    modalTipo.textContent = property.tipo || "";
    modalTitle.textContent = property.titulo || "";
    modalMeta.textContent = [property.bairro, property.endereco, specs(property)].filter(Boolean).join(" · ");
    modalPrice.textContent = property.faixa_preco || "";
    modalDesc.textContent = property.descricao || "";
    modalWhatsapp.href = whatsappUrl(MESSAGES.interest(property.titulo));
    showPhoto();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    activeProperty = null;
    document.body.style.overflow = "";
  }

  function setFilter(filter) {
    currentFilter = filter;
    if (!chipsWrap) return;
    chipsWrap.querySelectorAll(".chip").forEach((chip) => {
      const active = chip.dataset.filter === filter;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-selected", String(active));
    });
    renderGrid();
  }

  function showHeroStep(step) {
    heroStep = step;
    document.querySelectorAll("[data-hero-step]").forEach((panel) => {
      panel.hidden = Number(panel.dataset.heroStep) !== step;
    });
    document.getElementById("hero-step-label").textContent = `${step} · 2 · 3`;
  }

  function formDataFrom(form) {
    const data = new FormData(form);
    return {
      nome: String(data.get("nome") || "").trim(),
      telefone: String(data.get("telefone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      empreendimento: String(data.get("empreendimento") || "").trim(),
      renda: String(data.get("renda") || "").trim(),
      mensagem: String(data.get("mensagem") || "").trim(),
    };
  }

  function openLeadWhatsApp(form) {
    const payload = formDataFrom(form);
    if (!payload.nome || !payload.telefone) {
      form.reportValidity();
      return false;
    }
    window.open(whatsappUrl(MESSAGES.lead(payload)), "_blank", "noopener");
    return true;
  }

  const wa = whatsappUrl(MESSAGES.hero);
  ["header-whatsapp", "about-whatsapp", "cta-whatsapp", "footer-whatsapp", "fab-whatsapp"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = wa;
  });
  document.getElementById("footer-whatsapp").textContent = `WhatsApp ${SITE.whatsappDisplay}`;
  document.getElementById("contact-phone-display").textContent = SITE.whatsappDisplay;

  const instagram = document.getElementById("footer-instagram");
  instagram.href = SITE.instagramUrl;
  instagram.textContent = `Instagram ${SITE.instagramHandle}`;
  if (SITE.instagramUrl === "#") instagram.removeAttribute("target");

  const aboutPhoto = document.querySelector(".about-photo");
  if (aboutPhoto && SITE.photo) aboutPhoto.src = SITE.photo;

  fetch("data/site.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((site) => {
      applySite(site);
    })
    .catch(() => {});

  chipsWrap.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip || !chipsWrap.contains(chip)) return;
    setFilter(chip.dataset.filter);
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open]");
    if (!trigger) return;
    const property = propertyByKey(decodeURIComponent(trigger.dataset.open));
    if (property) openModal(property);
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal]")) closeModal();
  });

  galleryPrev.addEventListener("click", () => {
    const fotos = photosOf(activeProperty);
    if (!fotos.length) return;
    photoIndex = (photoIndex - 1 + fotos.length) % fotos.length;
    showPhoto();
  });

  galleryNext.addEventListener("click", () => {
    const fotos = photosOf(activeProperty);
    if (!fotos.length) return;
    photoIndex = (photoIndex + 1) % fotos.length;
    showPhoto();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  document.getElementById("hero-form").addEventListener("click", (event) => {
    if (event.target.closest("[data-hero-next]")) {
      const form = event.currentTarget;
      if (heroStep === 1 && (!form.nome.value.trim() || !form.telefone.value.trim())) {
        form.reportValidity();
        return;
      }
      showHeroStep(Math.min(3, heroStep + 1));
    }
    if (event.target.closest("[data-hero-prev]")) {
      showHeroStep(Math.max(1, heroStep - 1));
    }
  });

  document.getElementById("hero-form").addEventListener("submit", (event) => {
    event.preventDefault();
    openLeadWhatsApp(event.currentTarget);
  });

  document.getElementById("contact-form").addEventListener("submit", (event) => {
    event.preventDefault();
    openLeadWhatsApp(event.currentTarget);
  });

  fetch("data/properties.json")
    .then((response) => {
      if (!response.ok) throw new Error("Falha ao carregar imóveis");
      return response.json();
    })
    .then((data) => {
      properties = Array.isArray(data) ? data : [];
      document.getElementById("stats-count").textContent = String(properties.length);
      fillPropertySelects();
      renderHeroRegions();
      renderBairroTabs();
      renderFeatured();
      renderGrid();
    })
    .catch(() => {
      empty.hidden = false;
      empty.textContent = "Não foi possível carregar os imóveis.";
    });

  renderHeroRegions();
  renderBairroTabs();
})();
