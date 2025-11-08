// API client for AI Twin Analytics Dashboard
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Metrics API
export async function getMetricsData(dateRange: { start: string; end: string }) {
  const response = await api.get('/api/metrics', {
    params: {
      start_date: dateRange.start,
      end_date: dateRange.end,
    },
  });
  return response.data;
}

// Activity chart data
export async function getActivityData(dateRange: { start: string; end: string }) {
  const response = await api.get('/api/charts/activity', {
    params: {
      start_date: dateRange.start,
      end_date: dateRange.end,
    },
  });
  return response.data;
}

// Conversation chart data
export async function getConversationData(dateRange: { start: string; end: string }) {
  const response = await api.get('/api/charts/conversation', {
    params: {
      start_date: dateRange.start,
      end_date: dateRange.end,
    },
  });
  return response.data;
}

// Feature engagement chart data
export async function getFeatureEngagementData(dateRange: { start: string; end: string }) {
  const response = await api.get('/api/charts/engagement', {
    params: {
      start_date: dateRange.start,
      end_date: dateRange.end,
    },
  });
  return response.data;
}

// Feature distribution (pie chart)
export async function getFeatureDistribution(dateRange: { start: string; end: string }) {
  const response = await api.get('/api/charts/features/usage', {
    params: {
      start_date: dateRange.start,
      end_date: dateRange.end,
    },
  });
  return response.data;
}

// User retention metrics
export async function getUserRetentionData(dateRange: { start: string; end: string }) {
  const response = await api.get('/api/retention', {
    params: {
      start_date: dateRange.start,
      end_date: dateRange.end,
    },
  });
  return response.data;
}

// Recent activity (first 8 items)
export async function getRecentActivityData() {
  const response = await api.get('/api/activities', {
    params: {
      page: 1,
      limit: 8,
    },
  });
  return response.data;
}

// All activities with filtering
export async function getAllActivities(filters?: {
  page?: number;
  limit?: number;
  type?: string;
  user?: string;
}) {
  const response = await api.get('/api/activities', {
    params: {
      page: filters?.page || 1,
      limit: filters?.limit || 100,
      type: filters?.type,
      user: filters?.user,
    },
  });
  return response.data;
}

// Activity detail
export async function getActivityDetail(activityId: string) {
  const response = await api.get(`/api/activities/${activityId}`);
  return response.data;
}

export default api;
