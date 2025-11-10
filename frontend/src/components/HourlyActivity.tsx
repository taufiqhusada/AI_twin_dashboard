import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getHourlyActivity } from '../utils/api';
import { Clock } from 'lucide-react';

interface HourlyActivityProps {
  dateRange: { start: string; end: string };
  selectedDate?: string | null;
}

export function HourlyActivity({ dateRange, selectedDate }: HourlyActivityProps) {
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hourly = await getHourlyActivity(dateRange);
        setHourlyData(hourly);
      } catch (error) {
        console.error('Failed to fetch hourly activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average for reference line
  const avgHourlyActivity = hourlyData.length > 0 ? Math.round(
    hourlyData.reduce((sum, item) => sum + item.value, 0) / hourlyData.length
  ) : 0;

  // Find peak hours (top 2)
  const sortedHours = [...hourlyData].sort((a, b) => b.value - a.value);
  const peakHours = sortedHours.slice(0, 2).map(h => `${h.hour}:00`).join(', ');

  return (
    <Card className={selectedDate ? 'ring-4 ring-indigo-300 shadow-xl transition-all duration-300 bg-indigo-50/30' : 'transition-all duration-300'}>
      <CardHeader>
        <CardTitle>Average Activity by Hour</CardTitle>
        <CardDescription>
          Daily activity pattern (averaged over period)
          {selectedDate && (
            <span className="ml-2 text-indigo-600 font-medium">
              • Synchronized with {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="hour" 
              stroke="#9ca3af"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(value) => `${value}h`}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              label={{ value: 'Avg Conversations', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              formatter={(value: number) => [value.toLocaleString(), 'Avg Conversations']}
              labelFormatter={(hour) => `${hour}:00`}
            />
            <ReferenceLine 
              y={avgHourlyActivity} 
              stroke="#94a3b8" 
              strokeDasharray="5 5"
              label={{ value: 'Overall Avg', position: 'right', fill: '#6b7280', fontSize: 11 }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeOpacity={selectedDate ? 0.5 : 1}
              dot={{ fill: '#3b82f6', r: 3, fillOpacity: selectedDate ? 0.5 : 1 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Peak hours summary */}
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-indigo-600" />
              <span className="text-gray-700">Peak hours:</span>
            </div>
            <span className="text-gray-900">{peakHours}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Overall average:</span>
            <span className="text-gray-900">{avgHourlyActivity.toLocaleString()} conversations/hour</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
