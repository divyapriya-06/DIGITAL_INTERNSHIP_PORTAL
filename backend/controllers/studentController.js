import fs from 'fs';
import path from 'path';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import IndustryProfile from '../models/IndustryProfile.js';
import Review from '../models/Review.js';
import { extractResumeText, parseResumeEntities } from '../services/resumeParser.js';
import { rankInternshipsForStudent, calculateStudentInternshipMatch } from '../services/recommendationEngine.js';
import { getIndustrySkillDemandAnalytics, calculateStudentSkillGap } from '../services/skillDemandService.js';
import { checkAndFlagDuplicateStudent } from '../services/duplicateDetector.js';
import { notifyUser, getIO } from '../services/socketService.js';

/**
 * @route   GET /api/student/profile
 * @desc    Get current student's full profile
 * @access  Private (Student)
 */
export const getStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user._id,
        fullName: req.user.name,
        phone: req.user.phone || '',
      });
    }
    profile.calculateCompletion();
    await profile.save();

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile: ' + error.message });
  }
};

/**
 * @route   PUT /api/student/profile
 * @desc    Update student profile details
 * @access  Private (Student)
 */
export const updateStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    const {
      fullName,
      phone,
      location,
      bio,
      preferredLocations,
      college,
      degree,
      department,
      cgpa,
      graduationYear,
      technicalSkills,
      programmingLanguages,
      frameworks,
      tools,
      softSkills,
      experienceLevel,
      experiences,
      projects,
      preferredRole,
      preferredDomain,
      preferredStipend,
      preferredWorkMode,
      preferredDuration,
    } = req.body;

    if (fullName) profile.fullName = fullName;
    if (phone) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (bio !== undefined) profile.bio = bio;
    if (preferredLocations !== undefined) profile.preferredLocations = preferredLocations;
    if (college !== undefined) profile.college = college;
    if (degree !== undefined) profile.degree = degree;
    if (department !== undefined) profile.department = department;
    if (cgpa !== undefined) profile.cgpa = Number(cgpa);
    if (graduationYear !== undefined) profile.graduationYear = Number(graduationYear);

    if (technicalSkills !== undefined) profile.technicalSkills = technicalSkills;
    if (programmingLanguages !== undefined) profile.programmingLanguages = programmingLanguages;
    if (frameworks !== undefined) profile.frameworks = frameworks;
    if (tools !== undefined) profile.tools = tools;
    if (softSkills !== undefined) profile.softSkills = softSkills;

    if (experienceLevel !== undefined) profile.experienceLevel = experienceLevel;
    if (experiences !== undefined) profile.experiences = experiences;
    if (projects !== undefined) profile.projects = projects;

    if (preferredRole !== undefined) profile.preferredRole = preferredRole;
    if (preferredDomain !== undefined) profile.preferredDomain = preferredDomain;
    if (preferredStipend !== undefined) profile.preferredStipend = Number(preferredStipend);
    if (preferredWorkMode !== undefined) profile.preferredWorkMode = preferredWorkMode;
    if (preferredDuration !== undefined) profile.preferredDuration = preferredDuration;

    profile.calculateCompletion();
    await profile.save();

    // Update base User model name and isProfileComplete
    await User.findByIdAndUpdate(req.user._id, {
      name: profile.fullName,
      phone: profile.phone,
      isProfileComplete: profile.profileCompletionPercentage >= 60,
    });

    // Check duplicate profile
    checkAndFlagDuplicateStudent(profile, req.user);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Profile update failed: ' + error.message });
  }
};

/**
 * @route   POST /api/student/resume
 * @desc    Upload resume, parse text & extract entities for AI matching
 * @access  Private (Student)
 */
export const uploadStudentResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid PDF or DOCX resume file' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id, fullName: req.user.name });
    }

    // Delete old resume file if exists
    if (profile.resumePath && fs.existsSync(profile.resumePath)) {
      try {
        fs.unlinkSync(profile.resumePath);
      } catch (e) {
        console.warn('Could not remove previous resume file:', e.message);
      }
    }

    // Extract text & entities
    const extractedText = await extractResumeText(filePath);
    const parsedEntities = parseResumeEntities(extractedText);

    profile.resumePath = filePath;
    profile.resumeOriginalName = originalName;
    profile.resumeUploadedAt = new Date();
    profile.resumeExtractedText = extractedText;
    profile.resumeExtractedSkills = parsedEntities.skills;
    profile.resumeExtractedProjects = parsedEntities.projects;
    profile.resumeExtractedRoles = parsedEntities.roles;
    if (parsedEntities.education && !profile.degree) {
      profile.resumeExtractedEducation = parsedEntities.education;
    }

    // Auto-merge newly detected skills if student hasn't entered them
    if (parsedEntities.programmingLanguages.length > 0 && (!profile.programmingLanguages || profile.programmingLanguages.length === 0)) {
      profile.programmingLanguages = parsedEntities.programmingLanguages;
    }
    if (parsedEntities.frameworks.length > 0 && (!profile.frameworks || profile.frameworks.length === 0)) {
      profile.frameworks = parsedEntities.frameworks;
    }
    if (parsedEntities.skills.length > 0 && (!profile.technicalSkills || profile.technicalSkills.length === 0)) {
      profile.technicalSkills = parsedEntities.skills;
    }

    profile.calculateCompletion();
    await profile.save();

    await User.findByIdAndUpdate(req.user._id, {
      isProfileComplete: profile.profileCompletionPercentage >= 60,
    });

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully by AI parser',
      extractedData: {
        skillsFound: parsedEntities.skills.length,
        programmingLanguages: parsedEntities.programmingLanguages,
        frameworks: parsedEntities.frameworks,
        tools: parsedEntities.tools,
        extractedProjectsCount: parsedEntities.projects.length,
      },
      profile,
    });
  } catch (error) {
    console.error('Resume processing error:', error);
    return res.status(500).json({ success: false, message: 'Resume processing error: ' + error.message });
  }
};

/**
 * @route   DELETE /api/student/resume
 * @desc    Delete uploaded resume
 * @access  Private (Student)
 */
export const deleteStudentResume = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile || !profile.resumePath) {
      return res.status(404).json({ success: false, message: 'No resume found to delete' });
    }

    if (fs.existsSync(profile.resumePath)) {
      try {
        fs.unlinkSync(profile.resumePath);
      } catch (e) {
        console.warn('File unlinking error:', e.message);
      }
    }

    profile.resumePath = '';
    profile.resumeOriginalName = '';
    profile.resumeExtractedText = '';
    profile.resumeExtractedSkills = [];
    profile.resumeUploadedAt = null;
    profile.calculateCompletion();
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete resume: ' + error.message });
  }
};

/**
 * @route   GET /api/student/recommendations
 * @desc    Get Top 10 AI recommended internships with explainable match breakdown
 * @access  Private (Student)
 */
export const getRecommendedInternships = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Please complete your profile to receive recommendations' });
    }

    // Fetch active internships from APPROVED industries only
    const approvedIndustries = await IndustryProfile.find({ verificationStatus: 'APPROVED' }).select('_id');
    const approvedIndustryIds = approvedIndustries.map(i => i._id);

    const filter = {
      status: 'OPEN',
      industry: { $in: approvedIndustryIds },
      applicationDeadline: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    };

    if (req.query.role && req.query.role.trim()) {
      filter.role = { $regex: req.query.role.trim(), $options: 'i' };
    }
    if (req.query.domain && req.query.domain.trim() && req.query.domain !== '__custom__') {
      filter.domain = { $regex: req.query.domain.trim(), $options: 'i' };
    }

    const activeInternships = await Internship.find(filter)
      .populate('industry', 'companyName companyLocation industryType logo averageRating totalReviews website');

    // Run AI recommendation engine with limit
    const requestedLimit = req.query.limit ? parseInt(req.query.limit) : 50;
    const ranked = rankInternshipsForStudent(profile, activeInternships, requestedLimit);

    // Get list of internship IDs the student already applied for
    const existingApplications = await Application.find({
      student: profile._id,
      deletedByStudent: false,
    }).select('internship status');

    const appliedMap = {};
    existingApplications.forEach(app => {
      appliedMap[app.internship.toString()] = app.status;
    });

    const recommendationsWithStatus = ranked.map(item => ({
      ...item,
      appliedStatus: appliedMap[item._id.toString()] || null,
      hasApplied: !!appliedMap[item._id.toString()],
    }));

    return res.status(200).json({
      success: true,
      count: recommendationsWithStatus.length,
      totalMatching: recommendationsWithStatus.length,
      recommendations: recommendationsWithStatus,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate recommendations: ' + error.message });
  }
};

/**
 * @route   GET /api/student/internships
 * @desc    Search and filter internships (strictly excludes vacancies, inactive, expired, filled)
 * @access  Private (Student) or Public
 */
export const searchInternships = async (req, res) => {
  try {
    const {
      keyword,
      role,
      skill,
      location,
      minSalary,
      maxSalary,
      domain,
      experience,
      workMode,
      rating,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const approvedIndustries = await IndustryProfile.find({ verificationStatus: 'APPROVED' }).select('_id');
    const approvedIndustryIds = approvedIndustries.map(i => i._id);

    const query = {
      status: 'OPEN',
      industry: { $in: approvedIndustryIds },
      applicationDeadline: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    };

    // Keyword search across role, domain, description, requiredSkills
    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      query.$or = [
        { role: { $regex: kw, $options: 'i' } },
        { domain: { $regex: kw, $options: 'i' } },
        { description: { $regex: kw, $options: 'i' } },
        { requiredSkills: { $elemMatch: { $regex: kw, $options: 'i' } } },
      ];
    }

    if (role && role !== 'All') {
      query.role = { $regex: role, $options: 'i' };
    }

    if (domain && domain !== 'All') {
      query.domain = { $regex: domain, $options: 'i' };
    }

    if (skill && skill !== 'All') {
      query.requiredSkills = { $elemMatch: { $regex: skill, $options: 'i' } };
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (workMode && workMode !== 'All') {
      query.workMode = workMode;
    }

    if (experience && experience !== 'All') {
      query.experienceRequired = experience;
    }

    if (minSalary || maxSalary) {
      query.stipend = {};
      if (minSalary) query.stipend.$gte = Number(minSalary);
      if (maxSalary) query.stipend.$lte = Number(maxSalary);
    }

    // Sort setup
    let sortOptions = { createdAt: -1 };
    if (sort === 'HIGHEST_STIPEND') {
      sortOptions = { stipend: -1 };
    } else if (sort === 'LOWEST_STIPEND') {
      sortOptions = { stipend: 1 };
    } else if (sort === 'DEADLINE_SOON') {
      sortOptions = { applicationDeadline: 1 };
    }

    const total = await Internship.countDocuments(query);
    const skip = (Number(page) - 1) * Number(limit);

    // Strictly omit `requiredCandidates` from projection for student privacy
    const internships = await Internship.find(query)
      .select('-requiredCandidates')
      .populate('industry', 'companyName companyLocation industryType logo averageRating totalReviews website')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Optional student match calculation if authenticated
    let studentProfile = null;
    let appliedMap = {};
    if (req.user && req.user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: req.user._id });
      const apps = await Application.find({ student: studentProfile?._id, deletedByStudent: false }).select('internship status');
      apps.forEach(a => { appliedMap[a.internship.toString()] = a.status; });
    }

    const formattedList = internships.map(job => {
      let matchScore = null;
      let explainReasons = [];
      if (studentProfile) {
        const matchData = calculateStudentInternshipMatch(studentProfile, job, null);
        matchScore = matchData.matchPercentage;
        explainReasons = matchData.explainableReasons;
      }

      return {
        ...job.toObject(),
        matchPercentage: matchScore,
        explainableReasons: explainReasons,
        appliedStatus: appliedMap[job._id.toString()] || null,
        hasApplied: !!appliedMap[job._id.toString()],
      };
    });

    // If sorting by Best Match and student logged in
    if (sort === 'BEST_MATCH' && studentProfile) {
      formattedList.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    }

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      internships: formattedList,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: 'Search failed: ' + error.message });
  }
};

/**
 * @route   GET /api/student/internships/:id
 * @desc    Get single internship details and company reviews (strictly hides vacancies)
 * @access  Private (Student)
 */
export const getInternshipDetails = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .select('-requiredCandidates')
      .populate('industry', 'companyName companyLocation industryType logo averageRating totalReviews website companyDescription');

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship posting not found' });
    }

    const reviews = await Review.find({ industry: internship.industry._id })
      .populate('authorUser', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    let matchData = null;
    let hasApplied = false;
    let applicationDetails = null;

    if (req.user && req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ user: req.user._id });
      if (studentProfile) {
        matchData = calculateStudentInternshipMatch(studentProfile, internship, null);
        const app = await Application.findOne({ student: studentProfile._id, internship: internship._id });
        if (app) {
          hasApplied = true;
          applicationDetails = app;
        }
      }
    }

    return res.status(200).json({
      success: true,
      internship,
      reviews,
      matchData,
      hasApplied,
      applicationDetails,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch internship details: ' + error.message });
  }
};

/**
 * @route   POST /api/student/apply/:id
 * @desc    Apply for an internship (prevents duplicates, updates counts, notifies industry)
 * @access  Private (Student)
 */
export const applyForInternship = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({ success: false, message: 'Please complete your profile before applying' });
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    if (internship.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: `This internship is currently ${internship.status.toLowerCase()} and no longer accepting applications.`,
      });
    }

    // Check duplicate application
    const existingApp = await Application.findOne({
      student: studentProfile._id,
      internship: internship._id,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this internship position.',
      });
    }

    // Calculate AI match info for application record
    const matchAnalysis = calculateStudentInternshipMatch(studentProfile, internship, null);

    // Initial interview round status setup based on internship rounds
    const roundsStatus = (internship.interviewRounds || []).map(r => ({
      roundNumber: r.roundNumber,
      name: r.name,
      status: 'PENDING',
    }));

    // Create Application
    const application = await Application.create({
      student: studentProfile._id,
      studentUser: req.user._id,
      internship: internship._id,
      industry: internship.industry,
      status: 'APPLIED',
      rounds: roundsStatus,
      activeRoundNumber: 0,
      matchScore: matchAnalysis.matchPercentage,
      aiMatchDetails: {
        skillMatchPercentage: matchAnalysis.scores.skillScore,
        matchedSkills: matchAnalysis.matchedSkills,
        missingSkills: matchAnalysis.missingSkills,
        reasons: matchAnalysis.explainableReasons,
      },
      coverNote: req.body.coverNote || '',
    });

    // Increment internship application count
    internship.applicationCount += 1;
    await internship.save();

    // Real-time notification to Industry User
    const industryProfile = await IndustryProfile.findById(internship.industry);
    if (industryProfile) {
      await notifyUser(industryProfile.user, {
        title: 'New Application Received',
        message: `${studentProfile.fullName} (${matchAnalysis.matchPercentage}% match) has applied for "${internship.role}".`,
        type: 'NEW_APPLICATION',
        link: `/industry/applications`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this internship position.' });
    }
    console.error('Apply error:', error);
    return res.status(500).json({ success: false, message: 'Application submission failed: ' + error.message });
  }
};

/**
 * @route   GET /api/student/applications
 * @desc    Get student's active applications with tracking timeline and interview schedules
 * @access  Private (Student)
 */
export const getStudentApplications = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(200).json({ success: true, applications: [] });
    }

    // Ensure any applications in initial APPLIED state have activeRoundNumber as 0
    await Application.updateMany(
      { student: studentProfile._id, status: 'APPLIED', activeRoundNumber: { $gt: 0 } },
      { $set: { activeRoundNumber: 0 } }
    );

    const applications = await Application.find({
      student: studentProfile._id,
      deletedByStudent: false,
    })
      .populate({
        path: 'internship',
        select: '-requiredCandidates',
        populate: { path: 'industry', select: 'companyName companyLocation logo website' }
      })
      .populate('industry', 'companyName companyLocation logo website')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch applications: ' + error.message });
  }
};

/**
 * @route   DELETE /api/student/applications/:id
 * @desc    Delete rejected application from student's active view (soft delete, preserves audit)
 * @access  Private (Student)
 */
export const deleteRejectedApplication = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    const application = await Application.findOne({
      _id: req.params.id,
      student: studentProfile._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Only applications with REJECTED status can be deleted from your active dashboard.',
      });
    }

    application.deletedByStudent = true;
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Rejected application removed from active view',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove application: ' + error.message });
  }
};

/**
 * @route   GET /api/student/dashboard
 * @desc    Get complete student dashboard data (KPIs, upcoming rounds, skill demand, application pipeline)
 * @access  Private (Student)
 */
export const getStudentDashboard = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Applications statistics
    const applications = await Application.find({
      student: studentProfile._id,
      deletedByStudent: false,
    }).populate({
      path: 'internship',
      select: '-requiredCandidates',
      populate: { path: 'industry', select: 'companyName logo' }
    });

    const totalApplications = applications.length;
    const shortlistedCount = applications.filter(a => ['SHORTLISTED', 'ROUND_1', 'ROUND_2', 'TECHNICAL', 'HR'].includes(a.status)).length;
    const selectedCount = applications.filter(a => a.status === 'SELECTED').length;
    const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;
    const underReviewCount = applications.filter(a => ['APPLIED', 'UNDER_REVIEW'].includes(a.status)).length;

    // Upcoming interviews / scheduled rounds
    const upcomingInterviews = [];
    applications.forEach(app => {
      (app.rounds || []).forEach(r => {
        if (r.status === 'SCHEDULED' && r.scheduledDate && new Date(r.scheduledDate) >= new Date()) {
          upcomingInterviews.push({
            applicationId: app._id,
            internshipRole: app.internship?.role || 'Internship',
            companyName: app.internship?.industry?.companyName || 'Company',
            roundName: r.name,
            roundNumber: r.roundNumber,
            scheduledDate: r.scheduledDate,
            interviewMode: r.interviewMode,
            meetingLink: r.meetingLink,
            venue: r.venue,
            instructions: r.instructions,
          });
        }
      });
    });

    upcomingInterviews.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    // Skill demand & gap
    const skillAnalytics = await getIndustrySkillDemandAnalytics();
    const studentSkills = [
      ...(studentProfile.technicalSkills || []),
      ...(studentProfile.programmingLanguages || []),
      ...(studentProfile.frameworks || []),
      ...(studentProfile.resumeExtractedSkills || []),
    ];
    const skillGap = calculateStudentSkillGap(studentSkills, skillAnalytics.topSkills);

    return res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        shortlistedCount,
        selectedCount,
        rejectedCount,
        underReviewCount,
        profileCompletionPercentage: studentProfile.profileCompletionPercentage,
      },
      upcomingInterviews,
      skillGap,
      topIndustrySkills: skillAnalytics.topSkills.slice(0, 8),
      recentApplications: applications.slice(0, 5),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard: ' + error.message });
  }
};

/**
 * @route   GET /api/student/skill-demand
 * @desc    Get in-depth Industry Skill Demand and personalized Student Skill Gap insights
 * @access  Private (Student)
 */
export const getStudentSkillDemandInsights = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    const skillAnalytics = await getIndustrySkillDemandAnalytics();

    const studentSkills = studentProfile ? [
      ...(studentProfile.technicalSkills || []),
      ...(studentProfile.programmingLanguages || []),
      ...(studentProfile.frameworks || []),
      ...(studentProfile.resumeExtractedSkills || []),
    ] : [];

    const skillGap = calculateStudentSkillGap(studentSkills, skillAnalytics.topSkills);

    return res.status(200).json({
      success: true,
      marketDemand: skillAnalytics,
      skillGap,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch skill insights: ' + error.message });
  }
};
