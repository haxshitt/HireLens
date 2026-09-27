import React, { useState, useEffect } from 'react'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'



const NAV_ITEMS = [
    { id: 'analysis', label: 'Match Analysis', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
    ) },
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className={`bg-card border border-border rounded-2xl overflow-hidden transition-all hover:border-white/10 ${open ? 'ring-1 ring-white/10' : ''}`}>
            <div className='flex items-center gap-4 p-5 cursor-pointer bg-transparent transition-colors hover:bg-white/5' onClick={() => setOpen(o => !o)}>
                <span className='text-accent font-bold text-sm bg-accent/10 px-2 py-1 rounded-md shrink-0'>Q{index + 1}</span>
                <p className='flex-1 font-semibold text-primary m-0 pr-4 leading-relaxed'>{item.question}</p>
                <span className={`text-secondary transition-transform duration-300 shrink-0 ${open ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className='overflow-hidden'>
                    <div className='p-5 pt-0 flex flex-col gap-5 border-t border-border mt-1'>
                        <div className='flex flex-col gap-2 mt-4'>
                            <span className='inline-flex self-start px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20'>Intention</span>
                            <p className='text-secondary text-sm leading-relaxed m-0 whitespace-pre-wrap'>{item.intention}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span className='inline-flex self-start px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20'>Model Answer</span>
                            <p className='text-secondary text-sm leading-relaxed m-0 whitespace-pre-wrap'>{item.answerGuidance || item.answer}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='relative flex flex-col gap-4 pl-14'>
        <div className='flex items-center gap-4'>
            <span className='absolute left-0 w-[3.25rem] h-[3.25rem] bg-card border-2 border-border rounded-full flex flex-col items-center justify-center text-xs font-bold text-primary z-10 shadow-[0_0_0_8px_#0d1117]'>
                <span className='text-[10px] text-muted -mb-1'>Day</span>
                {day.day}
            </span>
            <h3 className='text-lg font-bold text-primary m-0'>{day.focus}</h3>
        </div>
        <ul className='list-none p-0 m-0 flex flex-col gap-3 bg-card border border-border rounded-2xl p-5'>
            {day.tasks.map((task, i) => (
                <li key={i} className='flex items-start gap-3 text-secondary text-sm leading-relaxed'>
                    <span className='w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('analysis')
    const [ isSidebarOpen, setSidebarOpen ] = useState(false)
    const { report, getReportById, loading } = useInterview()
    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])



    if (loading || !report) {
        return (
            <main className='h-screen w-full flex items-center justify-center bg-page'>
                <h1 className='text-primary text-xl'>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreValue = typeof report.matchScore === 'number' ? report.matchScore : report.matchScore?.score || 0;
    const scoreColorClass =
        scoreValue >= 80 ? 'text-severity-low' :
            scoreValue >= 60 ? 'text-severity-medium' : 'text-severity-high';
    const scoreStrokeClass =
        scoreValue >= 80 ? 'stroke-severity-low' :
            scoreValue >= 60 ? 'stroke-severity-medium' : 'stroke-severity-high';

    const handleNavClick = (id) => {
        setActiveNav(id)
        setSidebarOpen(false)
    }

    // Circular progress math
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (scoreValue / 100) * circumference;

    return (
        <div className='h-screen w-full flex flex-col bg-page overflow-hidden pt-16'>
            
            {/* Mobile Header */}
            <header className="md:hidden flex items-center gap-3 p-4 border-b border-border bg-card shrink-0">
                <button className="p-2 bg-transparent border-none text-primary cursor-pointer" onClick={() => setSidebarOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <h1 className="text-lg font-bold text-primary m-0">Interview Report</h1>
            </header>

            {/* Backdrop for mobile sidebar */}
            {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

            <div className='flex flex-1 overflow-hidden h-full'>

                {/* ── Sidebar Nav ── */}
                <nav className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 md:relative md:translate-x-0 md:flex flex-col shrink-0 pt-16 md:pt-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <p className='text-xs font-bold text-muted uppercase tracking-wider m-0'>Sections</p>
                            <button className="md:hidden p-1 bg-transparent border-none text-secondary hover:text-primary cursor-pointer" onClick={() => setSidebarOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                            {NAV_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-none font-semibold text-sm cursor-pointer transition-all ${activeNav === item.id ? 'bg-accent/10 text-accent' : 'bg-transparent text-secondary hover:bg-white/5 hover:text-primary'}`}
                                    onClick={() => handleNavClick(item.id)}
                                >
                                    <span className='flex items-center justify-center'>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                <div className='hidden md:block w-px bg-border h-full shrink-0' />

                {/* ── Main Content Panel ── */}
                <main className='flex-1 flex flex-col bg-page min-w-0 h-full relative'>

                    {/* Shared Fixed Header */}
                    <div className='flex items-center justify-between p-6 md:p-8 border-b border-border bg-page/80 backdrop-blur-md z-10 sticky top-0 shrink-0'>
                        <h2 className="text-2xl font-bold text-primary m-0">
                            {activeNav === 'analysis' ? 'Match Analysis' :
                             activeNav === 'technical' ? 'Technical Questions' :
                             activeNav === 'behavioral' ? 'Behavioral Questions' :
                             'Preparation Road Map'}
                        </h2>
                        {activeNav === 'technical' && <span className='text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full'>{report.technicalQuestions?.length || 0} questions</span>}
                        {activeNav === 'behavioral' && <span className='text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full'>{report.behavioralQuestions?.length || 0} questions</span>}
                        {activeNav === 'roadmap' && <span className='text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full'>{report.preparationPlan?.length || 0}-day plan</span>}
                    </div>

                    {/* Scrollable Body */}
                    <div className='flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar h-full'>
                        {/* Match Analysis Tab (default) */}
                        {activeNav === 'analysis' && (
                            <section className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
                                {/* Match Score */}
                                <div className='flex justify-center'>
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                                            <circle cx="100" cy="100" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" className="text-white/5" />
                                            <circle cx="100" cy="100" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`${scoreStrokeClass} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                                        </svg>
                                        <div className='absolute inset-0 flex flex-col items-center justify-center text-center gap-1'>
                                            <div className={`flex items-baseline gap-1 ${scoreColorClass}`}>
                                                <span className='text-5xl font-bold'>{scoreValue}</span>
                                                <span className='text-2xl font-semibold'>%</span>
                                            </div>
                                            <span className='text-sm font-semibold text-muted uppercase tracking-wider'>Match Score</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div className='bg-card border border-border rounded-2xl p-6 text-secondary leading-relaxed'>
                                    <p>{report.matchScore?.reasoning || 'No detailed analysis available for this report.'}</p>
                                </div>

                                {/* Skill Gaps */}
                                {report.skillGaps && report.skillGaps.length > 0 && (
                                    <div className='flex flex-col gap-4'>
                                        <h3 className='text-lg font-bold text-primary m-0'>Skill Gaps</h3>
                                        <div className='flex flex-wrap gap-2'>
                                            {report.skillGaps.map((gap, i) => {
                                                const sevColor = gap.severity === 'high' ? 'text-severity-high border-severity-high/20 bg-severity-high/10' : gap.severity === 'medium' ? 'text-severity-medium border-severity-medium/20 bg-severity-medium/10' : 'text-severity-low border-severity-low/20 bg-severity-low/10';
                                                return (
                                                    <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${sevColor}`}>
                                                        {gap.skill}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Technical Questions Tab */}
                        {activeNav === 'technical' && (
                            <section>
                                <div className='flex flex-col gap-4 max-w-4xl mx-auto w-full'>
                                    {report.technicalQuestions?.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Behavioral Questions Tab */}
                        {activeNav === 'behavioral' && (
                            <section>
                                <div className='flex flex-col gap-4 max-w-4xl mx-auto w-full'>
                                    {report.behavioralQuestions?.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Road Map Tab */}
                        {activeNav === 'roadmap' && (
                            <section>
                                <div className='flex flex-col gap-6 max-w-4xl mx-auto w-full relative before:content-[""] before:absolute before:left-[1.625rem] before:top-4 before:bottom-4 before:w-px before:bg-border'>
                                    {report.preparationPlan?.map((day) => (
                                        <RoadMapDay key={day.day} day={day} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Interview