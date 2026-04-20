# IntelliPrep

IntelliPrep is a full-stack interview preparation and resume optimization platform.
It helps users analyze role fit, generate interview strategy reports, optimize resumes against job descriptions, and manage prep notes in one workspace.

## What It Does

- Resume analysis against a target job description
- Interview strategy reports (match score, skill gaps, prep plan)
- Resume optimizer with one-page output and job-skill alignment
- Notes / prep workspace with AI-assisted answers
- Progress tracking dashboard
- Local auth + Google sign-in support

## Tech Stack

### Frontend
- React 19
- Vite 7
- React Router 7
- Axios
- Sass

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth + Google OAuth
- Gemini API (`@google/genai`)
- Puppeteer (PDF generation)
- Multer (file uploads)

## Repository Structure

```text
.
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   ├── components/
│   │   └── style/
│   └── vite.config.js
└── docker-compose.yml
```

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Resume_tracker_project

cd Backend
npm install

cd ../Frontend
npm install
```

### 2. Run in development

Backend terminal:

```bash
cd Backend
npm run dev
```

Frontend terminal:

```bash
cd Frontend
npm run dev
```

Open: `http://localhost:5173`

## Docker (Optional)

From repo root:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Available Scripts

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Notes

- Resume uploads support PDF, DOC, and DOCX.
- PDF generation uses Puppeteer, so system dependencies for Chromium may be required in some environments.

## License

This project is currently unlicensed for public reuse. Add a license file if you plan to open-source it.
