<p align="center">
  <img src="./public/docgenius-logo.svg" alt="DocGenius AI logo" width="104" height="104" />
</p>

<h1 align="center">DocGenius AI</h1>

<p align="center">
  AI Document Workspace for Word, PDF, PowerPoint, Excel, Research, and Conversion
</p>

<p align="center">
  <strong>Powered by Kreativan Technologies</strong>
</p>

<p align="center">
  Created by Ayush Sharma (SynergyAYUSH)
</p>

DocGenius AI is a production-ready AI-powered SaaS platform that generates professional Word, PDF, PowerPoint, and Excel documents, supports editable research workflows, and includes smart conversion tools.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Fill in values for:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY` or OpenAI/OpenRouter equivalent
- `PYTHON_SERVICE_URL` if different from `http://localhost:8000`

### 3. Set up Supabase
- Create a project in Supabase
- Run [schema.sql](/c:/Users/ayush/Desktop/prompt/ai-docgen/supabase/schema.sql)
- Run [seed.sql](/c:/Users/ayush/Desktop/prompt/ai-docgen/supabase/seed.sql)
- Create a public storage bucket named `documents`

### 4. Start the full app
```bash
npm run dev
```

This starts:
- Next.js on `http://localhost:3000`
- Python document service on `http://localhost:8000`

## Features

- AI document generation for `pdf`, `docx`, `pptx`, and `xlsx`
- Rich text editing with TipTap
- Research workspace with editable output and export to Word/PDF
- Converter module for PDF, Word, PowerPoint, Excel, text, and PDF-to-images workflows
- Templates, history, payments, token system, and plan handling
- Supabase auth, storage, and database integration
- Admin payment approval flow

## Project Structure

```text
ai-docgen/
|-- src/
|   |-- app/
|   |   |-- (dashboard)/
|   |   |-- api/
|   |-- components/
|   |-- lib/
|   `-- types/
|-- public/
|-- python-service/
|   |-- routers/
|   `-- requirements.txt
|-- scripts/
`-- supabase/
```

## Deployment

- Frontend: Vercel
- Python microservice: Railway or Render
- Database/Auth/Storage: Supabase

Set `PYTHON_SERVICE_URL` in your frontend deployment to the deployed Python service URL.

## Attribution

This project was originally developed by Ayush Sharma (SynergyAYUSH) and was presented during an internship at Kreativan Technologies.
