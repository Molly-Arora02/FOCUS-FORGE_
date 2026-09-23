export type UserRole = "student" | "professional" | "self_learner" | "other";

export interface UserPreferences {
  preferredSessionLength: number; // in minutes (e.g., 25, 45, 60)
  preferredFocusHours: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  coachingStyle: "direct" | "empathetic" | "socratic" | "enthusiastic";
  planningPreferences: {
    autoScheduleBreaks: boolean;
    bufferMinutes: number;
    maxDailyHours: number;
    aiGeneratedPlans: boolean;
  };
  cameraFocusEnabled: boolean;
  checkInFrequencyMinutes: number;
  soundEnabled: boolean;
  dailyFocusTargetMinutes: number;
}

export interface UserProfile {
  _id: string;
  authUserId: string;
  email: string;
  displayName: string;
  role: UserRole;
  timezone: string;
  ageRange?: string;
  onboardingCompleted: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: "academic" | "career" | "skill" | "habit" | "personal";
  priority: "low" | "medium" | "high" | "urgent";
  targetDate?: string;
  weeklyTargetHours: number;
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  _id: string;
  userId: string;
  name: string;
  color: string; // HEX color code, e.g. #43F59A
  icon: string;  // lucide icon name
  topics: string[];
  goalId?: string;
  estimatedWeeklyHours: number;
  createdAt: string;
}

export interface Task {
  _id: string;
  userId: string;
  subjectId?: string;
  goalId?: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  scheduledStart?: string; // ISO string
  estimatedDuration: number; // in minutes
  status: "pending" | "in_progress" | "completed" | "cancelled";
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PauseEvent {
  pausedAt: string;
  resumedAt?: string;
  reason?: string;
}

export interface FocusSession {
  _id: string;
  userId: string;
  subjectId?: string;
  taskId?: string;
  topic?: string;
  plannedDuration: number; // in minutes
  actualDuration: number;  // in seconds (pure focused duration excluding pauses)
  status: "idle" | "running" | "paused" | "completed" | "abandoned";
  startedAt: string;
  endedAt?: string;
  pauseEvents: PauseEvent[];
  focusRating?: number; // 1 to 5
  reflectionNotes?: string;
  distractionsReported?: string[];
  completionOutcome: "fully_completed" | "partially_completed" | "interrupted" | "extended";
  resourceAttachment?: {
    type: "youtube" | "web" | "doc" | "note";
    title: string;
    url?: string;
  };
  createdAt: string;
}

export interface DailyPlan {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timezone: string;
  tasks: Array<{
    id: string;
    title: string;
    subjectId?: string;
    subjectName?: string;
    priority: "low" | "medium" | "high";
    startTime: string; // "10:00"
    endTime: string;   // "11:00"
    durationMinutes: number;
    completed: boolean;
    isBreak?: boolean;
    breakActivity?: string;
  }>;
  totalPlannedMinutes: number;
  explanation: string;
  accepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PointsLedgerEntry {
  _id: string;
  userId: string;
  eventType: "session_completed" | "session_abandoned" | "streak_bonus" | "goal_milestone" | "plan_adherence" | "reflection_bonus";
  points: number;
  sessionId?: string;
  idempotencyKey: string;
  reason: string;
  createdAt: string;
}

export interface Reward {
  _id: string;
  userId: string;
  rewardType: "digital_card" | "badge" | "partner_coupon" | "merchandise_eligibility";
  milestoneHours: number; // 50, 100, 200, 500
  title: string;
  description: string;
  code?: string;
  badgeIcon: string;
  status: "locked" | "unlocked" | "claimed";
  claimedAt?: string;
  createdAt: string;
}

export interface Reflection {
  _id: string;
  userId: string;
  sessionId: string;
  focusRating: number;
  mood: "energized" | "neutral" | "drained" | "distracted";
  notes: string;
  distractions: string[];
  createdAt: string;
}

export interface Integration {
  _id: string;
  userId: string;
  provider: "google_drive" | "calendar" | "slack" | "notion";
  status: "connected" | "disconnected" | "error";
  externalAccountId?: string;
  scopes: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceItem {
  _id: string;
  userId: string;
  provider: "google_drive" | "upload" | "youtube" | "web_link" | "text_note";
  fileId?: string;
  fileName: string;
  mimeType?: string;
  resourceType: "timetable" | "syllabus" | "lecture" | "notes" | "cheatsheet";
  url?: string;
  contentSnippet?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "coach" | "system";
  content: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    action: string;
    payload?: any;
  }>;
}

export interface AIConversation {
  _id: string;
  userId: string;
  title: string;
  messages: AIChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface HeatmapDayData {
  date: string; // YYYY-MM-DD
  minutes: number;
  sessionsCount: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  subjects: Array<{ name: string; color: string; minutes: number }>;
}

export interface ProductivitySummary {
  todayFocusedMinutes: number;
  todayTargetMinutes: number;
  todaySessionsCount: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalFocusedHours: number;
  weeklyHours: number;
  weeklyCompletionRate: number;
  totalPoints: number;
  topSubject?: { name: string; color: string; minutes: number };
  completionRatePercent: number;
}
