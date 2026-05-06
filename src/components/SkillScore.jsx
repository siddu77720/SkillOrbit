import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getJobListings } from '../utils/jobData';
import { calculateMatchScore } from '../utils/skillMatcher';
import { Award, TrendingUp, Zap, Star } from 'lucide-react';

const SkillScore = () => {
  const { skills, assessmentScore } = useStore();
  const [animatedScore, setAnimatedScore] = useState(0);

  const calculateOverallScore = () => {
    const skillCountScore = Math.min(skills.length, 30);
    const avgLevel = skills.length ? skills.reduce((acc, s) => acc + (s.level || 0), 0) / skills.length : 0;
    const skillLevelScore = avgLevel * 6; // max 30
    
    const topMatches = getJobListings(skills).map(job => calculateMatchScore(skills, job.skills));
    const avgJobMatch = topMatches.length ? topMatches.reduce((acc, match) => acc + match, 0) / topMatches.length : 0;
    const jobMatchScore = (avgJobMatch / 100) * 20;

    const scaledAssessmentScore = Math.round((assessmentScore / 100) * 20);

    return Math.round(skillCountScore + skillLevelScore + scaledAssessmentScore + jobMatchScore);
  };

  const score = calculateOverallScore();

  useEffect(() => {
    // Animate score from 0 to target
    let current = 0;
    const interval = setInterval(() => {
      if (current < score) {
        current += 1;
        setAnimatedScore(current);
      } else if (current > score) {
        current -= 1;
        setAnimatedScore(current);
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  const getScoreColor = () => {
    if (score >= 71) return '#10b981'; // Green
    if (score >= 41) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const getBadge = () => {
    if (score >= 80) return { name: 'Expert', icon: Star, color: 'text-purple-400' };
    if (score >= 60) return { name: 'Pro', icon: Zap, color: 'text-cyan-400' };
    if (score >= 30) return { name: 'Rising Star', icon: TrendingUp, color: 'text-yellow-400' };
    return { name: 'Beginner', icon: Award, color: 'text-gray-400' };
  };

  const Badge = getBadge();
  const circumference = 2 * Math.PI * 120; // r=120
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <section id="skillscore" className="py-20 px-6 max-w-4xl mx-auto">
      <div className="glass-card p-10 flex flex-col md:flex-row items-center gap-12 justify-center">
        
        {/* Circular Progress Ring */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute inset-0">
            <circle
              cx="144" cy="144" r="120"
              stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none"
            />
            <motion.circle
              cx="144" cy="144" r="120"
              stroke={getScoreColor()} strokeWidth="12" fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 10px ${getScoreColor()})` }}
            />
          </svg>
          <div className="text-center z-10 flex flex-col items-center">
            <span className="text-6xl font-bold glow-text" style={{ textShadow: `0 0 20px ${getScoreColor()}` }}>
              {animatedScore}
            </span>
            <span className="text-gray-400">out of 100</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="flex-1 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <Badge.icon className={`w-8 h-8 ${Badge.color}`} />
            <div>
              <p className="text-sm text-gray-400">Current Rank</p>
              <h3 className={`text-2xl font-bold ${Badge.color}`}>{Badge.name}</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Skill Diversity (max 30)</span>
                <span className="text-cyan-400">{Math.min(skills.length, 30)}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${(Math.min(skills.length, 30) / 30) * 100}%` }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Skill Levels (max 30)</span>
                <span className="text-purple-400">{Math.round((skills.length ? skills.reduce((acc, s) => acc + s.level, 0) / skills.length : 0) * 6)}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400" style={{ width: `${((skills.length ? skills.reduce((acc, s) => acc + s.level, 0) / skills.length : 0) * 6 / 30) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Assessment Points (max 20)</span>
                <span className="text-green-400">{Math.round((assessmentScore / 100) * 20)}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: `${(Math.round((assessmentScore / 100) * 20) / 20) * 100}%` }} />
              </div>
            </div>
          </div>

          <button 
            className="btn-outline w-full mt-8"
            onClick={() => {
              const aiBtn = document.getElementById('ai-chat-btn');
              if (aiBtn) aiBtn.click();
              const prompt = `Based on my current skills (${skills.map(s=>s.name).join(', ')}), what are the most critical missing skills I need to improve my career score, and how can I start learning them?`;
              useStore.getState().triggerAI(prompt);
            }}
          >
            Improve Score with AI
          </button>
        </div>
      </div>
    </section>
  );
};

export default SkillScore;
