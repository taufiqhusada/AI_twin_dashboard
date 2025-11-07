import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { getUserRetentionData } from '../utils/mockData';

interface UserRetentionProps {
  dateRange: { start: string; end: string };
}

export function UserRetention({ dateRange }: UserRetentionProps) {
  const [retentionData, setRetentionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getUserRetentionData(dateRange);
        setRetentionData(data);
      } catch (error) {
        console.error('Failed to fetch retention data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (loading || !retentionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Retention Metrics</CardTitle>
          <CardDescription>User engagement and retention over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading retention data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Retention Metrics</CardTitle>
        <CardDescription>User engagement and retention over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Day 1 Retention</span>
            <span className="text-gray-900">{retentionData.day1}%</span>
          </div>
          <Progress value={retentionData.day1} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Day 7 Retention</span>
            <span className="text-gray-900">{retentionData.day7}%</span>
          </div>
          <Progress value={retentionData.day7} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Day 30 Retention</span>
            <span className="text-gray-900">{retentionData.day30}%</span>
          </div>
          <Progress value={retentionData.day30} className="h-2" />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Avg. Session Duration</p>
              <p className="text-gray-900 mt-1">{retentionData.avgSessionDuration}</p>
            </div>
            <div>
              <p className="text-gray-600">Sessions per User</p>
              <p className="text-gray-900 mt-1">{retentionData.sessionsPerUser}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-gray-600">Power Users (10+ sessions)</p>
          <div className="flex items-center justify-between mt-2">
            <Progress value={retentionData.powerUsersPercent} className="h-2 flex-1 mr-4" />
            <span className="text-gray-900">{retentionData.powerUsersPercent}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
