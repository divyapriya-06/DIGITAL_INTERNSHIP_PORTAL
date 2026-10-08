import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Comprehensive technical skill dictionary for matching
const TECH_TAXONOMY = {
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'golang', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'r', 'dart', 'scala', 'matlab', 'sql', 'html', 'css', 'bash', 'shell'
  ],
  frameworksAndLibraries: [
    'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'vuejs', 'angular', 'next.js', 'nextjs', 'node.js', 'nodejs', 'express', 'express.js', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'asp.net', 'laravel', 'flutter', 'react native', 'tailwind', 'tailwindcss', 'bootstrap', 'redux', 'graphql', 'rest api', 'prisma', 'hibernate'
  ],
  databases: [
    'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'oracle', 'cassandra', 'dynamodb', 'firebase', 'supabase', 'mariadb', 'neo4j'
  ],
  cloudAndDevops: [
    'aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'k8s', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd', 'linux', 'terraform', 'nginx', 'apache', 'ansible'
  ],
  aiAndData: [
    'machine learning', 'deep learning', 'nlp', 'natural language processing', 'computer vision', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'opencv', 'keras', 'llm', 'generative ai', 'transformers', 'bert', 'tableau', 'power bi', 'data analysis', 'data science'
  ],
  roles: [
    'frontend developer', 'backend developer', 'full stack developer', 'software engineer', 'web developer', 'mobile developer', 'data scientist', 'machine learning engineer', 'ai engineer', 'devops engineer', 'cloud engineer', 'qa engineer', 'ui/ux designer', 'database administrator'
  ]
};

/**
 * Extract raw text from uploaded resume (PDF or DOCX)
 */
export const extractResumeText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || '';
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } else {
      // Plain text fallback
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error.message);
    throw new Error(`Failed to extract text from resume: ${error.message}`);
  }
};

/**
 * Parse structured entities from extracted resume text
 */
export const parseResumeEntities = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      skills: [],
      programmingLanguages: [],
      frameworks: [],
      tools: [],
      roles: [],
      education: '',
      projects: [],
    };
  }

  const lowerText = text.toLowerCase();

  // Extract matched skills
  const extractedSkills = new Set();
  const programmingLanguages = new Set();
  const frameworks = new Set();
  const tools = new Set();
  const roles = new Set();

  // Match languages
  TECH_TAXONOMY.languages.forEach(lang => {
    const regex = new RegExp(`\\b${lang.replace('+', '\\+').replace('#', '\\#')}\\b`, 'i');
    if (regex.test(lowerText)) {
      programmingLanguages.add(lang.toUpperCase() === 'C' ? 'C' : lang.charAt(0).toUpperCase() + lang.slice(1));
      extractedSkills.add(lang);
    }
  });

  // Match frameworks
  TECH_TAXONOMY.frameworksAndLibraries.forEach(fw => {
    const regex = new RegExp(`\\b${fw.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(lowerText)) {
      frameworks.add(fw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      extractedSkills.add(fw);
    }
  });

  // Match databases and cloud/devops as tools
  [...TECH_TAXONOMY.databases, ...TECH_TAXONOMY.cloudAndDevops].forEach(tool => {
    const regex = new RegExp(`\\b${tool}\\b`, 'i');
    if (regex.test(lowerText)) {
      tools.add(tool.toUpperCase());
      extractedSkills.add(tool);
    }
  });

  // Match AI / Data
  TECH_TAXONOMY.aiAndData.forEach(ai => {
    const regex = new RegExp(`\\b${ai}\\b`, 'i');
    if (regex.test(lowerText)) {
      extractedSkills.add(ai);
    }
  });

  // Match roles
  TECH_TAXONOMY.roles.forEach(role => {
    if (lowerText.includes(role)) {
      roles.add(role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });

  // Detect education snippet
  let education = '';
  const eduKeywords = ['b.e', 'b.tech', 'm.tech', 'mca', 'bca', 'b.sc', 'm.sc', 'bachelor', 'master', 'cgpa', 'degree'];
  for (const keyword of eduKeywords) {
    if (lowerText.includes(keyword)) {
      education = keyword.toUpperCase();
      break;
    }
  }

  // Detect project headers or mentions
  const extractedProjects = [];
  const projectLines = text.split('\n').filter(line => {
    const l = line.toLowerCase();
    return (l.includes('project') || l.includes('developed') || l.includes('built')) && line.trim().length > 10;
  }).slice(0, 5);

  projectLines.forEach(line => extractedProjects.push(line.trim()));

  return {
    skills: Array.from(extractedSkills),
    programmingLanguages: Array.from(programmingLanguages),
    frameworks: Array.from(frameworks),
    tools: Array.from(tools),
    roles: Array.from(roles),
    education,
    projects: extractedProjects,
  };
};
