import { useAuthStore } from '../store/auth.store';
import { login as loginApi } from '../api/auth.api';
import { LoginDto } from '../types/auth.types';
import { useState } from 'react';

export const useAuth = () => {
  const authState = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginApi(credentials);
      authState.setAuth(response.token, response.user);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...authState,
    login,
    isLoading,
    error,
  };
};
