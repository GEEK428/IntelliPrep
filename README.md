<div align="center">

<img src="./Frontend/public/mind-icon.svg" width="72" height="72" alt="IntelliPrep" />

# IntelliPrep

**AI-powered interview prep — personalised to your resume and your target job**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-intelliprep--seven.vercel.app-4285F4?style=for-the-badge&logo=vercel&logoColor=white)](https://intelliprep-seven.vercel.app/)

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

</div>

---

## What is IntelliPrep?

Upload your resume + paste any job description → IntelliPrep generates a fully personalised interview kit using Google Gemini AI. No generic questions. Everything is specific to *you* and *the role*.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🎯 | **AI Interview Report** | Match score, tailored technical & behavioural Q&A with model answers, skill gap analysis, day-by-day prep plan |
| 📄 | **Resume Optimizer** | AI tailors your resume to the job, injects missing skills, exports a clean one-page PDF via Puppeteer |
| 📝 | **Smart Notes** | Create, tag, and organise notes by domain — AI generates answers, bulk import from PDF/DOCX, export to PDF |
| 📈 | **Progress Tracker** | Skill assessment, goal setting, weekly study roadmap, daily check-ins, streak tracking |
| 🔔 | **Reminders** | Daily study reminders via in-app notifications and/or email |
| 🔐 | **Auth** | Local + Google OAuth, JWT in HttpOnly cookies, token blacklist, email verification, forgot/reset password |

---

## 🛠️ Tech Stack

**Backend** — Node.js 20, Express 5, MongoDB (Mongoose), Google Gemini AI, Zod (structured AI output), Puppeteer (PDF generation), bcryptjs, JWT, Resend (email), Multer (file uploads), Docker

**Frontend** — React 19, Vite 7, React Router 7, Axios, SCSS, Lottie animations

---

## 🚀 Running Locally

### With Docker (recommended)

```bash
git clone https://github.com/GEEK428/IntelliPrep.git
cd IntelliPrep

cp Backend/.env.example Backend/.env    # fill in your values
cp Frontend/.env.example Frontend/.env  # fill in your values

docker-compose up --build
```

> Backend → `http://localhost:3000` · Frontend → `http://localhost:5173`

### Without Docker

```bash
# Backend
cd Backend && npm install && node server.js

# Frontend (new terminal)
cd Frontend && npm install && npm run dev
```

---

## ⚙️ Environment Variables

### `Backend/.env`

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/intelliprep
JWT_SECRET=your_jwt_secret_min_32_chars
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_GENAI_API_KEY=your_gemini_api_key
RESEND_API_KEY=re_your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

### `Frontend/.env`

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> **Tip:** App still runs without `RESEND_API_KEY` or `GOOGLE_GENAI_API_KEY` — emails log to console and AI features return fallback data.

---

## 📄 License

ISC © [GEEK428](https://github.com/GEEK428)

<div align="center">

⭐ Star this repo if IntelliPrep helped you prep for your next interview

</div>
