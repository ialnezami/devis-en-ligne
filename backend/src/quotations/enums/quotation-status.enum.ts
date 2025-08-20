export enum QuotationStatus {
  // Initial States
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  
  // Approval States
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  
  // Active States
  ACTIVE = 'active',
  SENT = 'sent',
  
  // Response States
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  
  // Final States
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum QuotationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ApprovalLevel {
  MANAGER = 'manager',
  DIRECTOR = 'director',
  EXECUTIVE = 'executive',
}

export enum RevisionReason {
  PRICING_UPDATE = 'pricing_update',
  SCOPE_CHANGE = 'scope_change',
  TERMS_UPDATE = 'terms_update',
  TECHNICAL_UPDATE = 'technical_update',
  CLIENT_REQUEST = 'client_request',
  INTERNAL_REVIEW = 'internal_review',
  OTHER = 'other',
}
