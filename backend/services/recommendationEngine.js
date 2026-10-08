import { tokenize, computeIDF, computeTFIDFVector, computeCosineSimilarity } from './textProcessor.js';

// Configurable scoring weights
export const RECOMMENDATION_WEIGHTS = {
  skillWeight: 0.40,
  roleWeight: 0.20,
  semanticWeight: 0.15,
  projectWeight: 0.10,
  experienceWeight: 0.05,
  locationWeight: 0.05,
  domainWeight: 0.05,
};

/**
 * Clean & normalize a string or skill tag
 */
const normalizeText = (str) => (str || '').toLowerCase().trim();

/**
 * Check if two skill strings match or overlap
 */
const matchSkill = (candidateSkill, targetSkill) => {
  const s1 = normalizeText(candidateSkill);
  const s2 = normalizeText(targetSkill);
  if (s1 === s2) return true;
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Aliases
  const aliases = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'react.js': 'react',
    'reactjs': 'react',
    'node.js': 'node',
    'nodejs': 'node',
    'express.js': 'express',
    'k8s': 'kubernetes',
    'postgres': 'postgresql',
    'aws': 'amazon web services',
    'gcp': 'google cloud',
    'ai': 'artificial intelligence',
    'ml': 'machine learning',
  };

  const a1 = aliases[s1] || s1;
  const a2 = aliases[s2] || s2;
  return a1 === a2 || a1.includes(a2) || a2.includes(a1);
};

/**
 * Compute AI Match Score & Explanation between a Student and an Internship
 */
export const calculateStudentInternshipMatch = (student, internship, globalIDF) => {
  // 1. Combine student skills (from manual inputs + parsed resume)
  const studentSkills = new Set([
    ...(student.technicalSkills || []).map(normalizeText),
    ...(student.programmingLanguages || []).map(normalizeText),
    ...(student.frameworks || []).map(normalizeText),
    ...(student.tools || []).map(normalizeText),
    ...(student.resumeExtractedSkills || []).map(normalizeText),
  ]);

  const requiredSkills = (internship.requiredSkills || []).map(normalizeText);
  const preferredSkills = (internship.preferredSkills || []).map(normalizeText);

  // 2. Skill Matching Factor (40%)
  const matchedRequiredSkills = [];
  const missingRequiredSkills = [];

  requiredSkills.forEach(reqSkill => {
    let matched = false;
    for (const studSkill of studentSkills) {
      if (matchSkill(studSkill, reqSkill)) {
        matched = true;
        break;
      }
    }
    if (matched) {
      matchedRequiredSkills.push(reqSkill);
    } else {
      missingRequiredSkills.push(reqSkill);
    }
  });

  const matchedPreferredSkills = [];
  preferredSkills.forEach(prefSkill => {
    for (const studSkill of studentSkills) {
      if (matchSkill(studSkill, prefSkill)) {
        matchedPreferredSkills.push(prefSkill);
        break;
      }
    }
  });

  const totalRequired = requiredSkills.length || 1;
  const skillMatchRatio = (matchedRequiredSkills.length / totalRequired) * 0.85 + 
    ((matchedPreferredSkills.length / (preferredSkills.length || 1)) * 0.15);
  const skillScore = Math.min(1.0, skillMatchRatio);

  // 3. Role Match Factor (20%)
  let roleScore = 0;
  const studentRole = normalizeText(student.preferredRole);
  const internshipRole = normalizeText(internship.role);
  if (studentRole && (studentRole === internshipRole || internshipRole.includes(studentRole) || studentRole.includes(internshipRole))) {
    roleScore = 1.0;
  } else if (studentRole && student.resumeExtractedRoles && student.resumeExtractedRoles.some(r => normalizeText(r).includes(internshipRole))) {
    roleScore = 0.8;
  } else {
    // Partial token overlap
    const roleTokensStud = tokenize(studentRole);
    const roleTokensJob = tokenize(internshipRole);
    const overlap = roleTokensStud.filter(t => roleTokensJob.includes(t));
    if (overlap.length > 0) {
      roleScore = 0.5;
    }
  }

  // 4. Semantic Resume / JD TF-IDF Cosine Similarity Factor (15%)
  const studentDocText = [
    student.bio || '',
    student.resumeExtractedText || '',
    (student.projects || []).map(p => `${p.title} ${p.description} ${(p.technologies || []).join(' ')}`).join(' '),
    Array.from(studentSkills).join(' ')
  ].join(' ');

  const internshipDocText = [
    internship.role || '',
    internship.domain || '',
    internship.description || '',
    (internship.requiredSkills || []).join(' '),
    (internship.preferredSkills || []).join(' '),
  ].join(' ');

  const studTokens = tokenize(studentDocText);
  const jobTokens = tokenize(internshipDocText);

  let semanticScore = 0;
  if (globalIDF) {
    const studVec = computeTFIDFVector(studTokens, globalIDF);
    const jobVec = computeTFIDFVector(jobTokens, globalIDF);
    semanticScore = computeCosineSimilarity(studVec, jobVec);
  } else {
    // Quick token Jaccard similarity fallback
    const setA = new Set(studTokens);
    const setB = new Set(jobTokens);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    semanticScore = intersection.size / (setA.size + setB.size - intersection.size || 1);
  }

  // 5. Project Relevance Factor (10%)
  let projectScore = 0;
  let matchingProjectTitle = null;
  if (student.projects && student.projects.length > 0) {
    for (const project of student.projects) {
      const projTokens = tokenize(`${project.title} ${project.description} ${(project.technologies || []).join(' ')}`);
      const matchedTokens = projTokens.filter(t => jobTokens.includes(t));
      if (matchedTokens.length >= 2) {
        projectScore = Math.max(projectScore, 0.9);
        matchingProjectTitle = project.title;
      } else if (matchedTokens.length === 1) {
        projectScore = Math.max(projectScore, 0.5);
        if (!matchingProjectTitle) matchingProjectTitle = project.title;
      }
    }
  }

  // 6. Experience Match Factor (5%)
  let experienceScore = 0.7; // default good score for freshers
  if (internship.experienceRequired === 'FRESHER' || internship.experienceRequired === 'ANY') {
    experienceScore = 1.0;
  } else if (student.experienceLevel === 'INTERMEDIATE' || (student.experiences && student.experiences.length > 0)) {
    experienceScore = 1.0;
  }

  // 7. Location Preference Match (5%)
  let locationScore = 0.2;
  const jobLoc = normalizeText(internship.location);
  const prefLocs = (student.preferredLocations || []).map(normalizeText);
  const studLoc = normalizeText(student.location);

  if (internship.workMode === 'REMOTE' || student.preferredWorkMode === 'REMOTE') {
    locationScore = 1.0;
  } else if (prefLocs.includes(jobLoc) || studLoc.includes(jobLoc) || jobLoc.includes(studLoc)) {
    locationScore = 1.0;
  } else if (student.preferredWorkMode === internship.workMode) {
    locationScore = 0.8;
  }

  // 8. Domain Preference Match (5%)
  let domainScore = 0.3;
  const studDomain = normalizeText(student.preferredDomain);
  const jobDomain = normalizeText(internship.domain);
  if (studDomain && (studDomain === jobDomain || jobDomain.includes(studDomain) || studDomain.includes(jobDomain))) {
    domainScore = 1.0;
  }

  // Final Weighted Match Calculation
  const rawWeightedScore = (
    skillScore * RECOMMENDATION_WEIGHTS.skillWeight +
    roleScore * RECOMMENDATION_WEIGHTS.roleWeight +
    semanticScore * RECOMMENDATION_WEIGHTS.semanticWeight +
    projectScore * RECOMMENDATION_WEIGHTS.projectWeight +
    experienceScore * RECOMMENDATION_WEIGHTS.experienceWeight +
    locationScore * RECOMMENDATION_WEIGHTS.locationWeight +
    domainScore * RECOMMENDATION_WEIGHTS.domainWeight
  );

  // Normalize final match percentage into 0 - 100 integer
  const finalMatchPercentage = Math.min(99, Math.max(35, Math.round(rawWeightedScore * 100)));

  // Generate Explainable AI "Why this internship?" reasoning
  const explainableReasons = [];

  // Skill explanation
  if (matchedRequiredSkills.length > 0) {
    explainableReasons.push(`Matched ${matchedRequiredSkills.length} of ${internship.requiredSkills.length} required skills (${matchedRequiredSkills.slice(0, 3).join(', ')}${matchedRequiredSkills.length > 3 ? '...' : ''})`);
  } else {
    explainableReasons.push(`Good foundational match for learning ${internship.requiredSkills.slice(0, 2).join(', ')}`);
  }

  // Role match explanation
  if (roleScore >= 0.8) {
    explainableReasons.push(`Direct match with your preferred role "${student.preferredRole || internship.role}"`);
  }

  // Project match explanation
  if (matchingProjectTitle) {
    explainableReasons.push(`Relevant academic project detected: "${matchingProjectTitle}"`);
  }

  // Semantic similarity explanation
  if (semanticScore > 0.3) {
    explainableReasons.push(`High semantic alignment between your resume profile and job description`);
  }

  // Location / Mode explanation
  if (internship.workMode === 'REMOTE') {
    explainableReasons.push(`Flexible Remote work opportunity`);
  } else if (locationScore >= 0.8) {
    explainableReasons.push(`Location matches your preferred area (${internship.location})`);
  }

  // Experience explanation
  if (experienceScore === 1.0) {
    explainableReasons.push(`Meets experience criteria (${internship.experienceRequired})`);
  }

  return {
    matchPercentage: finalMatchPercentage,
    scores: {
      skillScore: Math.round(skillScore * 100),
      roleScore: Math.round(roleScore * 100),
      semanticScore: Math.round(semanticScore * 100),
      projectScore: Math.round(projectScore * 100),
      experienceScore: Math.round(experienceScore * 100),
      locationScore: Math.round(locationScore * 100),
      domainScore: Math.round(domainScore * 100),
    },
    matchedSkills: matchedRequiredSkills,
    missingSkills: missingRequiredSkills,
    matchedPreferredSkills,
    explainableReasons,
  };
};

/**
 * Get Top 10 Recommended Internships for a Student
 */
export const rankInternshipsForStudent = (student, internships, limit = 50) => {
  // Build corpus for TF-IDF IDF computation
  const corpus = internships.map(job => tokenize([
    job.role,
    job.domain,
    job.description,
    (job.requiredSkills || []).join(' '),
    (job.preferredSkills || []).join(' ')
  ].join(' ')));

  const globalIDF = computeIDF(corpus);

  const scoredInternships = internships.map(internship => {
    const matchAnalysis = calculateStudentInternshipMatch(student, internship, globalIDF);
    
    // Clone internship doc without private fields
    const safeInternship = internship.toObject ? internship.toObject() : { ...internship };
    delete safeInternship.requiredCandidates; // Ensure privacy rule

    return {
      ...safeInternship,
      matchPercentage: matchAnalysis.matchPercentage,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills,
      explainableReasons: matchAnalysis.explainableReasons,
      matchBreakdown: matchAnalysis.scores,
    };
  });

  // Sort descending by match percentage
  scoredInternships.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return typeof limit === 'number' && limit > 0 ? scoredInternships.slice(0, limit) : scoredInternships;
};
