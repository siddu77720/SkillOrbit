import React, { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { groqClient } from '../utils/groqClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Award, Briefcase, Loader, Upload, X, Wand2, Star } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const TABS = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400' },
  { key: 'github', label: 'GitHub', icon: Github, color: 'text-white' },
  { key: 'certificates', label: 'Certificates', icon: Award, color: 'text-yellow-400' },
  { key: 'experience', label: 'Experience', icon: Briefcase, color: 'text-green-400' },
];

const GITHUB_LANG_MAP = {
  'JavaScript': ['JavaScript', 'React', 'Node.js'],
  'TypeScript': ['TypeScript', 'React'],
  'Python': ['Python'],
  'Java': ['Java'],
  'Kotlin': ['Kotlin'],
  'HTML': ['HTML', 'CSS'],
  'CSS': ['CSS'],
  'Dockerfile': ['Docker'],
  'Shell': ['Linux', 'Git'],
  'Go': ['Go'],
  'Ruby': ['Ruby'],
  'C++': ['C++'],
  'C#': ['C#'],
  'Swift': ['Swift'],
  'Rust': ['Rust'],
  'Vue': ['Vue.js'],
  'Dart': ['Dart', 'Flutter'],
};

const ProfileInput = () => {
  const { addSkill, skills, userProfile, updateUserProfile, setProfileData, profileData, addActivity } = useStore();
  const [activeTab, setActiveTab] = useState('linkedin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ═══════════════ LINKEDIN TAB ═══════════════
  const [linkedinUrl, setLinkedinUrl] = useState(userProfile.linkedin || '');
  const [linkedinAbout, setLinkedinAbout] = useState('');
  const [linkedinResult, setLinkedinResult] = useState(null);

  const analyzeLinkedin = async () => {
    if (!linkedinUrl.trim() && !linkedinAbout.trim()) return;
    setLoading(true);
    setError('');
    updateUserProfile({ linkedin: linkedinUrl });
    try {
      // Use Groq AI to analyze the LinkedIn URL + pasted about text
      const res = await groqClient.analyzeLinkedinUrl(linkedinUrl, userProfile.name, linkedinAbout);
      if (res && res.skills && Array.isArray(res.skills)) {
        setLinkedinResult(res);
        setProfileData({ linkedinSkills: res.skills });
        let added = 0;
        res.skills.forEach(s => {
          const skillName = typeof s === 'string' ? s : s.name;
          const skillPercentage = typeof s === 'string' ? null : s.percentage;
          if (skillName && !skills.find(sk => sk.name.toLowerCase() === skillName.toLowerCase())) {
            addSkill({ name: skillName, source: 'LinkedIn', percentage: skillPercentage });
            added++;
          }
        });
        if (added > 0) addActivity(`${added} skills extracted from LinkedIn`);
      } else {
        setError('Could not extract skills. Try pasting your LinkedIn About section below.');
      }
    } catch (e) {
      setError('Failed to analyze. Make sure you have a valid Groq API key in .env');
    }
    setLoading(false);
  };

  // ═══════════════ GITHUB TAB ═══════════════
  const [githubUrl, setGithubUrl] = useState(userProfile.github || '');
  const [githubRepos, setGithubRepos] = useState([]);

  const analyzeGithub = async () => {
    if (!githubUrl.trim()) return;
    setLoading(true);
    setError('');
    updateUserProfile({ github: githubUrl });

    // Extract username from URL or raw input
    let username = githubUrl.trim();
    if (username.includes('github.com/')) {
      username = username.split('github.com/')[1].split('/')[0].split('?')[0];
    }
    username = username.replace(/^@/, '');

    try {
      // Fetch REAL repos from GitHub public API
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
      if (!response.ok) throw new Error('GitHub user not found');
      const repos = await response.json();

      const topRepos = repos
        .filter(r => !r.fork)
        .slice(0, 8)
        .map(r => ({
          name: r.name,
          language: r.language || 'Unknown',
          stars: r.stargazers_count,
          description: r.description || '',
          url: r.html_url
        }));

      setGithubRepos(topRepos);
      setProfileData({ githubRepos: topRepos });

      let added = 0;
      
      // Calculate real percentages based on repo frequency
      const langCounts = {};
      topRepos.forEach(repo => {
        const mapped = GITHUB_LANG_MAP[repo.language] || (repo.language !== 'Unknown' ? [repo.language] : []);
        mapped.forEach(s => {
          langCounts[s] = (langCounts[s] || 0) + 1;
        });
      });

      Object.keys(langCounts).forEach(s => {
        if (!skills.find(sk => sk.name.toLowerCase() === s.toLowerCase())) {
          // 1 repo = 60%, scaled up to 98% based on frequency
          const freqPercentage = Math.min(98, 50 + (langCounts[s] * 15));
          addSkill({ name: s, source: 'GitHub', percentage: freqPercentage });
          added++;
        }
      });
      if (added > 0) addActivity(`${added} skills detected from ${username}'s GitHub repos`);
    } catch (e) {
      setError(`Could not fetch repos for "${username}". Make sure the username is correct and public.`);
    }
    setLoading(false);
  };

  // ═══════════════ CERTIFICATES TAB ═══════════════
  const [certFiles, setCertFiles] = useState(profileData.certificateFiles || []);

  const onCertDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(f => {
      let type = 'Course';
      if (f.name.toLowerCase().includes('intern')) type = 'Internship';
      // Create a preview URL for images so we can display the full certificate
      const previewUrl = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
      return { name: f.name, type, size: (f.size / 1024).toFixed(1) + ' KB', previewUrl, isImage: f.type.startsWith('image/') };
    });
    const all = [...certFiles, ...newFiles];
    setCertFiles(all);
    setProfileData({ certificateFiles: all });
    addActivity(`${newFiles.length} certificate(s) uploaded`);
  }, [certFiles, setProfileData, addActivity]);

  const { getRootProps: getCertRootProps, getInputProps: getCertInputProps, isDragActive: isCertDrag } = useDropzone({
    onDrop: onCertDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }
  });

  const removeCert = (idx) => {
    const updated = certFiles.filter((_, i) => i !== idx);
    setCertFiles(updated);
    setProfileData({ certificateFiles: updated });
  };

  // ═══════════════ EXPERIENCE TAB ═══════════════
  const [expForm, setExpForm] = useState({ company: '', role: '', duration: '', description: '' });
  const [experiences, setExperiences] = useState(profileData.experiences || []);
  const [expLoading, setExpLoading] = useState(false);

  const addExperience = async () => {
    if (!expForm.company || !expForm.role) return;
    setExpLoading(true);

    // Use Groq AI to extract skills from the description
    let extracted = [];
    if (expForm.description.trim()) {
      try {
        const res = await groqClient.extractSkillsFromText(expForm.description);
        if (res && res.skills) extracted = res.skills;
      } catch (e) {
        // Fallback: keyword matching
        const descLower = expForm.description.toLowerCase();
        const techKeywords = ['react', 'python', 'java', 'sql', 'aws', 'docker', 'node.js', 'javascript', 'figma', 'excel', 'git', 'mongodb', 'machine learning', 'kubernetes', 'typescript', 'html', 'css', 'tensorflow', 'firebase', 'azure'];
        extracted = techKeywords.filter(k => descLower.includes(k)).map(k => k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    }

    const entry = { ...expForm, extractedSkills: extracted, id: Date.now() };
    const all = [...experiences, entry];
    setExperiences(all);
    setProfileData({ experiences: all });
    let added = 0;
    extracted.forEach(s => {
      const skillName = typeof s === 'string' ? s : s.name;
      const skillPercentage = typeof s === 'string' ? null : s.percentage;
      if (skillName && !skills.find(sk => sk.name.toLowerCase() === skillName.toLowerCase())) {
        addSkill({ name: skillName, source: 'Experience', percentage: skillPercentage });
        added++;
      }
    });
    if (added > 0) addActivity(`${added} skills extracted from experience at ${expForm.company}`);
    setExpForm({ company: '', role: '', duration: '', description: '' });
    setExpLoading(false);
  };

  // Source counts
  const linkedinCount = skills.filter(s => s.source === 'LinkedIn').length;
  const githubCount = skills.filter(s => s.source === 'GitHub').length;
  const certCount = skills.filter(s => s.source === 'Certificate').length;
  const expCount = skills.filter(s => s.source === 'Experience').length;

  return (
    <section id="profile" className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 glow-text">Build Your Profile</h2>
        <p className="text-gray-400">Import your professional background to auto-detect skills.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setError(''); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
            }`}>
            <tab.icon size={18} className={tab.color} /> {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>}

      <div className="glass-card p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {/* LINKEDIN TAB */}
          {activeTab === 'linkedin' && (
            <motion.div key="linkedin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Linkedin className="text-blue-400" /> LinkedIn Profile</h3>
              <p className="text-gray-500 text-sm mb-4">Paste your LinkedIn URL and your "About" section text. AI will extract real skills from your profile content.</p>
              <div className="flex gap-4 mb-4">
                <input type="text" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none" />
              </div>
              <textarea value={linkedinAbout} onChange={(e) => setLinkedinAbout(e.target.value)} placeholder="Paste your LinkedIn About/Summary section here for accurate skill extraction...&#10;&#10;Example: Experienced Software Developer with 3+ years in React, Node.js, and AWS. Passionate about building scalable web applications..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none mb-4" />
              <button onClick={analyzeLinkedin} disabled={loading || (!linkedinUrl.trim() && !linkedinAbout.trim())} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 mb-6">
                {loading ? <Loader className="animate-spin" size={18} /> : <Wand2 size={18} />} Analyze LinkedIn Profile
              </button>
              {linkedinResult && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Detected Role</p>
                  <p className="text-lg font-bold text-blue-400 mb-4">{linkedinResult.role} • {linkedinResult.years} years exp</p>
                  <p className="text-gray-400 text-sm mb-2">Extracted Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedinResult.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm">
                        {typeof s === 'string' ? s : `${s.name} (${s.percentage}%)`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* GITHUB TAB */}
          {activeTab === 'github' && (
            <motion.div key="github" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Github /> GitHub Profile</h3>
              <p className="text-gray-500 text-sm mb-4">Enter your GitHub username — we fetch your REAL public repos and detect skills from languages used.</p>
              <div className="flex gap-4 mb-6">
                <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="username or https://github.com/username" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-white focus:outline-none" />
                <button onClick={analyzeGithub} disabled={loading || !githubUrl.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader className="animate-spin" size={18} /> : <Wand2 size={18} />} Analyze Repos
                </button>
              </div>
              {githubRepos.length > 0 && (
                <div>
                  <p className="text-cyan-400 text-sm font-bold mb-3">{githubRepos.length} public repos found</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {githubRepos.map((repo, i) => (
                      <a key={i} href={repo.url} target="_blank" rel="noopener noreferrer" className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/30 transition-colors block">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-white text-sm">{repo.name}</h4>
                          <span className="flex items-center gap-1 text-yellow-400 text-xs"><Star size={12} />{repo.stars}</span>
                        </div>
                        {repo.description && <p className="text-xs text-gray-500 mb-2 line-clamp-1">{repo.description}</p>}
                        <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">{repo.language}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certificates' && (
            <motion.div key="certificates" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Award className="text-yellow-400" /> Certificates</h3>
              <p className="text-gray-500 text-sm mb-4">Upload your course and internship certificates to showcase your credentials.</p>
              <div {...getCertRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors mb-6 ${isCertDrag ? 'border-yellow-400 bg-yellow-500/10' : 'border-white/20 hover:border-white/40'}`}>
                <input {...getCertInputProps()} />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300">Drag & drop certificates (PDF/Images)</p>
                <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, JPEG, PDF</p>
              </div>
              {certFiles.length > 0 && (
                <div>
                  <p className="text-cyan-400 font-bold text-sm mb-4">{certFiles.length} certificate(s) uploaded</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certFiles.map((cf, i) => (
                      <div key={i} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        {/* Certificate Image Preview */}
                        {cf.previewUrl ? (
                          <div className="w-full bg-black/30 flex items-center justify-center p-2" style={{ minHeight: '200px' }}>
                            <img src={cf.previewUrl} alt={cf.name} className="max-w-full max-h-[300px] rounded-lg object-contain" />
                          </div>
                        ) : (
                          <div className="w-full bg-white/5 flex items-center justify-center p-8" style={{ minHeight: '150px' }}>
                            <div className="text-center">
                              <Award size={40} className="text-yellow-400 mx-auto mb-2" />
                              <p className="text-gray-400 text-xs">PDF Certificate</p>
                            </div>
                          </div>
                        )}
                        {/* Certificate Info Bar */}
                        <div className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white font-medium truncate max-w-[200px]">{cf.name}</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${cf.type === 'Internship' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{cf.type}</span>
                              {cf.size && <span className="text-[10px] px-2 py-0.5 bg-white/10 text-gray-400 rounded-full">{cf.size}</span>}
                            </div>
                          </div>
                          <button onClick={() => removeCert(i)} className="text-gray-400 hover:text-red-400 p-1"><X size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <motion.div key="experience" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Briefcase className="text-green-400" /> Experience & Internships</h3>
              <p className="text-gray-500 text-sm mb-4">Add your real work experience. AI analyzes descriptions to extract actual skills used.</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input type="text" value={expForm.company} onChange={(e) => setExpForm({...expForm, company: e.target.value})} placeholder="Company Name" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:outline-none" />
                <input type="text" value={expForm.role} onChange={(e) => setExpForm({...expForm, role: e.target.value})} placeholder="Job Role" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:outline-none" />
                <input type="text" value={expForm.duration} onChange={(e) => setExpForm({...expForm, duration: e.target.value})} placeholder="Duration (e.g., Jan 2024 - Present)" className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:outline-none" />
              </div>
              <textarea value={expForm.description} onChange={(e) => setExpForm({...expForm, description: e.target.value})} placeholder="Describe your work in detail — the AI will extract real skills from your description..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:outline-none mb-4" />
              <button onClick={addExperience} disabled={expLoading || !expForm.company || !expForm.role} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {expLoading ? <Loader className="animate-spin" size={18} /> : <Briefcase size={18} />} Add Experience
              </button>
              
              {experiences.length > 0 && (
                <div className="mt-6 relative border-l-2 border-green-500/30 ml-4 pl-8 space-y-6">
                  {experiences.map((exp, i) => (
                    <div key={exp.id || i} className="relative">
                      <div className="absolute -left-[41px] top-0 w-6 h-6 bg-[#04091a] border-4 border-green-500 rounded-full"></div>
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 className="font-bold text-white">{exp.role}</h4>
                        <p className="text-sm text-gray-400">{exp.company} • {exp.duration}</p>
                        <p className="text-xs text-gray-500 mt-1">{exp.description}</p>
                        {exp.extractedSkills && exp.extractedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exp.extractedSkills.map(s => (
                              <span key={s} className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      

    </section>
  );
};

export default ProfileInput;
