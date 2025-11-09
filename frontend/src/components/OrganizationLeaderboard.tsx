import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { getOrganizationLeaderboard } from '../utils/api';
import { Building2, Users, TrendingUp } from 'lucide-react';

interface OrganizationLeaderboardProps {
  dateRange: { start: string; end: string };
}

export function OrganizationLeaderboard({ dateRange }: OrganizationLeaderboardProps) {
  const [orgData, setOrgData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Organizations</CardTitle>
        <CardDescription>Most active companies by engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orgData.map((org, index) => (
            <div 
              key={org.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors"
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
