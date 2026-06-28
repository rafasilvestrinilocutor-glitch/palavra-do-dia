/* ============================================================
   A Palavra do Dia — lógica do site (vanilla JS, sem dependências)
   ============================================================ */

(() => {
  "use strict";

  const SYMBOL_MAP = {
    cross: "#sym-cross",
    crescent: "#sym-crescent",
    "star-david": "#sym-star-david",
    "dharma-wheel": "#sym-dharma-wheel",
    om: "#sym-om",
    "seven-rays": "#sym-seven-rays",
    "leaf-axe": "#sym-leaf-axe",
    feather: "#sym-feather",
    "yin-yang": "#sym-yin-yang",
    dove: "#sym-dove",
    lotus: "#sym-lotus",
    chalice: "#sym-chalice",
    "nine-star": "#sym-nine-star",
    khanda: "#sym-khanda",
    "ahimsa-hand": "#sym-ahimsa-hand",
    torii: "#sym-torii",
    scroll: "#sym-scroll",
    pentacle: "#sym-pentacle",
    tree: "#sym-tree",
    cruzeiro: "#sym-cruzeiro",
    sun: "#sym-sun",
  };

  // Apelidos / grafias alternativas / sinônimos por tradição.
  // (a busca já ignora acentos e maiúsculas; aqui ficam termos e variações comuns)
  const ALIASES = {
    cristianismo: ["cristao", "crista", "cristianismo", "evangelico", "protestante", "jesus", "biblia", "gospel", "igreja", "cristo"],
    catolicismo: ["catolico", "catolicismo", "catolica", "papa", "santos", "igreja catolica", "romana"],
    islamismo: ["isla", "islamismo", "islamico", "muculmano", "mulsumano", "muslim", "alcorao", "corao", "maome", "mesquita", "islão", "islam"],
    judaismo: ["judaismo", "judeu", "judaico", "tora", "tanakh", "hebraico", "sinagoga", "israelita", "judaica"],
    budismo: ["budismo", "budista", "buda", "dharma", "zen", "nirvana", "budico"],
    hinduismo: ["hinduismo", "hindu", "hinduista", "krishna", "vedas", "gita", "yoga", "hare krishna"],
    umbanda: ["umbanda", "umbandista", "preto velho", "caboclo", "guia", "terreiro"],
    candomble: ["candomble", "orixa", "orixas", "ketu", "axe", "ifa", "yoruba", "candomblecista", "nago"],
    xamanismo: ["xamanismo", "xama", "chamanismo", "chama", "shaman", "shamanismo", "paje", "xamanico", "ancestral"],
    taoismo: ["taoismo", "taoista", "tao", "lao tse", "laozi", "tao te ching", "daoismo", "dao"],
    espiritismo: ["espiritismo", "espirita", "kardec", "kardecismo", "kardecista", "chico xavier", "doutrina espirita", "allan kardec"],
    bahai: ["bahai", "bahaismo", "baha", "fe bahai", "bahaí", "bahaullah"],
    sikhismo: ["sikhismo", "sikh", "sique", "siquismo", "guru nanak", "granth", "sikhista"],
    jainismo: ["jainismo", "jainista", "jaina", "jain", "ahimsa", "tirthankara"],
    xintoismo: ["xintoismo", "xinto", "shinto", "shintoismo", "kami", "japao", "xintoista"],
    confucionismo: ["confucionismo", "confucio", "confucionista", "analectos", "confucianismo", "confuciano"],
    wicca: ["wicca", "wiccano", "wiccana", "paganismo", "pagao", "paga", "bruxaria", "bruxa", "neopaganismo", "pentaculo", "paganista"],
    jurema: ["jurema", "jurema sagrada", "catimbo", "mestres", "cabocla", "juremeiro"],
    santodaime: ["santo daime", "daime", "ayahuasca", "floresta", "cipo", "daimista", "hinario"],
    seichonoie: ["seicho no ie", "seicho", "seishi", "seicho-no-ie"],
  };

  // sugestões mostradas quando o campo está focado e vazio
  const POPULAR = ["cristianismo", "catolicismo", "espiritismo", "islamismo", "budismo", "umbanda"];

  const state = {
    religions: [],
    index: {},           // id -> { rel, terms:[normalized strings] }
    current: null,
    phrases: [],
    phraseIndex: 0,
    cache: {},
    activeSuggestion: -1, // navegação por teclado nas sugestões
  };

  // ---- elementos ----
  const $ = (sel) => document.querySelector(sel);
  const els = {
    body: document.body,
    home: $("#home"),
    reader: $("#reader"),
    searchInput: $("#search-input"),
    suggest: $("#search-suggestions"),
    searchMsg: $("#search-msg"),
    readerBgUse: $("#reader-bg-use"),
    backBtn: $("#back-btn"),
    homeLink: $("#home-link"),
    readerReligion: $("#reader-religion"),
    readerSymbol: $("#reader-symbol"),
    phraseLabel: $("#phrase-label"),
    phraseText: $("#phrase-text"),
    phraseRef: $("#phrase-ref"),
    phraseSource: $("#phrase-source"),
    newBtn: $("#new-btn"),
    shareBtn: $("#share-btn"),
    shareMenu: $("#share-menu"),
    toast: $("#toast"),
    canvas: $("#share-canvas"),
  };

  // ---- utilidades de texto ----
  function norm(s) {
    return (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")  // remove acentos
      .toLowerCase()
      .replace(/['’.]/g, "")             // remove apóstrofos/pontos
      .replace(/[^a-z0-9]+/g, " ")        // demais símbolos viram espaço
      .trim();
  }

  // distância de Levenshtein (para "você quis dizer?")
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    let cur = new Array(n + 1);
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      [prev, cur] = [cur, prev];
    }
    return prev[n];
  }

  function dayNumber() {
    const now = new Date();
    const utc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor(utc / 86400000);
  }

  function applyTheme(t) {
    const r = els.body.style;
    if (!t) {
      r.cssText = "";
      els.body.removeAttribute("data-religion");
      return;
    }
    r.setProperty("--bg", t.bg);
    r.setProperty("--surface", t.surface);
    r.setProperty("--primary", t.primary);
    r.setProperty("--accent", t.accent);
    r.setProperty("--text", t.text);
    r.setProperty("--muted", t.muted);
    r.setProperty("--glow", t.glow);
  }

  function showScreen(name) {
    const entering = name === "home" ? els.home : els.reader;
    const leaving = name === "home" ? els.reader : els.home;
    leaving.hidden = true;
    entering.hidden = false;
    entering.classList.remove("is-entering");
    void entering.offsetWidth;
    entering.classList.add("is-entering");
    els.body.setAttribute("data-screen", name);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (els.toast.hidden = true), 2400);
  }

  // ---- carregamento de dados ----
  async function loadReligions() {
    const res = await fetch("data/religions.json");
    const data = await res.json();
    state.religions = data.religions;
    // monta índice de busca: cada tradição com seus termos normalizados
    state.religions.forEach((rel) => {
      const terms = new Set();
      terms.add(norm(rel.name));
      (ALIASES[rel.id] || []).forEach((a) => terms.add(norm(a)));
      // também indexa palavras do tagline (ajuda buscas por tema)
      state.index[rel.id] = { rel, terms: [...terms].filter(Boolean) };
    });
  }

  async function loadPhrases(id) {
    if (state.cache[id]) return state.cache[id];
    const res = await fetch(`data/${id}.json`);
    const data = await res.json();
    const phrases = Array.isArray(data) ? data : data.phrases || [];
    state.cache[id] = phrases;
    return phrases;
  }

  // ============================================================
  //  BUSCA POR TRADIÇÃO
  // ============================================================
  function scoreReligion(id, q) {
    let best = 0;
    for (const term of state.index[id].terms) {
      if (!term) continue;
      if (term === q) return 100;
      if (term.startsWith(q)) best = Math.max(best, 80 + Math.min(q.length, 15));
      else if (term.includes(q)) best = Math.max(best, 55 + Math.min(q.length, 10));
      else {
        // fuzzy por palavra (tolera erro de digitação tipo "chamanismo")
        const d = lev(q, term);
        const tol = q.length <= 4 ? 1 : q.length <= 7 ? 2 : 3;
        if (d <= tol) best = Math.max(best, 50 - d * 6);
        // fuzzy contra a primeira palavra do termo
        const first = term.split(" ")[0];
        if (first && first !== term) {
          const d2 = lev(q, first);
          if (d2 <= tol) best = Math.max(best, 48 - d2 * 6);
        }
      }
    }
    return best;
  }

  function searchReligions(query, limit = 6) {
    const q = norm(query);
    if (!q) return [];
    const scored = [];
    for (const id in state.index) {
      const sc = scoreReligion(id, q);
      if (sc > 0) scored.push({ rel: state.index[id].rel, score: sc });
    }
    scored.sort((a, b) => b.score - a.score || a.rel.name.localeCompare(b.rel.name));
    return scored.slice(0, limit).map((x) => x.rel);
  }

  // melhor palpite quando nada bate (para "você quis dizer?")
  function closestGuess(query) {
    const q = norm(query);
    if (q.length < 2) return null;
    let best = null, bestD = Infinity;
    for (const id in state.index) {
      for (const term of state.index[id].terms) {
        const d = lev(q, term);
        if (d < bestD) { bestD = d; best = state.index[id].rel; }
      }
    }
    // só sugere se for razoavelmente perto
    const limit = Math.max(2, Math.floor(q.length * 0.5));
    return bestD <= limit ? best : null;
  }

  function clearSuggestions() {
    els.suggest.innerHTML = "";
    els.suggest.hidden = true;
    els.searchInput.setAttribute("aria-expanded", "false");
    state.activeSuggestion = -1;
  }

  function renderSuggestions(list) {
    els.suggest.innerHTML = "";
    if (!list.length) { clearSuggestions(); return; }
    const frag = document.createDocumentFragment();
    list.forEach((rel, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggest__item";
      btn.setAttribute("role", "option");
      btn.dataset.id = rel.id;
      btn.dataset.i = String(i);
      btn.style.setProperty("--c", rel.theme.primary);
      btn.innerHTML = `
        <svg class="suggest__icon" viewBox="0 0 24 24" aria-hidden="true"><use href="${SYMBOL_MAP[rel.symbol] || "#sym-lotus"}"></use></svg>
        <span class="suggest__name">${rel.name}</span>
        <span class="suggest__tag">${rel.tagline}</span>`;
      btn.addEventListener("click", () => openReligion(rel.id));
      li.appendChild(btn);
      frag.appendChild(li);
    });
    els.suggest.appendChild(frag);
    els.suggest.hidden = false;
    els.searchInput.setAttribute("aria-expanded", "true");
    els.searchMsg.hidden = true;
    state.activeSuggestion = -1;
  }

  function showNotFound(query) {
    clearSuggestions();
    const guess = closestGuess(query);
    if (guess) {
      els.searchMsg.innerHTML = `Não encontramos <b>“${escapeHtml(query.trim())}”</b>. Você quis dizer `;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "search__suggest-btn";
      b.textContent = guess.name;
      b.addEventListener("click", () => openReligion(guess.id));
      els.searchMsg.appendChild(b);
      els.searchMsg.appendChild(document.createTextNode("?"));
    } else {
      els.searchMsg.innerHTML = `Não encontramos <b>“${escapeHtml(query.trim())}”</b>. Tente outro nome ou verifique a grafia.`;
    }
    els.searchMsg.hidden = false;
  }

  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function onSearchInput() {
    const v = els.searchInput.value;
    els.searchMsg.hidden = true;
    if (!norm(v)) {
      // vazio: mostra populares como atalho
      renderSuggestions(POPULAR.map((id) => state.index[id]?.rel).filter(Boolean));
      return;
    }
    const matches = searchReligions(v);
    if (matches.length) renderSuggestions(matches);
    else { clearSuggestions(); /* só avisa "não encontrado" ao confirmar */ }
  }

  function onSearchKey(e) {
    const items = [...els.suggest.querySelectorAll(".suggest__item")];
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      state.activeSuggestion = (state.activeSuggestion + 1) % items.length;
      updateActive(items);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      state.activeSuggestion = (state.activeSuggestion - 1 + items.length) % items.length;
      updateActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (state.activeSuggestion >= 0 && items[state.activeSuggestion]) {
        openReligion(items[state.activeSuggestion].dataset.id);
      } else if (items.length) {
        openReligion(items[0].dataset.id);
      } else if (norm(els.searchInput.value)) {
        showNotFound(els.searchInput.value);
      }
    } else if (e.key === "Escape") {
      clearSuggestions();
    }
  }

  function updateActive(items) {
    items.forEach((it, i) => it.classList.toggle("is-active", i === state.activeSuggestion));
    if (items[state.activeSuggestion]) items[state.activeSuggestion].scrollIntoView({ block: "nearest" });
  }

  // ============================================================
  //  LEITURA DA PALAVRA
  // ============================================================
  async function openReligion(id) {
    const rel = state.religions.find((r) => r.id === id);
    if (!rel) return;
    state.current = rel;
    applyTheme(rel.theme);
    els.body.setAttribute("data-religion", id);

    els.readerReligion.textContent = rel.name;
    const symHref = SYMBOL_MAP[rel.symbol] || "#sym-lotus";
    els.readerSymbol.querySelector("use").setAttribute("href", symHref);
    els.readerBgUse.setAttribute("href", symHref);
    els.phraseLabel.textContent = rel.phraseLabel;
    els.phraseSource.textContent = rel.source;

    closeShareMenu();
    clearSuggestions();
    els.searchMsg.hidden = true;
    showScreen("reader");

    try {
      state.phrases = await loadPhrases(id);
    } catch (e) {
      state.phrases = [{ text: "Não foi possível carregar as palavras agora. Tente novamente em instantes.", reference: "" }];
    }
    if (!state.phrases.length) {
      state.phrases = [{ text: "Em breve, novas palavras desta tradição.", reference: "" }];
    }

    state.phraseIndex = dayNumber() % state.phrases.length;
    renderPhrase(false);
    history.replaceState({ id }, "", `#${id}`);
  }

  function renderPhrase(animate = true) {
    const p = state.phrases[state.phraseIndex] || {};
    const apply = () => {
      els.phraseText.textContent = p.text || "";
      els.phraseRef.textContent = p.reference || "";
      els.phraseText.classList.remove("is-swapping");
    };
    if (animate) {
      els.phraseText.classList.add("is-swapping");
      setTimeout(apply, 280);
    } else {
      apply();
    }
  }

  function nextPhrase() {
    closeShareMenu();
    if (state.phrases.length <= 1) return;
    let i;
    do { i = Math.floor(Math.random() * state.phrases.length); }
    while (i === state.phraseIndex);
    state.phraseIndex = i;
    renderPhrase(true);
  }

  function goHome() {
    closeShareMenu();
    applyTheme(null);
    state.current = null;
    els.searchInput.value = "";
    clearSuggestions();
    els.searchMsg.hidden = true;
    showScreen("home");
    history.replaceState({}, "", location.pathname);
  }

  // ============================================================
  //  COMPARTILHAR
  // ============================================================
  function currentPhrase() {
    return state.phrases[state.phraseIndex] || {};
  }

  function shareText() {
    const p = currentPhrase();
    const label = state.current?.phraseLabel || "A Palavra do Dia";
    const src = state.current?.source ? " · " + state.current.source : "";
    return `“${p.text}”${p.reference ? " — " + p.reference : ""}\n\n${label}${src}`;
  }

  function shareUrl() {
    return location.origin + location.pathname + (state.current ? "#" + state.current.id : "");
  }

  function toggleShareMenu() {
    const open = els.shareMenu.hidden;
    if (open) openShareMenu(); else closeShareMenu();
  }
  function openShareMenu() {
    // mostra "Compartilhar…" nativo só quando o aparelho suporta
    const nativeBtn = els.shareMenu.querySelector('[data-share="native"]');
    if (nativeBtn) nativeBtn.hidden = !navigator.share;
    els.shareMenu.hidden = false;
    els.shareBtn.setAttribute("aria-expanded", "true");
  }
  function closeShareMenu() {
    els.shareMenu.hidden = true;
    els.shareBtn.setAttribute("aria-expanded", "false");
  }

  async function handleShare(kind) {
    const text = shareText();
    const url = shareUrl();
    if (kind === "whatsapp") {
      window.open("https://wa.me/?text=" + encodeURIComponent(text + "\n\n" + url), "_blank", "noopener");
      closeShareMenu();
    } else if (kind === "facebook") {
      window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) + "&quote=" + encodeURIComponent(text), "_blank", "noopener");
      closeShareMenu();
    } else if (kind === "copy") {
      try {
        await navigator.clipboard.writeText(text + "\n\n" + url);
        toast("Texto copiado para você compartilhar.");
      } catch (_) { toast("Não foi possível copiar."); }
      closeShareMenu();
    } else if (kind === "image") {
      closeShareMenu();
      await shareImage(false);
    } else if (kind === "native") {
      closeShareMenu();
      try {
        if (navigator.share) await navigator.share({ title: "A Palavra do Dia", text, url });
      } catch (_) { /* cancelado */ }
    }
  }

  // ---- geração da imagem (Canvas) ----
  function symbolSVG(symbolKey, color) {
    const el = document.querySelector(SYMBOL_MAP[symbolKey] || "#sym-lotus");
    const vb = el ? el.getAttribute("viewBox") || "0 0 24 24" : "0 0 24 24";
    const inner = el ? el.innerHTML.replace(/currentColor/g, color) : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="${color}">${inner}</svg>`;
  }

  function loadSVGImage(svg) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  async function buildImageBlob() {
    const rel = state.current;
    const p = currentPhrase();
    const t = rel.theme;
    const cv = els.canvas;
    const ctx = cv.getContext("2d");
    const W = cv.width, H = cv.height;

    // garante a fonte serif carregada
    try {
      await document.fonts.load("600 64px 'Cormorant Garamond'");
      await document.fonts.load("italic 600 64px 'Cormorant Garamond'");
      await document.fonts.load("600 30px 'Outfit'");
      await document.fonts.load("500 28px 'Outfit'");
      await document.fonts.ready;
    } catch (_) { /* segue com fallback */ }

    // fundo
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H);
    grad.addColorStop(0, hexA(t.primary, 0.16));
    grad.addColorStop(1, hexA(t.primary, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // marca d'água do símbolo
    const wm = await loadSVGImage(symbolSVG(rel.symbol, t.primary));
    if (wm) {
      const s = W * 0.62;
      ctx.globalAlpha = 0.06;
      ctx.drawImage(wm, (W - s) / 2, (H - s) / 2 + H * 0.04, s, s);
      ctx.globalAlpha = 1;
    }

    // moldura sutil
    ctx.strokeStyle = hexA(t.primary, 0.25);
    ctx.lineWidth = 3;
    roundRect(ctx, 56, 56, W - 112, H - 112, 36);
    ctx.stroke();

    // símbolo pequeno no topo
    const top = await loadSVGImage(symbolSVG(rel.symbol, t.primary));
    if (top) {
      const s = 96;
      ctx.drawImage(top, (W - s) / 2, 120, s, s);
    }

    // rótulo (Versículo do Dia etc.)
    ctx.fillStyle = t.primary;
    ctx.textAlign = "center";
    ctx.font = "600 30px 'Outfit', sans-serif";
    ctx.fillText((rel.phraseLabel || "A Palavra do Dia").toUpperCase(), W / 2, 290, W - 220);

    // frase (serif, com quebra de linha e tamanho adaptável)
    ctx.fillStyle = t.text;
    const maxW = W - 220;
    let size = p.text && p.text.length > 160 ? 56 : p.text && p.text.length > 90 ? 66 : 78;
    let lines;
    for (;;) {
      ctx.font = `italic 600 ${size}px 'Cormorant Garamond', Georgia, serif`;
      lines = wrapText(ctx, "“" + (p.text || "") + "”", maxW);
      const totalH = lines.length * size * 1.28;
      if (totalH <= H * 0.46 || size <= 38) break;
      size -= 4;
    }
    const lineH = size * 1.28;
    let y = H / 2 - (lines.length * lineH) / 2 + size * 0.35;
    for (const ln of lines) { ctx.fillText(ln, W / 2, y, maxW); y += lineH; }

    // referência
    if (p.reference) {
      ctx.fillStyle = t.primary;
      ctx.font = "600 30px 'Outfit', sans-serif";
      ctx.fillText(p.reference, W / 2, y + 28, maxW);
    }

    // rodapé: nome do site + fonte
    ctx.fillStyle = t.muted;
    ctx.font = "500 26px 'Outfit', sans-serif";
    ctx.fillText("A Palavra do Dia" + (rel.source ? "  ·  " + rel.source : ""), W / 2, H - 96, W - 200);

    return new Promise((resolve) => cv.toBlob(resolve, "image/png", 0.95));
  }

  async function shareImage() {
    if (!state.current) return;
    toast("Gerando imagem…");
    let blob;
    try {
      blob = await buildImageBlob();
    } catch (e) {
      toast("Não foi possível gerar a imagem.");
      return;
    }
    if (!blob) { toast("Não foi possível gerar a imagem."); return; }
    const fileName = "palavra-do-dia-" + (state.current.id) + ".png";
    const file = new File([blob], fileName, { type: "image/png" });

    // no celular: tenta abrir o menu nativo (Instagram, WhatsApp, etc.) com a imagem
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "A Palavra do Dia", text: shareText() });
        return;
      } catch (_) { /* cancelou ou não suportou; cai para download */ }
    }
    // senão: baixa a imagem
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast("Imagem salva! Agora é só postar.");
  }

  // ---- helpers de cor/desenho ----
  function hexA(hex, alpha) {
    const h = hex.replace("#", "");
    const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ============================================================
  //  EVENTOS / INIT
  // ============================================================
  function bind() {
    els.searchInput.addEventListener("input", onSearchInput);
    els.searchInput.addEventListener("keydown", onSearchKey);
    els.searchInput.addEventListener("focus", () => { if (!norm(els.searchInput.value)) onSearchInput(); });
    document.addEventListener("click", (e) => {
      if (!els.suggest.contains(e.target) && e.target !== els.searchInput) clearSuggestions();
      if (!els.shareMenu.contains(e.target) && e.target !== els.shareBtn && !els.shareBtn.contains(e.target)) closeShareMenu();
    });

    els.backBtn.addEventListener("click", goHome);
    els.homeLink.addEventListener("click", goHome);
    els.newBtn.addEventListener("click", nextPhrase);
    els.shareBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleShareMenu(); });
    els.shareMenu.querySelectorAll(".share-opt").forEach((b) => {
      b.addEventListener("click", () => handleShare(b.dataset.share));
    });

    window.addEventListener("popstate", () => {
      const id = (location.hash || "").replace("#", "");
      if (id && state.religions.some((r) => r.id === id)) openReligion(id);
      else goHome();
    });
  }

  async function init() {
    try {
      await loadReligions();
      bind();
      const id = (location.hash || "").replace("#", "");
      if (id && state.religions.some((r) => r.id === id)) openReligion(id);
    } catch (e) {
      els.searchMsg.hidden = false;
      els.searchMsg.textContent = "Não foi possível carregar as tradições. Recarregue a página.";
      console.error(e);
    }
  }

  init();
})();
