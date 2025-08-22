// Project and Phase Management Types

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[]; // Array of phase IDs this phase depends on
  milestones: Milestone[];
  resources: ResourceAllocation[];
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number; // 0-100
  deliverables: Deliverable[];
  assignedTo: string[]; // User IDs
  completedAt?: Date;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'code' | 'design' | 'review' | 'approval';
  status: 'pending' | 'in-progress' | 'completed' | 'review' | 'approved';
  dueDate: Date;
  assignedTo: string; // User ID
  attachments: Attachment[];
  comments: Comment[];
  completedAt?: Date;
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
  hourlyRate?: number;
  skills: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt?: Date;
  replies: Comment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  phases: ProjectPhase[];
  client: {
    id: string;
    name: string;
    email: string;
  };
  manager: {
    id: string;
    name: string;
    email: string;
  };
  team: ResourceAllocation[];
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  startDate: Date;
  endDate: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  phases: Omit<ProjectPhase, 'id' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'>[];
  estimatedDuration: number; // in days
  estimatedBudget: number;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhaseCollaboration {
  id: string;
  phaseId: string;
  type: 'comment' | 'review' | 'approval' | 'notification';
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  recipients: string[]; // User IDs
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  attachments: Attachment[];
  replies: Comment[];
}

export interface PhaseProgress {
  phaseId: string;
  phaseName: string;
  overallProgress: number;
  milestoneProgress: number;
  deliverableProgress: number;
  resourceUtilization: number;
  budgetUtilization: number;
  timelineStatus: 'on-track' | 'behind' | 'ahead' | 'at-risk';
  lastUpdated: Date;
}

export interface ResourceUtilization {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalAllocation: number;
  currentProjects: {
    projectId: string;
    projectName: string;
    allocation: number;
    startDate: Date;
    endDate: Date;
  }[];
  availability: {
    date: Date;
    available: boolean;
    reason?: string;
  }[];
  skills: string[];
  hourlyRate: number;
}

export interface TimelineDependency {
  id: string;
  sourcePhaseId: string;
  targetPhaseId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag: number; // in days
  critical: boolean;
}

export interface PhaseFilter {
  status?: ProjectPhase['status'][];
  priority?: ProjectPhase['priority'][];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignedTo?: string[];
  progress?: {
    min: number;
    max: number;
  };
}

export interface PhaseSort {
  field: 'name' | 'startDate' | 'endDate' | 'progress' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

// Export all types
export type {
  ProjectPhase,
  Milestone,
  Deliverable,
  ResourceAllocation,
  Attachment,
  Comment,
  Project,
  PhaseTemplate,
  PhaseCollaboration,
  PhaseProgress,
  ResourceUtilization,
  TimelineDependency,
  PhaseFilter,
  PhaseSort,
};
