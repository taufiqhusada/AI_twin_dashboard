import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFeatureEngagementData } from '../utils/api';

interface FeatureEngagementProps {
  dateRange: { start: string; end: string };
}

export function FeatureEngagement({ dateRange }: FeatureEngagementProps) {
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const engagement = await getFeatureEngagementData(dateRange);
        setEngagementData(engagement);
      } catch (error) {
        console.error('Failed to fetch feature engagement data:', error);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Engagement Over Time</CardTitle>
        <CardDescription>Distribution of feature usage across different Twin capabilities</CardDescription>
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
            <Bar dataKey="questionAsked" stackId="a" fill="#3b82f6" name="Questions Asked" />
            <Bar dataKey="infoRetrieved" stackId="a" fill="#10b981" name="Info Retrieved" />
            <Bar dataKey="documentsDrafted" stackId="a" fill="#8b5cf6" name="Documents Drafted" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
