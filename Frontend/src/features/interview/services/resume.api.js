import api from "../../../lib/api";

/**
 * @description Service to generate resume PDF based on form data
 */
export const generateResume = async (formData) => {
    const response = await api.post("/api/resume/generate", formData)
    return response.data
}

/**
 * @description Service to get all generated resumes of logged in user
 */
export const getUserResumes = async () => {
    const response = await api.get("/api/resume/")
    return response.data
}

/**
 * @description Service to download a specific generated resume
 */
export const downloadResume = async (resumeId) => {
    const response = await api.get(`/api/resume/download/${resumeId}`, {
        responseType: "blob"
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `resume_${resumeId}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}
