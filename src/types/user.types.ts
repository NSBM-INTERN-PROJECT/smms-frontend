export interface User {
  id: string;
  email: string;
  role: string; // 'admin', 'mentor', 'mentee'
  name?: string;
  profileData?: any;
}

export interface CreateUserDto {
  email: string;
  passwordHash: string;
  role: string;
  name?: string;
}

export interface UpdateUserDto {
  name?: string;
  profileData?: any;
}
