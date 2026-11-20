import type { Request, Response } from "express";
import { profileRepository } from "./profile.repository.js";

export async function getJobSeekerProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const profile = await profileRepository.getJobSeekerProfile(userId);
    return res.json(profile || {
      userId,
      firstName: "",
      lastName: "",
      headline: "",
      bio: "",
      skills: [],
      education: [],
      experience: [],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch profile." });
  }
}

export async function updateJobSeekerProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, headline, bio, phone, location, portfolioUrl, resumeUrl } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First and last name are required." });
    }

    const updated = await profileRepository.upsertJobSeekerProfile(userId, {
      firstName,
      lastName,
      headline,
      bio,
      phone,
      location,
      portfolioUrl,
      resumeUrl,
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update profile." });
  }
}

export async function updateResume(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { resumeUrl } = req.body;

    const updated = await profileRepository.updateResume(userId, resumeUrl || null);
    return res.json({ message: "Resume updated successfully.", profile: updated });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update resume." });
  }
}

export async function deleteResume(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    await profileRepository.updateResume(userId, null);
    return res.json({ message: "Resume removed successfully." });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to remove resume." });
  }
}

export async function getEmployerProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const profile = await profileRepository.getEmployerProfile(userId);
    return res.json(profile || {
      userId,
      firstName: "",
      lastName: "",
      jobTitle: "",
      company: {
        name: "",
        description: "",
        industry: "",
        website: "",
        location: "",
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch employer profile." });
  }
}

export async function updateEmployerProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      firstName,
      lastName,
      jobTitle,
      phone,
      companyName,
      companyDescription,
      website,
      logoUrl,
      industry,
      size,
      location,
    } = req.body;

    if (!companyName || !firstName || !lastName) {
      return res.status(400).json({ message: "Company name, first name, and last name are required." });
    }

    const updated = await profileRepository.upsertEmployerProfile(userId, {
      firstName,
      lastName,
      jobTitle,
      phone,
      companyName,
      companyDescription,
      website,
      logoUrl,
      industry,
      size,
      location,
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update employer profile." });
  }
}
