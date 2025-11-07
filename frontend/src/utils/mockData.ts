// API client imports - now using real backend instead of mock data
import {
  getMetricsData as apiGetMetrics,
  getActivityData as apiGetActivity,
  getConversationData as apiGetConversation,
  getFeatureEngagementData as apiGetEngagement,
  getFeatureDistribution as apiGetFeatureDistribution,
  getUserRetentionData as apiGetRetention,
  getRecentActivityData as apiGetRecentActivity,
  getAllActivities as apiGetAllActivities,
  getActivityDetail as apiGetActivityDetail,
} from './api';

// Re-export API functions with the same names for compatibility
export const getMetricsData = apiGetMetrics;
export const getActivityData = apiGetActivity;
export const getConversationData = apiGetConversation;
export const getFeatureEngagementData = apiGetEngagement;
export const getFeatureDistribution = apiGetFeatureDistribution;
export const getUserRetentionData = apiGetRetention;
export const getRecentActivityData = apiGetRecentActivity;
export const getAllActivities = apiGetAllActivities;
export const getActivityDetail = apiGetActivityDetail;