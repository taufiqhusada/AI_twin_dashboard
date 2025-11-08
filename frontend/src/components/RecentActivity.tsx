import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { getRecentActivityData } from '../utils/api';
import { MessageSquare, FileText, Search, Users } from 'lucide-react';

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'query':
        return <Search className="h-4 w-4 text-green-600" />;
      case 'shared':
        return <Users className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      conversation: { label: 'Conversation', variant: 'default' as const },
      document: { label: 'Document', variant: 'secondary' as const },
      query: { label: 'Query', variant: 'outline' as const },
      shared: { label: 'Shared Twin', variant: 'destructive' as const },
    };
    return badges[type as keyof typeof badges] || { label: type, variant: 'default' as const };
  };

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
              <TableHead>Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              const badge = getActivityBadge(activity.type);
              return (
                <TableRow 
                  key={activity.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onViewActivity(activity)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell className="max-w-md truncate">{activity.action}</TableCell>
                  <TableCell className="text-gray-600">{activity.time}</TableCell>
                  <TableCell className="text-right text-gray-600">{activity.duration}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}