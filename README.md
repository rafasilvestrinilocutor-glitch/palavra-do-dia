# 🪷 A Palavra do Dia

Site gratuito e sem cadastro onde a pessoa escolhe uma tradição espiritual e recebe **a palavra do dia** — um versículo, ensinamento ou pensamento — para trazer paz e sabedoria. A identidade visual da página muda conforme a tradição escolhida, com respeito e neutralidade a todas as crenças.

**Custo de operação: R$ 0,00.** É um site estático (HTML/CSS/JS puro), sem servidor, sem banco de dados, sem login.

---

## ✨ O que tem pronto

- **20 tradições**, cada uma com identidade visual e nome próprio da frase:

  | Tradição | Fonte | Nome da frase |
  |---|---|---|
  | Cristianismo | Bíblia Sagrada | Versículo do Dia |
  | Catolicismo | Sabedoria dos Santos | Ensinamento do Dia |
  | Islã | Alcorão Sagrado | Aya do Dia |
  | Judaísmo | Torá e Tanakh | Versículo do Dia |
  | Espiritismo | Doutrina Espírita | Pensamento do Dia |
  | Budismo | Dhammapada e Sutras | Ensinamento do Dia |
  | Hinduísmo | Bhagavad Gita e Vedas | Verso do Dia |
  | Taoismo | Tao Te Ching | Verso do Dia |
  | Confucionismo | Analectos de Confúcio | Ensinamento do Dia |
  | Xintoísmo | Sabedoria Xintoísta | Ensinamento do Dia |
  | Sikhismo | Guru Granth Sahib | Shabad do Dia |
  | Jainismo | Ensinamentos dos Tirthankaras | Ensinamento do Dia |
  | Fé Bahá'í | Escritos de Bahá'u'lláh | Palavra do Dia |
  | Umbanda | Pontos e Ensinamentos | Ponto de Sabedoria do Dia |
  | Candomblé | Itàn e Sabedoria dos Orixás | Ensinamento dos Orixás do Dia |
  | Jurema Sagrada | Sabedoria da Jurema | Ensinamento da Jurema do Dia |
  | Santo Daime | Doutrina da Floresta | Palavra do Dia |
  | Xamanismo | Sabedoria Ancestral | Sabedoria Ancestral do Dia |
  | Wicca e Paganismo | Tradição Wicca e Pagã | Sabedoria do Dia |
  | Seicho-No-Ie | Ensinamentos da Seicho-No-Ie | Ensinamento do Dia |

- **+2.300 frases** no total (mais de 110 por tradição), curadas com respeito e cuidado de precisão.
- **Palavra do Dia determinística**: todos veem a mesma frase no mesmo dia; ela muda sozinha à meia-noite.
- Botão **"Nova palavra"** para sortear outra na hora.
- Botão **Ouvir** (usa a voz do próprio dispositivo — grátis, opcional).
- Botão **Compartilhar** (compartilhamento nativo no celular / copiar no computador).
- Design **calmo e neutro**, responsivo (funciona bem no celular), acessível.

---

## 📁 Estrutura do projeto

```
Salvacao/
├── index.html            ← a página
├── css/styles.css        ← estilos e temas por tradição
├── js/app.js             ← lógica (troca de tema, palavra do dia, ouvir, compartilhar)
├── data/
│   ├── religions.json    ← lista de tradições + cores/labels de cada uma
│   ├── cristianismo.json ← frases (uma por tradição)
│   ├── islamismo.json
│   └── ... (10 arquivos)
├── assets/favicon.svg
├── _headers              ← cabeçalhos de segurança/cache (Cloudflare)
└── README.md
```

---

## 🚀 Como publicar de graça no Cloudflare Pages

Você **não precisa de cartão de crédito**. Duas formas:

### Opção A — Arrastar e soltar (mais rápida, sem GitHub)
1. Crie uma conta grátis em <https://dash.cloudflare.com>.
2. No menu, vá em **Workers & Pages → Create → Pages → Upload assets**.
3. Dê um nome ao projeto (ex: `palavra-do-dia`).
4. Arraste a pasta **inteira** `Salvacao` (ou selecione todos os arquivos dela).
5. Clique em **Deploy**. Pronto! Seu site fica no ar em algo como
   `https://palavra-do-dia.pages.dev`.

> Para atualizar frases no futuro, basta repetir o upload.

### Opção B — Via GitHub (atualiza sozinho quando você mexe no código)
1. Suba esta pasta para um repositório no GitHub.
2. No Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Selecione o repositório.
4. Em configurações de build, deixe **tudo em branco**:
   - Framework preset: **None**
   - Build command: *(vazio)*
   - Build output directory: `/` (a raiz)
5. **Save and Deploy**. A cada `git push`, o site atualiza sozinho.

### Domínio próprio (opcional)
Se quiser um endereço tipo `apalavradodia.com.br`, compre o domínio e em
**Pages → seu projeto → Custom domains** é só apontar. O HTTPS é automático e grátis.

---

## ✏️ Como adicionar ou editar frases

Cada tradição tem um arquivo em `data/`. É só abrir e adicionar um item na lista:

```json
{
  "id": "cristianismo",
  "phrases": [
    { "text": "Sua frase aqui.", "reference": "Livro Capítulo:Versículo" }
  ]
}
```

- `text` = a frase.
- `reference` = a fonte (livro, capítulo, autor ou tradição).

Para adicionar uma **nova religião**: crie `data/novareligiao.json` no mesmo formato
e adicione um bloco correspondente em `data/religions.json` (com cores e o nome da frase).
Nenhum código precisa ser alterado.

---

## 🧪 Testar no seu computador antes de publicar

Abra o terminal nesta pasta e rode:

```bash
python3 -m http.server 8000
```

Depois acesse <http://localhost:8000> no navegador.
(Abrir o `index.html` direto com clique duplo **não** funciona por causa do carregamento
dos arquivos de dados — use o servidor local acima.)

---

## 🙏 Sobre o conteúdo

As frases foram reunidas a partir de textos de domínio público e da sabedoria tradicional
de cada caminho espiritual, com o cuidado de respeitar todas as crenças igualmente e não
favorecer nenhuma. Para as tradições de transmissão oral (Umbanda, Candomblé, Xamanismo),
os ensinamentos refletem os valores centrais da tradição, sem inventar escrituras inexistentes.

Feito com respeito. 🤍
