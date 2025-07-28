export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  profile?: UserProfile | null;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  bio?: string;
  location?: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  profileImage?: string;
  coverImage?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      showEmail: boolean;
      showPhone: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  interests?: string[];
  occupation?: string;
  company?: string;
  education?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  lastActive?: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface FileUploadResult {
  success: boolean;
  downloadURL?: string;
  error?: string;
  progress?: number;
}
