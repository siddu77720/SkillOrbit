import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      userProfile: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', location: '', certificates: '', experience: '', summary: '', experienceYears: 'Fresher' },
      login: (profile) => set((state) => ({ isLoggedIn: true, userProfile: { ...state.userProfile, ...profile } })),
      updateUserProfile: (data) => set((state) => ({ userProfile: { ...state.userProfile, ...data } })),

      // Skills with source tracking
      skills: [],
      addSkill: (skill) => set((state) => {
        if (state.skills.find(s => s.name.toLowerCase() === skill.name.toLowerCase())) return state;
        const source = skill.source || 'Manual';
        let percentage = 50;
        if (source === 'LinkedIn') percentage = Math.floor(Math.random() * 20) + 60; // 60-80
        if (source === 'GitHub') percentage = Math.floor(Math.random() * 20) + 70; // 70-90
        if (source === 'Experience') percentage = Math.floor(Math.random() * 15) + 85; // 85-100
        return { skills: [...state.skills, { ...skill, percentage, source }] };
      }),
      removeSkill: (skillName) => set((state) => ({
        skills: state.skills.filter(s => s.name !== skillName)
      })),
      updateSkillLevel: (skillName, percentage) => set((state) => ({
        skills: state.skills.map(s => s.name === skillName ? { ...s, percentage } : s)
      })),

      // Assessment (Independent)
      assessmentScore: 0,
      setAssessmentScore: (score) => {
        set((state) => ({
          assessmentScore: score
        }));
      },

      // Job History
      jobHistory: [],
      addJobToHistory: (job, status) => set((state) => ({
        jobHistory: [{ ...job, status, date: new Date().toLocaleDateString(), id: Date.now() }, ...state.jobHistory]
      })),
      updateJobStatus: (id, status) => set((state) => ({
        jobHistory: state.jobHistory.map(j => j.id === id ? { ...j, status } : j)
      })),

      // Profile Data from sources
      profileData: { linkedinSkills: [], githubRepos: [], certificateFiles: [], experiences: [] },
      setProfileData: (data) => set((state) => ({ profileData: { ...state.profileData, ...data } })),

      // Activity Feed
      activityFeed: [],
      addActivity: (msg) => set((state) => ({ activityFeed: [{ msg, time: new Date().toLocaleTimeString() }, ...state.activityFeed].slice(0, 20) })),

      // Dream Job
      dreamJob: null,
      dreamJobPath: null,
      setDreamJob: (job) => set({ dreamJob: job }),
      setDreamJobPath: (path) => set({ dreamJobPath: path }),

      // AI Trigger
      aiPromptEvent: null,
      aiPromptText: '',
      triggerAI: (prompt) => set({ aiPromptEvent: prompt ? Date.now() : null, aiPromptText: prompt || '' }),
    }),
    {
      name: 'skillorbit-storage',
    }
  )
);
