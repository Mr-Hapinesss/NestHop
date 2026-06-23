export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isBanned: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type HouseType =
  | 'Single Room'
  | 'Bedsitter'
  | '1 Bedroom'
  | '2 Bedrooms'
  | '3 Bedrooms'
  | '4+ Bedrooms'
  | 'Studio';

export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  houseType: HouseType;
  location: {
    address: string;
    city: string;
    area: string;
    lat: number;
    lng: number;
  };
  images: string[];
  notes: string;
  amenities: string[];
  landlord: User;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participants: User[];
  listing: Pick<Listing, '_id' | 'title' | 'images' | 'houseType'>;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface SupportTicket {
  _id: string;
  contact: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  userId?: string;
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalLandlords: number;
  totalListings: number;
  openTickets: number;
}

export interface OTPState {
  contact: string;
  contactType: 'email' | 'phone';
  step: 'input' | 'verify';
  expiresAt: number | null;
}

export interface FilterState {
  city: string;
  area: string;
  houseType: HouseType | '';
  minPrice: number | '';
  maxPrice: number | '';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}