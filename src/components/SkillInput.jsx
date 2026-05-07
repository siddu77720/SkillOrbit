import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



const SOURCE_COLORS = {
  LinkedIn: 'bg-blue-500/20 text-blue-300',
  GitHub: 'bg-gray-500/20 text-gray-300',
  Certificate: 'bg-yellow-500/20 text-yellow-300',
  Experience: 'bg-green-500/20 text-green-300',
  Manual: 'bg-purple-500/20 text-purple-300',
  Extracted: 'bg-cyan-500/20 text-cyan-300',
};

const SkillInput = () => {
  const { skills, addSkill, removeSkill, assessmentScore } = useStore();
  const [input, setInput] = useState('');




  const renderPercentage = (percentage) => {
    return (
      <div className="w-full max-w-xs mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Proficiency</span>
          <span className="text-cyan-400 font-bold">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  const linkedinCount = skills.filter(s => s.source === 'LinkedIn').length;
  const githubCount = skills.filter(s => s.source === 'GitHub').length;
  const expCount = skills.filter(s => s.source === 'Experience').length;

  return (
    <section id="skills" className="py-20 px-6 max-w-5xl mx-auto">
      <div className="glass-card p-8">
        <h2 className="text-3xl font-bold mb-6 glow-text">Your Skills Arsenal</h2>
        


        <div className="space-y-3">
          <AnimatePresence>
            {skills.filter(s => s.source === 'LinkedIn' || s.source === 'GitHub' || s.source === 'Experience' || s.source === 'Certificate').map((skill) => (
              <motion.div 
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-semibold text-lg">{skill.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${SOURCE_COLORS[skill.source] || SOURCE_COLORS.Manual}`}>
                      {skill.source || 'Manual'}
                    </span>
                  </div>
                  <div className="mt-2 w-full">
                    {renderPercentage(skill.percentage || 50)}
                  </div>
                </div>
                <button 
                  onClick={() => removeSkill(skill.name)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {skills.filter(s => s.source === 'LinkedIn' || s.source === 'GitHub' || s.source === 'Experience' || s.source === 'Certificate').length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No skills extracted yet. Use the profile builder above to extract real skills from your LinkedIn, GitHub, or Experience!</p>
          </div>
        )}

        {/* Summary Banner */}
        {skills.filter(s => s.source === 'LinkedIn' || s.source === 'GitHub' || s.source === 'Experience' || s.source === 'Certificate').length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl flex flex-wrap gap-4 justify-center items-center text-sm">
            {linkedinCount > 0 && <span className="text-blue-400 font-bold">{linkedinCount} from LinkedIn</span>}
            {linkedinCount > 0 && githubCount > 0 && <span className="text-gray-600">|</span>}
            {githubCount > 0 && <span className="text-white font-bold">{githubCount} from GitHub</span>}
            {(linkedinCount > 0 || githubCount > 0) && expCount > 0 && <span className="text-gray-600">|</span>}
            {expCount > 0 && <span className="text-green-400 font-bold">{expCount} from Experience</span>}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SkillInput;
