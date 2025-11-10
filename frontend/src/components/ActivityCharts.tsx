import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { getActivityData, getConversationData, getFeatureEngagementData } from '../utils/api';
import { toast } from 'sonner';

interface ActivityChartsProps {
  dateRange: { start: string; end: string };
  baseDateRange: { start: string; end: string };
  onDateRangeChange?: (dateRange: { start: string; end: string }) => void;
  selectedDate?: string | null;
  onDateSelect?: (date: string | null) => void;
}

export function ActivityCharts({ dateRange, baseDateRange, onDateRangeChange, selectedDate, onDateSelect }: ActivityChartsProps) {
  const [fullActivityData, setFullActivityData] = useState<any[]>([]);
  const [fullConversationData, setFullConversationData] = useState<any[]>([]);
  const [fullEngagementData, setFullEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reference area state for dragging/zooming
  const [refAreaLeft, setRefAreaLeft] = useState<string>('');
  const [refAreaRight, setRefAreaRight] = useState<string>('');
  const [activeChart, setActiveChart] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [activity, conversation, engagement] = await Promise.all([
          getActivityData(baseDateRange),
          getConversationData(baseDateRange),
          getFeatureEngagementData(baseDateRange),
        ]);
        console.log('Fetched activity data:', activity.length, 'items');
        console.log('First item:', activity[0]);
        console.log('Date range:', baseDateRange);
        setFullActivityData(activity);
        setFullConversationData(conversation);
        setFullEngagementData(engagement);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseDateRange]);

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

  // Helper function to filter data based on date range
  const getFilteredData = (data: any[]) => {
    if (!dateRange.start || !dateRange.end || !data.length) return data;
    
    // If the dateRange matches baseDateRange, return all data (no zoom applied)
    if (dateRange.start === baseDateRange.start && dateRange.end === baseDateRange.end) {
      return data;
    }
    
    // Filter data within the zoomed range
    return data.filter(item => {
      return item.date >= dateRange.start && item.date <= dateRange.end;
    });
  };

  // Filter the data based on current date range
  const activityData = getFilteredData(fullActivityData);
  const conversationData = getFilteredData(fullConversationData);
  const engagementData = getFilteredData(fullEngagementData);

  console.log('Full data length:', fullActivityData.length);
  console.log('Filtered data length:', activityData.length);
  console.log('Date range:', dateRange);
  console.log('Base date range:', baseDateRange);

  // Get averages from filtered data
  const avgActiveUsers = activityData.length > 0 
    ? Math.round(activityData.reduce((sum, d) => sum + d.activeUsers, 0) / activityData.length)
    : 0;
  const avgConversations = conversationData.length > 0 
    ? Math.round(conversationData.reduce((sum, d) => sum + d.conversations, 0) / conversationData.length)
    : 0;
  const avgMessages = conversationData.length > 0 
    ? Math.round(conversationData.reduce((sum, d) => sum + d.messages, 0) / conversationData.length)
    : 0;

  // Zoom handlers
  const zoom = (chartType: string) => {
    let { left, right } = { left: refAreaLeft, right: refAreaRight };

    if (left === right || right === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    // Ensure left is before right
    if (left > right) [left, right] = [right, left];

    // Update the global date range - this will update all charts and the date picker
    onDateRangeChange?.({ start: left, end: right });
    
    toast.success('Date range updated', {
      description: `Viewing ${left} to ${right}`
    });

    setRefAreaLeft('');
    setRefAreaRight('');
    setActiveChart('');
  };

  // Click handlers for chart elements - handle single click
  const handleDotClick = (data: any) => {
    if (data && data.date) {
      // Toggle selection - if clicking the same date, deselect it
      if (selectedDate === data.date) {
        onDateSelect?.(null);
      } else {
        onDateSelect?.(data.date);
        toast.info(`Focused on ${data.date}`, {
          description: 'All charts synchronized to this date'
        });
      }
    }
  };

  // Render custom dot with selection highlighting
  const renderCustomDot = (color: string) => (props: any) => {
    const { cx, cy, payload } = props;
    const isSelected = selectedDate === payload.date;
    const isDimmed = selectedDate && selectedDate !== payload.date;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 6 : 3}
        fill={color}
        fillOpacity={isDimmed ? 0.2 : 1}
        stroke={color}
        strokeWidth={isSelected ? 2 : 0}
        strokeOpacity={isDimmed ? 0.2 : 1}
        style={{ cursor: 'pointer' }}
        onClick={() => handleDotClick(payload)}
      />
    );
  };

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
            <LineChart 
              data={activityData}
              onMouseDown={(e: any) => {
                if (e?.activeLabel) {
                  setActiveChart('activeUsers');
                  setRefAreaLeft(e.activeLabel);
                }
              }}
              onMouseMove={(e: any) => {
                if (activeChart === 'activeUsers' && refAreaLeft && e?.activeLabel) {
                  setRefAreaRight(e.activeLabel);
                }
              }}
              onMouseUp={() => {
                if (activeChart === 'activeUsers') {
                  zoom('activeUsers');
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#888"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Legend />
              {refAreaLeft && refAreaRight && activeChart === 'activeUsers' && (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#3b82f6" fillOpacity={0.3} />
              )}
              {selectedDate && (
                <ReferenceArea 
                  x1={selectedDate} 
                  x2={selectedDate} 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="#6366f1" 
                  fillOpacity={0.1} 
                />
              )}
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Active Users"
                dot={renderCustomDot('#3b82f6')}
                strokeOpacity={selectedDate ? 0.3 : 1}
                activeDot={{ r: 6, cursor: 'pointer', onClick: (e: any, payload: any) => handleDotClick(payload.payload) }}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name={`Average (${avgActiveUsers})`}
                dot={false}
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
            <AreaChart 
              data={conversationData}
              onMouseDown={(e: any) => {
                if (e?.activeLabel) {
                  setActiveChart('conversation');
                  setRefAreaLeft(e.activeLabel);
                }
              }}
              onMouseMove={(e: any) => {
                if (activeChart === 'conversation' && refAreaLeft && e?.activeLabel) {
                  setRefAreaRight(e.activeLabel);
                }
              }}
              onMouseUp={() => {
                if (activeChart === 'conversation') {
                  zoom('conversation');
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#888"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Legend />
              {refAreaLeft && refAreaRight && activeChart === 'conversation' && (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#10b981" fillOpacity={0.3} />
              )}
              {selectedDate && (
                <ReferenceArea 
                  x1={selectedDate} 
                  x2={selectedDate} 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="#6366f1" 
                  fillOpacity={0.1} 
                />
              )}
              <Area 
                type="monotone" 
                dataKey="conversations" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={selectedDate ? 0.2 : 0.6}
                strokeOpacity={selectedDate ? 0.3 : 1}
                name="Conversations"
                cursor="pointer"
                onClick={(data: any) => handleDotClick(data)}
              />
              <Area 
                type="monotone" 
                dataKey="messages" 
                stackId="1"
                stroke="#8b5cf6" 
                fill="#8b5cf6"
                fillOpacity={selectedDate ? 0.2 : 0.6}
                strokeOpacity={selectedDate ? 0.3 : 1}
                name="Messages"
                cursor="pointer"
                onClick={(data: any) => handleDotClick(data)}
              />
              <Line 
                type="monotone" 
                dataKey="avgConversations" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name={`Average Conversations (${avgConversations})`}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="avgMessages" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name={`Average Messages (${avgMessages})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feature Engagement */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Feature Engagement Over Time</CardTitle>
          <CardDescription>Distribution of feature usage across different Twin capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={engagementData}
              onMouseDown={(e: any) => {
                if (e?.activeLabel) {
                  setActiveChart('engagement');
                  setRefAreaLeft(e.activeLabel);
                }
              }}
              onMouseMove={(e: any) => {
                if (activeChart === 'engagement' && refAreaLeft && e?.activeLabel) {
                  setRefAreaRight(e.activeLabel);
                }
              }}
              onMouseUp={() => {
                if (activeChart === 'engagement') {
                  zoom('engagement');
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#888"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Legend />
              {refAreaLeft && refAreaRight && activeChart === 'engagement' && (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#8b5cf6" fillOpacity={0.3} />
              )}
              {selectedDate && (
                <ReferenceArea 
                  x1={selectedDate} 
                  x2={selectedDate} 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="#6366f1" 
                  fillOpacity={0.1} 
                />
              )}
              <Bar 
                dataKey="questionAsked" 
                stackId="a" 
                fill="#3b82f6" 
                name="Questions Asked"
                fillOpacity={selectedDate ? 0.3 : 1}
                cursor="pointer"
                onClick={(data: any) => handleDotClick(data)}
              />
              <Bar 
                dataKey="infoRetrieved" 
                stackId="a" 
                fill="#10b981" 
                name="Info Retrieved"
                fillOpacity={selectedDate ? 0.3 : 1}
                cursor="pointer"
                onClick={(data: any) => handleDotClick(data)}
              />
              <Bar 
                dataKey="documentsDrafted" 
                stackId="a" 
                fill="#8b5cf6" 
                name="Documents Drafted"
                fillOpacity={selectedDate ? 0.3 : 1}
                cursor="pointer"
                onClick={(data: any) => handleDotClick(data)}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}