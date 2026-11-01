# SSchat.box — Production Deployment, Architecture & Google SEO Guide

## 1. Updated Project Architecture

```
SSchat.box/
├── backend/
│   ├── app.py                      # Flask Application with Blueprints, CORS & Health probe
│   ├── config.py                   # Production environment config, secrets & origins
│   ├── gunicorn_config.py          # Production WSGI multi-worker concurrency
│   ├── Procfile                    # Render / Railway startup declaration
│   ├── requirements.txt            # Flask, PyJWT, gunicorn, pytest, etc.
│   ├── .env.production.example     # Production environment variables template
│   ├── data/
│   │   ├── sschatbox.db            # High-concurrency SQLite database (WAL mode)
│   │   ├── curriculum_catalog.json # Boards, classes & subjects directory
│   │   ├── textbooks/              # Authentic curriculum JSON files (TN State Board, NCERT, Early Learning)
│   │   └── glossary/               # Educational bilingual/trilingual terms glossary
│   ├── routes/
│   │   ├── auth_routes.py          # Register, Login, Me, Profile update, Change password
│   │   ├── chat_routes.py          # Isolated /ask, /history, /clear with rate limiting
│   │   ├── curriculum_routes.py    # Catalog, textbooks, chapters
│   │   ├── quiz_routes.py          # Textbook practice quizzes & grading
│   │   └── admin_routes.py         # System health, index reload & DB metrics
│   ├── services/
│   │   ├── db_service.py           # Thread-safe DB persistence & multi-student isolation
│   │   ├── jwt_service.py          # Cryptographic HMAC-SHA256 JWT tokens & validation
│   │   ├── auth_service.py         # PBKDF2/scrypt password hashing & session management
│   │   ├── ai_service.py           # Evidence-grounded synthesis & Gemini fallback
│   │   ├── rag_service.py          # Strict curriculum filtering & evidence scoring
│   │   └── language_service.py     # Tamil/Hindi script validation & glossary matching
│   └── tests/
│       ├── test_auth.py            # Authentication unit tests
│       ├── test_multilingual.py    # Script integrity and exact fallback tests
│       ├── test_rag.py             # Grounded retrieval and follow-up tests
│       └── test_scalability_and_security.py # Multi-student isolation, JWT tampering & rate limiting
│
└── frontend/
    ├── app/
    │   ├── page.tsx                # Public Landing Page with Sandbox & Schema.org JSON-LD
    │   ├── layout.tsx              # SEO Metadata, Open Graph, Twitter Cards & theme script
    │   ├── chat/page.tsx           # Isolated AI Chat interface with citations & clear history
    │   ├── dashboard/page.tsx      # Student Dashboard with recent questions & saved notes
    │   ├── settings/page.tsx       # Profile preferences, language & password update
    │   ├── textbooks/page.tsx      # Verified Curriculum Library & textbook viewer
    │   ├── chapter/page.tsx        # Section-by-section textbook chapter reader
    │   ├── quiz/page.tsx           # Interactive practice quizzes with citations
    │   ├── login/page.tsx          # Student login (with robots: noindex)
    │   ├── signup/page.tsx         # Student registration (with robots: noindex)
    │   ├── robots.ts               # Robots.txt (allows public pages, blocks private chats/dashboards)
    │   └── sitemap.ts              # Dynamic sitemap generator (sitemap.xml)
    ├── components/
    │   ├── Navbar.tsx              # Multilingual responsive navigation & theme switcher
    │   ├── Footer.tsx              # Educational portal attribution & links
    │   └── CitationCard.tsx        # Verified textbook source card with page numbers
    ├── context/
    │   └── AppContext.tsx          # Trilingual UI state & light/dark theme provider
    └── lib/
        ├── api.ts                  # API client with session management & JWT Bearer auth
        ├── curriculum.ts           # Board & class grade validation rules
        └── translations.ts         # Complete English, Tamil & Hindi dictionaries
```

---

## 2. Public Backend Deployment (Render / Railway)

### Step 1: Create a New Web Service on Render
1. Sign up / Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing `SSchat.box`.
4. Configure the following settings:
   - **Name**: `sschatbox-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --config gunicorn_config.py app:app`
   - **Instance Type**: Free or Starter

### Step 2: Configure Backend Environment Variables
In the Render dashboard under **Environment**, add:
- `FLASK_ENV`: `production`
- `DEBUG`: `false`
- `PORT`: `5000`
- `SECRET_KEY`: *(Generate a 64-character random string, e.g. run `python -c "import secrets; print(secrets.token_hex(32))"`)*
- `JWT_SECRET_KEY`: *(Generate another 64-character random string)*
- `CORS_ORIGIN`: `https://sschatbox.vercel.app` *(Replace with your actual frontend domain)*
- `GEMINI_API_KEY`: *(Optional: Your Google Gemini API key; if left blank, the local verified RAG engine is used)*

### Step 3: Verify Backend Deployment
Once Render deploys, test the health check endpoint:
```
https://your-backend-service.onrender.com/api/health
```
Expected output:
```json
{
  "status": "healthy",
  "database": { "status": "connected", "registered_students": 2 },
  "rag_engine": { "status": "operational", "indexed_textbook_passages": 14 }
}
```

---

## 3. Public Frontend Deployment (Vercel)

### Step 1: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Framework Preset will automatically detect **Next.js**.

### Step 2: Configure Frontend Environment Variables
Under **Environment Variables**, add:
- `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com` *(No trailing slash)*
- `NEXT_PUBLIC_SITE_URL`: `https://sschatbox.vercel.app` *(Your Vercel URL or custom domain)*

### Step 3: Deploy
Click **Deploy**. Vercel will build and launch the site globally on its Edge network with automatic HTTPS!

---

## 4. Google Search Console & SEO Indexing Instructions

### Target
Ensure anyone searching for **SSchat.box** finds the official website prominently.

### Step 1: Add Property in Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console/).
2. Select **URL prefix** and enter your production URL: `https://sschatbox.vercel.app`.

### Step 2: Verify Domain Ownership
Use the **HTML tag** method:
1. Copy the verification meta tag provided by Google (e.g. `<meta name="google-site-verification" content="..." />`).
2. Add it to `frontend/app/layout.tsx` inside `<head>`.
3. Commit and deploy, then click **Verify** in Search Console.

### Step 3: Submit Sitemap
1. In Search Console, click **Sitemaps** in the left sidebar.
2. Enter `sitemap.xml` and click **Submit**.
3. Google will fetch `https://sschatbox.vercel.app/sitemap.xml` and index public educational routes:
   - `/` (Home Landing Page)
   - `/chat` (AI School Assistant)
   - `/chapter` (Textbook Chapters)
   - `/textbooks` (Curriculum Library)
   - `/quiz` (Self-Assessment Practice)
   - `/privacy` & `/terms`

### Step 4: Protect Private Student Conversations
The system already enforces strict `robots: noindex, nofollow` on:
- `/dashboard`
- `/settings`
- `/admin`
- `/login`
- `/signup`
- `/api/*`
This guarantees student conversation history and accounts remain strictly private.

---

## 5. Connecting a Custom Domain (Optional)
If you purchase a custom domain (e.g., `sschatbox.edu` or `sschatbox.in`):
1. In Vercel -> Project Settings -> **Domains** -> Enter your domain.
2. Add the DNS records (CNAME or A record) at your registrar (Namecheap, GoDaddy, Cloudflare).
3. Update `CORS_ORIGIN` in your backend Render environment to include your new domain.
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your new domain.
