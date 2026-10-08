import IndustryProfile from '../models/IndustryProfile.js';

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not authorized to access this resource`
      });
    }

    next();
  };
};

export const adminOnly = authorizeRoles('admin');
export const industryOnly = authorizeRoles('industry');
export const studentOnly = authorizeRoles('student');

// Ensure industry is approved before allowing internship posting
export const approvedIndustryOnly = async (req, res, next) => {
  if (!req.user || req.user.role !== 'industry') {
    return res.status(403).json({ success: false, message: 'Industry access only' });
  }

  try {
    const industryProfile = await IndustryProfile.findOne({ user: req.user._id });
    if (!industryProfile) {
      return res.status(404).json({ success: false, message: 'Industry profile not found' });
    }

    if (industryProfile.verificationStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: `Your company verification status is currently '${industryProfile.verificationStatus}'. Posting internships is only allowed after Admin approval.`,
        verificationStatus: industryProfile.verificationStatus,
      });
    }

    req.industryProfile = industryProfile;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server verification check error', error: error.message });
  }
};
