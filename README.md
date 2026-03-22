# DocGenius AI — AI Document Generator SaaS

A production-ready AI-powered SaaS platform that generates professional **PDF, Word, PowerPoint, and Excel** documents using GPT-4o.

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd ai-docgen
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Fill in your values:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
# - PYTHON_SERVICE_URL (default: http://localhost:8000)
```

### 3. Set up Supabase
- Create a project at [supabase.com](https://supabase.com)
- Run `supabase/schema.sql` in the SQL Editor
- Run `supabase/seed.sql` to load templates
- Create a Storage bucket named **`documents`** (public)

### 4. Start Python microservice
```bash
cd python-service
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. Start Next.js dev server
```bash
cd ai-docgen
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗 Project Structure

```
ai-docgen/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── editor/page.tsx       # Main editor
│   │   │   ├── templates/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   └── premium/page.tsx
│   │   └── api/
│   │       ├── generate/route.ts     # AI content generation
│   │       ├── rewrite/route.ts      # Text transformation
│   │       ├── suggestions/route.ts  # AI suggestions
│   │       ├── download/route.ts     # Calls Python service
│   │       └── documents/route.ts    # Document CRUD
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── Editor/
│   │       ├── TipTapEditor.tsx
│   │       └── AIPanel.tsx
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   ├── openai.ts
│   │   ├── store.ts
│   │   ├── tokens.ts
│   │   └── utils.ts
│   └── types/index.ts
├── supabase/
│   ├── schema.sql
│   └── seed.sql
└── python-service/
    ├── main.py
    ├── requirements.txt
    ├── Dockerfile
    └── routers/
        ├── word.py
        ├── pdf.py
        ├── pptx.py
        └── excel.py
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Next.js Frontend | Vercel |
| Python Microservice | Railway / Render |
| Database + Auth + Storage | Supabase |

### Deploy Python service to Railway
1. Connect `python-service/` folder to a Railway project
2. Railway auto-detects Dockerfile
3. Set `PYTHON_SERVICE_URL` in Vercel to the Railway URL

---

## 🔑 Features

- **4 document formats**: PDF, Word, PowerPoint, Excel
- **GPT-4o powered** content generation
- **Rich text editor** (TipTap) with full formatting toolbar
- **AI Actions**: Rewrite, Expand, Summarize, Simplify, Improve
- **Voice input** (Web Speech API)
- **12 templates**: Business, Academic, Career, Finance, HR, Marketing
- **Supabase auth**: Email + Google OAuth
- **Token system**: Free (10), Pro (100), Premium (unlimited)
- **Version history** and document management
- **Share links** (coming soon / UI ready)
- **Dark mode** with glassmorphism design
- **Framer Motion** animations throughout
