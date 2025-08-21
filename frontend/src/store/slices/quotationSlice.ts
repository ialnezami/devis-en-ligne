import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface Quotation {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface CreateQuotationData {
  clientId: string;
  items: Omit<QuotationItem, 'id' | 'total'>[];
  validUntil: string;
  notes?: string;
  terms?: string;
  currency?: string;
}

export interface UpdateQuotationData {
  items?: Omit<QuotationItem, 'id' | 'total'>[];
  validUntil?: string;
  notes?: string;
  terms?: string;
  currency?: string;
  status?: Quotation['status'];
}

export interface QuotationFilters {
  status?: Quotation['status'];
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface QuotationState {
  quotations: Quotation[];
  currentQuotation: Quotation | null;
  isLoading: boolean;
  error: string | null;
  filters: QuotationFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: QuotationState = {
  quotations: [],
  currentQuotation: null,
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

// RTK Query API for quotations
export const quotationApi = createApi({
  reducerPath: 'quotationApi',
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
  tagTypes: ['Quotation', 'Quotations'],
  endpoints: (builder) => ({
    getQuotations: builder.query<{ quotations: Quotation[]; pagination: QuotationState['pagination'] }, QuotationFilters & { page?: number; limit?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        return `/quotations?${searchParams.toString()}`;
      },
      providesTags: ['Quotations'],
    }),
    getQuotationById: builder.query<Quotation, string>({
      query: (id) => `/quotations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quotation', id }],
    }),
    createQuotation: builder.mutation<Quotation, CreateQuotationData>({
      query: (data) => ({
        url: '/quotations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Quotations'],
    }),
    updateQuotation: builder.mutation<Quotation, { id: string; data: UpdateQuotationData }>({
      query: ({ id, data }) => ({
        url: `/quotations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotations'
      ],
    }),
    deleteQuotation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quotations'],
    }),
    sendQuotation: builder.mutation<Quotation, string>({
      query: (id) => ({
        url: `/quotations/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Quotation', id },
        'Quotations'
      ],
    }),
    acceptQuotation: builder.mutation<Quotation, string>({
      query: (id) => ({
        url: `/quotations/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Quotation', id },
        'Quotations'
      ],
    }),
    rejectQuotation: builder.mutation<Quotation, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/quotations/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotations'
      ],
    }),
    duplicateQuotation: builder.mutation<Quotation, string>({
      query: (id) => ({
        url: `/quotations/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Quotations'],
    }),
    exportQuotation: builder.mutation<Blob, { id: string; format: 'pdf' | 'docx' | 'xlsx' }>({
      query: ({ id, format }) => ({
        url: `/quotations/${id}/export`,
        method: 'POST',
        body: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),
    getQuotationStats: builder.query<{
      total: number;
      draft: number;
      sent: number;
      accepted: number;
      rejected: number;
      expired: number;
      totalValue: number;
      averageValue: number;
    }, void>({
      query: () => '/quotations/stats',
      providesTags: ['Quotations'],
    }),
  }),
});

// Export hooks
export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  useSendQuotationMutation,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
  useDuplicateQuotationMutation,
  useExportQuotationMutation,
  useGetQuotationStatsQuery,
} = quotationApi;

// Async thunks
export const fetchQuotations = createAsyncThunk(
  'quotation/fetchQuotations',
  async (filters: QuotationFilters & { page?: number; limit?: number }, { dispatch }) => {
    try {
      const response = await dispatch(
        quotationApi.endpoints.getQuotations.initiate(filters)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to fetch quotations');
    }
  }
);

export const createNewQuotation = createAsyncThunk(
  'quotation/createQuotation',
  async (data: CreateQuotationData, { dispatch }) => {
    try {
      const response = await dispatch(
        quotationApi.endpoints.createQuotation.initiate(data)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to create quotation');
    }
  }
);

export const updateExistingQuotation = createAsyncThunk(
  'quotation/updateQuotation',
  async ({ id, data }: { id: string; data: UpdateQuotationData }, { dispatch }) => {
    try {
      const response = await dispatch(
        quotationApi.endpoints.updateQuotation.initiate({ id, data })
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to update quotation');
    }
  }
);

// Quotation slice
const quotationSlice = createSlice({
  name: 'quotation',
  initialState,
  reducers: {
    setCurrentQuotation: (state, action: PayloadAction<Quotation | null>) => {
      state.currentQuotation = action.payload;
    },
    setFilters: (state, action: PayloadAction<QuotationFilters>) => {
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
    addQuotation: (state, action: PayloadAction<Quotation>) => {
      state.quotations.unshift(action.payload);
      state.pagination.total += 1;
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
    },
    updateQuotationInList: (state, action: PayloadAction<Quotation>) => {
      const index = state.quotations.findIndex(q => q.id === action.payload.id);
      if (index !== -1) {
        state.quotations[index] = action.payload;
      }
      if (state.currentQuotation?.id === action.payload.id) {
        state.currentQuotation = action.payload;
      }
    },
    removeQuotationFromList: (state, action: PayloadAction<string>) => {
      state.quotations = state.quotations.filter(q => q.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      if (state.currentQuotation?.id === action.payload) {
        state.currentQuotation = null;
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
      .addCase(fetchQuotations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotations = action.payload.quotations;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch quotations';
      })
      .addCase(createNewQuotation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotations.unshift(action.payload);
        state.pagination.total += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
        state.error = null;
      })
      .addCase(createNewQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create quotation';
      })
      .addCase(updateExistingQuotation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingQuotation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.quotations.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.quotations[index] = action.payload;
        }
        if (state.currentQuotation?.id === action.payload.id) {
          state.currentQuotation = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExistingQuotation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update quotation';
      });
  },
});

export const {
  setCurrentQuotation,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addQuotation,
  updateQuotationInList,
  removeQuotationFromList,
  setError,
  clearError,
  setLoading,
} = quotationSlice.actions;

export default quotationSlice.reducer;
