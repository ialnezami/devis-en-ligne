// Calendar and Scheduling System Types

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: 'meeting' | 'deadline' | 'milestone' | 'task' | 'reminder' | 'external';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  location?: string;
  attendees: CalendarAttendee[];
  projectId?: string;
  phaseId?: string;
  taskId?: string;
  tags: string[];
  color: string;
  recurring?: RecurringPattern;
  reminders: Reminder[];
  notes?: string;
  attachments: CalendarAttachment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CalendarAttendee {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'organizer' | 'attendee' | 'optional';
  response: 'accepted' | 'declined' | 'pending' | 'tentative';
  responseDate?: Date;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // Every X days/weeks/months/years
  endDate?: Date;
  endAfterOccurrences?: number;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number;
  weekOfMonth?: number; // 1-5
  exceptions: Date[]; // Dates to exclude
}

export interface Reminder {
  id: string;
  type: 'email' | 'push' | 'sms' | 'desktop';
  time: number; // Minutes before event
  sent: boolean;
  sentAt?: Date;
}

export interface CalendarAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ProjectSchedule {
  id: string;
  projectId: string;
  projectName: string;
  phases: ScheduledPhase[];
  milestones: ScheduledMilestone[];
  dependencies: ScheduleDependency[];
  constraints: ScheduleConstraint[];
  estimatedDuration: number; // in days
  actualDuration?: number; // in days
  startDate: Date;
  endDate: Date;
  criticalPath: string[]; // Array of task IDs
  slackTime: number; // Total slack time in days
  resourceAllocations: ResourceAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledPhase {
  id: string;
  phaseId: string;
  phaseName: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  progress: number; // 0-100
  status: 'scheduled' | 'active' | 'completed' | 'delayed';
  dependencies: string[]; // Phase IDs
  resources: ResourceAllocation[];
  tasks: ScheduledTask[];
}

export interface ScheduledMilestone {
  id: string;
  milestoneId: string;
  milestoneName: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number; // 0-100
  deliverables: ScheduledDeliverable[];
  assignedTo: string[]; // User IDs
  dependencies: string[]; // Task IDs
}

export interface ScheduledTask {
  id: string;
  taskId: string;
  taskName: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  effort: number; // in hours
  progress: number; // 0-100
  status: 'scheduled' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string; // User ID
  dependencies: string[]; // Task IDs
  predecessors: string[]; // Task IDs that must complete first
  successors: string[]; // Task IDs that depend on this task
  slackTime: number; // Days this task can be delayed without affecting project
  isCritical: boolean;
  actualStartDate?: Date;
  actualEndDate?: Date;
  actualEffort?: number;
}

export interface ScheduledDeliverable {
  id: string;
  deliverableId: string;
  deliverableName: string;
  type: 'document' | 'code' | 'design' | 'review' | 'approval';
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo: string; // User ID
  dependencies: string[]; // Task IDs
}

export interface ScheduleDependency {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag: number; // in days
  critical: boolean;
}

export interface ScheduleConstraint {
  id: string;
  type: 'start-no-earlier-than' | 'start-no-later-than' | 'finish-no-earlier-than' | 'finish-no-later-than' | 'must-start-on' | 'must-finish-on';
  date: Date;
  taskId: string;
  description?: string;
}

export interface ResourceAllocation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: string;
  allocation: number; // Percentage of time allocated (0-100)
  startDate: Date;
  endDate: Date;
  hourlyRate: number;
  skills: string[];
  availability: ResourceAvailability[];
  conflicts: ResourceConflict[];
}

export interface ResourceAvailability {
  date: Date;
  available: boolean;
  reason?: string;
  hoursAvailable: number;
}

export interface ResourceConflict {
  id: string;
  type: 'overallocation' | 'unavailability' | 'skill-mismatch';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedTasks: string[];
  suggestedSolutions: string[];
}

export interface CalendarView {
  type: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'timeline';
  startDate: Date;
  endDate: Date;
  events: CalendarEvent[];
  filters: CalendarFilter;
  sort: CalendarSort;
}

export interface CalendarFilter {
  eventTypes?: CalendarEvent['type'][];
  priorities?: CalendarEvent['priority'][];
  statuses?: CalendarEvent['status'][];
  projects?: string[];
  phases?: string[];
  assignees?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CalendarSort {
  field: 'startDate' | 'endDate' | 'priority' | 'title' | 'type' | 'status';
  direction: 'asc' | 'desc';
}

export interface ExternalCalendar {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'ical' | 'exchange' | 'other';
  url?: string;
  apiKey?: string;
  syncEnabled: boolean;
  lastSync?: Date;
  syncInterval: number; // in minutes
  events: CalendarEvent[];
  permissions: 'read-only' | 'read-write' | 'full-access';
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarWidget {
  id: string;
  type: 'upcoming-events' | 'today-schedule' | 'deadlines' | 'resource-utilization' | 'project-timeline';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
  };
  settings: Record<string, any>;
  data: any;
  lastUpdated: Date;
}

export interface CalendarShare {
  id: string;
  calendarId: string;
  sharedWith: {
    userId: string;
    name: string;
    email: string;
    permissions: 'view' | 'edit' | 'manage';
  };
  sharedBy: string;
  sharedAt: Date;
  expiresAt?: Date;
}

export interface CalendarNotification {
  id: string;
  type: 'event-reminder' | 'deadline-approaching' | 'schedule-conflict' | 'resource-overallocation' | 'milestone-completed';
  title: string;
  message: string;
  eventId?: string;
  taskId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  sent: boolean;
  sentAt?: Date;
}

// Export all types
export type {
  CalendarEvent,
  CalendarAttendee,
  RecurringPattern,
  Reminder,
  CalendarAttachment,
  ProjectSchedule,
  ScheduledPhase,
  ScheduledMilestone,
  ScheduledTask,
  ScheduledDeliverable,
  ScheduleDependency,
  ScheduleConstraint,
  ResourceAllocation,
  ResourceAvailability,
  ResourceConflict,
  CalendarView,
  CalendarFilter,
  CalendarSort,
  ExternalCalendar,
  CalendarWidget,
  CalendarShare,
  CalendarNotification,
};
