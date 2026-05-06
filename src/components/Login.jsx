import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit, Lock, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const Login = () => {
  const { login } = useStore();
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate auth
    login({ name: isLogin ? 'John Doe' : name, email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04091a] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/30 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Orbit className="w-16 h-16 text-purple-500 mb-4 animate-spin-slow" />
          <h1 className="text-3xl font-bold glow-text text-center">SkillOrbit</h1>
          <p className="text-gray-400 mt-2 text-center text-sm">AI-Powered Skills Matching Platform</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            className={`flex-1 pb-2 border-b-2 transition-colors ${isLogin ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`flex-1 pb-2 border-b-2 transition-colors ${!isLogin ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-500'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300">Forgot Password?</a>
            </div>
          )}

          <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 py-3">
            {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to SkillOrbit's Terms of Service and Privacy Policy.
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
