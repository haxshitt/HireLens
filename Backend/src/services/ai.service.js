const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Simplified Schema (no difficulty)
const interviewReportSchema = z.object({
  title: z.string(),

  matchScore: z.object({
    score: z.number().min(0).max(100),
    reasoning: z
      .string()
      .describe("Strict justification of score based on JD vs resume"),
  }),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      topic: z.string(),
      intention: z.string(),
      answerGuidance: z.string(),
    }),
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answerGuidance: z.string(),
    }),
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      reason: z.string(),
    }),
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert technical interviewer and hiring manager.

Analyze the following:

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Generate a STRICT and REALISTIC interview report.

RULES:

1. MATCH SCORE:
- Score must be STRICT (0–100)
- Based ONLY on overlap between candidate profile and job description
- Penalize missing required skills heavily
- Provide clear reasoning

2. TECHNICAL QUESTIONS:
- Must be real interview-level questions
- Based on job description tech stack
- Include scenario-based and problem-solving questions
- Mention topic (DSA, backend, system design, etc.)

3. BEHAVIORAL QUESTIONS:
- Real-world hiring questions
- Focus on teamwork, ownership, conflict, deadlines

4. ANSWERS:
- Provide structured guidance, not full answers

5. SKILL GAPS:
- Strict comparison with JD
- Mention reason why it is a gap

6. Keep output realistic and aligned with real interviews
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  return JSON.parse(response.text);
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 680, height: 971 });

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const contentHeight = await page.evaluate(() => {
    return document.documentElement.scrollHeight;
  });

  // A4 height is 297mm. Usable is 297 - 40mm margins = 257mm.
  // 257mm at 96dpi is roughly 971px.
  const isOverflowing = contentHeight > 971;

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
  return { pdfBuffer, isOverflowing };
}

const formDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      }),
    )
    .optional(),
  summary: z.string().optional(),
  skills: z
    .array(
      z.object({
        category: z.string(),
        items: z.array(z.string()),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        duration: z.string(),
        score: z.string().optional(),
      }),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        title: z.string(),
        techStack: z.string(),
        bullets: z.array(z.string()),
      }),
    )
    .optional(),
  certificates: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  achievements: z.array(z.string()).optional(),
  responsibilities: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
});

async function polishResumeContent(formData) {
  const prompt = `You are an expert resume writer. Polish the following resume data. 
Fix spelling and grammar errors. Rewrite bullet points into polished, professional, resume-appropriate language (action verbs, concise phrasing, quantified impact where possible). Normalize list formatting. Ensure consistent past-tense for completed projects/achievements.
STRICT RULE: DO NOT fabricate facts, numbers, or claims not present in the user's original input. Only rephrase and format what was provided.

Raw Data:
${JSON.stringify(formData, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(formDataSchema),
    },
  });
  return JSON.parse(response.text);
}

async function condenseResumeContent(formData) {
  const prompt = `You are an expert resume writer. The following resume data is too long to fit on one page. 
Condense it heavily. Make bullet points as brief as possible while retaining core facts. Combine ideas where logical. Trim redundant words. 
STRICT RULES: 
1. DO NOT delete facts, skills, numbers, or details the user actually provided. Condensing means tighter language, not information loss. 
2. DO NOT fabricate facts.

Data to condense:
${JSON.stringify(formData, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(formDataSchema),
    },
  });
  return JSON.parse(response.text);
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z.string(),
  });

  const prompt = `Generate a professional ATS-friendly resume tailored strictly to the job description.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

RULES:
- Must look human-written
- Highlight relevant skills only
- STRICTLY fit in 1 page
- Use clean HTML structure
- Avoid unnecessary content
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);
  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return { pdfBuffer, htmlContent: jsonContent.html };
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
  generatePdfFromHtml,
  polishResumeContent,
  condenseResumeContent,
};
