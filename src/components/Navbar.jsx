import React, { useState } from 'react';
import { Menu, X, Orbit, LogOut, UserCog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { userProfile, updateUserProfile } = useStore();

  const [editForm, setEditForm] = useState({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    location: userProfile.location || '',
  });

  const handleLogout = () => {
    localStorage.removeItem('skillorbit-storage');
    window.location.reload();
  };

  const openEditModal = () => {
    setEditForm({
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      location: userProfile.location || '',
    });
    setShowEditModal(true);
    setIsOpen(false);
  };

  const handleSaveProfile = () => {
    updateUserProfile(editForm);
    setShowEditModal(false);
  };

  const links = [
    { name: 'Home', href: '#home' },
    { name: 'Assessment', href: '#assessment' },
    { name: 'Skills', href: '#skills' },
    { name: 'Dashboard', href: '#dashboard' },
    { name: 'Galaxy', href: '#galaxymap' },
    { name: 'Dream Job', href: '#dreamjob' },
    { name: 'Projects', href: '#projects' },
    { name: 'Resume', href: '#resume' },
    { name: 'Career', href: '#careerpath' },
    { name: 'History', href: '#history' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b border-white/10 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl font-bold glow-text">
            <Orbit className="text-purple-500 w-7 h-7" />
            SkillOrbit
          </div>
          
          <div className="hidden xl:flex gap-5 items-center">
            {links.map(link => (
              <a key={link.name} href={link.href} className="text-white/80 hover:text-cyan-400 transition-all text-[15px] font-medium">
                {link.name}
              </a>
            ))}
            <button onClick={openEditModal} className="ml-1 flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-[14px] font-semibold transition-colors border border-cyan-500/30">
              <UserCog size={16} /> Edit Profile
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg text-[14px] font-semibold transition-colors border border-red-500/30">
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <button onClick={openEditModal} className="flex items-center gap-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm border border-cyan-500/30">
              <UserCog size={16} />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/30">
              <LogOut size={16} />
            </button>
            <button className="text-white" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="xl:hidden absolute top-full left-0 w-full glass-card p-4 flex flex-col gap-4"
            >
              {links.map(link => (
                <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-white hover:text-cyan-400 text-base">
                  {link.name}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 w-full max-w-md border border-purple-500/30 shadow-[0_0_40px_rgba(124,58,237,0.2)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCog size={20} className="text-cyan-400" /> Edit Profile
                </h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="City, Country"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleSaveProfile} className="btn-primary flex-1">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
