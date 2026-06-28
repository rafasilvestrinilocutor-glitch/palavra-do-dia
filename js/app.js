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

  // Vozes preferidas por tradição (quando o dispositivo tiver)
  const VOICE_LANG = {
    cristianismo: "pt-BR", islamismo: "pt-BR", judaismo: "pt-BR",
    budismo: "pt-BR", hinduismo: "pt-BR", umbanda: "pt-BR",
    candomble: "pt-BR", xamanismo: "pt-BR", taoismo: "pt-BR", espiritismo: "pt-BR",
  };

  const state = {
    religions: [],
    current: null,        // metadados da religião selecionada
    phrases: [],          // frases carregadas
    index: 0,
    cache: {},            // cache de frases por id
  };

  // ---- elementos ----
  const $ = (sel) => document.querySelector(sel);
  const els = {
    body: document.body,
    home: $("#home"),
    reader: $("#reader"),
    grid: $("#religion-grid"),
    backBtn: $("#back-btn"),
    homeLink: $("#home-link"),
    readerReligion: $("#reader-religion"),
    readerSymbol: $("#reader-symbol"),
    phraseLabel: $("#phrase-label"),
    phraseText: $("#phrase-text"),
    phraseRef: $("#phrase-ref"),
    phraseSource: $("#phrase-source"),
    newBtn: $("#new-btn"),
    listenBtn: $("#listen-btn"),
    shareBtn: $("#share-btn"),
    toast: $("#toast"),
  };

  // ---- utilidades ----
  function dayNumber() {
    // dias desde a época, no fuso local -> mesma palavra do dia para o usuário
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
    void entering.offsetWidth; // reinicia animação
    entering.classList.add("is-entering");
    els.body.setAttribute("data-screen", name);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (els.toast.hidden = true), 2200);
  }

  // ---- carregamento de dados ----
  async function loadReligions() {
    const res = await fetch("data/religions.json");
    const data = await res.json();
    state.religions = data.religions;
  }

  async function loadPhrases(id) {
    if (state.cache[id]) return state.cache[id];
    const res = await fetch(`data/${id}.json`);
    const data = await res.json();
    const phrases = Array.isArray(data) ? data : data.phrases || [];
    state.cache[id] = phrases;
    return phrases;
  }

  // ---- render da home ----
  function renderHome() {
    const frag = document.createDocumentFragment();
    state.religions.forEach((rel) => {
      const card = document.createElement("button");
      card.className = "card";
      card.setAttribute("role", "listitem");
      card.style.setProperty("--c", rel.theme.primary);
      card.innerHTML = `
        <span class="card__icon"><svg aria-hidden="true"><use href="${SYMBOL_MAP[rel.symbol] || "#sym-lotus"}"></use></svg></span>
        <span class="card__name">${rel.name}</span>
        <span class="card__tag">${rel.tagline}</span>`;
      card.addEventListener("click", () => openReligion(rel.id));
      frag.appendChild(card);
    });
    els.grid.appendChild(frag);
  }

  // ---- abrir tradição ----
  async function openReligion(id) {
    const rel = state.religions.find((r) => r.id === id);
    if (!rel) return;
    state.current = rel;
    applyTheme(rel.theme);
    els.body.setAttribute("data-religion", id);

    els.readerReligion.textContent = rel.name;
    els.readerSymbol.querySelector("use").setAttribute("href", SYMBOL_MAP[rel.symbol] || "#sym-lotus");
    els.phraseLabel.textContent = rel.phraseLabel;
    els.phraseSource.textContent = rel.source;

    showScreen("reader");
    stopSpeech();

    try {
      state.phrases = await loadPhrases(id);
    } catch (e) {
      state.phrases = [{ text: "Não foi possível carregar as palavras agora. Tente novamente em instantes.", reference: "" }];
    }

    if (!state.phrases.length) {
      state.phrases = [{ text: "Em breve, novas palavras desta tradição.", reference: "" }];
    }

    // palavra do dia: determinística pela data
    state.index = dayNumber() % state.phrases.length;
    renderPhrase(false);
    history.replaceState({ id }, "", `#${id}`);
  }

  function renderPhrase(animate = true) {
    const p = state.phrases[state.index] || {};
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
    stopSpeech();
    if (state.phrases.length <= 1) return;
    let i;
    do { i = Math.floor(Math.random() * state.phrases.length); }
    while (i === state.index);
    state.index = i;
    renderPhrase(true);
  }

  // ---- voz (opcional, grátis, voz do dispositivo) ----
  function stopSpeech() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    els.listenBtn.classList.remove("is-active");
  }

  function speak() {
    if (!("speechSynthesis" in window)) {
      toast("Seu dispositivo não permite leitura em voz.");
      return;
    }
    if (els.listenBtn.classList.contains("is-active")) { stopSpeech(); return; }
    const p = state.phrases[state.index] || {};
    const text = [p.text, p.reference].filter(Boolean).join(". ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICE_LANG[state.current?.id] || "pt-BR";
    u.rate = 0.92; u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith("pt"));
    if (v) u.voice = v;
    u.onend = () => els.listenBtn.classList.remove("is-active");
    u.onerror = () => els.listenBtn.classList.remove("is-active");
    els.listenBtn.classList.add("is-active");
    window.speechSynthesis.speak(u);
  }

  // ---- compartilhar ----
  async function share() {
    const p = state.phrases[state.index] || {};
    const text = `"${p.text}"${p.reference ? " — " + p.reference : ""}\n\n${state.current?.phraseLabel || "A Palavra do Dia"} · ${state.current?.source || ""}`;
    const shareData = { title: "A Palavra do Dia", text };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(text);
        toast("Palavra copiada para você compartilhar.");
      }
    } catch (_) { /* usuário cancelou */ }
  }

  // ---- voltar para home ----
  function goHome() {
    stopSpeech();
    applyTheme(null);
    state.current = null;
    showScreen("home");
    history.replaceState({}, "", location.pathname);
  }

  // ---- eventos ----
  function bind() {
    els.backBtn.addEventListener("click", goHome);
    els.homeLink.addEventListener("click", goHome);
    els.newBtn.addEventListener("click", nextPhrase);
    els.listenBtn.addEventListener("click", speak);
    els.shareBtn.addEventListener("click", share);
    window.addEventListener("popstate", () => {
      const id = (location.hash || "").replace("#", "");
      if (id && state.religions.some((r) => r.id === id)) openReligion(id);
      else goHome();
    });
    // pré-carrega vozes (alguns navegadores carregam async)
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
  }

  // ---- init ----
  async function init() {
    try {
      await loadReligions();
      renderHome();
      bind();
      // deep-link: abrir direto numa tradição via #id
      const id = (location.hash || "").replace("#", "");
      if (id && state.religions.some((r) => r.id === id)) openReligion(id);
    } catch (e) {
      els.grid.innerHTML = '<p style="color:var(--muted)">Não foi possível carregar as tradições. Recarregue a página.</p>';
      console.error(e);
    }
  }

  init();
})();
