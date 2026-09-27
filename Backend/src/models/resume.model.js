const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    formData: {
      type: Object, // Store the structured form data so the user can edit it later
      required: true,
    },
    pdfBuffer: {
      type: Buffer, // Storing the generated PDF as a buffer
      required: true,
    },
    htmlContent: {
      type: String, // Cached HTML content
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const resumeModel = mongoose.model("Resume", resumeSchema);

module.exports = resumeModel;
