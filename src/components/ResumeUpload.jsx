import React, { useState } from 'react';
import { FileText, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { groqClient } from '../utils/groqClient';
import html2pdf from 'html2pdf.js';

const STEPS = ['Basic Info', 'Summary', 'Skills', 'Experience', 'Education', 'Projects', 'Resume Type'];

const ResumeUpload = () => {
  const { skills, userProfile, profileData } = useStore();
  const [step, setStep] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    name: userProfile.name || '', email: userProfile.email || '', phone: '', linkedin: userProfile.linkedin || '',
    github: userProfile.github || '', portfolio: '', location: ''
  });

  // Step 2: Summary
  const [summary, setSummary] = useState({ targetJob: '', years: 'Fresher', about: '' });

  // Step 3: Skills (auto-filled)
  const [resumeSkills, setResumeSkills] = useState(skills.map(s => s.name));
  const [newSkill, setNewSkill] = useState('');

  // Step 4: Experience (auto-filled)
  const [resumeExp, setResumeExp] = useState(profileData.experiences || []);

  // Step 5: Education
  const [education, setEducation] = useState({ degree: '', college: '', year: '', cgpa: '' });

  // Step 6: Projects
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', techStack: '', github: '', live: '' });

  // Step 7: Resume Type
  const [resumeType, setResumeType] = useState('ATS-Optimized');

  const addProject = () => {
    if (!projectForm.name) return;
    setProjects([...projects, { ...projectForm, techStack: projectForm.techStack.split(',').map(s => s.trim()) }]);
    setProjectForm({ name: '', description: '', techStack: '', github: '', live: '' });
  };

  const handleGenerate = async () => {
    if (!summary.targetJob.trim()) return alert('Please enter a Target Job Role in Step 2');
    if (!basicInfo.name.trim()) return alert('Please enter your Name in Step 1');
    setLoading(true);
    const skillsToUse = resumeSkills.length > 0 ? resumeSkills : skills.map(s => s.name);
    try {
      const data = await groqClient.generateResume(
        { ...basicInfo, experienceYears: summary.years, summary: summary.about },
        skillsToUse,
        summary.targetJob
      );
      if (data && data.summary && typeof data.summary === 'string') {
        setResumeData({
          aiSummary: data.summary,
          coreCompetencies: data.coreCompetencies || skillsToUse,
          experience: data.experience || [],
          userInfo: basicInfo,
          userSummary: summary,
          education, projects, certs, resumeType
        });
      } else {
        setResumeData({
          aiSummary: summary.about || `${basicInfo.name} is a dedicated ${summary.targetJob} with ${summary.years} of experience and proficiency in ${skillsToUse.slice(0, 5).join(', ')}.`,
          coreCompetencies: skillsToUse,
          experience: resumeExp.map(e => ({ title: e.role, context: `${e.company} | ${e.duration}`, bullets: [e.description || 'Key contributor to team projects.'] })),
          userInfo: basicInfo,
          userSummary: summary,
          education, projects, certs, resumeType
        });
      }
      setGenerated(true);
    } catch (err) {
      setResumeData({
        aiSummary: summary.about || `${basicInfo.name} is a motivated ${summary.targetJob} professional skilled in ${skillsToUse.slice(0, 5).join(', ')}.`,
        coreCompetencies: skillsToUse,
        experience: resumeExp.map(e => ({ title: e.role, context: `${e.company} | ${e.duration}`, bullets: [e.description || 'Contributed to team objectives.'] })),
        userInfo: basicInfo,
        userSummary: summary,
        education, projects, certs, resumeType
      });
      setGenerated(true);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const element = document.getElementById('resume-preview');
    html2pdf().set({
      margin: 10, filename: `${basicInfo.name?.replace(/\s+/g, '_') || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
  };

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  if (generated && resumeData) {
    return (
      <section id="resume" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 glow-text">Your Resume</h2>
        </div>
        <div className="glass-card p-2 mb-4">
          <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.8, type: 'spring' }} style={{ transformStyle: 'preserve-3d' }}>
            <div id="resume-preview" className="bg-white text-black p-10 rounded font-sans shadow-2xl" style={{ minHeight: '297mm', maxWidth: '210mm', margin: '0 auto' }}>
              {/* Header */}
              <div className="border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 uppercase">{basicInfo.name}</h1>
                <p className="text-gray-600 font-semibold text-lg">{summary.targetJob}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {basicInfo.email}{basicInfo.phone ? ` | ${basicInfo.phone}` : ''}{basicInfo.location ? ` | ${basicInfo.location}` : ''}
                </p>
                <p className="text-sm text-gray-500">
                  {basicInfo.linkedin && <span>LinkedIn: {basicInfo.linkedin} </span>}
                  {basicInfo.github && <span>| GitHub: {basicInfo.github} </span>}
                  {basicInfo.portfolio && <span>| Portfolio: {basicInfo.portfolio}</span>}
                </p>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-300 mb-2 uppercase tracking-wider">Professional Summary</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{resumeData.aiSummary}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-300 mb-2 uppercase tracking-wider">Core Competencies</h2>
                <div className="flex flex-wrap gap-2">
                  {(resumeData.coreCompetencies || resumeSkills).map(s => (
                    <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-300 mb-2 uppercase tracking-wider">Experience & Projects</h2>
                {(resumeData.experience || []).map((exp, i) => (
                  <div key={i} className="mb-4">
                    <h3 className="font-bold text-gray-800 text-sm">{exp.title}</h3>
                    <p className="text-xs text-gray-500 italic">{exp.context}</p>
                    <ul className="list-disc pl-5 mt-1 text-xs text-gray-700 space-y-0.5">
                      {(exp.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Education */}
              {education.degree && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-gray-900 border-b border-gray-300 mb-2 uppercase tracking-wider">Education</h2>
                  <p className="text-sm text-gray-800 font-bold">{education.degree}</p>
                  <p className="text-xs text-gray-500">{education.college} | {education.year}{education.cgpa ? ` | CGPA: ${education.cgpa}` : ''}</p>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-gray-900 border-b border-gray-300 mb-2 uppercase tracking-wider">Projects</h2>
                  {projects.map((p, i) => (
                    <div key={i} className="mb-3">
                      <h3 className="font-bold text-gray-800 text-sm">{p.name}</h3>
                      <p className="text-xs text-gray-600">{p.description}</p>
                      <p className="text-xs text-gray-500">Tech: {Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}</p>
                    </div>
                  ))}
                </div>
              )}


            </div>
          </motion.div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setGenerated(false)} className="btn-outline flex-1">Edit Details</button>
          <button onClick={handleDownload} className="btn-primary flex-1 flex items-center justify-center gap-2"><Download size={18} /> Download A4 PDF</button>
        </div>
      </section>
    );
  }

  return (
    <section id="resume" className="py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 glow-text">Resume Builder</h2>
        <p className="text-gray-400">Fill in the details to generate a personalized, ATS-optimized resume.</p>
      </div>

      {/* Step Progress */}
      <div className="flex gap-1 mb-8 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${i === step ? 'bg-purple-600 text-white' : i < step ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>{s}</button>
        ))}
      </div>

      <div className="glass-card p-8 min-h-[350px]">
        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={basicInfo.name} onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})} placeholder="Full Name *" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={basicInfo.email} onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})} placeholder="Email *" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={basicInfo.phone} onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})} placeholder="Phone" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={basicInfo.location} onChange={(e) => setBasicInfo({...basicInfo, location: e.target.value})} placeholder="Location" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={basicInfo.linkedin} onChange={(e) => setBasicInfo({...basicInfo, linkedin: e.target.value})} placeholder="LinkedIn URL" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={basicInfo.github} onChange={(e) => setBasicInfo({...basicInfo, github: e.target.value})} placeholder="GitHub URL" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={basicInfo.portfolio} onChange={(e) => setBasicInfo({...basicInfo, portfolio: e.target.value})} placeholder="Portfolio URL" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none md:col-span-2" />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Professional Summary</h3>
            <input value={summary.targetJob} onChange={(e) => setSummary({...summary, targetJob: e.target.value})} placeholder="Target Job Role *" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
            <select value={summary.years} onChange={(e) => setSummary({...summary, years: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none">
              <option value="Fresher">Fresher</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
            <textarea value={summary.about} onChange={(e) => setSummary({...summary, about: e.target.value})} placeholder="Write 2-3 lines about yourself..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Skills (auto-filled from profile)</h3>
            <div className="flex gap-2 mb-4">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add skill..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <button onClick={() => { if (newSkill.trim()) { setResumeSkills([...resumeSkills, newSkill.trim()]); setNewSkill(''); } }} className="btn-primary">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {resumeSkills.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2">
                  {s} <button onClick={() => setResumeSkills(resumeSkills.filter((_, j) => j !== i))} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Experience (auto-filled from profile)</h3>
            {resumeExp.length > 0 ? resumeExp.map((exp, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/10 mb-3">
                <p className="font-bold text-white">{exp.role} at {exp.company}</p>
                <p className="text-xs text-gray-400">{exp.duration}</p>
              </div>
            )) : <p className="text-gray-500">No experience added. Add through the Profile Input section.</p>}
          </div>
        )}

        {/* Step 5 */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Education</h3>
            <input value={education.degree} onChange={(e) => setEducation({...education, degree: e.target.value})} placeholder="Degree (e.g., B.Tech Computer Science)" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
            <input value={education.college} onChange={(e) => setEducation({...education, college: e.target.value})} placeholder="College/University" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <input value={education.year} onChange={(e) => setEducation({...education, year: e.target.value})} placeholder="Graduation Year" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={education.cgpa} onChange={(e) => setEducation({...education, cgpa: e.target.value})} placeholder="CGPA / Percentage" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
            </div>
          </div>
        )}

        {/* Step 6 */}
        {step === 5 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Projects</h3>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <input value={projectForm.name} onChange={(e) => setProjectForm({...projectForm, name: e.target.value})} placeholder="Project Name" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={projectForm.techStack} onChange={(e) => setProjectForm({...projectForm, techStack: e.target.value})} placeholder="Tech Stack (comma separated)" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
            </div>
            <textarea value={projectForm.description} onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} placeholder="Description" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none mb-3" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input value={projectForm.github} onChange={(e) => setProjectForm({...projectForm, github: e.target.value})} placeholder="GitHub Link" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
              <input value={projectForm.live} onChange={(e) => setProjectForm({...projectForm, live: e.target.value})} placeholder="Live Link" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
            </div>
            <button onClick={addProject} className="btn-outline w-full mb-4">+ Add Project</button>
            {projects.map((p, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
                <p className="font-bold text-white text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">{Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}</p>
              </div>
            ))}
          </div>
        )}

        {/* Step 7 */}
        {step === 6 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Choose Resume Type</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Fresher', 'Experienced', 'Creative', 'ATS-Optimized'].map(type => (
                <button key={type} onClick={() => setResumeType(type)} className={`p-6 rounded-xl border-2 text-center transition-all ${resumeType === type ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'}`}>
                  <p className="font-bold text-lg">{type}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button onClick={prev} disabled={step === 0} className="btn-outline flex items-center gap-2 disabled:opacity-30">
          <ArrowLeft size={18} /> Previous
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="btn-primary flex items-center gap-2">
            Next <ArrowRight size={18} />
          </button>
        ) : (
          <button onClick={handleGenerate} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? 'Generating...' : 'Generate Resume'} <ArrowRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
};

export default ResumeUpload;
