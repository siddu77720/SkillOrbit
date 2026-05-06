import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, UserCircle, CheckSquare, TrendingUp, BookOpen, Send, Star } from 'lucide-react';
import { useStore } from '../store/useStore';

const steps = [
  { id: 'profile', icon: UserCircle, title: 'Profile Created', desc: 'Added basic details and initial skills.' },
  { id: 'assessment', icon: CheckSquare, title: 'Skill Assessment', desc: 'Validated skills through AI quizzes.' },
  { id: 'gap', icon: TrendingUp, title: 'Skill Gap Analysis', desc: 'Identified missing skills for target jobs.' },
  { id: 'learning', icon: BookOpen, title: 'Learning Path', desc: 'Completed recommended courses.' },
  { id: 'apply', icon: Send, title: 'Job Application', desc: 'Generated resume and applied to matched jobs.' },
  { id: 'dream', icon: Star, title: 'Dream Job Secured', desc: 'Successfully landed the target position.' },
];

const CareerPath = () => {
  const { skills, assessmentScore, dreamJob } = useStore();

  const getCurrentStepIndex = () => {
    if (skills.length === 0) return 0;
    if (assessmentScore === 0) return 1;
    if (!dreamJob) return 2;
    // Mock progression for remaining
    return 3;
  };

  const currentIndex = getCurrentStepIndex();
  const progressPercent = Math.max(10, (currentIndex / (steps.length - 1)) * 100);

  return (
    <section id="careerpath" className="py-20 px-6 max-w-4xl mx-auto relative">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 glow-text">Career Path</h2>
        <p className="text-gray-400">Track your journey from skill building to dream job.</p>
        <div className="mt-6 inline-block glass-card px-6 py-2">
          <span className="text-cyan-400 font-bold">{Math.round(progressPercent)}%</span> Journey Completed
        </div>
      </div>

      <div className="relative pl-8 md:pl-0">
        {/* Vertical Line */}
        <div className="absolute left-12 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 transform md:-translate-x-1/2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: `${progressPercent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 w-full bg-gradient-to-b from-purple-500 to-cyan-400"
          />
        </div>

        {/* Rocket Indicator */}
        <motion.div 
          initial={{ top: 0 }}
          whileInView={{ top: `calc(${progressPercent}% - 24px)` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute left-12 md:left-1/2 transform -translate-x-1/2 z-10 w-12 h-12 bg-[#04091a] border-4 border-purple-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#7c3aed]"
        >
          <Rocket size={20} className="text-white transform -rotate-45" />
        </motion.div>

        <div className="space-y-16">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const alignLeft = idx % 2 === 0;

            return (
              <div key={step.id} className={`relative flex items-center ${alignLeft ? 'md:justify-start' : 'md:justify-end'} justify-start`}>
                {/* Node for mobile */}
                <div className={`md:hidden absolute left-4 w-4 h-4 rounded-full ${isCompleted ? 'bg-cyan-400 shadow-[0_0_10px_#06b6d4]' : 'bg-white/20'}`} />

                {/* Node for desktop */}
                <div className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${isCompleted ? 'bg-cyan-400 shadow-[0_0_10px_#06b6d4]' : 'bg-white/20'}`} />

                <motion.div 
                  initial={{ opacity: 0, x: alignLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`w-full md:w-[45%] ml-16 md:ml-0 glass-card p-6 ${isCurrent ? 'border-purple-500 shadow-[0_0_20px_rgba(124,58,237,0.2)]' : ''} ${!isCompleted && 'opacity-50'}`}
                >
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${isCompleted ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-500'}`}>
                    <step.icon size={24} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isCurrent ? 'text-white' : (isCompleted ? 'text-gray-200' : 'text-gray-500')}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CareerPath;
