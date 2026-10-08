import fs from 'fs';
import IndustryProfile from '../models/IndustryProfile.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import { rankCandidatesForInternship } from '../services/candidateMatchingEngine.js';
import { notifyUser } from '../services/socketService.js';

/**
 * @route   GET /api/industry/profile
 * @desc    Get industry profile and verification status
 * @access  Private (Industry)
 */
export const getIndustryProfile = async (req, res) => {
  try {
    let profile = await IndustryProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await IndustryProfile.create({
        user: req.user._id,
        companyName: req.user.name,
        officialEmail: req.user.email,
        contactPerson: req.user.name,
        companyLocation: 'Chennai',
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch company profile: ' + error.message });
  }
};

/**
 * @route   PUT /api/industry/profile
 * @desc    Update company profile details
 * @access  Private (Industry)
 */
export const updateIndustryProfile = async (req, res) => {
  try {
    let profile = await IndustryProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new IndustryProfile({ user: req.user._id });
    }

    const {
      companyName,
      contactPerson,
      phone,
      website,
      companyDescription,
      industryType,
      companyLocation,
      logo,
    } = req.body;

    if (companyName) profile.companyName = companyName;
    if (contactPerson) profile.contactPerson = contactPerson;
    if (phone !== undefined) profile.phone = phone;
    if (website !== undefined) profile.website = website;
    if (companyDescription !== undefined) profile.companyDescription = companyDescription;
    if (industryType !== undefined) profile.industryType = industryType;
    if (companyLocation !== undefined) profile.companyLocation = companyLocation;
    if (logo !== undefined) profile.logo = logo;

    await profile.save();

    await User.findByIdAndUpdate(req.user._id, {
      name: profile.contactPerson,
      phone: profile.phone,
    });

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Company profile update failed: ' + error.message });
  }
};

/**
 * @route   POST /api/industry/verification
 * @desc    Upload company registration / GST verification proof
 * @access  Private (Industry)
 */
export const uploadVerificationProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a valid document (PDF/JPG/PNG)' });
    }

    let profile = await IndustryProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new IndustryProfile({ user: req.user._id, companyName: req.user.name, officialEmail: req.user.email, contactPerson: req.user.name, companyLocation: 'Chennai' });
    }

    // Delete existing proof file if any
    if (profile.verificationProofPath && fs.existsSync(profile.verificationProofPath)) {
      try {
        fs.unlinkSync(profile.verificationProofPath);
      } catch (e) {
        console.warn('Old proof unlink warning:', e.message);
      }
    }

    profile.verificationProofPath = req.file.path;
    profile.verificationProofOriginalName = req.file.originalname;
    profile.verificationUploadedAt = new Date();
    profile.verificationStatus = 'PENDING';
    profile.verificationRejectionReason = '';
    await profile.save();

    // Notify all Admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notifyUser(admin._id, {
        title: 'New Industry Verification Request',
        message: `${profile.companyName} uploaded verification documents for approval.`,
        type: 'VERIFICATION_UPDATE',
        link: '/admin/verification',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification proof uploaded successfully. Your submission is now under Admin review.',
      profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Proof upload failed: ' + error.message });
  }
};

/**
 * @route   POST /api/industry/internships
 * @desc    Post a new internship (only approved companies allowed)
 * @access  Private (Industry & Approved)
 */
export const postInternship = async (req, res) => {
  try {
    const industryProfile = await IndustryProfile.findOne({ user: req.user._id });
    if (!industryProfile) {
      return res.status(404).json({ success: false, message: 'Industry profile not found' });
    }

    if (industryProfile.verificationStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: `Your company verification status is "${industryProfile.verificationStatus}". Only Admin-approved industries can post internships.`,
      });
    }

    const {
      role,
      domain,
      description,
      requiredSkills,
      preferredSkills,
      experienceRequired,
      educationRequired,
      location,
      workMode,
      duration,
      stipend,
      stipendType,
      applicationDeadline,
      requiredCandidates, // private vacancy count
      interviewRounds,
      perks,
      eligibilityCgpa,
    } = req.body;

    if (!role || !domain || !description || !location || !stipend || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: role, domain, description, location, stipend, and deadline.',
      });
    }

    // Default interview rounds if none provided
    const roundsList = (interviewRounds && interviewRounds.length > 0) ? interviewRounds : [
      { roundNumber: 1, name: 'Aptitude / Initial Screening', type: 'ONLINE_TEST', description: 'Basic screening & aptitude' },
      { roundNumber: 2, name: 'Technical Interview', type: 'TECHNICAL', description: 'Core technical and coding assessment' },
      { roundNumber: 3, name: 'HR / Managerial Round', type: 'HR', description: 'Final culture and offer discussion' },
    ];

    const internship = await Internship.create({
      industry: industryProfile._id,
      postedBy: req.user._id,
      role: role.trim(),
      domain: domain.trim(),
      description: description.trim(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
      experienceRequired: experienceRequired || 'FRESHER',
      educationRequired: educationRequired || 'B.E / B.Tech / MCA / M.Sc in CS / IT / Related Disciplines',
      location: location.trim(),
      workMode: workMode || 'HYBRID',
      duration: duration || '6 Months',
      stipend: Number(stipend),
      stipendType: stipendType || 'PER_MONTH',
      applicationDeadline: new Date(applicationDeadline),
      requiredCandidates: Math.max(1, Number(requiredCandidates) || 1), // Private vacancy count
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: roundsList,
      status: 'OPEN',
      perks: Array.isArray(perks) ? perks : (perks || '').split(',').map(p => p.trim()).filter(Boolean),
      eligibilityCgpa: Number(eligibilityCgpa) || 6.0,
    });

    return res.status(201).json({
      success: true,
      message: 'Internship posted successfully!',
      internship,
    });
  } catch (error) {
    console.error('Post internship error:', error);
    return res.status(500).json({ success: false, message: 'Failed to post internship: ' + error.message });
  }
};

/**
 * @route   GET /api/industry/internships
 * @desc    Get all internships posted by this industry (includes private vacancy & fulfillment metrics)
 * @access  Private (Industry)
 */
export const getMyInternships = async (req, res) => {
  try {
    const industryProfile = await IndustryProfile.findOne({ user: req.user._id });
    if (!industryProfile) {
      return res.status(200).json({ success: true, internships: [] });
    }

    const internships = await Internship.find({ industry: industryProfile._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: internships.length,
      internships,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch internships: ' + error.message });
  }
};

/**
 * @route   PUT /api/industry/internships/:id
 * @desc    Update internship details or status
 * @access  Private (Industry)
 */
export const updateInternship = async (req, res) => {
  try {
    const industryProfile = await IndustryProfile.findOne({ user: req.user._id });
    const internship = await Internship.findOne({ _id: req.params.id, industry: industryProfile._id });

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    const updatableFields = [
      'role', 'domain', 'description', 'requiredSkills', 'preferredSkills',
      'experienceRequired', 'educationRequired', 'location', 'workMode',
      'duration', 'stipend', 'stipendType', 'applicationDeadline',
      'requiredCandidates', 'interviewRounds', 'status', 'perks', 'eligibilityCgpa'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        internship[field] = req.body[field];
      }
    });

    // Run vacancy check
    internship.checkFulfillment();
    await internship.save();

    return res.status(200).json({
      success: true,
      message: 'Internship updated successfully',
      internship,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Update failed: ' + error.message });
  }
};

/**
 * @route   GET /api/industry/applications
 * @desc    Get applications received for this industry's postings
 * @access  Private (Industry)
 */
export const getIndustryApplications = async (req, res) => {
  try {
    const industryProfile = await IndustryProfile.findOne({ user: req.user._id });
    if (!industryProfile) {
      return res.status(200).json({ success: true, applications: [] });
    }

    const { internshipId, status } = req.query;
    const filter = { industry: industryProfile._id };

    if (internshipId) filter.internship = internshipId;
    if (status && status !== 'ALL') filter.status = status;

    const applications = await Application.find(filter)
      .populate('student')
      .populate('internship')
      .populate('studentUser', 'name email phone avatar')
      .sort({ createdAt: -1 });

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
 * @route   GET /api/industry/ai-candidates/:internshipId
 * @desc    AI reverse matching: Recommend top candidates best suited for a specific internship
 * @access  Private (Industry)
 */
export const getAICandidateRecommendations = async (req, res) => {
  try {
    const industryProfile = await IndustryProfile.findOne({ user: req.user._id });
    const internship = await Internship.findOne({
      _id: req.params.internshipId,
      industry: industryProfile._id,
    });

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Fetch all student profiles with complete or active data
    const allStudents = await StudentProfile.find({
      isFlaggedDuplicate: { $ne: true }
    }).populate('user', 'name email phone');

    // Run AI candidate reverse-matching engine
    const scoredCandidates = rankCandidatesForInternship(internship, allStudents);

    // Check existing applications to know if already applied / shortlisted
    const existingApps = await Application.find({ internship: internship._id }).select('student status');
    const appStatusMap = {};
    existingApps.forEach(a => {
      appStatusMap[a.student.toString()] = a.status;
    });

    const candidatesWithAppStatus = scoredCandidates.map(c => ({
      ...c,
      applicationStatus: appStatusMap[c.student._id.toString()] || 'NOT_APPLIED',
    }));

    return res.status(200).json({
      success: true,
      count: candidatesWithAppStatus.length,
      internship: {
        _id: internship._id,
        role: internship.role,
        requiredSkills: internship.requiredSkills,
        requiredCandidates: internship.requiredCandidates,
        selectedCount: internship.selectedCount,
        status: internship.status,
      },
      candidates: candidatesWithAppStatus.slice(0, 20), // Top 20 best matching candidates
    });
  } catch (error) {
    console.error('AI candidate matching error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate AI candidate matches: ' + error.message });
  }
};

/**
 * @route   GET /api/industry/candidates/search
 * @desc    Search and filter candidates database manually
 * @access  Private (Industry)
 */
export const searchCandidates = async (req, res) => {
  try {
    const {
      keyword,
      skill,
      location,
      degree,
      department,
      minCgpa,
      experienceLevel,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isFlaggedDuplicate: { $ne: true } };

    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      query.$or = [
        { fullName: { $regex: kw, $options: 'i' } },
        { college: { $regex: kw, $options: 'i' } },
        { preferredRole: { $regex: kw, $options: 'i' } },
        { technicalSkills: { $elemMatch: { $regex: kw, $options: 'i' } } },
      ];
    }

    if (skill && skill !== 'All') {
      query.technicalSkills = { $elemMatch: { $regex: skill, $options: 'i' } };
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (degree && degree !== 'All') {
      query.degree = { $regex: degree, $options: 'i' };
    }

    if (department && department !== 'All') {
      query.department = { $regex: department, $options: 'i' };
    }

    if (minCgpa) {
      query.cgpa = { $gte: Number(minCgpa) };
    }

    if (experienceLevel && experienceLevel !== 'All') {
      query.experienceLevel = experienceLevel;
    }

    const total = await StudentProfile.countDocuments(query);
    const skip = (Number(page) - 1) * Number(limit);

    const candidates = await StudentProfile.find(query)
      .populate('user', 'email name phone')
      .sort({ cgpa: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      candidates,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Candidate search failed: ' + error.message });
  }
};

/**
 * @route   PUT /api/industry/applications/:id/status
 * @desc    Update recruitment round status, schedule interview, select candidate & handle automatic vacancy fulfillment
 * @access  Private (Industry)
 */
export const updateApplicationRoundStatus = async (req, res) => {
  try {
    const industryProfile = await IndustryProfile.findOne({ user: req.user._id });
    const application = await Application.findOne({
      _id: req.params.id,
      industry: industryProfile._id,
    }).populate('internship').populate('student');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const {
      status, // e.g. SHORTLISTED, ROUND_1, ROUND_2, TECHNICAL, HR, SELECTED, ON_HOLD, REJECTED
      roundNumber,
      roundStatus, // SCHEDULED, CLEARED, REJECTED
      scheduledDate,
      interviewMode,
      meetingLink,
      venue,
      instructions,
      feedback,
      notesByIndustry,
    } = req.body;

    const previousStatus = application.status;

    if (status) {
      application.status = status;
      application.statusUpdatedAt = new Date();
    }

    if (notesByIndustry !== undefined) {
      application.notesByIndustry = notesByIndustry;
    }

    // Update specific interview round info if provided
    if (roundNumber !== undefined) {
      let targetRound = application.rounds.find(r => r.roundNumber === Number(roundNumber));
      if (!targetRound) {
        targetRound = {
          roundNumber: Number(roundNumber),
          name: `Round ${roundNumber}`,
          status: roundStatus || 'SCHEDULED',
        };
        application.rounds.push(targetRound);
      }

      if (roundStatus) targetRound.status = roundStatus;
      if (scheduledDate) targetRound.scheduledDate = new Date(scheduledDate);
      if (interviewMode) targetRound.interviewMode = interviewMode;
      if (meetingLink !== undefined) targetRound.meetingLink = meetingLink;
      if (venue !== undefined) targetRound.venue = venue;
      if (instructions !== undefined) targetRound.instructions = instructions;
      if (feedback !== undefined) targetRound.feedback = feedback;
      if (roundStatus === 'CLEARED' || roundStatus === 'REJECTED') {
        targetRound.completedAt = new Date();
      }

      application.activeRoundNumber = Number(roundNumber);
    }

    await application.save();

    // CRITICAL VACANCY FULFILLMENT LOGIC
    // Recalculate selected candidate count for this internship
    const internship = await Internship.findById(application.internship._id);
    if (internship) {
      const selectedCount = await Application.countDocuments({
        internship: internship._id,
        status: 'SELECTED',
      });

      internship.selectedCount = selectedCount;

      // If selected candidates equal or exceed requiredCandidates, mark as FILLED
      if (internship.selectedCount >= internship.requiredCandidates && internship.status === 'OPEN') {
        internship.status = 'FILLED';
        console.log(`🎯 Internship "${internship.role}" is now FILLED (${internship.selectedCount}/${internship.requiredCandidates} vacancies filled).`);
      } else if (internship.selectedCount < internship.requiredCandidates && internship.status === 'FILLED') {
        // If an offer was revoked and vacancies reopen
        internship.status = 'OPEN';
      }

      await internship.save();
    }

    // Real-time notification to Student
    const studentUser = await User.findById(application.studentUser);
    if (studentUser) {
      let notifTitle = 'Application Status Updated';
      let notifMsg = `Your application for "${application.internship.role}" is now "${application.status}".`;
      let notifType = 'APPLICATION_UPDATE';

      if (status === 'SELECTED') {
        notifTitle = '🎉 Congratulations! You are Selected!';
        notifMsg = `You have been selected for the "${application.internship.role}" internship at ${industryProfile.companyName}!`;
      } else if (roundStatus === 'SCHEDULED' && scheduledDate) {
        notifTitle = '📅 Interview Scheduled';
        notifMsg = `Your Round ${roundNumber} interview for "${application.internship.role}" is scheduled on ${new Date(scheduledDate).toLocaleDateString()}.`;
        notifType = 'INTERVIEW_SCHEDULED';
      } else if (status === 'REJECTED') {
        notifTitle = 'Application Status Update';
        notifMsg = `Your application for "${application.internship.role}" was not selected.`;
      }

      await notifyUser(studentUser._id, {
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        link: '/student/applications',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recruitment status updated successfully',
      application,
      internshipStatus: internship ? internship.status : null,
      selectedCount: internship ? internship.selectedCount : 0,
    });
  } catch (error) {
    console.error('Update round status error:', error);
    return res.status(500).json({ success: false, message: 'Status update failed: ' + error.message });
  }
};

/**
 * @route   GET /api/industry/dashboard
 * @desc    Get industry dashboard KPIs & recruitment analytics
 * @access  Private (Industry)
 */
export const getIndustryDashboard = async (req, res) => {
  try {
    const industryProfile = await IndustryProfile.findOne({ user: req.user._id });
    if (!industryProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const internships = await Internship.find({ industry: industryProfile._id });
    const internshipIds = internships.map(i => i._id);

    const applications = await Application.find({ internship: { $in: internshipIds } })
      .populate('student')
      .populate('internship')
      .populate('studentUser', 'name email phone avatar');

    const activeInternshipsCount = internships.filter(i => i.status === 'OPEN').length;
    const filledInternshipsCount = internships.filter(i => i.status === 'FILLED').length;
    const totalApplicationsCount = applications.length;
    const shortlistedCount = applications.filter(a => ['SHORTLISTED', 'ROUND_1', 'ROUND_2', 'TECHNICAL', 'HR'].includes(a.status)).length;
    const selectedCount = applications.filter(a => a.status === 'SELECTED').length;
    const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

    // Recruitment pipeline stages
    const pipelineData = [
      { stage: 'Applied', count: applications.filter(a => a.status === 'APPLIED').length },
      { stage: 'Under Review', count: applications.filter(a => a.status === 'UNDER_REVIEW').length },
      { stage: 'Shortlisted', count: applications.filter(a => a.status === 'SHORTLISTED').length },
      { stage: 'Rounds / Technical', count: applications.filter(a => ['ROUND_1', 'ROUND_2', 'TECHNICAL'].includes(a.status)).length },
      { stage: 'HR Round', count: applications.filter(a => a.status === 'HR').length },
      { stage: 'Selected', count: selectedCount },
    ];

    // Applications grouped by role
    const roleMap = {};
    applications.forEach(app => {
      const r = app.internship?.role || 'Other';
      roleMap[r] = (roleMap[r] || 0) + 1;
    });

    const applicationsByRole = Object.entries(roleMap).map(([role, count]) => ({ role, count }));

    return res.status(200).json({
      success: true,
      stats: {
        activeInternshipsCount,
        filledInternshipsCount,
        totalApplicationsCount,
        shortlistedCount,
        selectedCount,
        rejectedCount,
        verificationStatus: industryProfile.verificationStatus,
        selectionRate: totalApplicationsCount > 0 ? Math.round((selectedCount / totalApplicationsCount) * 100) : 0,
      },
      pipelineData,
      applicationsByRole,
      recentApplications: applications.slice(0, 6),
      internships: internships.slice(0, 5),
    });
  } catch (error) {
    console.error('Industry dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load industry dashboard: ' + error.message });
  }
};
