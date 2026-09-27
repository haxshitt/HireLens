const resumeModel = require('../models/resume.model');
const { generatePdfFromHtml, polishResumeContent, condenseResumeContent } = require('../services/ai.service');
const { buildResumeHtml } = require('../utils/resumeTemplate');

/**
 * @description Controller to generate a new resume PDF from structured form data.
 */
async function generateResumeController(req, res) {
    try {
        const rawFormData = req.body;

        // Basic validation
        if (!rawFormData.personalInfo?.fullName || !rawFormData.personalInfo?.phone) {
            return res.status(400).json({ message: "Full Name and Phone Number are required." });
        }
        if (!rawFormData.education || rawFormData.education.length === 0) {
            return res.status(400).json({ message: "At least one education entry is required." });
        }
        console.log(`[Resume Generation] Polishing content for user ${req.user.id}...`);
        let polishedData = await polishResumeContent(rawFormData);

        let finalPdfBuffer = null;
        let finalHtmlContent = null;
        let attempt = 1;
        let currentData = polishedData;
        let currentScale = 1.0;

        while (attempt <= 3) {
            console.log(`[Resume Generation] Attempt ${attempt} with scale ${currentScale}...`);
            const htmlContent = buildResumeHtml(currentData, currentScale);
            const { pdfBuffer: pdfBytes, isOverflowing } = await generatePdfFromHtml(htmlContent);
            const pdfBuffer = Buffer.isBuffer(pdfBytes) ? pdfBytes : Buffer.from(pdfBytes);

            if (!isOverflowing || attempt === 3) {
                finalPdfBuffer = pdfBuffer;
                finalHtmlContent = htmlContent;
                if (isOverflowing) {
                    console.log(`[Resume Generation] Best-effort reached. Accepting 2-page PDF.`);
                }
                break;
            }

            attempt++;
            if (attempt === 2) {
                currentScale = 0.9;
            } else if (attempt === 3) {
                // Scaling didn't work, try condensing
                console.log(`[Resume Generation] Overflow persists. Condensing content...`);
                currentData = await condenseResumeContent(polishedData);
                currentScale = 0.9;
            }
        }

        const title = `Resume - ${new Date().toLocaleDateString()}`;
        const resume = await resumeModel.create({
            user: req.user.id,
            title,
            formData: currentData,
            htmlContent: finalHtmlContent,
            pdfBuffer: finalPdfBuffer
        });



        res.status(201).json({
            message: "Resume generated successfully",
            resume: {
                _id: resume._id,
                title: resume.title,
                createdAt: resume.createdAt
            }
        });
    } catch (error) {
        console.error("Error generating resume:", error);
        res.status(503).json({
            success: false,
            message: "Google's AI server is currently facing an issue. Please try again in a few minutes."
        });
    }
}

/**
 * @description Controller to get all generated resumes for the logged in user.
 */
async function getUserResumesController(req, res) {
    try {
        const resumes = await resumeModel.find({ user: req.user.id })
            .select('-formData -htmlContent -pdfBuffer')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Resumes fetched successfully",
            resumes
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resumes",
            error: error.message
        });
    }
}

/**
 * @description Controller to download a specific resume PDF.
 */
async function downloadResumeController(req, res) {
    try {
        const { resumeId } = req.params;

        const resume = await resumeModel.findOne({ _id: resumeId, user: req.user.id });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${resumeId}.pdf`
        });

        res.send(resume.pdfBuffer);
    } catch (error) {
        res.status(500).json({
            message: "Failed to download resume",
            error: error.message
        });
    }
}

module.exports = {
    generateResumeController,
    getUserResumesController,
    downloadResumeController
};
