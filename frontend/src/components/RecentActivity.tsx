import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { getRecentActivityData } from '../utils/api';
import { FileText, Search, Users } from 'lucide-react';

interface RecentActivityProps {
  onViewAll: () => void;
  onViewActivity: (activity: any) => void;
}

export function RecentActivity({ onViewAll, onViewActivity }: RecentActivityProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const data = await getRecentActivityData();
        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading || !activities.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user interactions across the platform</CardDescription>
            </div>
            <Button onClick={onViewAll}>View All Activities</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading activities...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user interactions across the platform</CardDescription>
          </div>
          <Button onClick={onViewAll}>View All Activities</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Twin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              // Format twin display
              let twinDisplay = activity.twinName || 'Unknown Twin';
              if (activity.twinOwner) {
                if (activity.userEmail === activity.twinOwner) {
                  twinDisplay = `${activity.twinName || 'My Twin'}`;
                } else {
                  const ownerName = activity.twinOwner.split('@')[0].split('.').map((n: string) => 
                    n.charAt(0).toUpperCase() + n.slice(1)
                  ).join(' ');
                  twinDisplay = `${activity.twinName} (${ownerName})`;
                }
              }
              
              return (
                <TableRow 
                  key={activity.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onViewActivity(activity)}
                >
                  <TableCell>{activity.user}</TableCell>
                  <TableCell className="text-gray-700">
                    <div className="flex items-center gap-2">
                      {twinDisplay}
                      {activity.isShared && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{activity.action}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {activity.hasDocuments && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {activity.documentCount}
                        </Badge>
                      )}
                      {activity.hasQueries && (
                        <Badge variant="outline" className="text-xs">
                          <Search className="h-3 w-3 mr-1" />
                          {activity.queryCount}
                        </Badge>
                      )}
                      {!activity.hasDocuments && !activity.hasQueries && (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{activity.time}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}