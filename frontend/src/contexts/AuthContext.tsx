import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useGetCurrentUserQuery, useLogoutMutation } from '@/store/slices/authSlice';
import { clearCredentials } from '@/store/slices/authSlice';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkTokenExpiry: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, token } = useAppSelector(state => state.auth);
  
  const [logout] = useLogoutMutation();
  
  // Query current user if authenticated
  const { data: currentUser, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated || !token,
    pollingInterval: 5 * 60 * 1000, // Poll every 5 minutes to check token validity
  });

  // Check token expiry and handle auto-logout
  const checkTokenExpiry = () => {
    if (!token) return;

    try {
      // Decode JWT token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired, logging out user');
        handleLogout();
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
      // If we can't decode the token, it's invalid
      handleLogout();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state
      dispatch(clearCredentials());
      localStorage.removeItem('token');
      localStorage.removeItem('rememberedEmail');
    }
  };

  // Check token expiry periodically
  useEffect(() => {
    if (!token) return;

    // Check immediately
    checkTokenExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  // Handle authentication errors
  useEffect(() => {
    if (error && isAuthenticated) {
      console.log('Authentication error detected, logging out user');
      handleLogout();
    }
  }, [error, isAuthenticated]);

  // Set up beforeunload event to handle page refresh/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current auth state to sessionStorage for persistence across page refreshes
      if (isAuthenticated && user) {
        sessionStorage.setItem('auth_state', JSON.stringify({ user, token }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, user, token]);

  // Restore auth state from sessionStorage on mount
  useEffect(() => {
    const savedAuthState = sessionStorage.getItem('auth_state');
    if (savedAuthState && !isAuthenticated) {
      try {
        const { user: savedUser, token: savedToken } = JSON.parse(savedAuthState);
        // Only restore if we have both user and token
        if (savedUser && savedToken) {
          // Validate token before restoring
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp > currentTime) {
            // Token is still valid, restore state
            dispatch(clearCredentials()); // Clear first to avoid conflicts
            // Note: The Redux store will handle the actual restoration
            // This is just for session persistence across page refreshes
          } else {
            // Token expired, clear session storage
            sessionStorage.removeItem('auth_state');
          }
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        sessionStorage.removeItem('auth_state');
      }
    }
  }, []);

  const value: AuthContextType = {
    user: currentUser || user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    checkTokenExpiry
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
