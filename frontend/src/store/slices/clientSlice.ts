import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  website?: string;
  industry?: string;
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  source?: 'website' | 'referral' | 'social_media' | 'cold_outreach' | 'other';
  notes?: string;
  tags?: string[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  lastContact?: string;
  totalRevenue?: number;
  quotationCount?: number;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: Client['address'];
  website?: string;
  industry?: string;
  status?: Client['status'];
  source?: Client['source'];
  notes?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: Client['address'];
  website?: string;
  industry?: string;
  status?: Client['status'];
  source?: Client['source'];
  notes?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface ClientFilters {
  status?: Client['status'];
  industry?: string;
  source?: Client['source'];
  assignedTo?: string;
  search?: string;
  tags?: string[];
}

export interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
  filters: ClientFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: ClientState = {
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// RTK Query API for clients
export const clientApi = createApi({
  reducerPath: 'clientApi',
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
  tagTypes: ['Client', 'Clients'],
  endpoints: (builder) => ({
    getClients: builder.query<{ clients: Client[]; pagination: ClientState['pagination'] }, ClientFilters & { page?: number; limit?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => searchParams.append(key, v));
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });
        return `/clients?${searchParams.toString()}`;
      },
      providesTags: ['Clients'],
    }),
    getClientById: builder.query<Client, string>({
      query: (id) => `/clients/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Client', id }],
    }),
    createClient: builder.mutation<Client, CreateClientData>({
      query: (data) => ({
        url: '/clients',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Clients'],
    }),
    updateClient: builder.mutation<Client, { id: string; data: UpdateClientData }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Client', id },
        'Clients'
      ],
    }),
    deleteClient: builder.mutation<void, string>({
      query: (id) => ({
        url: `/clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),
    deactivateClient: builder.mutation<Client, string>({
      query: (id) => ({
        url: `/clients/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Client', id },
        'Clients'
      ],
    }),
    activateClient: builder.mutation<Client, string>({
      query: (id) => ({
        url: `/clients/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Client', id },
        'Clients'
      ],
    }),
    addClientTag: builder.mutation<Client, { id: string; tag: string }>({
      query: ({ id, tag }) => ({
        url: `/clients/${id}/tags`,
        method: 'POST',
        body: { tag },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Client', id },
        'Clients'
      ],
    }),
    removeClientTag: builder.mutation<Client, { id: string; tag: string }>({
      query: ({ id, tag }) => ({
        url: `/clients/${id}/tags/${encodeURIComponent(tag)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Client', id },
        'Clients'
      ],
    }),
    getClientStats: builder.query<{
      total: number;
      active: number;
      inactive: number;
      prospect: number;
      lead: number;
      totalRevenue: number;
      averageRevenue: number;
      topIndustries: Array<{ industry: string; count: number }>;
      topSources: Array<{ source: string; count: number }>;
    }, void>({
      query: () => '/clients/stats',
      providesTags: ['Clients'],
    }),
    exportClients: builder.mutation<Blob, { format: 'csv' | 'xlsx' | 'pdf'; filters?: ClientFilters }>({
      query: ({ format, filters }) => ({
        url: '/clients/export',
        method: 'POST',
        body: { format, filters },
        responseHandler: (response) => response.blob(),
      }),
    }),
    importClients: builder.mutation<{ success: number; errors: string[] }, FormData>({
      query: (formData) => ({
        url: '/clients/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Clients'],
    }),
  }),
});

// Export hooks
export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useDeactivateClientMutation,
  useActivateClientMutation,
  useAddClientTagMutation,
  useRemoveClientTagMutation,
  useGetClientStatsQuery,
  useExportClientsMutation,
  useImportClientsMutation,
} = clientApi;

// Async thunks
export const fetchClients = createAsyncThunk(
  'client/fetchClients',
  async (filters: ClientFilters & { page?: number; limit?: number }, { dispatch }) => {
    try {
      const response = await dispatch(
        clientApi.endpoints.getClients.initiate(filters)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to fetch clients');
    }
  }
);

export const createNewClient = createAsyncThunk(
  'client/createClient',
  async (data: CreateClientData, { dispatch }) => {
    try {
      const response = await dispatch(
        clientApi.endpoints.createClient.initiate(data)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to create client');
    }
  }
);

export const updateExistingClient = createAsyncThunk(
  'client/updateClient',
  async ({ id, data }: { id: string; data: UpdateClientData }, { dispatch }) => {
    try {
      const response = await dispatch(
        clientApi.endpoints.updateClient.initiate({ id, data })
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to update client');
    }
  }
);

// Client slice
const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setCurrentClient: (state, action: PayloadAction<Client | null>) => {
      state.currentClient = action.payload;
    },
    setFilters: (state, action: PayloadAction<ClientFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when limit changes
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.unshift(action.payload);
      state.pagination.total += 1;
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
    },
    updateClientInList: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
      if (state.currentClient?.id === action.payload.id) {
        state.currentClient = action.payload;
      }
    },
    removeClientFromList: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(c => c.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      if (state.currentClient?.id === action.payload) {
        state.currentClient = null;
      }
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
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = action.payload.clients;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch clients';
      })
      .addCase(createNewClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients.unshift(action.payload);
        state.pagination.total += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
        state.error = null;
      })
      .addCase(createNewClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create client';
      })
      .addCase(updateExistingClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingClient.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.clients.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.currentClient?.id === action.payload.id) {
          state.currentClient = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExistingClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update client';
      });
  },
});

export const {
  setCurrentClient,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addClient,
  updateClientInList,
  removeClientFromList,
  setError,
  clearError,
  setLoading,
} = clientSlice.actions;

export default clientSlice.reducer;
