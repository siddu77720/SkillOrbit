import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { getJobListings } from '../utils/jobData';
import { calculateMatchScore, getMatchedAndMissingSkills } from '../utils/skillMatcher';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import * as THREE from 'three';

// CORS-safe texture (earth blue marble — tinted gray to look like moon)
const MOON_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

// Realistic Moon in the center
const Moon = () => {
  const ref = useRef();
  const texture = useTexture(MOON_TEXTURE);

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
};

// Clickable job star — slow orbit, bigger click area
const JobStar = ({ job, index, total, onClick, showLabels }) => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  // Spread stars evenly in a ring
  const orbitRadius = 10 + (index % 3) * 3;
  const startAngle = (index / total) * Math.PI * 2;
  const yOffset = ((index % 5) - 2) * 1.2;

  useFrame(({ clock }) => {
    // Medium orbit — not too fast, not too slow
    const t = clock.getElapsedTime() * 0.035 + startAngle;
    ref.current.position.x = Math.cos(t) * orbitRadius;
    ref.current.position.z = Math.sin(t) * orbitRadius;
    ref.current.position.y = yOffset + Math.sin(t * 0.5) * 0.3;
  });

  return (
    <group ref={ref}>
      {/* Invisible larger click target */}
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* Visible tiny bright core */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={hovered ? 0.4 : 0.2} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Label */}
      {showLabels && (
        <Html distanceFactor={22} center zIndexRange={[100, 0]} position={[0, 0.9, 0]}>
          <div
            className="whitespace-nowrap text-center cursor-pointer"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <p className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all ${hovered ? 'bg-white/20 border-white/40 text-white' : 'bg-black/50 border-white/10 text-white/80'}`}>
              {job.title}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};

const GalaxyMap = () => {
  const { skills, addJobToHistory, updateJobStatus } = useStore();
  const [selectedJob, setSelectedJob] = useState(null);

  const handleApply = () => {
    const id = Date.now();
    addJobToHistory({ ...selectedJob, id }, 'Pending Review');
    setTimeout(() => {
      const result = Math.random() > 0.4 ? 'Approved' : 'Rejected';
      updateJobStatus(id, result);
    }, 3000);
    alert(`Applied to ${selectedJob.title} at ${selectedJob.company}! Status will update shortly.`);
    setSelectedJob(null);
  };

  const jobsData = useMemo(() => {
    const listings = getJobListings(skills);
    return listings.map((job) => {
      const matchScore = calculateMatchScore(skills, job.skills);
      return { ...job, matchScore };
    });
  }, [skills]);

  return (
    <section id="galaxymap" className="relative h-screen w-full bg-[#020810] overflow-hidden">
      <div className="absolute top-20 left-10 z-10">
        <h2 className="text-4xl font-bold glow-text mb-2">Job Galaxy</h2>
        <p className="text-gray-400 text-sm">Click on any star to view job details</p>
      </div>

      <Canvas camera={{ position: [0, 8, 20], fov: 55 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-8, -3, -5]} intensity={0.6} color="#8899bb" />
        <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.2} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={!selectedJob}
          autoRotateSpeed={0.15}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
        />

        <React.Suspense fallback={<Html center className="text-white text-xl">Loading Galaxy...</Html>}>
          <Moon />

          {jobsData.map((job, idx) => (
            <JobStar
              key={job.id}
              job={job}
              index={idx}
              total={jobsData.length}
              showLabels={!selectedJob}
              onClick={(e) => {
                if (e?.stopPropagation) e.stopPropagation();
                setSelectedJob(job);
              }}
            />
          ))}
        </React.Suspense>
      </Canvas>

      {/* Selected Job Detail Panel */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-6 w-96 max-w-[calc(100vw-3rem)] glass-card p-6 border-l-4 overflow-y-auto max-h-[80vh]"
            style={{ borderLeftColor: selectedJob.matchScore >= 80 ? '#ffd700' : selectedJob.matchScore >= 50 ? '#60a5fa' : '#ff6b35' }}
          >
            <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Briefcase className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedJob.title}</h3>
                <p className="text-gray-400">{selectedJob.company}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-gray-400">Match Score</span>
                <span className="text-2xl font-bold" style={{ color: selectedJob.matchScore >= 80 ? '#ffd700' : selectedJob.matchScore >= 50 ? '#60a5fa' : '#ff6b35' }}>
                  {selectedJob.matchScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedJob.matchScore}%` }}
                  className="h-full"
                  style={{ backgroundColor: selectedJob.matchScore >= 80 ? '#ffd700' : selectedJob.matchScore >= 50 ? '#60a5fa' : '#ff6b35' }}
                />
              </div>
            </div>

            {(() => {
              const { matched, missing } = getMatchedAndMissingSkills(skills, selectedJob.skills);
              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" /> Matched ({matched.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matched.map(s => <span key={s} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">{s}</span>)}
                      {matched.length === 0 && <span className="text-xs text-gray-500">None</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-400" /> Missing ({missing.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {missing.map(s => <span key={s} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">{s}</span>)}
                      {missing.length === 0 && <span className="text-xs text-green-500">You have all required skills!</span>}
                    </div>
                  </div>
                </div>
              );
            })()}

            <button onClick={handleApply} className="btn-primary w-full mt-6">Apply Now</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GalaxyMap;
