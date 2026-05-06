export const calculateMatchScore = (userSkills, jobSkills) => {
  if (!userSkills.length || !jobSkills.length) return 0;
  
  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  const jobSkillNames = jobSkills.map(s => s.toLowerCase());
  
  const matched = jobSkillNames.filter(skill => userSkillNames.includes(skill));
  return Math.round((matched.length / jobSkillNames.length) * 100);
};

export const getMatchedAndMissingSkills = (userSkills, jobSkills) => {
  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  
  const matched = [];
  const missing = [];
  
  jobSkills.forEach(skill => {
    if (userSkillNames.includes(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });
  
  return { matched, missing };
};
