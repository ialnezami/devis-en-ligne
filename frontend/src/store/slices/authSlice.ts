import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'sales_rep' | 'user';
  company?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// RTK Query API for authentication
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { dispatch }) => {
    try {
      const response = await dispatch(
        authApi.endpoints.login.initiate(credentials)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { dispatch }) => {
    try {
      const response = await dispatch(
        authApi.endpoints.register.initiate(userData)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await dispatch(authApi.endpoints.logout.initiate()).unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed, continuing with local logout');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('token');
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  setUser,
  setError,
  clearError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
