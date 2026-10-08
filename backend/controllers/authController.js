import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import IndustryProfile from '../models/IndustryProfile.js';
import { checkAndFlagDuplicateStudent } from '../services/duplicateDetector.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_collab_portal_2026_academic_prod', {
    expiresIn: '30d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student or industry account (Admin is strictly forbidden from registration)
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { role, name, email, password, phone, ...extraDetails } = req.body;

    // Validate role
    if (!role || !['student', 'industry'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selection. Registration is only permitted for Student and Industry roles.',
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Check duplicate phone if provided
    if (phone) {
      const phoneExists = await User.findOne({ phone: phone.trim() });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this phone number already exists.',
        });
      }
    }

    // Create Base User
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone ? phone.trim() : '',
      isProfileComplete: false,
    });

    let profileDoc = null;

    if (role === 'student') {
      profileDoc = await StudentProfile.create({
        user: user._id,
        fullName: name.trim(),
        phone: phone ? phone.trim() : '',
        profileCompletionPercentage: 20,
      });

      // Run duplicate detection
      checkAndFlagDuplicateStudent(profileDoc, user);
    } else if (role === 'industry') {
      profileDoc = await IndustryProfile.create({
        user: user._id,
        companyName: extraDetails.companyName || name.trim(),
        officialEmail: email.toLowerCase().trim(),
        contactPerson: name.trim(),
        phone: phone ? phone.trim() : '',
        website: extraDetails.website || '',
        companyDescription: extraDetails.companyDescription || '',
        industryType: extraDetails.industryType || 'Information Technology',
        companyLocation: extraDetails.companyLocation || 'Chennai',
        verificationStatus: 'PENDING',
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
      profile: profileDoc,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message,
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate User & return token
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by the administrator. Please contact support.',
      });
    }

    let profile = null;
    let verificationStatus = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'industry') {
      profile = await IndustryProfile.findOne({ user: user._id });
      verificationStatus = profile ? profile.verificationStatus : 'PENDING';
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
        avatar: user.avatar,
      },
      profile,
      verificationStatus,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user & profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;
    let verificationStatus = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'industry') {
      profile = await IndustryProfile.findOne({ user: user._id });
      verificationStatus = profile ? profile.verificationStatus : 'PENDING';
    }

    return res.status(200).json({
      success: true,
      user,
      profile,
      verificationStatus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile: ' + error.message,
    });
  }
};

/**
 * @route   PUT /api/auth/deactivate
 * @desc    Deactivate current user account
 * @access  Private
 */
export const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'INACTIVE';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Your account has been deactivated successfully. You can reactivate by signing in again.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to deactivate account: ' + error.message });
  }
};

/**
 * @route   DELETE /api/auth/delete
 * @desc    Permanently delete current user account and profile data
 * @access  Private
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'student') {
      await StudentProfile.deleteOne({ user: userId });
    } else if (user.role === 'industry') {
      await IndustryProfile.deleteOne({ user: userId });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: 'Your account has been permanently deleted.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete account: ' + error.message });
  }
};
