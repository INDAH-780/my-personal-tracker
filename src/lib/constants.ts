export type OpportunityCategory =
  | "FELLOWSHIP"
  | "SCHOLARSHIP"
  | "RESEARCH_PROGRAM"
  | "INTERNSHIP"
  | "BOOTCAMP"
  | "SUMMER_SCHOOL"
  | "HACKATHON"
  | "CONFERENCE"
  | "WORKSHOP"
  | "LEADERSHIP_PROGRAM"
  | "OPEN_SOURCE_PROGRAM"
  | "AMBASSADOR_PROGRAM"
  | "GRANT"
  | "COMPETITION"
  | "INNOVATION_CHALLENGE"
  | "COMMUNITY_PROGRAM"
  | "RESIDENCY"
  | "TRAINING"
  | "OTHER";

export type OpportunityStatus =
  | "WISHLIST"
  | "DRAFTING"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WAITLISTED"
  | "WITHDRAWN"
  | "COMPLETED";

export type FundingType =
  | "FULLY_FUNDED"
  | "PARTIALLY_FUNDED"
  | "STIPEND"
  | "UNFUNDED"
  | "UNKNOWN";

export type DiaryEntryType =
  | "MENTORSHIP_SESSION"
  | "MEETING"
  | "EVENT"
  | "WORKSHOP"
  | "REFLECTION"
  | "GOAL_SETTING"
  | "APPLICATION_UPDATE"
  | "LEARNING_NOTE"
  | "GENERAL";

export type CourseStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAUSED"
  | "DROPPED";

export type ProgramStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "DROPPED";

export type ScholarshipStatus =
  | "WISHLIST"
  | "PREPARING"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "AWARDED"
  | "REJECTED"
  | "WAITLISTED";

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  FELLOWSHIP: "Fellowship",
  SCHOLARSHIP: "Scholarship",
  RESEARCH_PROGRAM: "Research Program",
  INTERNSHIP: "Internship",
  BOOTCAMP: "Bootcamp",
  SUMMER_SCHOOL: "Summer School",
  HACKATHON: "Hackathon",
  CONFERENCE: "Conference",
  WORKSHOP: "Workshop",
  LEADERSHIP_PROGRAM: "Leadership Program",
  OPEN_SOURCE_PROGRAM: "Open Source Program",
  AMBASSADOR_PROGRAM: "Ambassador Program",
  GRANT: "Grant",
  COMPETITION: "Competition",
  INNOVATION_CHALLENGE: "Innovation Challenge",
  COMMUNITY_PROGRAM: "Community Program",
  RESIDENCY: "Residency",
  TRAINING: "Training / Course",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  WISHLIST: "Wishlist",
  DRAFTING: "Drafting",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WAITLISTED: "Waitlisted",
  WITHDRAWN: "Withdrawn",
  COMPLETED: "Completed",
};

export const STATUS_COLORS: Record<OpportunityStatus, string> = {
  WISHLIST: "bg-gray-100 text-gray-700",
  DRAFTING: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WAITLISTED: "bg-orange-100 text-orange-700",
  WITHDRAWN: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export const FUNDING_LABELS: Record<FundingType, string> = {
  FULLY_FUNDED: "Fully Funded",
  PARTIALLY_FUNDED: "Partially Funded",
  STIPEND: "Stipend Provided",
  UNFUNDED: "Unfunded / Free",
  UNKNOWN: "Unknown",
};

export const DIARY_TYPE_LABELS: Record<DiaryEntryType, string> = {
  MENTORSHIP_SESSION: "Mentorship Session",
  MEETING: "Meeting",
  EVENT: "Event",
  WORKSHOP: "Workshop",
  REFLECTION: "Reflection",
  GOAL_SETTING: "Goal Setting",
  APPLICATION_UPDATE: "Application Update",
  LEARNING_NOTE: "Learning Note",
  GENERAL: "General",
};

export const DIARY_TYPE_COLORS: Record<DiaryEntryType, string> = {
  MENTORSHIP_SESSION: "bg-indigo-100 text-indigo-700",
  MEETING: "bg-blue-100 text-blue-700",
  EVENT: "bg-green-100 text-green-700",
  WORKSHOP: "bg-purple-100 text-purple-700",
  REFLECTION: "bg-amber-100 text-amber-700",
  GOAL_SETTING: "bg-teal-100 text-teal-700",
  APPLICATION_UPDATE: "bg-cyan-100 text-cyan-700",
  LEARNING_NOTE: "bg-rose-100 text-rose-700",
  GENERAL: "bg-gray-100 text-gray-700",
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  DROPPED: "Dropped",
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  DROPPED: "bg-red-100 text-red-700",
};

export const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};

export const PROGRAM_STATUS_COLORS: Record<ProgramStatus, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PAUSED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  DROPPED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export const SCHOLARSHIP_STATUS_LABELS: Record<ScholarshipStatus, string> = {
  WISHLIST: "Wishlist",
  PREPARING: "Preparing",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  AWARDED: "Awarded",
  REJECTED: "Rejected",
  WAITLISTED: "Waitlisted",
};

export const SCHOLARSHIP_STATUS_COLORS: Record<ScholarshipStatus, string> = {
  WISHLIST: "bg-gray-100 text-gray-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  AWARDED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WAITLISTED: "bg-orange-100 text-orange-700",
};

export const TAGS = [
  "AI / Machine Learning",
  "Healthcare AI",
  "Agriculture AI",
  "Computer Vision",
  "NLP / Language",
  "Robotics",
  "Embedded Systems / TinyML",
  "Data Science",
  "Research",
  "Open Source",
  "Leadership",
  "Entrepreneurship",
  "Technical Writing",
  "Women",
  "Youth",
  "Beginner Friendly",
  "Advanced",
];

export const REGIONS = [
  "Global",
  "Africa",
  "Europe",
  "North America",
  "Asia",
  "South America",
  "Remote / Online",
  "Cameroon",
  "Nigeria",
  "Kenya",
  "Ghana",
  "South Africa",
  "Rwanda",
];

export const COURSE_PLATFORMS = [
  "Coursera",
  "edX",
  "Udemy",
  "YouTube",
  "freeCodeCamp",
  "Codecademy",
  "Khan Academy",
  "LinkedIn Learning",
  "Pluralsight",
  "Skillshare",
  "Udacity",
  "MIT OpenCourseWare",
  "Stanford Online",
  "Other",
];
