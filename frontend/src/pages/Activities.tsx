import { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { MessageSquare, FileText, Search as SearchIcon, Users, Filter } from 'lucide-react';
import { getAllActivities } from '../utils/api';

interface ActivitiesProps {
  onViewActivity: (activity: any) => void;
}

export function Activities({ onViewActivity }: ActivitiesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
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

  // Filter activities based on search and type
  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch = 
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'query':
        return <SearchIcon className="h-4 w-4 text-green-600" />;
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
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:w-[300px]">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by user or action..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="conversation">Conversations</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="query">Queries</SelectItem>
                    <SelectItem value="shared">Shared Twin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
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
                          <TableCell className="text-gray-600">{activity.duration}</TableCell>
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