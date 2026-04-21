const { z } = require("zod");

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })),
  behavioralQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })),
  skillGaps: z.array(z.object({
    skill: z.string(),
    severity: z.enum(["low", "medium", "high"])
  })),
  topSkills: z.array(z.string()),
  preparationPlan: z.array(z.object({
    day: z.number(),
    focus: z.string(),
    tasks: z.array(z.string())
  })),
  title: z.string()
});

const premiumResumeSchema = z.object({
  header: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    links: z.array(z.object({ label: z.string(), url: z.string() }))
  }),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    duration: z.string(),
    location: z.string(),
    details: z.array(z.string())
  })),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    location: z.string(),
    points: z.array(z.string())
  })),
  projects: z.array(z.object({
    title: z.string(),
    techStack: z.string().optional(),
    duration: z.string(),
    link: z.string().optional(),
    points: z.array(z.string())
  })),
  technicalSkills: z.array(z.object({
    category: z.string(),
    skills: z.string()
  })),
  achievements: z.array(z.string()),
  interests: z.array(z.string())
});

const noteAnswerSchema = z.object({
  answerText: z.string(),
  answerHtml: z.string()
});

module.exports = {
  interviewReportSchema,
  premiumResumeSchema,
  noteAnswerSchema
};
