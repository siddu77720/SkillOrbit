import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { groqClient } from '../utils/groqClient';
import { motion } from 'framer-motion';
import { Target, Loader, ArrowRight, ExternalLink } from 'lucide-react';
import { getSkillLink } from '../utils/skillLinks';

const DreamJobMode = () => {
  const { skills, dreamJob, setDreamJob, dreamJobPath, setDreamJobPath } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePath = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setDreamJob(input);
    const skillNames = skills.map(s => s.name);
    const result = await groqClient.getDreamJobPath(input, skillNames);
    setDreamJobPath(result);
    setLoading(false);
  };

  return (
    <section id="dreamjob" className="py-20 px-6 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 glow-text">Dream Job Mode</h2>
        <p className="text-gray-400 text-lg">Tell us your ultimate career goal, and AI will build your roadmap.</p>
      </div>

      {!dreamJobPath && !loading && (
        <form onSubmit={generatePath} className="max-w-2xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Senior Machine Learning Engineer"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <button type="submit" className="btn-primary px-8 flex items-center gap-2">
            <Target /> Set Goal
          </button>
        </form>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <p className="text-gray-400 animate-pulse">Calculating optimal path through the galaxy...</p>
        </div>
      )}

      {dreamJobPath && !loading && (
        <div className="space-y-10">
          <div className="flex justify-between items-center bg-gradient-to-r from-purple-900/40 to-cyan-900/40 p-8 rounded-2xl border border-white/10">
            <div>
              <p className="text-gray-400 mb-1">Target Destination</p>
              <h3 className="text-3xl font-bold text-white">{dreamJob}</h3>
            </div>
            <button onClick={() => setDreamJobPath(null)} className="btn-outline text-sm">Change Target</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h4 className="text-xl font-bold mb-4 text-cyan-400">Required Skills Overview</h4>
              <div className="flex flex-wrap gap-2">
                {dreamJobPath.requiredSkills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <h4 className="text-xl font-bold mb-4 text-red-400">Critical Gaps to Fill</h4>
              <div className="space-y-3">
                {dreamJobPath.missingSkills.map((gap, i) => (
                  <div key={i} className="flex justify-between items-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <span className="font-medium text-red-200">{gap.skill}</span>
                    <span className="text-xs px-2 py-1 bg-red-500/30 text-red-300 rounded uppercase">{gap.priority} Priority</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-8">Your Learning Roadmap</h3>
            <div className="relative border-l-2 border-purple-500/30 ml-4 pl-8 space-y-12">
              {dreamJobPath.roadmap.map((step, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  key={idx} 
                  className="relative"
                >
                  <div className="absolute -left-[41px] top-0 w-6 h-6 bg-[#04091a] border-4 border-purple-500 rounded-full"></div>
                  <div className="glass-card p-6 border-l-4 border-l-cyan-400">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-lg font-bold text-cyan-400">📅 {String(step.month).toLowerCase().includes('month') ? step.month : `Month ${step.month}`}</h5>
                      <span className="text-sm text-gray-400 bg-white/5 px-2 py-0.5 rounded">⏱ {/^\d+$/.test(String(step.estimatedTime).trim()) ? `${step.estimatedTime} hours` : step.estimatedTime}</span>
                    </div>
                    <h6 className="text-xl font-semibold mb-2">{step.skill}</h6>
                    <a 
                      href={getSkillLink(step.skill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mt-4"
                    >
                      <ExternalLink size={14} /> {step.resource}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DreamJobMode;
