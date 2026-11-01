# SSchat.box — AI School Learning Assistant (LKG to Class 12)
> **BCA Final-Year Capstone Project**  
> *A Textbook-Grounded, Multilingual (Tamil, English, Hindi) Educational Web Application with Zero Hallucination and Genuine Citations.*

---

## 📖 1. Project Overview & Vision

**SSchat.box** is an AI-powered educational web application designed specifically for school students from **LKG through Class 12**. 

Unlike generic generative AI models that fabricate facts and invent textbook citations, **SSchat.box** employs strict **Retrieval-Augmented Generation (RAG)**. Every answer is retrieved from and validated against authentic curriculum materials from:
1. **Tamil Nadu State Board / Samacheer Kalvi** (Tamil Nadu Textbook and Educational Services Corporation)
2. **NCERT** (National Council of Educational Research and Training)
3. **CBSE Academic**
4. **Foundational Early Childhood Stage** (LKG & UKG Phonics, Numbers, Uyir Ezhuthukkal, and Varnamala)

---

## 🌟 2. Key Features

- **Strict Evidence Grounding (Zero Hallucination)**: Answers are generated strictly from verified textbook passages. If evidence is insufficient, the system returns an honest, curriculum-aware fallback message.
- **Genuine Citations**: Every answer displays the verified **Board, Chapter Number, Chapter Name, and exact Textbook Page Range**.
- **Accurate Multilingual Support**:
  - **Tamil**: Pure Tamil script without accidental Tanglish, validated with Unicode ranges (`\u0B80–\u0BFF`) and educational science glossaries.
  - **Hindi**: Natural Devanagari script (`\u0900–\u097F`) preserving authentic textbook terms (e.g., *द्रव्यमान संरक्षण*, *प्रकाश संश्लेषण*).
  - **English**: Grade-appropriate vocabulary tailored to student age.
- **Curriculum & Class Isolation**: Tamil Nadu Samacheer Kalvi and NCERT/CBSE are treated as distinct repositories and never conflated.
- **Kindergarten Inclusion (LKG & UKG)**: Tailored explanations with gentle vocabulary, phonics, numbers 1–10, and foundational nature studies.
- **Interactive Textbook Practice Quizzes**: Self-assessment tests linked to textbook chapters with immediate page explanations.
- **Public Website with Optional Accounts**: Open access to educational information without forced logins. Optional secure student authentication using PBKDF2/SHA256 password hashing.

---

## 🏛️ 3. Technology Stack

### Frontend
- **Framework**: Next.js (App Router, Server Components)
- **UI Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom Deep Navy (`#0B192C`) and Teal (`#0D9488`) design tokens
- **Icons**: Lucide Icons
- **Typography**: Inter, Noto Sans Tamil, and Noto Sans Devanagari

### Backend
- **Framework**: Python 3.11 + Flask
- **API Architecture**: Modular REST Blueprints (`auth`, `chat`, `curriculum`, `quiz`, `admin`)
- **RAG Engine**: Semantic keyword & concept relevance scoring with threshold validation
- **NLP Validation**: Script integrity checkers, Unicode boundary validation, and trilingual glossary matching
- **Testing**: Automated `pytest` suite

---

## 🚀 4. How to Run Locally (Step-by-Step)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Step 1: Start the Python Backend
Open a terminal in the project root:
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```
> The backend server starts at: **`http://localhost:5000`**

### Step 2: Run Automated Backend Tests
In a separate terminal:
```bash
cd backend
python -m pytest tests/ -v
```
> All 11 automated test cases (RAG retrieval, Tamil/Hindi script integrity, fallback messages, authentication) will pass!

### Step 3: Start the Next.js Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> The web application opens at: **`http://localhost:3000`**

---

## 🧪 5. BCA Examiner & Viva Demonstration Guide

Use these exact test cases to demonstrate the system during project evaluation:

| Test Case | Language | Query | Expected Grounded Result | Citation |
|---|---|---|---|---|
| **Newton's First Law** | Tamil | `நியூட்டனின் முதல் இயக்க விதியைக் கூறுக.` | Retrieves Newton's First Law and definition of Inertia (*நிலைமம்*) in pure Tamil. | TN Samacheer Kalvi Class 10 Science, Ch. 1, Page 2–3 |
| **Photosynthesis & Xylem** | English | `Differentiate between xylem and phloem.` | Explains upward unidirectional water transport (xylem) vs multidirectional food transport (phloem). | TN Samacheer Kalvi Class 10 Science, Ch. 12, Page 176–178 |
| **Chemical Equations** | Hindi | `रासायनिक समीकरण को संतुलित करना क्यों आवश्यक है?` | Explains Law of Conservation of Mass (*द्रव्यमान संरक्षण का नियम*) in Devanagari. | NCERT Class 10 Science, Ch. 1, Page 3–4 |
| **Kindergarten Early Learning** | Tamil | `தமிழ் உயிர் எழுத்துக்கள் யாவை?` | Lists the 12 Tamil vowels (அ, ஆ, இ, ஈ...) with early childhood examples (அணில், ஆலமரம்). | Early Childhood Framework LKG, Ch. 1, Page 4–8 |
| **Insufficient Evidence Fallback** | Any | `How to construct a quantum teleportation circuit?` | Triggers strict prompt-mandated fallback message: *"தேர்ந்தெடுத்த பாடப்புத்தகத்தில் இந்தக் கேள்விக்கான பதிலை உறுதிப்படுத்தப் போதுமான தகவல் கிடைக்கவில்லை..."* | No hallucinated citations |

---

## 🌐 6. Public Deployment Guide

- **Frontend**: Connect the `frontend/` folder to [Vercel](https://vercel.com/) with environment variable `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`.
- **Backend**: Connect the `backend/` folder to [Render](https://render.com/) or Railway as a Python Web Service with start command `gunicorn app:app` or `python app.py`.

---

## 📜 7. License & Attribution

- Built as a BCA Final-Year Project.
- Educational materials referenced from official public portals:
  - Tamil Nadu Textbook Corporation: `https://textbookcorp.in/`
  - NCERT Portal: `https://ncert.nic.in/`
  - CBSE Academic: `https://cbseacademic.nic.in/`
