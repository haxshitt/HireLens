const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
  generatePdfFromHtml,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
  try {
    let resumeContentText = "";
    if (req.file) {
      const resumeContent = await new pdfParse.PDFParse(
        Uint8Array.from(req.file.buffer),
      ).getText();
      resumeContentText = resumeContent.text;
    }
    const { selfDescription, jobDescription } = req.body;

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeContentText,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContentText,
      selfDescription,
      jobDescription,
      ...interViewReportByAi,
    });

    res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (error) {
    console.error("Error generating interview report:", error);
    res.status(503).json({
      success: false,
      message:
        "Google's AI server is currently facing an issue. Please try again in a few minutes.",
    });
  }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport =
      await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found.",
      });
    }

    let pdfBuffer;

    if (interviewReport.generatedResumeHtml) {
      // Use cached HTML to generate PDF
      pdfBuffer = await generatePdfFromHtml(
        interviewReport.generatedResumeHtml,
      );
    } else {
      const { resume, jobDescription, selfDescription } = interviewReport;
      const result = await generateResumePdf({
        resume,
        jobDescription,
        selfDescription,
      });
      pdfBuffer = result.pdfBuffer;

      // Cache the generated HTML so we don't call AI again
      interviewReport.generatedResumeHtml = result.htmlContent;
      await interviewReport.save();
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating resume PDF:", error);
    res.status(503).json({
      success: false,
      message:
        "Google's AI server is currently facing an issue. Please try again in a few minutes.",
    });
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
