import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { groqClient } from '../utils/groqClient';
import { motion } from 'framer-motion';
import { Loader, Code2, Play, RefreshCw } from 'lucide-react';

const ProjectRecommendations = () => {
  const { skills } = useStore();
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    if (skills.length === 0) return alert("Please add some skills first!");
    setLoading(true);
    const skillNames = skills.map(s => s.name);
    const res = await groqClient.getProjectRecommendations(skillNames);
    if (res && res.projects) {
      setProjects(res.projects);
    }
    setLoading(false);
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <section id="projects" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold mb-4 glow-text">AI Project Ideas</h2>
          <p className="text-gray-400">Build your portfolio with personalized project recommendations.</p>
        </div>
        <button 
          onClick={fetchProjects} 
          disabled={loading}
          className="btn-outline flex items-center gap-2"
        >
          {loading ? <Loader className="animate-spin" size={18} /> : (projects ? <RefreshCw size={18} /> : <Code2 size={18} />)}
          {projects ? 'Regenerate Ideas' : 'Get Ideas'}
        </button>
      </div>

      {projects && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 flex flex-col h-full hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl">{proj.emoji}</span>
                <span className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(proj.difficulty)}`}>
                  {proj.difficulty}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{proj.name}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-grow">{proj.description}</p>
              
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">Tech Stack:</p>
                <div className="flex flex-wrap gap-2">
                  {proj.techStack?.map(tech => (
                    <span key={tech} className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-cyan-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                <span className="text-sm text-gray-400">{proj.estimatedTime}</span>
                <a href={`https://github.com/search?q=${encodeURIComponent(proj.name)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium">
                  <Play size={14} /> Start Building
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!projects && !loading && (
        <div className="text-center py-20 glass-card">
          <Code2 size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Click the button above to generate personalized project ideas based on your skills.</p>
        </div>
      )}
    </section>
  );
};

export default ProjectRecommendations;
