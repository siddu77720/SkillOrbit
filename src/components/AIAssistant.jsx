import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Orbit } from 'lucide-react';
import { useStore } from '../store/useStore';
import { groqClient } from '../utils/groqClient';
import ReactMarkdown from 'react-markdown';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I am your SkillOrbit AI coach. Ask me about your career, skills, or projects!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { skills, aiPromptEvent, aiPromptText, triggerAI } = useStore();

  useEffect(() => {
    if (aiPromptEvent && aiPromptText) {
      setIsOpen(true);
      handleSend(aiPromptText);
      triggerAI(null);
    }
  }, [aiPromptEvent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const newMsgs = [...messages, { role: 'user', content: msg }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    const context = skills.map(s => s.name);
    const aiReply = await groqClient.chatWithAssistant(msg, context);

    setIsTyping(false);
    setMessages([...newMsgs, { role: 'ai', content: aiReply }]);
  };

  const quickQuestions = [
    "Which job suits me best?",
    "What skills should I learn next?",
    "How to improve my score?"
  ];

  return (
    <>
      <button 
        id="ai-chat-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 p-4 bg-purple-600 rounded-full shadow-[0_0_20px_#7c3aed] text-white hover:bg-purple-500 transition-colors z-50 flex items-center justify-center group"
      >
        <MessageSquare className="absolute group-hover:opacity-0 transition-opacity" />
        <Orbit className="opacity-0 group-hover:opacity-100 transition-opacity animate-spin-slow" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-36 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] glass-card z-50 flex flex-col overflow-hidden border border-purple-500/30 shadow-2xl"
          >
            <div className="bg-purple-900/50 p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Orbit className="text-cyan-400" />
                <span className="font-bold">AI Coach</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5 ai-message-content'
                  }`}>
                    {m.role === 'user' ? (
                      m.content
                    ) : (
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center h-10 w-16">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-black/20">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {quickQuestions.map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(q)}
                    className="whitespace-nowrap px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-cyan-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
                <button type="submit" className="p-2 bg-purple-600 rounded-xl text-white hover:bg-purple-500 transition-colors">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
