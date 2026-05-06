import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, Briefcase } from 'lucide-react';

const FILTERS = ['All', 'Approved', 'Pending', 'Rejected'];

const History = () => {
  const { jobHistory } = useStore();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? jobHistory : jobHistory.filter(j => j.status?.includes(filter));

  const approved = jobHistory.filter(j => j.status === 'Approved').length;
  const pending = jobHistory.filter(j => j.status?.includes('Pending')).length;
  const rejected = jobHistory.filter(j => j.status === 'Rejected').length;

  return (
    <section id="history" className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 glow-text">Application History</h2>
        <p className="text-gray-400">Track all your job applications in one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-6 text-center">
          <h3 className="text-gray-400 text-sm mb-1">Applied</h3>
          <div className="text-3xl font-bold text-cyan-400">{jobHistory.length}</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-6 text-center">
          <h3 className="text-gray-400 text-sm mb-1">Approved</h3>
          <div className="text-3xl font-bold text-green-400">{approved}</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-6 text-center">
          <h3 className="text-gray-400 text-sm mb-1">Rejected</h3>
          <div className="text-3xl font-bold text-red-400">{rejected}</div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No applications yet. Start applying from Job Galaxy!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((job, idx) => (
              <motion.div
                key={job.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <Briefcase className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{job.title}</h4>
                    <p className="text-sm text-gray-400">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {job.date}</p>
                    {job.matchScore !== undefined && <p className="text-xs text-cyan-400 mt-1">{job.matchScore}% match</p>}
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                    job.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                    job.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {job.status === 'Approved' && <CheckCircle size={12} />}
                    {job.status === 'Rejected' && <XCircle size={12} />}
                    {job.status?.includes('Pending') && <AlertCircle size={12} />}
                    {job.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};

export default History;
