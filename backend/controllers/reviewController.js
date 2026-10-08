import Review from '../models/Review.js';
import IndustryProfile from '../models/IndustryProfile.js';
import StudentProfile from '../models/StudentProfile.js';

/**
 * @route   POST /api/reviews
 * @desc    Submit a review (Student reviewing company, or Industry reviewing student)
 * @access  Private
 */
export const createReview = async (req, res) => {
  try {
    const {
      industryId,
      internshipId,
      rating,
      title,
      feedback,
      mentorshipRating,
      workEnvironmentRating,
      learningOpportunitiesRating,
      studentId,
      technicalRating,
      communicationRating,
      professionalismRating,
    } = req.body;

    if (!rating || !title || !feedback) {
      return res.status(400).json({ success: false, message: 'Rating, title, and feedback text are required' });
    }

    const review = await Review.create({
      authorUser: req.user._id,
      authorRole: req.user.role,
      industry: industryId,
      student: studentId || undefined,
      internship: internshipId || undefined,
      rating: Number(rating),
      title: title.trim(),
      feedback: feedback.trim(),
      mentorshipRating: mentorshipRating ? Number(mentorshipRating) : 5,
      workEnvironmentRating: workEnvironmentRating ? Number(workEnvironmentRating) : 5,
      learningOpportunitiesRating: learningOpportunitiesRating ? Number(learningOpportunitiesRating) : 5,
      technicalRating: technicalRating ? Number(technicalRating) : undefined,
      communicationRating: communicationRating ? Number(communicationRating) : undefined,
      professionalismRating: professionalismRating ? Number(professionalismRating) : undefined,
    });

    // Update industry average rating
    if (industryId) {
      const allIndustryReviews = await Review.find({ industry: industryId });
      const avg = allIndustryReviews.reduce((sum, r) => sum + r.rating, 0) / allIndustryReviews.length;
      await IndustryProfile.findByIdAndUpdate(industryId, {
        averageRating: Number(avg.toFixed(1)),
        totalReviews: allIndustryReviews.length,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit review: ' + error.message });
  }
};

/**
 * @route   GET /api/reviews/industry/:id
 * @desc    Get all reviews for an industry
 * @access  Public / Private
 */
export const getIndustryReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ industry: req.params.id })
      .populate('authorUser', 'name avatar')
      .populate('internship', 'role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews: ' + error.message });
  }
};

/**
 * @route   GET /api/reviews/all
 * @desc    Get all reviews across platform for admin/student review insights
 * @access  Private
 */
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('authorUser', 'name email role')
      .populate('industry', 'companyName logo')
      .populate('student', 'fullName college')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch all reviews: ' + error.message });
  }
};

/**
 * @route   GET /api/reviews/companies
 * @desc    Get all companies for review search and ratings
 * @access  Private / Public
 */
export const getAllCompaniesForReviews = async (req, res) => {
  try {
    const companies = await IndustryProfile.find()
      .select('companyName companyLocation industryType averageRating totalReviews website verificationStatus')
      .sort({ companyName: 1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch companies: ' + error.message });
  }
};

