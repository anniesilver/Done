// User type definitions

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}
