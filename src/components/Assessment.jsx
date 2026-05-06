import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

import { groqClient } from '../utils/groqClient';
import { Loader } from 'lucide-react';

const Assessment = () => {
  const { skills, setAssessmentScore } = useStore();
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const startQuiz = async () => {
    setStarted(true);
    setLoading(true);
    const skillNames = skills.map(s => s.name);
    const res = await groqClient.generateAssessment(skillNames.length > 0 ? skillNames : ["General Tech"]);
    setQuestions(res.questions || []);
    setLoading(false);
  };

  const handleAnswer = (idx) => {
    const isCorrect = idx === questions[currentQ].correctAnswer;
    if (isCorrect) setScore(s => s + 10); // 10 points per question
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      setFinished(true);
      const finalScore = score + (isCorrect ? 10 : 0);
      setAssessmentScore(finalScore); // Max 100
    }
  };

  if (!started) {
    return (
      <section id="assessment" className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 glow-text">Skill Assessment</h2>
        <p className="text-gray-400 mb-4 max-w-2xl mx-auto">Take our AI-generated quiz to validate your skills from all sources. Your score determines your skill levels across the entire platform.</p>
        <p className="text-cyan-400 mb-8 text-sm">{skills.length} skills loaded from LinkedIn, GitHub, Certificates, Experience & Manual input</p>
        <button onClick={startQuiz} className="btn-primary text-xl px-10 py-4">Start Assessment ({skills.length} skills)</button>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="assessment" className="py-20 px-6 max-w-4xl mx-auto text-center">
        <Loader className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 animate-pulse">Generating your personalized skill assessment...</p>
      </section>
    );
  }

  const retakeAssessment = () => {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
  };

  if (finished) {
    return (
      <section id="assessment" className="py-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block p-6 bg-green-500/20 rounded-full mb-6">
          <CheckCircle className="w-20 h-20 text-green-400" />
        </motion.div>
        <h2 className="text-4xl font-bold mb-4">Assessment Complete!</h2>
        <p className="text-2xl text-gray-300 mb-8">You scored {score} out of {questions.length * 10}</p>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">Your results have been verified and added to your Skill Profile. Your Dashboard stats have been updated.</p>
        <div className="flex gap-4 justify-center">
          <a href="#dashboard" className="btn-primary">View Updated Dashboard</a>
          <button onClick={retakeAssessment} className="btn-outline flex items-center gap-2">🔄 Retake Assessment</button>
        </div>
      </section>
    );
  }

  if (questions.length === 0) return null;

  return (
    <section id="assessment" className="py-20 px-6 max-w-3xl mx-auto">
      <div className="glass-card p-8">
        <div className="flex justify-between items-center mb-8">
          <span className="text-gray-400">Question {currentQ + 1} of {questions.length}</span>
          <div className="w-1/2 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${((currentQ) / questions.length) * 100}%` }}></div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-8">{questions[currentQ].question}</h3>
        
        <div className="space-y-4">
          {questions[currentQ].options.map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left p-4 rounded-xl border border-white/10 hover:bg-purple-500/20 hover:border-purple-500 transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Assessment;
