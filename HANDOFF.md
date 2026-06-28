# 📌 HANDOFF — A Palavra do Dia

> Para você retomar amanhã sem perder nada. Última atualização: 27/06/2026 (noite).

---

## ✅ O que JÁ está pronto (100% funcionando)

- Site **"A Palavra do Dia"** completo, na pasta `Salvacao`.
- **20 tradições religiosas**, cada uma com símbolo, cores e nome próprio da frase.
- **2.399 frases** no total (116 a 134 por tradição), curadas com respeito e neutralidade.
- Funções: escolher tradição → a página muda de identidade visual → mostra a **Palavra do Dia**
  (muda sozinha a cada dia), botão **Nova palavra**, **Ouvir** (voz grátis do aparelho) e **Compartilhar**.
- Site **estático, custo zero, sem login, sem build**. Tudo validado (JSON ok, HTTP 200, símbolos ok).

**As 20 tradições:** Cristianismo, Catolicismo, Islã, Judaísmo, Espiritismo, Budismo, Hinduísmo,
Taoismo, Confucionismo, Xintoísmo, Sikhismo, Jainismo, Fé Bahá'í, Umbanda, Candomblé, Jurema Sagrada,
Santo Daime, Xamanismo, Wicca/Paganismo, Seicho-No-Ie.

---

## 👀 Como ver o site agora (no seu computador)

No terminal, dentro da pasta `Salvacao`:

```bash
python3 -m http.server 8000
```

Depois abra <http://localhost:8000> no navegador.
(Não adianta dar duplo-clique no `index.html` — precisa do servidor acima por causa dos dados.)

---

## ⏭️ PRÓXIMO PASSO (a decisão é sua) — PUBLICAR O SITE

O site ainda **não está no ar**. Falta publicar. Eu **não consigo entrar na sua conta Cloudflare**
(exige seu login + 2FA). Escolha UM caminho e me avise amanhã:

1. **Eu publico por comando (recomendado):** você digita no chat
   `! npx wrangler login` → aprova no navegador → eu rodo o deploy. OU me passa um *API Token*
   da Cloudflare e eu publico sem navegador.
2. **Você publica sozinho (sem mim):** painel da Cloudflare → Workers & Pages → Create → Pages →
   Upload assets → arrasta a pasta `Salvacao` → Deploy. (~2 min, grátis, sem cartão.)
   Passo a passo detalhado no `README.md`.

Resultado: site no ar em algo como `https://palavra-do-dia.pages.dev` (e dá pra usar domínio próprio depois).

---

## 💡 Ideias para amanhã (opcionais, se você quiser)

- [ ] Publicar o site (passo acima).
- [ ] Incluir mais religiões? (ex.: Mormonismo / Livro de Mórmon, Testemunhas de Jeová, outras).
- [ ] Áudio com voz de IA (ElevenLabs) — qualidade melhor que a voz do aparelho (tem custo).
- [ ] Comprar um domínio próprio (ex.: apalavradodia.com.br).
- [ ] Subir pro GitHub para o site atualizar sozinho a cada mudança.

---

## 🗂️ Onde está cada coisa

```
Salvacao/
├── index.html        ← a página
├── css/styles.css    ← visual e temas por tradição
├── js/app.js         ← lógica
├── data/
│   ├── religions.json ← lista das 20 tradições (cores + nome da frase)
│   └── *.json         ← as frases (1 arquivo por tradição)
├── README.md         ← guia completo + como publicar
└── HANDOFF.md        ← este arquivo
```

Para adicionar/editar frases ou uma nova religião: instruções no `README.md` (seção "Como adicionar").

— Tudo salvo. Bom descanso. 🤍
