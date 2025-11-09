import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { getFeatureDistribution, getHourlyActivity } from '../utils/api';
import { Clock } from 'lucide-react';

interface FeatureUsageProps {
  dateRange: { start: string; end: string };
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export function FeatureUsage({ dateRange }: FeatureUsageProps) {
  const [data, setData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [features, hourly] = await Promise.all([
          getFeatureDistribution(dateRange),
          getHourlyActivity(dateRange),
        ]);
        setData(features);
        setHourlyData(hourly);
      } catch (error) {
        console.error('Failed to fetch feature usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
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

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Distribution</CardTitle>
          <CardDescription>Breakdown of how users interact with their Twin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-400">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total and averages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const totalDays = 30; // TODO: Calculate from actual date range
  
  // Calculate average for hourly activity reference line
  const avgHourlyActivity = hourlyData.length > 0 ? Math.round(
    hourlyData.reduce((sum, item) => sum + item.value, 0) / hourlyData.length
  ) : 0;

  // Custom label rendering function
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, name, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Determine text anchor based on position
    const textAnchor = x > cx ? 'start' : 'end';
    
    // Get short name (first word)
    const shortName = name.split(' ')[0];
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[data.findIndex(d => d.name === name)]}
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{ fontSize: '13px', fontWeight: '500' }}
      >
        {`${shortName} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Feature Usage Distribution */}
      <Card>
          <CardHeader>
            <CardTitle>Feature Usage Distribution</CardTitle>
            <CardDescription>Breakdown of how users interact with their Twin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                    label={renderCustomLabel}
                    labelLine={{
                      stroke: '#d1d5db',
                      strokeWidth: 1
                    }}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Activities']}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center label - positioned absolutely in the middle of the chart */}
              <div 
                className="absolute text-center pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium leading-tight">Activities</div>
                <div className="text-3xl font-bold text-gray-900 leading-tight">{total.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              {data.map((item, index) => {
                const avgPerDay = Math.round(item.value / totalDays);
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-900 text-[15px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <span className="text-gray-900 font-medium min-w-[65px] text-[15px]">{item.value.toLocaleString()}</span>
                      <span className="text-gray-600 min-w-[50px] text-[15px]">{percentage}%</span>
                      <span className="text-sm text-gray-400 min-w-[70px]">~{avgPerDay}/day</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Activity - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Activity by Hour</CardTitle>
            <CardDescription>Daily activity pattern (averaged over period)</CardDescription>
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
                  label={{ value: 'Avg Activities', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Avg Activities']}
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
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Peak hours summary */}
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-sm mt-4">
                <span className="text-gray-700">Overall average:</span>
                <span className="text-gray-900">{avgHourlyActivity.toLocaleString()} activities/hour</span>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}