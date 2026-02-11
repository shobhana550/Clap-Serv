/**
 * App-specific TypeScript types and interfaces for Clap-Serv
 */

import { Database } from './database.types';

// Extract table types from Database
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row'];
export type ServiceRequest = Database['public']['Tables']['service_requests']['Row'];
export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];

// User role type
export type UserRole = 'buyer' | 'provider' | 'both';

// Service Region type
export interface ServiceRegion {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  lat?: number;
  lng?: number;
  radius_km: number;
  is_active: boolean;
  created_at: string;
}

// Region-Category mapping
export interface RegionCategory {
  region_id: string;
  category_id: string;
}

// Location type
export interface Location {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  postalCode?: string;
}

// Portfolio item type
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  date?: string;
}

// Certification type
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

// Extended types with relationships
export interface ServiceRequestWithDetails extends ServiceRequest {
  buyer?: Profile;
  category?: {
    id: string;
    name: string;
    icon: string;
    max_distance_km: number | null;
  };
  proposalCount?: number;
  proposals?: ProposalWithProvider[];
}

export interface ProposalWithProvider extends Proposal {
  provider?: Profile;
  providerProfile?: ProviderProfile;
  request?: ServiceRequest;
}

export interface ProposalWithDetails extends Proposal {
  provider?: Profile;
  providerProfile?: ProviderProfile;
  request?: ServiceRequestWithDetails;
}

export interface ProjectWithDetails extends Project {
  buyer?: Profile;
  provider?: Profile;
  request?: ServiceRequest;
  proposal?: Proposal;
}

export interface ConversationWithDetails extends Conversation {
  buyer?: Profile;
  provider?: Profile;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface MessageWithSender extends Message {
  sender?: Profile;
}

// Form data types
export interface ServiceRequestFormData {
  categoryId: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  timeline?: string;
  deadline?: string;
  location?: Location;
  attachments?: string[];
}

export interface ProposalFormData {
  requestId: string;
  price: number;
  timelineEstimate?: string;
  coverLetter?: string;
  portfolioSamples?: string[];
}

export interface ProfileFormData {
  fullName: string;
  phone?: string;
  role: UserRole;
  location?: Location;
  avatarUrl?: string;
}

export interface ProviderProfileFormData {
  skills: string[];
  hourlyRate?: number;
  bio?: string;
  portfolioItems?: PortfolioItem[];
  certifications?: Certification[];
}

// Filter and search types
export interface OpportunityFilters {
  categoryId?: string;
  budgetMin?: number;
  budgetMax?: number;
  maxDistance?: number;
  location?: Location;
  sortBy?: 'newest' | 'budget_high' | 'budget_low' | 'closest';
}

export interface ProposalFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  requestId?: string;
}

export interface RequestFilters {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  categoryId?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Authentication types
export interface AuthState {
  user: any | null; // Supabase User type
  session: any | null; // Supabase Session type
  loading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

// Notification types
export interface AppNotification {
  id: string;
  type: 'new_proposal' | 'proposal_accepted' | 'proposal_rejected' | 'new_message' | 'project_update' | 'new_opportunity';
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

// Stats and analytics types
export interface BuyerStats {
  activeRequests: number;
  receivedProposals: number;
  activeProjects: number;
  totalSpent: number;
}

export interface ProviderStats {
  submittedBids: number;
  acceptedBids: number;
  activeProjects: number;
  totalEarned: number;
  rating: number;
  totalReviews: number;
}

// Error types
export interface AppError {
  code?: string;
  message: string;
  details?: any;
}

// Upload types
export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

// Distance calculation result
export interface DistanceResult {
  distance: number; // in kilometers
  unit: 'km' | 'mi';
}
