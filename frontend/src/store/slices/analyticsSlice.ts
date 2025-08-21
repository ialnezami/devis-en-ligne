import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface AnalyticsData {
  period: string;
  revenue: number;
  quotations: number;
  clients: number;
  conversionRate: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
}

export interface AnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsState {
  overview: {
    totalRevenue: number;
    totalQuotations: number;
    totalClients: number;
    conversionRate: number;
    periodChange: {
      revenue: number;
      quotations: number;
      clients: number;
      conversionRate: number;
    };
  };
  revenueChart: ChartData | null;
  quotationsChart: ChartData | null;
  conversionFunnel: ConversionFunnel[];
  topPerformers: {
    clients: TopPerformer[];
    quotations: TopPerformer[];
    revenue: TopPerformer[];
  };
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
}

// Initial state
const initialState: AnalyticsState = {
  overview: {
    totalRevenue: 0,
    totalQuotations: 0,
    totalClients: 0,
    conversionRate: 0,
    periodChange: {
      revenue: 0,
      quotations: 0,
      clients: 0,
      conversionRate: 0,
    },
  },
  revenueChart: null,
  quotationsChart: null,
  conversionFunnel: [],
  topPerformers: {
    clients: [],
    quotations: [],
    revenue: [],
  },
  isLoading: false,
  error: null,
  filters: {
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    dateTo: new Date().toISOString().split('T')[0], // today
    period: 'monthly',
    groupBy: 'day',
  },
};

// RTK Query API for analytics
export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
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
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getOverview: builder.query<AnalyticsState['overview'], AnalyticsFilters>({
      query: (filters) => {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        return `/analytics/overview?${searchParams.toString()}`;
      },
      providesTags: ['Analytics'],
    }),
    getRevenueChart: builder.query<ChartData, AnalyticsFilters>({
      query: (filters) => {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        return `/analytics/revenue-chart?${searchParams.toString()}`;
      },
      providesTags: ['Analytics'],
    }),
    getQuotationsChart: builder.query<ChartData, AnalyticsFilters>({
      query: (filters) => {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        return `/analytics/quotations-chart?${searchParams.toString()}`;
      },
      providesTags: ['Analytics'],
    }),
    getConversionFunnel: builder.query<ConversionFunnel[], AnalyticsFilters>({
      query: (filters) => {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        return `/analytics/conversion-funnel?${searchParams.toString()}`;
      },
      providesTags: ['Analytics'],
    }),
    getTopPerformers: builder.query<AnalyticsState['topPerformers'], AnalyticsFilters>({
      query: (filters) => {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        return `/analytics/top-performers?${searchParams.toString()}`;
      },
      providesTags: ['Analytics'],
    }),
    exportAnalytics: builder.mutation<Blob, { format: 'csv' | 'xlsx' | 'pdf'; filters: AnalyticsFilters; type: 'overview' | 'revenue' | 'quotations' | 'funnel' | 'performers' }>({
      query: ({ format, filters, type }) => ({
        url: `/analytics/export`,
        method: 'POST',
        body: { format, filters, type },
        responseHandler: (response) => response.blob(),
      }),
    }),
    generateReport: builder.mutation<{ reportId: string; downloadUrl: string }, { filters: AnalyticsFilters; reportType: string; email?: string }>({
      query: (data) => ({
        url: '/analytics/reports',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetOverviewQuery,
  useGetRevenueChartQuery,
  useGetQuotationsChartQuery,
  useGetConversionFunnelQuery,
  useGetTopPerformersQuery,
  useExportAnalyticsMutation,
  useGenerateReportMutation,
} = analyticsApi;

// Async thunks
export const fetchAnalyticsOverview = createAsyncThunk(
  'analytics/fetchOverview',
  async (filters: AnalyticsFilters, { dispatch }) => {
    try {
      const response = await dispatch(
        analyticsApi.endpoints.getOverview.initiate(filters)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to fetch analytics overview');
    }
  }
);

export const fetchRevenueChart = createAsyncThunk(
  'analytics/fetchRevenueChart',
  async (filters: AnalyticsFilters, { dispatch }) => {
    try {
      const response = await dispatch(
        analyticsApi.endpoints.getRevenueChart.initiate(filters)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to fetch revenue chart');
    }
  }
);

export const fetchQuotationsChart = createAsyncThunk(
  'analytics/fetchQuotationsChart',
  async (filters: AnalyticsFilters, { dispatch }) => {
    try {
      const response = await dispatch(
        analyticsApi.endpoints.getQuotationsChart.initiate(filters)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to fetch quotations chart');
    }
  }
);

export const fetchConversionFunnel = createAsyncThunk(
  'analytics/fetchConversionFunnel',
  async (filters: AnalyticsFilters, { dispatch }) => {
    try {
      const response = await dispatch(
        analyticsApi.endpoints.getConversionFunnel.initiate(filters)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to fetch conversion funnel');
    }
  }
);

export const fetchTopPerformers = createAsyncThunk(
  'analytics/fetchTopPerformers',
  async (filters: AnalyticsFilters, { dispatch }) => {
    try {
      const response = await dispatch(
        analyticsApi.endpoints.getTopPerformers.initiate(filters)
      ).unwrap();
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to fetch top performers');
    }
  }
);

// Analytics slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AnalyticsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setDateRange: (state, action: PayloadAction<{ dateFrom: string; dateTo: string }>) => {
      state.filters.dateFrom = action.payload.dateFrom;
      state.filters.dateTo = action.payload.dateTo;
    },
    setPeriod: (state, action: PayloadAction<AnalyticsFilters['period']>) => {
      state.filters.period = action.payload;
    },
    setGroupBy: (state, action: PayloadAction<AnalyticsFilters['groupBy']>) => {
      state.filters.groupBy = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        period: 'monthly',
        groupBy: 'day',
      };
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
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch analytics overview';
      })
      .addCase(fetchRevenueChart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueChart = action.payload;
        state.error = null;
      })
      .addCase(fetchRevenueChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch revenue chart';
      })
      .addCase(fetchQuotationsChart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotationsChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotationsChart = action.payload;
        state.error = null;
      })
      .addCase(fetchQuotationsChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch quotations chart';
      })
      .addCase(fetchConversionFunnel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversionFunnel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversionFunnel = action.payload;
        state.error = null;
      })
      .addCase(fetchConversionFunnel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch conversion funnel';
      })
      .addCase(fetchTopPerformers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopPerformers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topPerformers = action.payload;
        state.error = null;
      })
      .addCase(fetchTopPerformers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch top performers';
      });
  },
});

export const {
  setFilters,
  setDateRange,
  setPeriod,
  setGroupBy,
  resetFilters,
  setError,
  clearError,
  setLoading,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
