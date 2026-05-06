import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProfileInput from './components/ProfileInput';
import Dashboard from './components/Dashboard';
import SkillScore from './components/SkillScore';
import SkillInput from './components/SkillInput';
import GalaxyMap from './components/GalaxyMap';
import DreamJobMode from './components/DreamJobMode';
import Assessment from './components/Assessment';
import ProjectRecommendations from './components/ProjectRecommendations';
import ResumeUpload from './components/ResumeUpload';
import CareerPath from './components/CareerPath';
import History from './components/History';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import { useStore } from './store/useStore';

function App() {
  const { isLoggedIn } = useStore();

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <ProfileInput />
      <Assessment />
      <SkillInput />
      <Dashboard />
      <SkillScore />
      <GalaxyMap />
      <DreamJobMode />
      <ProjectRecommendations />
      <ResumeUpload />
      <CareerPath />
      <History />
      <AIAssistant />
    </div>
  );
}

export default App;
