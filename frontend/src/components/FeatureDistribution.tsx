import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getFeatureDistribution } from '../utils/api';

interface FeatureDistributionProps {
  dateRange: { start: string; end: string };
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export function FeatureDistribution({ dateRange }: FeatureDistributionProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const features = await getFeatureDistribution(dateRange);
        setData(features);
      } catch (error) {
        console.error('Failed to fetch feature distribution data:', error);
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

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Distribution</CardTitle>
          <CardDescription>Usage breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-400">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const totalDays = 30;

  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, name, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';
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
    <Card>
      <CardHeader>
        <CardTitle>Feature Distribution</CardTitle>
        <CardDescription>Usage breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
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
          
          <div 
            className="absolute text-center pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium leading-tight">Total</div>
            <div className="text-2xl font-bold text-gray-900 leading-tight">{total.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          {data.map((item, index) => {
            const avgPerDay = Math.round(item.value / totalDays);
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-900 text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-gray-900 font-medium text-sm">{item.value.toLocaleString()}</span>
                  <span className="text-gray-600 text-sm">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
