import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/hooks/useAuth';
import { generateResume } from '../services/resume.api';

const CreateResume = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        personalInfo: { fullName: user?.username || '', phone: '', email: user?.email || '' },
        links: [],
        summary: '',
        skills: [],
        education: [],
        projects: [],
        certificates: [],
        achievements: [],
        responsibilities: []
    });


    // --- Dynamic Field Handlers ---
    const handlePersonalInfoChange = (e) => {
        setFormData({
            ...formData,
            personalInfo: { ...formData.personalInfo, [e.target.name]: e.target.value }
        });
    };

    const handleDynamicAdd = (field, emptyItem) => {
        setFormData({ ...formData, [field]: [...formData[field], emptyItem] });
    };

    const handleDynamicRemove = (field, index) => {
        const newArray = [...formData[field]];
        newArray.splice(index, 1);
        setFormData({ ...formData, [field]: newArray });
    };

    const handleDynamicChange = (field, index, key, value) => {
        const newArray = [...formData[field]];
        newArray[index][key] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const handleNestedDynamicAdd = (field, index, nestedField, emptyItem) => {
        const newArray = [...formData[field]];
        newArray[index][nestedField] = [...newArray[index][nestedField], emptyItem];
        setFormData({ ...formData, [field]: newArray });
    };

    const handleNestedDynamicChange = (field, index, nestedField, nestedIndex, value) => {
        const newArray = [...formData[field]];
        newArray[index][nestedField][nestedIndex] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const handleNestedDynamicRemove = (field, index, nestedField, nestedIndex) => {
        const newArray = [...formData[field]];
        newArray[index][nestedField].splice(nestedIndex, 1);
        setFormData({ ...formData, [field]: newArray });
    };

    // --- Form Submission ---
    const handleSubmit = async () => {
        // Validation
        if (!formData.personalInfo.fullName || !formData.personalInfo.phone) {
            toast.error('Full Name and Phone are required.');
            return;
        }
        if (formData.education.length === 0) {
            toast.error('At least one Education entry is required.');
            return;
        }

        setLoading(true);
        try {
            // Process skills from string to array before submission
            const payload = {
                ...formData,
                skills: formData.skills.map(group => ({
                    ...group,
                    items: typeof group.items === 'string' 
                        ? group.items.split(',').map(s => s.trim()).filter(Boolean) 
                        : group.items
                }))
            };

            await generateResume(payload);
            toast.success('Resume successfully generated and saved to your history!');
            navigate('/history');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate resume');
        } finally {
            setLoading(false);
        }
    };

    // Shared Tailwind classes
    const sectionTitleClass = "text-xl font-bold text-primary mb-4 border-b border-border pb-2";
    const formGroupClass = "flex flex-col gap-2 mb-4";
    const labelClass = "text-sm font-semibold text-secondary";
    const inputClass = "w-full bg-input border border-border rounded-xl p-3 text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all";
    const dynamicListClass = "flex flex-col gap-4 mb-4";
    const dynamicItemClass = "relative p-5 rounded-xl border border-border bg-[#161d28]";
    const removeBtnClass = "absolute top-3 right-3 text-red-500 hover:text-red-400 bg-transparent border-none text-2xl font-bold cursor-pointer leading-none";
    const addBtnClass = "w-full py-3 rounded-xl border-2 border-dashed border-border bg-transparent text-accent font-semibold hover:border-accent hover:bg-accent/5 transition-all cursor-pointer";

    // --- Render Steps ---
    const renderStep1 = () => (
        <div className="flex flex-col gap-5">
            <h3 className={sectionTitleClass}>Personal Information</h3>
            <div className={formGroupClass}>
                <label className={labelClass}>Full Name *</label>
                <input className={inputClass} name="fullName" value={formData.personalInfo.fullName} onChange={handlePersonalInfoChange} placeholder="e.g., Anurag Kumar" required />
            </div>
            <div className={formGroupClass}>
                <label className={labelClass}>Phone Number *</label>
                <input className={inputClass} name="phone" value={formData.personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="e.g., +91 1234567890" required />
            </div>
            <div className={formGroupClass}>
                <label className={labelClass}>Email Address *</label>
                <input className={inputClass} name="email" value={formData.personalInfo.email} onChange={handlePersonalInfoChange} placeholder="e.g., example@gmail.com" required />
            </div>

            <h3 className={`${sectionTitleClass} mt-8`}>Links (LinkedIn, GitHub, Portfolio)</h3>
            <div className={dynamicListClass}>
                {formData.links.map((link, idx) => (
                    <div key={idx} className={dynamicItemClass}>
                        <button className={removeBtnClass} onClick={() => handleDynamicRemove('links', idx)}>×</button>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Label</label>
                            <input className={inputClass} value={link.label} onChange={(e) => handleDynamicChange('links', idx, 'label', e.target.value)} placeholder="e.g., LinkedIn" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>URL</label>
                            <input className={inputClass} value={link.url} onChange={(e) => handleDynamicChange('links', idx, 'url', e.target.value)} placeholder="e.g., https://linkedin.com/in/username" />
                        </div>
                    </div>
                ))}
            </div>
            <button className={addBtnClass} onClick={() => handleDynamicAdd('links', { label: '', url: '' })}>+ Add Link</button>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex flex-col gap-5">
            <h3 className={sectionTitleClass}>Professional Summary</h3>
            <div className={formGroupClass}>
                <label className={labelClass}>Summary (Optional)</label>
                <textarea className={`${inputClass} min-h-[100px] resize-y`} value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Brief summary of your professional background..." />
            </div>

            <h3 className={`${sectionTitleClass} mt-8`}>Technical Skills</h3>
            <div className={dynamicListClass}>
                {formData.skills.map((skillGroup, idx) => (
                    <div key={idx} className={dynamicItemClass}>
                        <button className={removeBtnClass} onClick={() => handleDynamicRemove('skills', idx)}>×</button>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Category</label>
                            <input className={inputClass} value={skillGroup.category} onChange={(e) => handleDynamicChange('skills', idx, 'category', e.target.value)} placeholder="e.g., Languages, Frameworks, Tools" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Skills (Comma separated)</label>
                            <input className={inputClass} value={skillGroup.items} onChange={(e) => handleDynamicChange('skills', idx, 'items', e.target.value)} placeholder="e.g., React, Node.js, MongoDB" />
                        </div>
                    </div>
                ))}
            </div>
            <button className={addBtnClass} onClick={() => handleDynamicAdd('skills', { category: '', items: '' })}>+ Add Skill Group</button>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col gap-5">
            <h3 className={sectionTitleClass}>Education *</h3>
            <div className={dynamicListClass}>
                {formData.education.map((edu, idx) => (
                    <div key={idx} className={dynamicItemClass}>
                        <button className={removeBtnClass} onClick={() => handleDynamicRemove('education', idx)}>×</button>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Institution Name</label>
                            <input className={inputClass} value={edu.institution} onChange={(e) => handleDynamicChange('education', idx, 'institution', e.target.value)} placeholder="e.g., University of Technology" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Degree / Qualification</label>
                            <input className={inputClass} value={edu.degree} onChange={(e) => handleDynamicChange('education', idx, 'degree', e.target.value)} placeholder="e.g., B.Tech in Computer Science" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Duration</label>
                            <input className={inputClass} value={edu.duration} onChange={(e) => handleDynamicChange('education', idx, 'duration', e.target.value)} placeholder="e.g., Aug 2020 - May 2024" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Score (CGPA / Percentage)</label>
                            <input className={inputClass} value={edu.score} onChange={(e) => handleDynamicChange('education', idx, 'score', e.target.value)} placeholder="e.g., 8.5 CGPA" />
                        </div>
                    </div>
                ))}
            </div>
            <button className={addBtnClass} onClick={() => handleDynamicAdd('education', { institution: '', degree: '', duration: '', score: '' })}>+ Add Education</button>

            <h3 className={`${sectionTitleClass} mt-8`}>Projects</h3>
            <div className={dynamicListClass}>
                {formData.projects.map((proj, idx) => (
                    <div key={idx} className={dynamicItemClass}>
                        <button className={removeBtnClass} onClick={() => handleDynamicRemove('projects', idx)}>×</button>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Project Title</label>
                            <input className={inputClass} value={proj.title} onChange={(e) => handleDynamicChange('projects', idx, 'title', e.target.value)} placeholder="e.g., E-commerce Platform" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Tech Stack</label>
                            <input className={inputClass} value={proj.techStack} onChange={(e) => handleDynamicChange('projects', idx, 'techStack', e.target.value)} placeholder="e.g., MERN Stack, Redux" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Description Bullets</label>
                            {proj.bullets.map((bullet, bIdx) => (
                                <div key={bIdx} className="flex gap-2 mb-2 items-center">
                                    <input className={`${inputClass} flex-1`} value={bullet} onChange={(e) => handleNestedDynamicChange('projects', idx, 'bullets', bIdx, e.target.value)} />
                                    <button className="text-red-500 hover:text-red-400 bg-transparent border-none text-2xl font-bold cursor-pointer leading-none shrink-0" onClick={() => handleNestedDynamicRemove('projects', idx, 'bullets', bIdx)}>×</button>
                                </div>
                            ))}
                            <button className="w-full py-2 mt-2 rounded-xl border border-dashed border-border bg-transparent text-accent font-semibold hover:border-accent hover:bg-accent/5 transition-all cursor-pointer text-sm" onClick={() => handleNestedDynamicAdd('projects', idx, 'bullets', '')}>+ Add Bullet</button>
                        </div>
                    </div>
                ))}
            </div>
            <button className={addBtnClass} onClick={() => handleDynamicAdd('projects', { title: '', techStack: '', bullets: [''] })}>+ Add Project</button>
        </div>
    );

    const renderStep4 = () => (
        <div className="flex flex-col gap-5">
            <h3 className={sectionTitleClass}>Certificates</h3>
            <div className={dynamicListClass}>
                {formData.certificates.map((cert, idx) => (
                    <div key={idx} className={dynamicItemClass}>
                        <button className={removeBtnClass} onClick={() => handleDynamicRemove('certificates', idx)}>×</button>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Title</label>
                            <input className={inputClass} value={cert.title} onChange={(e) => handleDynamicChange('certificates', idx, 'title', e.target.value)} placeholder="e.g., AWS Certified Developer" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Description</label>
                            <input className={inputClass} value={cert.description} onChange={(e) => handleDynamicChange('certificates', idx, 'description', e.target.value)} placeholder="e.g., Issued by Amazon Web Services" />
                        </div>
                    </div>
                ))}
            </div>
            <button className={addBtnClass} onClick={() => handleDynamicAdd('certificates', { title: '', description: '' })}>+ Add Certificate</button>

            <h3 className={`${sectionTitleClass} mt-8`}>Achievements</h3>
            <div className={dynamicListClass}>
                {formData.achievements.map((ach, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input className={`${inputClass} flex-1`} value={ach} onChange={(e) => {
                            const newArr = [...formData.achievements];
                            newArr[idx] = e.target.value;
                            setFormData({ ...formData, achievements: newArr });
                        }} placeholder="e.g., Won 1st prize in Hackathon" />
                        <button className="text-red-500 hover:text-red-400 bg-transparent border-none text-2xl font-bold cursor-pointer leading-none shrink-0" onClick={() => handleDynamicRemove('achievements', idx)}>×</button>
                    </div>
                ))}
            </div>
            <button className={addBtnClass} onClick={() => setFormData({ ...formData, achievements: [...formData.achievements, ''] })}>+ Add Achievement</button>

            <h3 className={`${sectionTitleClass} mt-8`}>Positions of Responsibility</h3>
            <div className={dynamicListClass}>
                {formData.responsibilities.map((resp, idx) => (
                    <div key={idx} className={dynamicItemClass}>
                        <button className={removeBtnClass} onClick={() => handleDynamicRemove('responsibilities', idx)}>×</button>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Title</label>
                            <input className={inputClass} value={resp.title} onChange={(e) => handleDynamicChange('responsibilities', idx, 'title', e.target.value)} placeholder="e.g., Technical Head" />
                        </div>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Description</label>
                            <input className={inputClass} value={resp.description} onChange={(e) => handleDynamicChange('responsibilities', idx, 'description', e.target.value)} placeholder="e.g., Managed a team of 50 students..." />
                        </div>
                    </div>
                ))}
            </div>
            <button className={addBtnClass} onClick={() => handleDynamicAdd('responsibilities', { title: '', description: '' })}>+ Add Responsibility</button>
        </div>
    );

    return (
        <div className="min-h-screen pt-[120px] pb-10 px-4 w-full max-w-[900px] mx-auto overflow-x-hidden">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-3 text-primary">Resume <span className="text-accent">Builder</span></h1>
                <p className="text-secondary text-[1.1rem]">Fill out the sections below to generate a professional, ATS-friendly PDF resume.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
                <div className="flex justify-between mb-8 overflow-hidden rounded-lg bg-input">
                    <div className={`flex-1 text-center py-3 text-sm font-semibold transition-colors ${currentStep === 1 ? 'bg-accent text-white' : currentStep > 1 ? 'bg-accent/20 text-accent' : 'text-secondary'}`}>1. Info</div>
                    <div className={`flex-1 text-center py-3 text-sm font-semibold transition-colors ${currentStep === 2 ? 'bg-accent text-white' : currentStep > 2 ? 'bg-accent/20 text-accent' : 'text-secondary'}`}>2. Summary</div>
                    <div className={`flex-1 text-center py-3 text-sm font-semibold transition-colors ${currentStep === 3 ? 'bg-accent text-white' : currentStep > 3 ? 'bg-accent/20 text-accent' : 'text-secondary'}`}>3. Education</div>
                    <div className={`flex-1 text-center py-3 text-sm font-semibold transition-colors ${currentStep === 4 ? 'bg-accent text-white' : 'text-secondary'}`}>4. Extras</div>
                </div>

                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                    <button type="button" className="px-6 py-2.5 rounded-xl border border-border bg-transparent text-primary hover:bg-white/5 disabled:opacity-50 transition-all font-semibold cursor-pointer" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1 || loading}>
                        ← Previous
                    </button>
                    
                    {currentStep < 4 ? (
                        <button type="button" className="px-8 py-2.5 rounded-xl border-none bg-accent text-white hover:bg-[#e1034d] disabled:opacity-50 transition-all font-semibold cursor-pointer" onClick={() => setCurrentStep(prev => prev + 1)}>
                            Next →
                        </button>
                    ) : (
                        <button type="button" className="px-8 py-2.5 rounded-xl border-none bg-accent text-white hover:bg-[#e1034d] disabled:opacity-50 transition-all font-semibold cursor-pointer" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Generating PDF...' : 'Generate Resume'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateResume;
