import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { ActivityCharts } from './components/ActivityCharts';
import { FeatureUsage } from './components/FeatureUsage';
import { FeatureEngagement } from './components/FeatureEngagement';
import { FeatureDistribution } from './components/FeatureDistribution';
import { HourlyActivity } from './components/HourlyActivity';
import { OrganizationLeaderboard } from './components/OrganizationLeaderboard';
import { RecentActivity } from './components/RecentActivity';
import { UserRetention } from './components/UserRetention';
import { DateRangePicker } from './components/DateRangePicker';
import { Activities } from './pages/Activities';
import { ActivityDetailPage } from './pages/ActivityDetailPage';
import { getActivityDetail } from './utils/api';
import { Calendar, Users, MessageSquare, FileText, ZoomIn, RotateCcw } from 'lucide-react';
import { Button } from './components/ui/button';
import { toast } from 'sonner';

// Helper function to get default date range (last 30 days)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
};

export default function App() {
  const initialDateRange = getDefaultDateRange();
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [originalDateRange] = useState(initialDateRange);
  const [baseDateRange, setBaseDateRange] = useState(initialDateRange);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'activities' | 'activity-detail'>('dashboard');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activityDetail, setActivityDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const handleResetZoom = () => {
    setDateRange(originalDateRange);
    setSelectedDate(null);
  };

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
  };

  const handleDateRangeChange = (newRange: { start: string; end: string }) => {
    setDateRange(newRange);
    setBaseDateRange(newRange);
    setSelectedDate(null);
  };

  const isZoomed = dateRange.start !== originalDateRange.start || dateRange.end !== originalDateRange.end;

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
            <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Zoom Indicator */}
        {(isZoomed || selectedDate) && (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ZoomIn className="h-5 w-5 text-indigo-600" />
              <div>
                {isZoomed && (
                  <>
                    <p className="text-sm text-indigo-900">
                      Viewing filtered data: <span className="font-medium">{new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                    <p className="text-xs text-indigo-700 mt-0.5">All charts are synchronized to this date range</p>
                  </>
                )}
                {!isZoomed && selectedDate && (
                  <>
                    <p className="text-sm text-indigo-900">
                      Focused on: <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                    <p className="text-xs text-indigo-700 mt-0.5">Click chart background or reset to view all data</p>
                  </>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetZoom}
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isZoomed ? 'Reset to Full Range' : 'Clear Focus'}
            </Button>
          </div>
        )}

        {/* Metrics Overview (2x2) + Organization Leaderboard */}
        <div className="flex gap-6">
          <div style={{ flex: '0 0 50%', maxHeight: '440px' }}>
            <MetricsOverview dateRange={dateRange} />
          </div>
          <div style={{ flex: '0 0 calc(50% - 24px)', maxHeight: '440px' }}>
            <OrganizationLeaderboard dateRange={dateRange} />
          </div>
        </div>

        {/* Activity Charts */}
        <div className="mt-8">
          <ActivityCharts 
            dateRange={dateRange}
            baseDateRange={baseDateRange}
            onDateRangeChange={setDateRange}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Feature Usage */}
        <div className="mt-8">
          <FeatureUsage 
            dateRange={dateRange}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Recent Activity - Full Width */}
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