// ─────────────────────────────────────────────
// ALERTIO — Mock API for local development
// Simulates API responses without a backend
// ─────────────────────────────────────────────

import type { Job, UserProfile, MatchResult, Notification } from "../../../../packages/core/src/types";
import type { JobsResponse, JobsFilters, NotificationsResponse } from "./api";

// Mock user profile
export const mockProfile: UserProfile = {
  uid: "test-user-123",
  email: "user@example.com",
  displayName: "Test User",
  preferences: {
    notificationThreshold: 70,
    contractTypes: ["CDI"],
    remoteTypes: ["NONE", "PARTIAL", "FULL"],
  },
  profile: {
    romeCodes: ["M1101"],
    appellations: [],
    skills: ["JavaScript", "React"],
    primarySkills: ["JavaScript"],
    sectors: [],
    nafCodes: [],
    themes: [],
    contexts: [],
    savoir: [],
    savoirFaire: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock jobs
const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Développeur React Senior",
    description: "Rejoignez notre équipe React pour des projets innovants",
    company: "TechCorp",
    romeCode: "M1101",
    romeLabel: "Études et développement informatique",
    skills: ["React", "TypeScript", "Node.js"],
    sector: "Informatique",
    nafCode: "62.01Z",
    location: {
      city: "Paris",
      department: "75",
      postalCode: "75001",
      remote: "PARTIAL",
    },
    contract: "CDI",
    salary: { min: 50000, max: 70000, currency: "EUR", period: "YEARLY" },
    datePosted: new Date(),
    sourceUrl: "https://example.com/job-1",
  },
  {
    id: "job-2",
    title: "Full Stack Developer",
    description: "Position fullstack innovante avec équipe agile",
    company: "StartupXYZ",
    romeCode: "M1101",
    romeLabel: "Études et développement informatique",
    skills: ["JavaScript", "React", "PostgreSQL", "Docker"],
    sector: "High Tech",
    nafCode: "62.01Z",
    location: {
      city: "Toulouse",
      department: "31",
      postalCode: "31000",
      remote: "FULL",
    },
    contract: "CDI",
    salary: { min: 45000, max: 65000, currency: "EUR", period: "YEARLY" },
    datePosted: new Date(),
    sourceUrl: "https://example.com/job-2",
  },
];

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "test-user-123",
    jobId: "job-1",
    title: "Nouveau match",
    body: "Développeur React Senior — score 85",
    matchScore: 85,
    sentAt: new Date(),
    read: false,
  },
];

export async function mockFetchProfile(): Promise<UserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProfile), 500);
  });
}

export async function mockSaveProfile(uid: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...mockProfile, ...profile } as UserProfile), 500);
  });
}

export async function mockFetchJobs(filters?: JobsFilters): Promise<JobsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        jobs: mockJobs,
        count: mockJobs.length,
        hasMore: false,
        cursor: null,
      });
    }, 800);
  });
}

export async function mockFetchJob(id: string): Promise<{ job: Job; match: MatchResult | null }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const job = mockJobs.find(j => j.id === id);
      resolve({
        job: job || mockJobs[0],
        match: null,
      });
    }, 500);
  });
}

export async function mockFetchNotifications(): Promise<NotificationsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.read).length,
      });
    }, 600);
  });
}

export async function mockMarkAsRead(notifId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300);
  });
}
