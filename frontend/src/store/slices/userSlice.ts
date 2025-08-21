import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from './authSlice';

// Types
export interface UserProfile extends User {
  phone?: string;
  address?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  preferences?: Partial<UserProfile['preferences']>;
}

export interface UserState {
  currentUser: UserProfile | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  currentUser: null,
  users: [],
  isLoading: false,
  error: null,
};

// RTK Query API for user management
export const userApi = createApi({
  reducerPath: 'userApi',
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
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<UserProfile, UserUpdateData>({
      query: (data) => ({
        url: '/users/me',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/users/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    uploadAvatar: builder.mutation<{ avatar: string }, FormData>({
      query: (formData) => ({
        url: '/users/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    getAllUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<User, Omit<User, 'id' | 'createdAt'>>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        'Users'
      ],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    deactivateUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/users/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        'Users'
      ],
    }),
    activateUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        'Users'
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useDeactivateUserMutation,
  useActivateUserMutation,
} = userApi;

// Async thunks
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: UserUpdateData, { dispatch }) => {
    try {
      const response = await dispatch(
        userApi.endpoints.updateProfile.initiate(data)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Profile update failed');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'user/changePassword',
  async (data: { currentPassword: string; newPassword: string }, { dispatch }) => {
    try {
      await dispatch(
        userApi.endpoints.changePassword.initiate(data)
      ).unwrap();
    } catch (error: any) {
      throw new Error(error.data?.message || 'Password change failed');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async (_, { dispatch }) => {
    try {
      const response = await dispatch(
        userApi.endpoints.getAllUsers.initiate()
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to fetch users');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<UserProfile>) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.error = null;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
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
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Profile update failed';
      })
      .addCase(changeUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Password change failed';
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });
  },
});

export const {
  setCurrentUser,
  clearCurrentUser,
  setUsers,
  addUser,
  updateUserInList,
  removeUserFromList,
  setError,
  clearError,
  setLoading,
} = userSlice.actions;

export default userSlice.reducer;
