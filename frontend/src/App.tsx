import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { ActivityCharts } from './components/ActivityCharts';
import { FeatureUsage } from './components/FeatureUsage';
import { RecentActivity } from './components/RecentActivity';
import { UserRetention } from './components/UserRetention';
import { DateRangePicker } from './components/DateRangePicker';
import { Activities } from './pages/Activities';
import { ActivityDetailPage } from './pages/ActivityDetailPage';
import { getActivityDetail } from './utils/api';
import { Calendar, Users, MessageSquare, FileText } from 'lucide-react';

export default function App() {
  const [dateRange, setDateRange] = useState({ start: '2025-10-07', end: '2025-11-06' });
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'activities' | 'activity-detail'>('dashboard');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activityDetail, setActivityDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleViewActivity = async (activity: any) => {
    setSelectedActivity(activity);
    setCurrentPage('activity-detail');
    setLoadingDetail(true);
    
    try {
      // Fetch full activity detail from API
      const detail = await getActivityDetail(activity.id);
      setActivityDetail(detail);
    } catch (error) {
      console.error('Failed to fetch activity detail:', error);
      setActivityDetail(activity); // Fallback to basic activity data
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackToActivities = () => {
    setSelectedActivity(null);
    setActivityDetail(null);
    setCurrentPage('activities');
  };

  if (currentPage === 'activity-detail' && activityDetail) {
    return (
      <>
        <Navbar currentPage="activities" onNavigate={setCurrentPage} />
        {loadingDetail ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading activity details...</div>
          </div>
        ) : (
          <ActivityDetailPage activity={activityDetail} onBack={handleBackToActivities} />
        )}
      </>
    );
  }

  if (currentPage === 'activities') {
    return (
      <>
        <Navbar currentPage="activities" onNavigate={setCurrentPage} />
        <Activities onViewActivity={handleViewActivity} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar currentPage="dashboard" onNavigate={setCurrentPage} />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">AI Twin Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor user engagement and product metrics</p>
            </div>
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Overview */}
        <MetricsOverview dateRange={dateRange} />

        {/* Activity Charts */}
        <div className="mt-8">
          <ActivityCharts dateRange={dateRange} />
        </div>

        {/* Feature Usage & Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <FeatureUsage dateRange={dateRange} />
          <UserRetention dateRange={dateRange} />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <RecentActivity 
            onViewAll={() => setCurrentPage('activities')} 
            onViewActivity={handleViewActivity}
          />
        </div>
      </main>
    </div>
  );
}