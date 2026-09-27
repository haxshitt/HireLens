import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { useInterview } from '../hooks/useInterview.js'
import { getUserResumes, downloadResume } from '../services/resume.api.js'

const History = () => {
    const { reports, loading: interviewLoading } = useInterview()
    const navigate = useNavigate()
    const [resumes, setResumes] = useState([])
    const [resumesLoading, setResumesLoading] = useState(true)

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const data = await getUserResumes()
                setResumes(data.resumes || [])
            } catch (err) {
                console.error("Failed to fetch resumes", err)
            } finally {
                setResumesLoading(false)
            }
        }
        fetchResumes()
    }, [])

    const handleDownload = async (e, resumeId) => {
        e.stopPropagation() // Prevent row click if we add one later
        try {
            await downloadResume(resumeId)
        } catch (err) {
            toast.error("Failed to download resume")
        }
    }

    const loading = interviewLoading || resumesLoading;

    return (
        <div className='min-h-screen w-full flex flex-col items-center pt-28 px-4 pb-12 overflow-x-hidden bg-page justify-start'>
            <section className='w-full max-w-[800px] mt-0'>
                <h2 className='text-primary mb-4 border-b border-border pb-2 text-2xl font-bold'>Interview Reports</h2>
                {interviewLoading ? (
                    <p className='text-center text-secondary'>Loading interview history...</p>
                ) : reports.length === 0 ? (
                    <p className='text-center text-secondary mb-8'>No past interview plans found.</p>
                ) : (
                    <ul className='list-none p-0 m-0 flex flex-col gap-4 mb-12'>
                        {reports.map(report => (
                            <li key={report._id} className='bg-card border border-border rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:border-white/10 group' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3 className='text-lg font-bold text-primary m-0'>{report.title || 'Untitled Position'}</h3>
                                <p className='text-muted text-sm mt-1 mb-3'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold ${(typeof report.matchScore === 'number' ? report.matchScore : report.matchScore?.score || 0) >= 80 ? 'text-severity-low border border-severity-low/20 bg-severity-low/10' : (typeof report.matchScore === 'number' ? report.matchScore : report.matchScore?.score || 0) >= 60 ? 'text-severity-medium border border-severity-medium/20 bg-severity-medium/10' : 'text-severity-high border border-severity-high/20 bg-severity-high/10'}`}>
                                    Match Score: {typeof report.matchScore === 'number' ? report.matchScore : report.matchScore?.score || 0}%
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                <h2 className='text-primary mb-4 border-b border-border pb-2 text-2xl font-bold'>Generated Resumes</h2>
                {resumesLoading ? (
                    <p className='text-center text-secondary'>Loading resumes...</p>
                ) : resumes.length === 0 ? (
                    <p className='text-center text-secondary'>No resumes generated yet.</p>
                ) : (
                    <ul className='list-none p-0 m-0 flex flex-col gap-4'>
                        {resumes.map(resume => (
                            <li key={resume._id} className='bg-card border border-border rounded-2xl p-5 flex justify-between items-center cursor-default'>
                                <div>
                                    <p className='text-primary font-medium text-base m-0'>Generated on {new Date(resume.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    onClick={(e) => handleDownload(e, resume._id)}
                                    className="bg-transparent border border-accent text-accent px-4 py-2 rounded-lg cursor-pointer font-semibold transition-all hover:bg-accent/10"
                                >
                                    Download PDF
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}

export default History
