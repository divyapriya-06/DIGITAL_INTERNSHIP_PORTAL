import Internship from '../models/Internship.js';

/**
 * Calculate overall industry skill demand, top roles, domains, and locations from active postings
 */
export const getIndustrySkillDemandAnalytics = async () => {
  const activeInternships = await Internship.find({ status: 'OPEN' }).lean();

  const skillCounts = {};
  const roleCounts = {};
  const domainCounts = {};
  const locationCounts = {};
  let totalActive = activeInternships.length;

  activeInternships.forEach(job => {
    // Count required skills
    (job.requiredSkills || []).forEach(skill => {
      const s = skill.trim();
      if (s) {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      }
    });

    // Count preferred skills
    (job.preferredSkills || []).forEach(skill => {
      const s = skill.trim();
      if (s) {
        skillCounts[s] = (skillCounts[s] || 0) + 0.5;
      }
    });

    // Count roles
    if (job.role) {
      roleCounts[job.role] = (roleCounts[job.role] || 0) + 1;
    }

    // Count domains
    if (job.domain) {
      domainCounts[job.domain] = (domainCounts[job.domain] || 0) + 1;
    }

    // Count locations
    if (job.location) {
      locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
    }
  });

  // Sort and format skills
  const topSkills = Object.entries(skillCounts)
    .map(([skill, count]) => ({
      skill,
      count: Math.round(count),
      percentage: totalActive ? Math.round((count / totalActive) * 100) : 0,
      demandLevel: count > 3 ? 'High' : count > 1 ? 'Moderate' : 'Emerging'
    }))
    .sort((a, b) => b.count - a.count);

  // Sort and format roles
  const topRoles = Object.entries(roleCounts)
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);

  // Sort and format domains
  const topDomains = Object.entries(domainCounts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);

  // Sort and format locations
  const topLocations = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalActiveInternships: totalActive,
    topSkills,
    topRoles,
    topDomains,
    topLocations,
  };
};

/**
 * Calculate Student Skill Gap against industry demand
 */
export const calculateStudentSkillGap = (studentSkillsList, topIndustrySkills) => {
  const studentSkillSet = new Set((studentSkillsList || []).map(s => s.toLowerCase().trim()));

  const acquiredSkills = [];
  const missingInDemandSkills = [];

  topIndustrySkills.forEach(item => {
    const sLower = item.skill.toLowerCase().trim();
    if (studentSkillSet.has(sLower) || [...studentSkillSet].some(sk => sk.includes(sLower) || sLower.includes(sk))) {
      acquiredSkills.push(item);
    } else {
      missingInDemandSkills.push(item);
    }
  });

  // Recommended skills to learn (top 4 missing skills with highest industry demand)
  const recommendations = missingInDemandSkills.slice(0, 4).map(item => ({
    skill: item.skill,
    demandPercentage: item.percentage,
    reason: `Appears in ${item.percentage}% of active internship postings. Learning this skill will significantly increase your match rate.`,
  }));

  const readinessScore = topIndustrySkills.length > 0 
    ? Math.round((acquiredSkills.length / Math.min(10, topIndustrySkills.length)) * 100)
    : 100;

  return {
    acquiredSkills,
    missingInDemandSkills,
    recommendedSkillsToLearn: recommendations,
    readinessScore: Math.min(100, readinessScore),
  };
};
