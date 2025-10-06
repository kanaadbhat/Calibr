export interface EmployerProfileData {
  name: string;
  email: string;
  companyName: string;
  tagline: string;
  description?: string;
  industry: string;
  companySize: string;
  foundedYear?: string;
  website?: string;
  location: string;
  profileImage?: string;
  companyLogo?: string;
  socialLinks: SocialLinks;
  benefits: string[];
  culture?: string;
}

export interface SocialLinks {
  linkedin: string;
  twitter: string;
  facebook: string;
}

export interface EmployerProfileResponse {
  success: boolean;
  message: string;
  data: EmployerProfileData | null;
  completionPercentage: number;
  error?: string;
}
