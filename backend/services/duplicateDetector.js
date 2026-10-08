import StudentProfile from '../models/StudentProfile.js';
import DuplicateFlag from '../models/DuplicateFlag.js';

/**
 * Check if the student profile matches an existing student profile suspiciously
 */
export const checkAndFlagDuplicateStudent = async (studentProfile, user) => {
  try {
    if (!studentProfile.fullName || !studentProfile.college) return null;

    // Search other student profiles
    const otherStudents = await StudentProfile.find({
      user: { $ne: user._id },
    }).populate('user', 'email name phone');

    for (const other of otherStudents) {
      let matchCount = 0;
      const matchedFields = [];
      let reason = '';

      // Phone match
      if (user.phone && other.user && other.user.phone && user.phone === other.user.phone) {
        matchCount += 40;
        matchedFields.push('Phone Number');
      }

      // Exact name match
      if (
        studentProfile.fullName.toLowerCase().trim() ===
        other.fullName.toLowerCase().trim()
      ) {
        matchCount += 30;
        matchedFields.push('Full Name');
      }

      // College match
      if (
        studentProfile.college &&
        other.college &&
        studentProfile.college.toLowerCase().trim() ===
        other.college.toLowerCase().trim()
      ) {
        matchCount += 15;
        matchedFields.push('College');
      }

      // Department & Grad year match
      if (
        studentProfile.department &&
        other.department &&
        studentProfile.department.toLowerCase().trim() ===
        other.department.toLowerCase().trim()
      ) {
        matchCount += 10;
        matchedFields.push('Department');
      }

      if (
        studentProfile.graduationYear &&
        other.graduationYear &&
        studentProfile.graduationYear === other.graduationYear
      ) {
        matchCount += 5;
        matchedFields.push('Graduation Year');
      }

      // If similarity >= 65%, flag for admin review
      if (matchCount >= 65) {
        reason = `High profile similarity (${matchCount}%) detected across fields: ${matchedFields.join(', ')}`;
        
        // Upsert duplicate flag record
        const flag = await DuplicateFlag.findOneAndUpdate(
          {
            suspectUser: user._id,
            matchingUser: other.user._id,
          },
          {
            suspectUser: user._id,
            suspectProfile: studentProfile._id,
            matchingUser: other.user._id,
            matchingProfile: other._id,
            similarityScore: matchCount,
            matchedFields,
            reason,
            status: 'FLAGGED',
          },
          { upsert: true, new: true }
        );

        // Mark on student profile
        studentProfile.isFlaggedDuplicate = true;
        studentProfile.duplicateFlagReason = reason;
        await studentProfile.save();

        return flag;
      }
    }

    return null;
  } catch (error) {
    console.error('Duplicate detection check error:', error.message);
    return null;
  }
};
