const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const crypto = require("crypto")
const { getCache, setCache } = require("../utils/redis")
let puppeteerLib = null

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const RESUME_AI_MODEL = "gemini-3-flash-preview"

function generateCacheKey(prefix, data) {
    const hash = crypto.createHash("md5").update(JSON.stringify(data)).digest("hex")
    return `${prefix}:${hash}`
}

function extractResponseText(response) {
    if (!response) return ""
    if (typeof response.text === "string") return response.text
    if (typeof response.text === "function") {
        try {
            return response.text() || ""
        } catch (err) {
            return ""
        }
    }
    return response?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || ""
}

function safeParseJson(rawText = "") {
    const text = String(rawText || "").trim()
    if (!text) throw new Error("AI returned an empty response.")
    try {
        return JSON.parse(text)
    } catch (err) {
        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
        if (fenced?.[1]) return JSON.parse(fenced[1].trim())
        throw new Error("AI returned malformed JSON.")
    }
}

async function generateStructuredJson({ prompt, schema, cachePrefix = null, cacheData = null }) {
    // 1. Check Redis Cache first
    let cacheKey = null
    if (cachePrefix && cacheData) {
        cacheKey = generateCacheKey(cachePrefix, cacheData)
        const cached = await getCache(cacheKey)
        if (cached) {
            console.log(`[AI-Cache] HIT: ${cacheKey}`)
            return cached
        }
    }

    if (!process.env.GOOGLE_GENAI_API_KEY) throw new Error("GOOGLE_GENAI_API_KEY is missing.")
    
    console.log(`[AI-Cache] MISS: Calling Gemini for prompt...`)
    const response = await ai.getGenerativeModel({ model: RESUME_AI_MODEL }).generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(schema),
        }
    })
    
    const rawText = extractResponseText(response.response)
    const parsed = safeParseJson(rawText)
    const validated = schema.parse(parsed)

    // 2. Save to Redis for future hits
    if (cacheKey) {
        await setCache(cacheKey, validated, 43200) // Cache for 12 hours
    }

    return validated
}

const interviewReportSchema = z.object({
    matchScore: z.number(),
    technicalQuestions: z.array(z.object({ question: z.string(), intention: z.string(), answer: z.string() })),
    behavioralQuestions: z.array(z.object({ question: z.string(), intention: z.string(), answer: z.string() })),
    skillGaps: z.array(z.object({ skill: z.string(), severity: z.enum(["low", "medium", "high"]) })),
    topSkills: z.array(z.string()),
    preparationPlan: z.array(z.object({ day: z.number(), focus: z.string(), tasks: z.array(z.string()) })),
    title: z.string(),
})

const noteAnswerSchema = z.object({
    answerText: z.string(),
    answerHtml: z.string()
})

const premiumResumeSchema = z.object({
    header: z.object({
        fullName: z.string(),
        email: z.string(),
        phone: z.string(),
        location: z.string(),
        links: z.array(z.object({ label: z.string(), url: z.string() })).default([])
    }),
    education: z.array(z.object({
        institution: z.string(),
        degree: z.string(),
        duration: z.string(),
        location: z.string(),
        details: z.array(z.string()).optional()
    })),
    experience: z.array(z.object({
        company: z.string(),
        role: z.string(),
        duration: z.string(),
        location: z.string(),
        points: z.array(z.string())
    })).default([]),
    projects: z.array(z.object({
        title: z.string(),
        techStack: z.string().optional(),
        duration: z.string(),
        link: z.string().optional(),
        points: z.array(z.string())
    })).default([]),
    technicalSkills: z.array(z.object({
        category: z.string(),
        skills: z.string()
    })),
    achievements: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([])
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a high-quality, comprehensive interview analysis report.
Job Context: ${jobDescription}
Candidate Details: ${resume} ${selfDescription}

Requirements:
1. Calculate a realistic matchScore (0-100).
2. Generate EXACTLY 4 technical questions tailored to the role.
3. Generate EXACTLY 4 behavioral questions.
4. Provide a PROPER 7-day preparation plan.
5. Identify skill gaps and top skills accurately.`

    return generateStructuredJson({ 
        prompt, 
        schema: interviewReportSchema, 
        cachePrefix: "report", 
        cacheData: { resume, selfDescription, jobDescription } 
    })
}

function escapeHtml(text = "") {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function buildPremiumResumeHtml(data) {
    const { header, education, experience, projects, technicalSkills, achievements, interests } = data;
    const linksHtml = (header.links || []).map(link => `<a href="${link.url}">${link.label}</a>`).join(" | ");

    const section = (title, content) => content ? `<section><h1>${title}</h1>${content}</section>` : "";

    const educationHtml = education.map(edu => `
        <div class="item">
            <div class="row"><span class="main-text">${escapeHtml(edu.institution)}</span><span class="side-text">${escapeHtml(edu.duration)}</span></div>
            <div class="row"><span class="sub-text">${escapeHtml(edu.degree)}</span><span class="side-text italic">${escapeHtml(edu.location)}</span></div>
            ${edu.details && edu.details.length > 0 ? `<ul>${edu.details.map(d => `<li>${escapeHtml(d)}</li>`).join("")}</ul>` : ""}
        </div>`).join("");

    const experienceHtml = experience.map(exp => `
        <div class="item">
            <div class="row"><span class="main-text">${escapeHtml(exp.company)}</span><span class="side-text">${escapeHtml(exp.duration)}</span></div>
            <div class="row"><span class="sub-text">${escapeHtml(exp.role)}</span><span class="side-text italic">${escapeHtml(exp.location)}</span></div>
            <ul>${exp.points.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
        </div>`).join("");

    const projectsHtml = projects.map(proj => `
        <div class="item">
            <div class="row">
                <span class="main-text">${escapeHtml(proj.title)} ${proj.techStack ? `<span class="italic normal">| ${escapeHtml(proj.techStack)}</span>` : ""}</span>
                <span class="side-text">${escapeHtml(proj.duration)} ${proj.link ? `| <a href="${proj.link}">Link</a>` : ""}</span>
            </div>
            <ul>${proj.points.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
        </div>`).join("");

    const skillsHtml = '<div class="skills-grid">' + technicalSkills.map(g => `<div><strong>${escapeHtml(g.category)}:</strong> ${escapeHtml(g.skills)}</div>`).join("") + '</div>';

    return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>@page { size: A4; margin: 10mm; } body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.25; color: #111; margin: 0; padding: 0; } header { text-align: center; margin-bottom: 8pt; } header h1 { font-size: 24pt; margin: 0; font-weight: normal; } header p { margin: 2pt 0; font-size: 10pt; } header a { color: #111; text-decoration: underline; margin: 0 4pt; } section { margin-top: 10pt; } section h1 { font-size: 11pt; font-weight: bold; border-bottom: 1px solid #111; margin: 0 0 5pt; padding-bottom: 1pt; text-transform: uppercase; } .item { margin-bottom: 6pt; } .row { display: flex; justify-content: space-between; align-items: baseline; } .main-text { font-weight: bold; } .sub-text { font-style: italic; } ul { margin: 2pt 0 0 15pt; padding: 0; list-style-type: disc; } li { margin-bottom: 1pt; text-align: justify; }</style></head><body><header><h1>" + escapeHtml(header.fullName) + "</h1><p>" + escapeHtml(header.location) + " | " + escapeHtml(header.phone) + " | " + escapeHtml(header.email) + "</p><div class='links'>" + linksHtml + "</div></header>" + section("EDUCATION", educationHtml) + section("EXPERIENCE", experienceHtml) + section("PROJECTS", projectsHtml) + section("TECHNICAL SKILLS", skillsHtml) + (achievements.length ? section("ACHIEVEMENTS", "<ul>" + achievements.map(a => "<li>" + escapeHtml(a) + "</li>").join("") + "</ul>") : "") + (interests.length ? section("INTERESTS", "<ul><li>" + escapeHtml(interests.join(", ")) + "</li></ul>") : "") + "</body></html>";
}

async function generatePdfFromHtml(htmlContent) {
    if (!puppeteerLib) puppeteerLib = require("puppeteer")
    let browser
    try {
        browser = await puppeteerLib.launch({
            executablePath: process.env.NODE_ENV === "production" ? "/usr/bin/chromium" : undefined,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--single-process"],
            headless: "new"
        })
        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })
        return await page.pdf({ format: "A4", margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }, printBackground: true })
    } finally {
        if (browser) await browser.close()
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const source = String(resume || selfDescription || "").trim()
    if (!source) throw new Error("Resume content missing.")

    const prompt = "Convert this candidate profile into a high-quality professional resume JSON. \nJob context: " + (jobDescription || "N/A") + "\nProfile: " + source + "\n\nRules:\n1. Extract Details and all links.\n2. Standard Academic Order.\n3. STAR Method points.\n4. No inventions.";

    const data = await generateStructuredJson({ 
        prompt, 
        schema: premiumResumeSchema,
        cachePrefix: "resume-json",
        cacheData: { resume, selfDescription, jobDescription } 
    })
    return generatePdfFromHtml(buildPremiumResumeHtml(data))
}

async function generateNoteAnswer({ domain, subdomain, question, sourceTag = "" }) {
    const prompt = "Generate interview answer for: " + question + "\nDomain: " + domain;
    return generateStructuredJson({ 
        prompt, 
        schema: noteAnswerSchema,
        cachePrefix: "note",
        cacheData: { domain, subdomain, question }
    })
}

module.exports = { generateInterviewReport, generateResumePdf, generatePdfFromHtml, generateNoteAnswer }
