// Base job templates - these get dynamically augmented based on user skills
const baseJobs = [
  { id:1, title:"Frontend Developer", company:"TechCorp", skills:["React","JavaScript","CSS","HTML","Git"] },
  { id:2, title:"Data Analyst", company:"DataFlow Inc", skills:["Python","SQL","Excel","Tableau","Statistics"] },
  { id:3, title:"ML Engineer", company:"AI Labs", skills:["Python","Machine Learning","TensorFlow","SQL","Docker"] },
  { id:4, title:"UX Designer", company:"DesignStudio", skills:["Figma","User Research","Prototyping","CSS"] },
  { id:5, title:"Backend Developer", company:"ServerSide Co", skills:["Node.js","Express","MongoDB","Docker","AWS"] },
  { id:6, title:"DevOps Engineer", company:"CloudOps", skills:["AWS","Docker","Kubernetes","Linux","CI/CD"] },
  { id:7, title:"Full Stack Developer", company:"StartupXYZ", skills:["React","Node.js","MongoDB","JavaScript","Git"] },
  { id:8, title:"Business Analyst", company:"BizConsult", skills:["Excel","SQL","PowerBI","Communication","JIRA"] },
  { id:9, title:"Android Developer", company:"MobileFirst", skills:["Java","Kotlin","Android SDK","Git","Firebase"] },
  { id:10, title:"Cloud Architect", company:"CloudMasters", skills:["AWS","Azure","Docker","Kubernetes","Terraform"] },
];

// Dynamic job generation based on user skills
const SKILL_TO_ROLES = {
  'React': [
    { title: 'React Developer', company: 'ReactWorks', extraSkills: ['JavaScript', 'CSS', 'TypeScript'] },
    { title: 'Frontend Engineer', company: 'WebUI Labs', extraSkills: ['HTML', 'CSS', 'Git'] },
  ],
  'Python': [
    { title: 'Python Developer', company: 'PyTech Solutions', extraSkills: ['Django', 'SQL', 'Git'] },
    { title: 'Data Scientist', company: 'DataMind AI', extraSkills: ['Machine Learning', 'TensorFlow', 'SQL'] },
  ],
  'Node.js': [
    { title: 'Node.js Developer', company: 'BackendPro', extraSkills: ['Express', 'MongoDB', 'Docker'] },
    { title: 'API Engineer', company: 'APIFirst Inc', extraSkills: ['JavaScript', 'Git', 'AWS'] },
  ],
  'Java': [
    { title: 'Java Developer', company: 'JavaSoft', extraSkills: ['Spring', 'SQL', 'Git'] },
    { title: 'Enterprise Engineer', company: 'EntSystems', extraSkills: ['Kubernetes', 'Docker', 'CI/CD'] },
  ],
  'AWS': [
    { title: 'AWS Solutions Architect', company: 'CloudFirst', extraSkills: ['Docker', 'Terraform', 'Linux'] },
  ],
  'Docker': [
    { title: 'Platform Engineer', company: 'ContainerCo', extraSkills: ['Kubernetes', 'Linux', 'CI/CD'] },
  ],
  'Machine Learning': [
    { title: 'ML Research Engineer', company: 'DeepLearn Lab', extraSkills: ['Python', 'TensorFlow', 'SQL'] },
    { title: 'AI Product Engineer', company: 'IntelliAI', extraSkills: ['Python', 'Docker', 'Git'] },
  ],
  'TypeScript': [
    { title: 'TypeScript Engineer', company: 'TypeSafe Inc', extraSkills: ['React', 'Node.js', 'Git'] },
  ],
  'SQL': [
    { title: 'Database Engineer', company: 'DataCore', extraSkills: ['MongoDB', 'Python', 'Linux'] },
  ],
  'Figma': [
    { title: 'UI/UX Designer', company: 'PixelPerfect', extraSkills: ['CSS', 'Prototyping', 'User Research'] },
    { title: 'Product Designer', company: 'DesignHub', extraSkills: ['HTML', 'CSS', 'Communication'] },
  ],
  'Flutter': [
    { title: 'Flutter Developer', company: 'CrossApp Inc', extraSkills: ['Dart', 'Firebase', 'Git'] },
  ],
  'C++': [
    { title: 'Systems Programmer', company: 'LowLevel Labs', extraSkills: ['Linux', 'Git'] },
  ],
  'MongoDB': [
    { title: 'Database Administrator', company: 'NoSQLPro', extraSkills: ['Node.js', 'Docker', 'AWS'] },
  ],
};

export function getJobListings(userSkills = []) {
  const skillNames = userSkills.map(s => typeof s === 'string' ? s : s.name);
  const dynamicJobs = [];
  let nextId = 100;

  skillNames.forEach(skill => {
    const roles = SKILL_TO_ROLES[skill];
    if (roles) {
      roles.forEach(role => {
        // Don't add duplicate titles
        if (!dynamicJobs.find(j => j.title === role.title) && !baseJobs.find(j => j.title === role.title)) {
          dynamicJobs.push({
            id: nextId++,
            title: role.title,
            company: role.company,
            skills: [skill, ...role.extraSkills],
          });
        }
      });
    }
  });

  return [...baseJobs, ...dynamicJobs];
}

// Keep backward compat
export const jobListings = baseJobs;
