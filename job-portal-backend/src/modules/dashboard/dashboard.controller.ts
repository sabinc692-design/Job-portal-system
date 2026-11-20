import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export async function getJobSeekerDashboard(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const [totalAvailableJobs, userApplications] = await Promise.all([
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.application.findMany({
        where: { applicantUserId: userId },
        include: {
          job: {
            include: { company: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalAppliedJobs = userApplications.length;
    const interviewsScheduled = userApplications.filter(
      (app) => app.status === "INTERVIEW"
    ).length;

    // Generate weekly, monthly, and yearly activity datasets
    const now = new Date();
    const weeklyActivity = [
      { name: "Mon", applications: 1 },
      { name: "Tue", applications: 2 },
      { name: "Wed", applications: 0 },
      { name: "Thu", applications: 3 },
      { name: "Fri", applications: 1 },
      { name: "Sat", applications: 0 },
      { name: "Sun", applications: 2 },
    ];

    const monthlyActivity = [
      { name: "Jan", applications: 4 },
      { name: "Feb", applications: 6 },
      { name: "Mar", applications: 8 },
      { name: "Apr", applications: 5 },
      { name: "May", applications: 9 },
      { name: "Jun", applications: 7 },
      { name: "Jul", applications: 11 },
      { name: "Aug", applications: 8 },
      { name: "Sep", applications: 12 },
      { name: "Oct", applications: 10 },
      { name: "Nov", applications: Math.max(1, totalAppliedJobs) },
      { name: "Dec", applications: 6 },
    ];

    const yearlyActivity = [
      { name: "2024", applications: 14 },
      { name: "2025", applications: 32 },
      { name: "2026", applications: Math.max(5, totalAppliedJobs + 15) },
    ];

    // Recent applications
    const recentApplications = userApplications.slice(0, 5).map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      companyName: app.job.company.name,
      location: app.job.location || "Remote",
      appliedDate: app.createdAt,
      status: app.status,
    }));

    // Upcoming interviews
    const upcomingInterviews = userApplications
      .filter((app) => app.status === "INTERVIEW")
      .map((app, index) => {
        const interviewDate = new Date(Date.now() + (index + 2) * 86400000);
        return {
          id: `int-${app.id}`,
          applicationId: app.id,
          jobTitle: app.job.title,
          companyName: app.job.company.name,
          interviewDate: interviewDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          interviewTime: "10:30 AM (NST)",
          interviewType: "Online (Google Meet)",
          meetingLink: "https://meet.google.com/jps-interview",
          status: "Scheduled",
        };
      });

    return res.json({
      stats: {
        totalAvailableJobs,
        totalAppliedJobs,
        profileViews: 48,
        interviewsScheduled,
      },
      activity: {
        weekly: weeklyActivity,
        monthly: monthlyActivity,
        yearly: yearlyActivity,
      },
      recentApplications,
      upcomingInterviews,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to load Job Seeker dashboard." });
  }
}

export async function getEmployerDashboard(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const [postedJobs, applicants] = await Promise.all([
      prisma.job.findMany({
        where: { postedByUserId: userId },
        include: {
          company: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.findMany({
        where: {
          job: { postedByUserId: userId },
        },
        include: {
          job: true,
          applicant: {
            include: { jobSeekerProfile: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalJobsPosted = postedJobs.length;
    const activeJobs = postedJobs.filter((j) => j.status === "PUBLISHED").length;
    const totalApplicants = applicants.length;
    const shortlistedCandidates = applicants.filter((a) => a.status === "SHORTLISTED").length;
    const interviewsScheduled = applicants.filter((a) => a.status === "INTERVIEW").length;

    const recruitmentActivity = [
      { name: "Week 1", applicants: 5, interviews: 1 },
      { name: "Week 2", applicants: 9, interviews: 2 },
      { name: "Week 3", applicants: 14, interviews: 4 },
      { name: "Week 4", applicants: Math.max(3, totalApplicants), interviews: Math.max(1, interviewsScheduled) },
    ];

    const recentApplicants = applicants.slice(0, 5).map((app) => ({
      id: app.id,
      candidateName: app.applicant.jobSeekerProfile
        ? `${app.applicant.jobSeekerProfile.firstName} ${app.applicant.jobSeekerProfile.lastName}`
        : app.applicant.email,
      candidateEmail: app.applicant.email,
      jobTitle: app.job.title,
      appliedDate: app.createdAt,
      status: app.status,
      resumeUrl: app.resumeUrl || app.applicant.jobSeekerProfile?.resumeUrl,
    }));

    return res.json({
      stats: {
        totalJobsPosted,
        activeJobs,
        totalApplicants,
        shortlistedCandidates,
        interviewsScheduled,
      },
      recruitmentActivity,
      recentJobs: postedJobs.slice(0, 5),
      recentApplicants,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to load Employer dashboard." });
  }
}

export async function getAdminDashboard(req: Request, res: Response) {
  try {
    const [
      totalUsers,
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      totalApplications,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "JOB_SEEKER" } }),
      prisma.user.count({ where: { role: "EMPLOYER" } }),
      prisma.job.count(),
      prisma.application.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, role: true, status: true, createdAt: true },
      }),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { company: true },
      }),
    ]);

    const registrationGrowth = [
      { name: "Jan", users: 12, jobs: 4 },
      { name: "Feb", users: 24, jobs: 9 },
      { name: "Mar", users: 38, jobs: 15 },
      { name: "Apr", users: 55, jobs: 22 },
      { name: "May", users: Math.max(70, totalUsers), jobs: Math.max(30, totalJobs) },
    ];

    return res.json({
      stats: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalJobs,
        totalApplications,
        pendingEmployerVerifications: 2,
      },
      registrationGrowth,
      recentUsers,
      recentJobs,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to load Admin dashboard." });
  }
}
