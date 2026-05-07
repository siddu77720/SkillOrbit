import React from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getJobListings } from '../utils/jobData';
import { calculateMatchScore } from '../utils/skillMatcher';
import { motion } from 'framer-motion';
import { User, Github, Award, Briefcase, Activity } from 'lucide-react';

const Dashboard = () => {
  const { skills, assessmentScore, jobHistory, userProfile, profileData, activityFeed } = useStore();

  const getTopJobs = () => {
    return getJobListings(skills).map(job => ({
      name: job.title,
      match: calculateMatchScore(skills, job.skills)
    })).sort((a, b) => b.match - a.match).slice(0, 5);
  };

  const calculateOverallScore = () => {
    const skillCountScore = Math.min(skills.length, 30);
    const avgLevel = skills.length ? skills.reduce((acc, s) => acc + (s.level || 0), 0) / skills.length : 0;
    const skillLevelScore = avgLevel * 6;
    const topJobs = getTopJobs();
    const avgJobMatch = topJobs.length ? topJobs.reduce((acc, j) => acc + j.match, 0) / topJobs.length : 0;
    const jobMatchScore = (avgJobMatch / 100) * 20;
    const scaledAssessment = Math.round((assessmentScore / 100) * 20);
    return Math.round(skillCountScore + skillLevelScore + scaledAssessment + jobMatchScore);
  };

  // Skill source breakdown
  const sourceData = [
    { name: 'LinkedIn', value: skills.filter(s => s.source === 'LinkedIn').length, color: '#3b82f6' },
    { name: 'GitHub', value: skills.filter(s => s.source === 'GitHub').length, color: '#6b7280' },
    { name: 'Certificate', value: skills.filter(s => s.source === 'Certificate').length, color: '#eab308' },
    { name: 'Experience', value: skills.filter(s => s.source === 'Experience').length, color: '#10b981' },
    { name: 'Manual', value: skills.filter(s => s.source === 'Manual' || !s.source).length, color: '#7c3aed' },
  ].filter(d => d.value > 0);

  return (
    <section id="dashboard" className="py-20 px-6 max-w-7xl mx-auto min-h-screen">
      <h2 className="text-4xl font-bold mb-10 glow-text">Dashboard Insights</h2>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-6 text-center">
          <h3 className="text-gray-400 text-sm mb-2">Total Skills</h3>
          <div className="text-4xl font-bold text-cyan-400">{skills.length}</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-6 text-center">
          <h3 className="text-gray-400 text-sm mb-2">Best Skill</h3>
          <div className="text-4xl font-bold text-purple-500 glow-text flex flex-col items-center">
            {skills.length > 0 ? (
              <>
                <span className="text-2xl">{skills.reduce((max, s) => max.percentage > s.percentage ? max : s, skills[0]).name}</span>
                <span className="text-sm text-gray-400 mt-1">{skills.reduce((max, s) => max.percentage > s.percentage ? max : s, skills[0]).percentage}%</span>
              </>
            ) : (
              <span className="text-2xl">None</span>
            )}
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-6 text-center">
          <h3 className="text-gray-400 text-sm mb-2">Jobs Applied</h3>
          <div className="text-4xl font-bold text-cyan-400">{jobHistory.length}</div>
        </motion.div>
      </div>

      {/* Profile Summary */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={18} className="text-cyan-400" /> Profile Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Name</p>
            <p className="font-bold text-sm text-white">{userProfile.name || '—'}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Email</p>
            <p className="font-bold text-sm text-white truncate">{userProfile.email || '—'}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">LinkedIn</p>
            {userProfile.linkedin ? (
              <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-sm text-blue-400 hover:underline truncate block">Connected ✓</a>
            ) : <p className="font-bold text-sm text-gray-500">—</p>}
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">GitHub</p>
            {userProfile.github ? (
              <a href={userProfile.github.startsWith('http') ? userProfile.github : `https://github.com/${userProfile.github}`} target="_blank" rel="noopener noreferrer" className="font-bold text-sm text-white hover:underline truncate block">Connected ✓</a>
            ) : <p className="font-bold text-sm text-gray-500">—</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 p-3 rounded-lg text-center">
            <Github size={18} className="text-white mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{profileData.githubRepos?.length || 0}</p>
            <p className="text-[10px] text-gray-400">GitHub Repos</p>
          </div>
          <div className="bg-white/5 p-3 rounded-lg text-center">
            <Award size={18} className="text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{profileData.certificateFiles?.length || 0}</p>
            <p className="text-[10px] text-gray-400">Certificates</p>
          </div>
          <div className="bg-white/5 p-3 rounded-lg text-center">
            <Briefcase size={18} className="text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{profileData.experiences?.length || 0}</p>
            <p className="text-[10px] text-gray-400">Experiences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Top Job Matches */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6">Top Job Matches</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTopJobs()} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#fff', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#04091a', border: '1px solid #7c3aed' }} />
                <Bar dataKey="match" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Sources Pie */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6">Skill Sources</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#04091a', border: '1px solid #7c3aed' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Job History */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-6">Job Application History</h3>
        {jobHistory && jobHistory.length > 0 ? (
          <div className="space-y-3">
            {jobHistory.slice(0, 5).map((job, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/10">
                <div>
                  <h4 className="font-bold text-white text-sm">{job.title}</h4>
                  <p className="text-xs text-gray-400">{job.company} • {job.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  job.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                  job.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>{job.status}</span>
              </div>
            ))}
            {jobHistory.length > 5 && <a href="#history" className="text-cyan-400 text-sm hover:underline">View all →</a>}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No job applications yet. Head to Job Galaxy!</p>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
