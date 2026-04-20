import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  authApi,
  type User,
  type RegisterData,
  type LoginData,
} from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('termburg_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch {
      localStorage.removeItem('termburg_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (data: LoginData) => {
      const result = await authApi.login(data);
      localStorage.setItem('termburg_token', result.token);
      setUser(result.user);
      navigate('/account');
    },
    [navigate]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const result = await authApi.register(data);
      localStorage.setItem('termburg_token', result.token);
      setUser(result.user);
      navigate('/account');
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('termburg_token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateProfile = useCallback(
    async (data: { name?: string; phone?: string }) => {
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for requiring authentication
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
}
