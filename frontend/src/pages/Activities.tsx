import { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { MessageSquare, FileText, Search as SearchIcon, Users } from 'lucide-react';
import { getAllActivities } from '../utils/api';

interface ActivitiesProps {
  onViewActivity: (activity: any) => void;
}

export function Activities({ onViewActivity }: ActivitiesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const data = await getAllActivities();
        setAllActivities(data);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Filter activities based on search
  const filteredActivities = allActivities.filter((activity) => {
    return activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-gray-900">All User Activities</h1>
            <p className="text-gray-600 mt-1">Loading activities...</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading activities...</div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-gray-900">All User Activities</h1>
            <p className="text-gray-600 mt-1">View and search all user interactions with their Twins</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} found
                </CardDescription>
              </div>
              
              {/* Search */}
              <div className="relative w-full sm:w-[300px]">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user or action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Twin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Messages</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No activities found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((activity) => {
                      // Format twin display
                      let twinDisplay = activity.twinName || 'Unknown Twin';
                      if (activity.twinOwner) {
                        if (activity.user === activity.twinOwner) {
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
                            {twinDisplay}
                            {activity.isShared && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Shared
                              </Badge>
                            )}
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
                                  <SearchIcon className="h-3 w-3 mr-1" />
                                  {activity.queryCount}
                                </Badge>
                              )}
                              {!activity.hasDocuments && !activity.hasQueries && (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{activity.time}</TableCell>
                          <TableCell className="text-right text-gray-600">
                            {activity.messageCount || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}