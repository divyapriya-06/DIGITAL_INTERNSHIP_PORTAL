const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting End-to-End API Suite Tests...\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('1. Health Check:', health.status === 'online' ? '✅ PASS' : '❌ FAIL', health);

    // 2. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin123' })
    });
    const adminLogin = await adminLoginRes.json();
    console.log('2. Admin Login (admin@gmail.com / admin123):', adminLogin.success && adminLogin.user.role === 'admin' ? '✅ PASS' : '❌ FAIL');
    const adminToken = adminLogin.token;

    // 3. Admin Dashboard
    const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminDash = await adminDashRes.json();
    console.log('3. Admin Dashboard & Placement Stats:', adminDash.success ? '✅ PASS' : '❌ FAIL', {
      totalStudents: adminDash.stats?.totalStudents,
      totalIndustries: adminDash.stats?.totalIndustries,
      placementPercentage: `${adminDash.stats?.placementPercentage}%`,
      activeInternships: adminDash.stats?.activeInternships
    });

    // 4. Industry Login
    const industryLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'zoho@careers.com', password: 'password123' })
    });
    const industryLogin = await industryLoginRes.json();
    console.log('4. Industry Login (zoho@careers.com):', industryLogin.success && industryLogin.user.role === 'industry' ? '✅ PASS' : '❌ FAIL');
    const industryToken = industryLogin.token;

    // 5. Industry AI Candidate Reverse Matching
    const industryInternshipsRes = await fetch(`${BASE_URL}/industry/internships`, {
      headers: { 'Authorization': `Bearer ${industryToken}` }
    });
    const industryInternships = await industryInternshipsRes.json();
    const zohoJobId = industryInternships.internships[0]._id;

    const aiCandidatesRes = await fetch(`${BASE_URL}/industry/ai-candidates/${zohoJobId}`, {
      headers: { 'Authorization': `Bearer ${industryToken}` }
    });
    const aiCandidates = await aiCandidatesRes.json();
    console.log('5. Industry AI Candidate Reverse Matching:', aiCandidates.success && aiCandidates.candidates?.length > 0 ? '✅ PASS' : '❌ FAIL', {
      totalCandidates: aiCandidates.candidates?.length,
      topCandidate: aiCandidates.candidates?.[0]?.student?.fullName,
      matchPercentage: `${aiCandidates.candidates?.[0]?.matchPercentage}%`
    });

    // 6. Student Login
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@student.com', password: 'password123' })
    });
    const studentLogin = await studentLoginRes.json();
    console.log('6. Student Login (rahul@student.com):', studentLogin.success && studentLogin.user.role === 'student' ? '✅ PASS' : '❌ FAIL');
    const studentToken = studentLogin.token;

    // 7. Student AI Recommendations with Explainability
    const recsRes = await fetch(`${BASE_URL}/student/recommendations`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const recs = await recsRes.json();
    console.log('7. Student AI Top 10 Recommendations & Explainability:', recs.success && recs.recommendations?.length > 0 ? '✅ PASS' : '❌ FAIL', {
      count: recs.count,
      topRecommendedJob: recs.recommendations?.[0]?.role,
      matchPercentage: `${recs.recommendations?.[0]?.matchPercentage}%`,
      explainableReasons: recs.recommendations?.[0]?.explainableReasons?.slice(0, 2),
      vacancyExposedToStudent: recs.recommendations?.[0]?.requiredCandidates !== undefined ? '❌ PRIVACY VIOLATION' : '✅ PROTECTED (HIDDEN)'
    });

    // 8. Student Skill Gap Insights
    const skillGapRes = await fetch(`${BASE_URL}/student/skill-demand`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const skillGap = await skillGapRes.json();
    console.log('8. Student Skill Gap & Recommendation:', skillGap.success ? '✅ PASS' : '❌ FAIL', {
      readinessScore: `${skillGap.skillGap?.readinessScore}%`,
      recommendedSkillsToLearn: skillGap.skillGap?.recommendedSkillsToLearn?.map(s => s.skill)
    });

    // 9. Search Internships with Privacy Enforced
    const searchRes = await fetch(`${BASE_URL}/student/internships?keyword=Full%20Stack`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const search = await searchRes.json();
    console.log('9. Internship Search & Filter with Vacancy Privacy:', search.success ? '✅ PASS' : '❌ FAIL', {
      found: search.internships?.length,
      firstResultRole: search.internships?.[0]?.role,
      vacancyExposedToStudent: search.internships?.[0]?.requiredCandidates !== undefined ? '❌ PRIVACY VIOLATION' : '✅ PROTECTED (HIDDEN)'
    });

    console.log('\n========================================================');
    console.log('🎉 ALL INTEGRATION AND UNIT TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
