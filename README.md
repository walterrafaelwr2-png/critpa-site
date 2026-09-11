# 🎓 CRITPA Site

**Clube de Relações Internacionais — Tiradentes Porto Alegre**

Um site moderno para o clube com registro de eventos (mural) e calendário de simulações diplomáticas. Todos os dados são salvos na nuvem via Supabase.

---

## ✨ Características

- ✅ **Mural de eventos** — Registre e compartilhe eventos do clube com fotos
- ✅ **Calendário de simulações** — Veja datas, comitês e locais das próximas simulações
- ✅ **Edição em tempo real** — Membros do clube podem adicionar, editar e remover conteúdo
- ✅ **Autenticação por código** — Apenas com a senha do clube você edita o site
- ✅ **Design responsivo** — Funciona em celular, tablet e desktop
- ✅ **Dados na nuvem** — Tudo sincronizado via Supabase, sem perder nada
- ✅ **Deploy automático** — Conecte no Netlify e o site sai do forno sozinho

---

## 🚀 Começar agora

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/walterrafaelwr2-png/critpa-site.git
cd critpa-site
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Configurar o `.env`

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Depois abra o `.env` e confirme que tem:

```
SUPABASE_URL=https://ammbxjabhmfuoutgzqvz.supabase.co
SUPABASE_KEY=sb_publishable_Y4iAlkuFY1zJrpd6miUARg_Dm9W65Q_
NODE_ENV=production
PORT=3000
ADMIN_PASSWORD=critpa2026
```

### 4️⃣ Rodar localmente

```bash
npm run dev
```

Abra **http://localhost:3000** no navegador. 🎉

---

## 📊 Configurar o banco de dados (Supabase)

### Criar as tabelas

No painel do Supabase, vá para **SQL Editor** e rode esses comandos:

#### Tabela de posts (eventos)

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX posts_date_idx ON posts(date DESC);
```

#### Tabela de simulações

```sql
CREATE TABLE simulations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  committees JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX simulations_date_idx ON simulations(date ASC);
```

---

## 🔐 Autenticação

A primeira vez que alguém acessa o site, clica em **Entrar** e digita a senha do clube: **`critpa2026`**

Depois disso, aparece:
- ✏️ Botão "+ Evento" para adicionar posts
- 📅 Botão "+ Simulação" para adicionar simulações
- ⚙️ Botão de configurações (pra trocar a senha)
- 🚪 Botão "Sair"

A senha fica salva no navegador (localStorage), então não precisa digitar toda vez.

---

## 📱 Como usar

### Adicionar um evento

1. Clique em **"+ Evento"**
2. Preencha título, data e descrição
3. Adicione até 4 fotos (são redimensionadas automaticamente)
4. Clique em **"Salvar registro"**

As fotos aparecem em destaque no card do evento.

### Adicionar uma simulação

1. Clique em **"+ Simulação"**
2. Preencha nome, data, local e comitês (separados por vírgula)
3. Opcionalmente, adicione notas (link de inscrição, taxa, etc)
4. Clique em **"Salvar simulação"**

Simulações futuras aparecem em **"Próximas simulações"**, as passadas em **"Simulações passadas"**.

### Editar ou remover

Hover em qualquer card ou linha de simulação (membros logados) — aparecem os botões ✏️ (editar) e 🗑 (remover).

---

## 🌐 Deploy no Netlify

### Passo 1: Conectar o repositório

1. Vá para **netlify.com** e logue/crie conta
2. Clique em **"New site from Git"**
3. Selecione **GitHub** e autorize
4. Selecione o repositório `critpa-site`

### Passo 2: Configurar build

Netlify detecta automaticamente `netlify.toml`. Confirme:
- **Build command:** `npm install`
- **Publish directory:** `public`

### Passo 3: Variáveis de ambiente

No painel do Netlify, vá para **Site settings → Build & deploy → Environment**. Adicione:

```
SUPABASE_URL=https://ammbxjabhmfuoutgzqvz.supabase.co
SUPABASE_KEY=sb_publishable_Y4iAlkuFY1zJrpd6miUARg_Dm9W65Q_
ADMIN_PASSWORD=critpa2026
NODE_ENV=production
```

### Passo 4: Deploy

Clique em **"Deploy site"**. Pronto! O site sai do forno em ~2 minutos. 🎂

Toda vez que você fizer push pro `main`, o site atualiza automaticamente.

---

## 🛠 Estrutura do projeto

```
critpa-site/
├── server.js              # Express backend
├── public/
│   ├── index.html         # HTML + CSS (tudo junto)
│   └── app.js             # JavaScript cliente
├── package.json           # Dependências
├── netlify.toml           # Config Netlify
├── .env                   # Variáveis (não comita)
└── .gitignore             # Git ignore
```

---

## 📝 API Endpoints

### Posts

- `GET /api/posts` — Lista todos os eventos
- `POST /api/posts` — Criar novo evento (precisa `password`)
- `DELETE /api/posts/:id` — Remover evento (precisa `password`)

### Simulações

- `GET /api/simulations` — Lista todas as simulações
- `POST /api/simulations` — Criar nova simulação (precisa `password`)
- `DELETE /api/simulations/:id` — Remover simulação (precisa `password`)

Todos os POST/DELETE precisam enviar `password` no body (para posts) ou query (para deletes).

---

## 🎨 Personalizar

### Cores

No `index.html`, procure por `:root { --ink: ... }` para mudar as cores:

```css
:root {
  --ink: #101B4D;           /* Azul escuro */
  --brass: #C0272B;         /* Vermelho */
  --parchment: #FFFFFF;     /* Branco */
  /* ... mais cores ... */
}
```

### Logo

Procure por `LOGO_URL` no `app.js` e substitua pela URL do logo do CRITPA.

### Texto

Tudo que está em português pode ser mudado diretamente no `index.html`.

---

## 🐛 Troubleshooting

### "Erro ao carregar dados"

Verifique se:
- As variáveis de `.env` estão corretas
- As tabelas foram criadas no Supabase
- A chave Supabase é válida

### Fotos não aparecem

- Verifique o console do navegador (F12)
- Certifique-se de que as fotos são base64 (são convertidas automaticamente)
- Arquivos muito grandes podem não funcionar — redimensione antes

### Deploy no Netlify falha

- Verifique se `netlify.toml` está no root
- Confirme as variáveis de ambiente
- Veja os logs no painel do Netlify

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique este README
2. Veja os comentários no `server.js` e `app.js`
3. Consulte a documentação do [Supabase](https://supabase.com/docs)
4. Abra uma issue neste repositório

---

## 💚 Créditos

Feito com carinho para o **Clube de Relações Internacionais Tiradentes** de Porto Alegre.

**Desenvolvido por:** Walter Rafael

---

**Enjoy! 🎉**
