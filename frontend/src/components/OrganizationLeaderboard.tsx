import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { getOrganizationLeaderboard } from '../utils/api';
import { Building2, Users, TrendingUp } from 'lucide-react';

interface OrganizationLeaderboardProps {
  dateRange: { start: string; end: string };
  selectedDate?: string | null;
}

export function OrganizationLeaderboard({ dateRange, selectedDate }: OrganizationLeaderboardProps) {
  const [orgData, setOrgData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Brushing and linking integration - responds to selectedDate changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getOrganizationLeaderboard(dateRange, 3);
        setOrgData(data);
      } catch (error) {
        console.error('Failed to fetch organization leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Debug log for brushing and linking
  useEffect(() => {
    console.log('OrganizationLeaderboard - selectedDate changed:', selectedDate);
  }, [selectedDate]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${selectedDate ? 'ring-4 ring-indigo-300 shadow-xl transition-all duration-300 bg-indigo-50/30' : 'transition-all duration-300'}`}>
      <CardHeader>
        <CardTitle>Top Organizations</CardTitle>
        <CardDescription>
          Most active companies by engagement
          {selectedDate && (
            <span className="ml-2 text-indigo-600 font-medium">
              • Synchronized with {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orgData.map((org, index) => (
            <div 
              key={org.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors ${selectedDate ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex-shrink-0">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && <span className="text-sm">#{index + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="size-4 text-gray-400 flex-shrink-0" />
                  <h4 className="text-sm text-gray-900 truncate">{org.name}</h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {org.activeUsers} users
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    {org.totalActivities.toLocaleString()} activities
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm text-gray-900">~{org.avgActivitiesPerUser}</div>
                <div className="text-xs text-gray-500">per user</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
