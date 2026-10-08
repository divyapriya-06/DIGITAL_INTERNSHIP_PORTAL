import { calculateStudentInternshipMatch } from './recommendationEngine.js';
import { tokenize, computeIDF } from './textProcessor.js';

/**
 * Reverse candidate matching: ranks candidate pool for an industry's internship posting
 */
export const rankCandidatesForInternship = (internship, students) => {
  // Build student corpus for TF-IDF
  const corpus = students.map(stud => tokenize([
    stud.bio || '',
    stud.resumeExtractedText || '',
    (stud.technicalSkills || []).join(' '),
    (stud.projects || []).map(p => `${p.title} ${p.description}`).join(' ')
  ].join(' ')));

  const globalIDF = computeIDF(corpus);

  const scoredCandidates = students.map(student => {
    const matchAnalysis = calculateStudentInternshipMatch(student, internship, globalIDF);
    const studObj = student.toObject ? student.toObject() : { ...student };

    return {
      student: {
        _id: studObj._id,
        user: studObj.user,
        fullName: studObj.fullName,
        college: studObj.college,
        degree: studObj.degree,
        department: studObj.department,
        cgpa: studObj.cgpa,
        graduationYear: studObj.graduationYear,
        location: studObj.location,
        preferredLocations: studObj.preferredLocations,
        technicalSkills: studObj.technicalSkills,
        programmingLanguages: studObj.programmingLanguages,
        frameworks: studObj.frameworks,
        tools: studObj.tools,
        experienceLevel: studObj.experienceLevel,
        experiences: studObj.experiences,
        projects: studObj.projects,
        preferredRole: studObj.preferredRole,
        preferredDomain: studObj.preferredDomain,
        resumePath: studObj.resumePath,
        resumeOriginalName: studObj.resumeOriginalName,
        profileCompletionPercentage: studObj.profileCompletionPercentage,
      },
      matchPercentage: matchAnalysis.matchPercentage,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills,
      matchedPreferredSkills: matchAnalysis.matchedPreferredSkills,
      explainableReasons: matchAnalysis.explainableReasons,
      matchBreakdown: matchAnalysis.scores,
    };
  });

  // Sort descending by match score
  scoredCandidates.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return scoredCandidates;
};
