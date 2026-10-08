import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import IndustryProfile from '../models/IndustryProfile.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import DuplicateFlag from '../models/DuplicateFlag.js';
import Review from '../models/Review.js';
import { getIndustrySkillDemandAnalytics } from '../services/skillDemandService.js';
import { notifyUser, broadcastToRole } from '../services/socketService.js';

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get master admin dashboard KPIs and placement statistics
 * @access  Private (Admin)
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalIndustries = await IndustryProfile.countDocuments();
    const verifiedIndustries = await IndustryProfile.countDocuments({ verificationStatus: 'APPROVED' });
    const pendingIndustries = await IndustryProfile.countDocuments({ verificationStatus: 'PENDING' });
    
    const activeInternships = await Internship.countDocuments({ status: 'OPEN' });
    const totalInternships = await Internship.countDocuments();
    
    const totalApplications = await Application.countDocuments();
    const selectedApplications = await Application.countDocuments({ status: 'SELECTED' });

    // Distinct students who actively applied
    const activeApplicantsDistinct = await Application.distinct('student');
    const activeApplicantsCount = activeApplicantsDistinct.length;

    // Distinct students placed / selected
    const selectedStudentsDistinct = await Application.distinct('student', { status: 'SELECTED' });
    const selectedStudentsCount = selectedStudentsDistinct.length;

    // Placement Percentage = (Selected Students / Active Applicants) * 100
    const placementPercentage = activeApplicantsCount > 0
      ? Math.round((selectedStudentsCount / activeApplicantsCount) * 100)
      : 0;

    const duplicateFlagsCount = await DuplicateFlag.countDocuments({ status: 'FLAGGED' });

    // Recent verification requests
    const pendingVerificationRequests = await IndustryProfile.find({ verificationStatus: 'PENDING' })
      .populate('user', 'email name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent applications
    const recentApplications = await Application.find()
      .populate('student', 'fullName college department')
      .populate('internship', 'role')
      .populate('industry', 'companyName')
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalIndustries,
        verifiedIndustries,
        pendingIndustries,
        activeInternships,
        totalInternships,
        totalApplications,
        activeApplicantsCount,
        selectedStudentsCount,
        placementPercentage,
        duplicateFlagsCount,
      },
      pendingVerificationRequests,
      recentApplications,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load admin dashboard: ' + error.message });
  }
};

/**
 * @route   GET /api/admin/verifications
 * @desc    Get industry verification queue
 * @access  Private (Admin)
 */
export const getVerificationRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'ALL') {
      filter.verificationStatus = status;
    }

    const industries = await IndustryProfile.find(filter)
      .populate('user', 'email name phone status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: industries.length,
      industries,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch verification requests: ' + error.message });
  }
};

/**
 * @route   PUT /api/admin/verifications/:id
 * @desc    Update company verification status (APPROVED, REJECTED, ON_HOLD)
 * @access  Private (Admin)
 */
export const updateVerificationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['APPROVED', 'REJECTED', 'ON_HOLD', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const industry = await IndustryProfile.findById(req.params.id).populate('user');
    if (!industry) {
      return res.status(404).json({ success: false, message: 'Industry not found' });
    }

    industry.verificationStatus = status;
    industry.verificationReviewedAt = new Date();
    if (rejectionReason !== undefined) {
      industry.verificationRejectionReason = rejectionReason;
    }
    await industry.save();

    // Send real-time notification to the Industry user
    if (industry.user) {
      let notifTitle = 'Company Verification Status Updated';
      let notifMsg = `Your company verification is now "${status}".`;

      if (status === 'APPROVED') {
        notifTitle = '🎉 Verification Approved!';
        notifMsg = `Your company "${industry.companyName}" has been verified and approved. You can now post internships and recruit candidates.`;
      } else if (status === 'REJECTED') {
        notifTitle = 'Verification Rejected';
        notifMsg = `Your verification request was rejected. Reason: ${rejectionReason || 'Incomplete documentation'}.`;
      } else if (status === 'ON_HOLD') {
        notifTitle = 'Verification On Hold';
        notifMsg = `Your verification is on hold pending further review.`;
      }

      await notifyUser(industry.user._id, {
        title: notifTitle,
        message: notifMsg,
        type: 'VERIFICATION_UPDATE',
        link: status === 'APPROVED' ? '/industry/dashboard' : '/industry/verification',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Industry verification updated to ${status}`,
      industry,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification update failed: ' + error.message });
  }
};

/**
 * @route   GET /api/admin/students
 * @desc    Get list of all registered students
 * @access  Private (Admin)
 */
export const getAllStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate('user', 'email name phone status createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch students: ' + error.message });
  }
};

/**
 * @route   GET /api/admin/industries
 * @desc    Get list of all industries
 * @access  Private (Admin)
 */
export const getAllIndustries = async (req, res) => {
  try {
    const industries = await IndustryProfile.find()
      .populate('user', 'email name phone status createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: industries.length,
      industries,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch industries: ' + error.message });
  }
};

/**
 * @route   GET /api/admin/internships
 * @desc    Get all internships across the platform with admin metrics
 * @access  Private (Admin)
 */
export const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find()
      .populate('industry', 'companyName companyLocation verificationStatus')
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
 * @route   PUT /api/admin/internships/:id/status
 * @desc    Update internship status (e.g. INACTIVE / CLOSED / OPEN)
 * @access  Private (Admin)
 */
export const updateInternshipStatusByAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Internship status updated to ${status}`,
      internship,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update internship status: ' + error.message });
  }
};

/**
 * @route   GET /api/admin/applications
 * @desc    Get all applications across platform
 * @access  Private (Admin)
 */
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student', 'fullName college department cgpa')
      .populate('internship', 'role domain stipend location')
      .populate('industry', 'companyName')
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
 * @route   GET /api/admin/duplicate-flags
 * @desc    Get duplicate student account detection flags
 * @access  Private (Admin)
 */
export const getDuplicateFlags = async (req, res) => {
  try {
    const flags = await DuplicateFlag.find()
      .populate('suspectUser', 'email name phone')
      .populate('suspectProfile', 'fullName college department graduationYear')
      .populate('matchingUser', 'email name phone')
      .populate('matchingProfile', 'fullName college department graduationYear')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: flags.length,
      flags,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch duplicate flags: ' + error.message });
  }
};

/**
 * @route   PUT /api/admin/duplicate-flags/:id
 * @desc    Resolve or dismiss duplicate flag
 * @access  Private (Admin)
 */
export const resolveDuplicateFlag = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const flag = await DuplicateFlag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({ success: false, message: 'Flag not found' });
    }

    flag.status = status || 'REVIEWED_LEGITIMATE';
    flag.adminNotes = adminNotes || '';
    flag.reviewedBy = req.user._id;
    flag.reviewedAt = new Date();
    await flag.save();

    return res.status(200).json({
      success: true,
      message: 'Duplicate flag updated',
      flag,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to resolve duplicate flag: ' + error.message });
  }
};

/**
 * @route   GET /api/admin/analytics
 * @desc    Get detailed platform recruitment and skill analytics
 * @access  Private (Admin)
 */
export const getPlatformAnalytics = async (req, res) => {
  try {
    const skillData = await getIndustrySkillDemandAnalytics();
    
    // Internships by Location
    const internships = await Internship.find();
    const locMap = {};
    internships.forEach(i => {
      const loc = i.location || 'Other';
      locMap[loc] = (locMap[loc] || 0) + 1;
    });
    const internshipsByLocation = Object.entries(locMap).map(([location, count]) => ({ location, count }));

    // Applications funnel
    const applications = await Application.find();
    const funnel = [
      { stage: 'Total Applied', count: applications.length },
      { stage: 'Under Review', count: applications.filter(a => a.status === 'UNDER_REVIEW').length },
      { stage: 'Shortlisted', count: applications.filter(a => a.status === 'SHORTLISTED').length },
      { stage: 'Interview Rounds', count: applications.filter(a => ['ROUND_1', 'ROUND_2', 'TECHNICAL', 'HR'].includes(a.status)).length },
      { stage: 'Selected', count: applications.filter(a => a.status === 'SELECTED').length },
    ];

    // Most recruiting companies
    const industries = await IndustryProfile.find();
    const industryPlacementStats = [];
    for (const ind of industries) {
      const indApps = await Application.find({ industry: ind._id });
      const selected = indApps.filter(a => a.status === 'SELECTED').length;
      if (indApps.length > 0) {
        industryPlacementStats.push({
          companyName: ind.companyName,
          totalApplications: indApps.length,
          selectedCandidates: selected,
        });
      }
    }
    industryPlacementStats.sort((a, b) => b.selectedCandidates - a.selectedCandidates);

    return res.status(200).json({
      success: true,
      skillData,
      internshipsByLocation,
      funnel,
      topRecruitingCompanies: industryPlacementStats.slice(0, 8),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load platform analytics: ' + error.message });
  }
};

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status (ACTIVE, INACTIVE, SUSPENDED)
 * @access  Private (Admin)
 */
export const updateUserStatusByAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check if ID is user ID or profile ID
    let user = await User.findById(req.params.id);
    if (!user) {
      const sp = await StudentProfile.findById(req.params.id);
      if (sp) user = await User.findById(sp.user);
      else {
        const ip = await IndustryProfile.findById(req.params.id);
        if (ip) user = await User.findById(ip.user);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account status changed to ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user status: ' + error.message });
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account and associated profile
 * @access  Private (Admin)
 */
export const deleteUserByAdmin = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      const sp = await StudentProfile.findById(req.params.id);
      if (sp) user = await User.findById(sp.user);
      else {
        const ip = await IndustryProfile.findById(req.params.id);
        if (ip) user = await User.findById(ip.user);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete linked profiles and data
    await StudentProfile.deleteMany({ user: user._id });
    await IndustryProfile.deleteMany({ user: user._id });
    await Application.deleteMany({ student: user._id });
    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: 'User account and profile data deleted permanently.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user: ' + error.message });
  }
};

