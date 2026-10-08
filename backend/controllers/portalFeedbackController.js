import PortalFeedback from '../models/PortalFeedback.js';

/**
 * @route   POST /api/feedback/portal
 * @desc    Submit a portal improvement or feature suggestion
 * @access  Private (Student, Industry, Admin)
 */
export const submitPortalFeedback = async (req, res) => {
  try {
    const { category, title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    const feedback = await PortalFeedback.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      category: category || 'PORTAL_IMPROVEMENT',
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'MEDIUM',
      status: 'PENDING',
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your suggestion! We will review it shortly.',
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit portal feedback: ' + error.message,
    });
  }
};

/**
 * @route   GET /api/feedback/portal
 * @desc    Get portal improvements and suggestions
 * @access  Private
 */
export const getAllPortalFeedback = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};

    if (category && category !== 'ALL') {
      filter.category = category;
    }
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    // Non-admin can only see their own feedback unless requesting general view
    if (req.user.role !== 'admin') {
      filter.user = req.user._id;
    }

    const items = await PortalFeedback.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      feedback: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch portal feedback: ' + error.message,
    });
  }
};

/**
 * @route   PUT /api/feedback/portal/:id/status
 * @desc    Update portal feedback status and admin response
 * @access  Private (Admin)
 */
export const updatePortalFeedbackStatus = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    const feedback = await PortalFeedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback entry not found' });
    }

    if (status) feedback.status = status;
    if (adminResponse !== undefined) feedback.adminResponse = adminResponse;

    await feedback.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update feedback: ' + error.message,
    });
  }
};
