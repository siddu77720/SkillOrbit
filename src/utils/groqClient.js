const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

async function fetchGroq(prompt, systemMessage = "You are an expert career counselor and technical AI assistant. Return only valid JSON.") {
  if (!API_KEY) {
    console.warn("Groq API key is missing. Using mock data.");
    return null;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API Error Details:", errText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error communicating with Groq API:", error);
    return null;
  }
}

export const groqClient = {
  analyzeSkills: async (skillsArray) => {
    const prompt = `Analyze these skills: ${skillsArray.join(', ')}. Return a JSON object with two keys: "skillGaps" (array of strings, missing complementary skills) and "recommendations" (array of strings, next steps to improve).`;
    const res = await fetchGroq(prompt);
    return res || { skillGaps: ["Cloud Computing", "CI/CD"], recommendations: ["Learn AWS basics", "Build a full-stack project"] };
  },

  analyzeLinkedinUrl: async (linkedinUrl, userName, aboutText) => {
    let prompt;
    if (aboutText && aboutText.trim().length > 10) {
      prompt = `A user named "${userName || 'unknown'}" shared their LinkedIn profile.
URL: ${linkedinUrl || 'not provided'}
Their LinkedIn About/Summary section text: "${aboutText}"

Based on this REAL profile text, extract the actual skills, role, and experience. Do NOT invent any skills that aren't mentioned or implied in the text.
Return JSON with keys: "role" (string, their job title from the text), "years" (number, years of experience mentioned or inferred), "skills" (array of objects with "name" and "percentage" between 60-98 representing confidence/proficiency based on text prominence).`;
    } else {
      prompt = `A user named "${userName || 'unknown'}" shared their LinkedIn profile URL: ${linkedinUrl}. We cannot scrape it, so DO NOT invent skills. Return JSON with keys: "role" (string, guess based on URL slug if possible, else "Professional"), "years" (number, 0), "skills" (an empty array [] - extremely important to return empty if no text is provided).`;
    }
    const res = await fetchGroq(prompt);
    return res || { role: "Unknown", years: 0, skills: [] };
  },

  extractSkillsFromText: async (text) => {
    const prompt = `Extract all technical skills, programming languages, frameworks, tools, and professional skills mentioned in this text: "${text}". Return JSON with a key "skills" which is an array of objects containing "name" (string) and "percentage" (number 60-98, estimating proficiency based on how deep the experience sounds). Only include skills explicitly mentioned.`;
    const res = await fetchGroq(prompt);
    return res || { skills: [] };
  },

  extractSkillsFromProfile: async (profile) => {
    const prompt = `Extract a list of technical and soft skills from the following profile data: LinkedIn: ${profile.linkedin}, GitHub: ${profile.github}, Experience: ${profile.experience}, Certificates: ${profile.certificates}. Return a JSON object with a key "skills" which is an array of strings representing the extracted skills.`;
    const res = await fetchGroq(prompt);
    return res || { skills: [] };
  },
  
  generateLearningPath: async (missingSkills) => {
    const prompt = `Generate a learning path for these missing skills: ${missingSkills.join(', ')}. Return a JSON object with a key "courses" which is an array of objects containing "title", "platform", and "duration".`;
    const res = await fetchGroq(prompt);
    return res || { courses: [] };
  },

  getDreamJobPath: async (targetJob, currentSkills) => {
    const prompt = `User wants to be a ${targetJob} and currently knows: ${currentSkills.join(', ')}. Create a step-by-step roadmap. Return a JSON object with keys: "requiredSkills" (array of strings), "missingSkills" (array of objects with "skill" and "priority" High/Medium/Low), and "roadmap" (array of objects with "month", "skill", "resource", "url" (MUST be EXACTLY a search link format like "https://www.coursera.org/search?query=Skill+Name" or "https://www.udemy.com/courses/search/?q=Skill+Name" to guarantee it works. DO NOT make up direct course links.), "estimatedTime").`;
    const res = await fetchGroq(prompt);
    return res || {
      requiredSkills: [],
      missingSkills: [],
      roadmap: []
    };
  },

  getProjectRecommendations: async (skills) => {
    const prompt = `User has these skills: ${skills.join(', ')}. Recommend 5 project ideas to build. Return JSON with a key "projects", an array of objects containing "name", "emoji", "description" (2 lines), "techStack" (array), "difficulty" (Beginner/Intermediate/Advanced), and "estimatedTime".`;
    const res = await fetchGroq(prompt);
    return res || { projects: [] };
  },

  generateAssessment: async (skills) => {
    const prompt = `User has these skills: ${skills.join(', ')}. Generate exactly 10 simple, beginner-friendly multiple-choice assessment questions covering these basic concepts. Return JSON with a key "questions", an array of objects containing "id" (number 1-10), "question" (string), "options" (array of exactly 4 strings), and "correctAnswer" (index 0-3).`;
    const res = await fetchGroq(prompt);
    return res || {
      questions: [
        { id: 1, question: "What is a core feature of the technologies you use?", options: ["A", "B", "C", "D"], correctAnswer: 0 }
      ]
    };
  },

  generateResume: async (profile, skills, jobGoal) => {
    const prompt = `Generate a professional resume for:
Name: ${profile.name}
Email: ${profile.email}
Target Job: ${jobGoal}
Experience: ${profile.experienceYears || 'Fresher'}
About: ${profile.summary || 'Not provided'}
Skills: ${skills.join(', ')}

Rules:
1. Use ONLY the provided information — do NOT invent fake companies or past experiences
2. The "summary" must be tailored for the "${jobGoal}" role
3. "experience" entries should describe what the user CAN do with their skills (as project work), not fake jobs
4. Return JSON with keys: "summary" (string, 2-3 sentences), "coreCompetencies" (array of strings), "experience" (array of objects with "title", "context", "bullets" array)`;
    const res = await fetchGroq(prompt);
    return res || null;
  },

  chatWithAssistant: async (message, context) => {
    // Note: For chat, we might not want strict JSON if it's just text
    if (!API_KEY) {
      return "Hi! Please add your Groq API Key to chat with me. I'm currently in demo mode.";
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: `You are an AI career coach for a platform called SkillOrbit. The user has these skills: ${context.join(', ')}. Keep answers brief and helpful.` },
            { role: 'user', content: message }
          ]
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      return "Sorry, I am having trouble connecting right now.";
    }
  }
};
