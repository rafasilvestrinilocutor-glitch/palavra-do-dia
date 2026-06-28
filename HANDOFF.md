# 📌 HANDOFF — Mosaico da Luz

> Para retomar sem perder nada. Última atualização: 28/06/2026 (noite).
> (Nome antigo do projeto: "Palavras Sagradas" / "A Palavra do Dia".)

---

## ✅ O que JÁ está pronto e NO AR

- Site **"Mosaico da Luz"** — no ar em **https://mosaicodaluz.netlify.app**
- Hospedagem: **Netlify** (plano grátis), **deploy automático** a cada `git push` no GitHub (branch `main`).
- **20 tradições religiosas**, cada uma com símbolo, cor de luz e nome próprio da frase.
- **~8.388 frases** no total — **365+ por tradição** (uma para cada dia do ano).
- **Uma frase fixa por dia** (determinística pela data). O usuário só pode **"Ver a de ontem"**
  (e dias anteriores) — **nunca o futuro**. Há botão **"Voltar para hoje"**.
- **Compartilhar**: WhatsApp, Facebook, copiar texto, compartilhamento nativo e **gerar imagem** (Instagram).
- **Design escuro premium** ("santuário noturno"): obsidiana + ouro, emblema de **mosaico** com halo.
- Site **estático, sem login, sem build**. Custo zero de funcionamento.

**As 20 tradições:** Cristianismo, Catolicismo, Islã, Judaísmo, Espiritismo, Budismo, Hinduísmo,
Taoismo, Confucionismo, Xintoísmo, Sikhismo, Jainismo, Fé Bahá'í, Umbanda, Candomblé, Jurema Sagrada,
Santo Daime, Xamanismo, Wicca/Paganismo, Seicho-No-Ie.

---

## 💰 Monetização (infra PRONTA no código, esperando suas contas)

A ideia: **empresas pagam (anúncios)**, o usuário nunca paga. Já está tudo preparado:

- **Espaços de anúncio** (`<aside class="ad-slot">`) na home e na tela da palavra — somem quando vazios.
- **Aviso de cookies (LGPD)** + **Política de Privacidade** (`privacidade.html`) — exigidos p/ aprovação.
- Espaço comentado no `<head>` do `index.html` pra colar o script da rede.

**Falta você (não é código):**
1. Criar conta no **Google AdSense** (grátis) e no **Ezoic** (paga mais; conecta o AdSense por dentro).
2. Me mandar o código/script deles → eu encaixo nos espaços.
3. E-mail de contato na privacidade hoje é `mosaicodaluz@gmail.com` (troque se quiser).

> Redes que pagam mais (Mediavine/Raptive) só aceitam com muito tráfego (50–100 mil/mês). Começar por
> AdSense/Ezoic agora, crescer, e migrar depois.

---

## 🌐 Domínio próprio (decidido: VALE A PENA — ainda não comprado)

- **mosaicodaluz** está livre em **.com**, **.com.br** e **.org** (checado 28/06/2026).
- Recomendado: comprar **mosaicodaluz.com.br** (~R$40/ano no registro.br) e, opcional, o **.com**.
- Apontar pro Netlify é grátis — peça o passo a passo quando registrar.
- E-mail profissional grátis depois: **contato@mosaicodaluz.com.br** (via Zoho ou encaminhamento).

---

## ⚙️ Sobre os "créditos" do Netlify (não se assuste)

- Plano grátis = **300 créditos/mês**, resetam no ciclo (ex.: 27/jul). **Sem cartão = sem cobrança.**
- Cada `git push` faz um build e gasta créditos. Em 28/06 bateu 50% porque fizemos ~8 deploys no dia.
- **Regra adotada:** agrupar mudanças e dar **1 push por sessão**. Se virar incômodo, dá pra migrar
  pro **GitHub Pages** (grátis, sem limite) em ~10 min.

---

## 👀 Como ver/editar localmente

No terminal, dentro da pasta `Salvacao`:

```bash
python3 -m http.server 8000
```

Abra <http://localhost:8000>. (Duplo-clique no `index.html` não funciona — precisa do servidor.)

---

## 🗂️ Onde está cada coisa

```
Salvacao/
├── index.html        ← página + sprite de símbolos SVG (inclui sym-mosaic da marca)
├── privacidade.html  ← Política de Privacidade (LGPD)
├── css/styles.css    ← visual, temas por tradição, anúncios, barra de cookies
├── js/app.js         ← lógica (busca, 1-frase-por-dia, compartilhar, imagem)
├── data/
│   ├── religions.json ← lista das 20 tradições (cor + nome da frase + símbolo)
│   └── *.json         ← as frases (1 arquivo por tradição, campo "phrases")
├── netlify.toml / _headers ← deploy e cache
├── README.md         ← guia (como adicionar frases/religião)
└── HANDOFF.md        ← este arquivo
```

Adicionar frase: editar `data/<id>.json`. Nova religião: novo arquivo + bloco em `religions.json`.

---

## ⏭️ Próximos passos (quando quiser)

- [ ] Registrar `mosaicodaluz.com.br` e ligar no Netlify (peça o passo a passo).
- [ ] Criar AdSense + Ezoic e me mandar o código dos anúncios.
- [ ] (Opcional) Revisar/variar entidades de outras tradições, novas religiões, etc.

— Tudo salvo e no ar. Bom descanso. 🤍
