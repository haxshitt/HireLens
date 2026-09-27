import React, { useState, useRef } from 'react'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ weakPoints, setWeakPoints ] = useState("")
    const [ generating, setGenerating ] = useState(false)
    const [ selectedFile, setSelectedFile ] = useState(null)
    const [ isDragOver, setIsDragOver ] = useState(false)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("File size must be under 5MB")
                return
            }
            setSelectedFile(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) {
            const ext = file.name.split('.').pop().toLowerCase()
            if (!['pdf', 'docx'].includes(ext)) {
                showToast("Please upload a PDF or DOCX file")
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast("File size must be under 5MB")
                return
            }
            setSelectedFile(file)
            // Sync with the hidden input
            const dt = new DataTransfer()
            dt.items.add(file)
            if (resumeInputRef.current) {
                resumeInputRef.current.files = dt.files
            }
        }
    }

    const removeFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
    }

    const showToast = (msg) => {
        toast.error(msg)
    }

    const handleCreateResumeClick = () => {
        navigate('/create-resume');
    }

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[ 0 ]
        
        if (!jobDescription || jobDescription.trim() === '') {
            showToast("Please provide a Target Job Description.");
            return;
        }

        if (!resumeFile && !selectedFile) {
            showToast("Please upload your Resume.");
            return;
        }

        setGenerating(true)
        try {
            const data = await generateReport({ 
                jobDescription, 
                selfDescription: weakPoints, 
                resumeFile: resumeFile || selectedFile 
            })
            if (data?._id) {
                navigate(`/interview/${data._id}`)
            }
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className='min-h-screen w-full flex flex-col items-center pt-28 px-4 pb-12 overflow-x-hidden relative bg-page'>
            
            {/* Page Header */}
            <header className='text-center max-w-[600px] mb-10 animate-dropIn'>
                <h1 className='text-3xl md:text-[2.5rem] font-bold text-primary mb-3 leading-tight'>Create Your Custom <span className='text-accent'>Interview Plan</span></h1>
                <p className='text-secondary text-lg m-0'>Prep smarter, not harder for your next interview</p>
            </header>

            {/* Main Card */}
            <div className='bg-card border border-border rounded-[2rem] w-full max-w-[900px] shadow-[0_24px_48px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col'>
                <div className='flex flex-col md:flex-row relative'>

                    {/* Left Panel - Job Description */}
                    <div className='flex-1 flex flex-col p-8 md:p-10 gap-6'>
                        <div className='flex items-center gap-3 mb-2'>
                            <span className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent shrink-0'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2 className='text-xl font-bold text-primary m-0'>Target Job Description</h2>
                            <span className='bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded text-[0.7rem] font-bold uppercase tracking-wider ml-auto'>Required</span>
                        </div>
                        <textarea
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='w-full bg-input border border-border rounded-xl p-4 text-primary text-base resize-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all flex-1 min-h-[250px]'
                            placeholder={`Paste the full job description here...\nEg. Full stack Engineer with hands on experience with react,node and databases.`}
                            maxLength={5000}
                        />
                        <div className='text-right text-muted text-sm mt-1 font-mono'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider hidden md:block w-px self-stretch' />
                    {/* Horizontal Divider for mobile */}
                    <div className='panel-divider-mobile md:hidden h-px self-stretch' />

                    {/* Right Panel - Profile */}
                    <div className='flex-1 flex flex-col p-8 md:p-10 gap-6'>
                        <div className='flex items-center gap-3 mb-2'>
                            <span className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent shrink-0'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2 className='text-xl font-bold text-primary m-0'>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='flex flex-col gap-3'>
                            <label className='flex items-center gap-2 text-primary font-semibold text-[0.95rem]'>
                                Upload Resume
                                <span className='bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded text-[0.7rem] font-bold uppercase tracking-wider ml-auto'>Required</span>
                            </label>
                            <label 
                                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all hover:bg-white/5 hover:border-accent/50 ${selectedFile ? 'border-solid border-accent/50 bg-accent/5' : isDragOver ? 'border-accent bg-accent/10 scale-[1.02]' : 'border-border bg-input'}`} 
                                htmlFor='resume'
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <span className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${selectedFile ? 'bg-accent/20 text-accent' : 'bg-white/5 text-muted'}`}>
                                    {selectedFile ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    )}
                                </span>
                                <div>
                                    <p className='text-primary font-semibold m-0 mb-1'>
                                        {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
                                    </p>
                                    {!selectedFile && <p className='text-muted text-sm m-0'>PDF or DOCX (Max 5MB)</p>}
                                    {selectedFile && (
                                        <p className='text-muted text-sm m-0'>
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    )}
                                </div>
                                {selectedFile && (
                                    <button className='absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-secondary border-none cursor-pointer hover:bg-[#e1034d] hover:text-white transition-colors' onClick={removeFile}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                )}
                                <input 
                                    ref={resumeInputRef} 
                                    hidden 
                                    type='file' 
                                    id='resume' 
                                    name='resume' 
                                    accept='.pdf,.docx' 
                                    onChange={handleFileChange}
                                />
                            </label>

                            {/* Create Resume link (shown only when no file selected) */}
                            {!selectedFile && (
                                <button type="button" onClick={handleCreateResumeClick} className='text-accent bg-transparent border-none p-0 font-medium text-sm text-left cursor-pointer hover:underline'>
                                    Don't have a resume? Create one →
                                </button>
                            )}
                        </div>

                        {/* Weak Points */}
                        <div className='flex flex-col gap-3'>
                            <label className='flex items-center gap-2 text-primary font-semibold text-[0.95rem]' htmlFor='weakPoints'>
                                Your Weak Points
                                <span className='bg-white/10 text-muted px-2 py-0.5 rounded text-[0.7rem] font-bold uppercase tracking-wider ml-auto'>Optional</span>
                            </label>
                            <textarea
                                onChange={(e) => { setWeakPoints(e.target.value) }}
                                id='weakPoints'
                                name='weakPoints'
                                className='w-full bg-input border border-border rounded-xl p-4 text-primary text-base resize-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all min-h-[100px]'
                                placeholder="Eg. Struggles with Solving complex DSA problems"
                            />
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='p-6 md:px-10 md:py-8 bg-panel border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <span className="text-muted text-sm flex items-center gap-2 before:content-['i'] before:inline-flex before:items-center before:justify-center before:w-5 before:h-5 before:rounded-full before:bg-white/10 before:text-xs before:font-bold">This may take time, Please have some patience</span>
                    <button
                        onClick={handleGenerateReport}
                        disabled={generating}
                        className={`relative flex items-center justify-center min-h-[3rem] px-8 py-3 rounded-xl bg-accent text-white font-bold text-base border-none cursor-pointer transition-all hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(255,45,120,0.3)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 sm:w-auto w-full ${generating ? 'text-transparent pointer-events-none after:content-[""] after:absolute after:w-5 after:h-5 after:border-[3px] after:border-white/30 after:border-t-white after:rounded-full after:animate-spin' : ''}`}>
                        {generating ? '' : 'Generate My Resume Strategy'}
                    </button>
                </div>
            </div>
            
            {/* Toast rendering can go here if needed, or via context */}
        </div>
    )
}

export default Home