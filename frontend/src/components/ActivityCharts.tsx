import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getActivityData, getConversationData, getFeatureEngagementData } from '../utils/mockData';

interface ActivityChartsProps {
  dateRange: { start: string; end: string };
}

export function ActivityCharts({ dateRange }: ActivityChartsProps) {
  const [activityData, setActivityData] = useState<any[]>([]);
  const [conversationData, setConversationData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [activity, conversation, engagement] = await Promise.all([
          getActivityData(dateRange),
          getConversationData(dateRange),
          getFeatureEngagementData(dateRange),
        ]);
        setActivityData(activity);
        setConversationData(conversation);
        setEngagementData(engagement);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className={i === 3 ? 'lg:col-span-2' : ''}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Active Users</CardTitle>
          <CardDescription>User activity trends over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Active Users"
                dot={{ fill: '#3b82f6', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversations Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation Activity</CardTitle>
          <CardDescription>Total conversations and messages per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={conversationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="conversations" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
                name="Conversations"
              />
              <Area 
                type="monotone" 
                dataKey="messages" 
                stackId="1"
                stroke="#8b5cf6" 
                fill="#8b5cf6"
                fillOpacity={0.6}
                name="Messages"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feature Engagement */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Feature Engagement Over Time</CardTitle>
          <CardDescription>Usage of different Twin features by day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="questionAsked" fill="#3b82f6" name="Questions Asked" />
              <Bar dataKey="infoRetrieved" fill="#10b981" name="Info Retrieved" />
              <Bar dataKey="documentsDrafted" fill="#8b5cf6" name="Documents Drafted" />
              <Bar dataKey="sharedInteractions" fill="#f59e0b" name="Shared Twin Interactions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}