import { UserRole, IncidentSeverity, IncidentStatus } from '@prisma/client';

// User types
export interface CreateUserRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Incident types
export interface CreateIncidentRequest {
  title: string;
  severity: IncidentSeverity;
  tags: string[];
}

export interface UpdateIncidentRequest {
  title?: string;
  severity?: IncidentSeverity;
  tags?: string[];
}

export interface IncidentResponse {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    email: string;
  };
  _count: {
    timelineEvents: number;
    reviews: number;
  };
}

// Timeline types
export interface CreateTimelineEventRequest {
  content: string;
}

export interface TimelineEventResponse {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  creator: {
    id: string;
    email: string;
  };
}

// Review types
export interface CreateReviewRequest {
  status: IncidentStatus;
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  status: IncidentStatus;
  comment?: string;
  reviewedBy: string;
  reviewedAt: Date;
  reviewer: {
    id: string;
    email: string;
  };
}

// Share link types
export interface CreateShareLinkRequest {
  expiresAt: Date;
}

export interface ShareLinkResponse {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  url: string;
}

// Search and filter types
export interface IncidentFilters {
  search?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Request with user context (for backward compatibility)
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}
