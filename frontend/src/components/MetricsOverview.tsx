import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Users, MessageSquare, FileText, Zap, UserPlus } from 'lucide-react';
import { getMetricsData } from '../utils/api';

interface MetricsOverviewProps {
  dateRange: { start: string; end: string };
}

export function MetricsOverview({ dateRange }: MetricsOverviewProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const data = await getMetricsData(dateRange);
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange]);

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Active Users',
      value: metrics.totalActiveUsers.toLocaleString(),
      change: metrics.activeUsersChange,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Conversations',
      value: metrics.totalConversations.toLocaleString(),
      change: metrics.conversationsChange,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Documents Drafted',
      value: metrics.documentsDrafted.toLocaleString(),
      change: metrics.documentsChange,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Twin Installations',
      value: metrics.twinInstallations.toLocaleString(),
      change: metrics.installationsChange,
      icon: UserPlus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-600">{metric.title}</CardTitle>
              <div className={`${metric.bgColor} ${metric.color} p-2 rounded-lg`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{metric.value}</div>
              <div className="flex items-center mt-2">
                <TrendIcon
                  className={`h-4 w-4 mr-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                />
                <span
                  className={`${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {metric.change}%
                </span>
                <span className="text-gray-500 ml-1">vs previous period</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
