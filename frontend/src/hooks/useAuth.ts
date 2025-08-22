import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';

export const useAuth = () => {
  const authContext = useAuthContext();
  const authState = useAppSelector(state => state.auth);

  return {
    ...authContext,
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    token: authState.token
  };
};
