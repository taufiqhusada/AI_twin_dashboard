import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { MessageSquare, FileText, Search, Users, Clock, Calendar, Hash, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

interface ActivityDetailPageProps {
  activity: any;
  onBack: () => void;
}

export function ActivityDetailPage({ activity, onBack }: ActivityDetailPageProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="h-6 w-6 text-blue-600" />;
      case 'document':
        return <FileText className="h-6 w-6 text-purple-600" />;
      case 'query':
        return <Search className="h-6 w-6 text-green-600" />;
      default:
        return null;
    }
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      conversation: { label: 'Conversation', variant: 'default' as const },
      document: { label: 'Document', variant: 'secondary' as const },
      query: { label: 'Query', variant: 'outline' as const },
    };
    return badges[type as keyof typeof badges] || { label: type, variant: 'default' as const };
  };

  const badge = getActivityBadge(activity.type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Activities
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-gray-900">Activity Details</h1>
                <Badge variant={badge.variant}>{badge.label}</Badge>
                {activity.isShared && (
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    Shared Twin
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{activity.action}</p>
            </div>
          </div>
        </div>

        {/* Metadata Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">User</p>
                  <p className="text-gray-900">{activity.user}</p>
                  {activity.userEmail && (
                    <p className="text-sm text-gray-500">{activity.userEmail}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Date & Time</p>
                  <p className="text-gray-900">{activity.timestamp || activity.time}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              {activity.messageCount && (
                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Messages</p>
                    <p className="text-gray-900">{activity.messageCount} messages</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation Thread</CardTitle>
            <CardDescription>
              {activity.documentCount > 0 && `${activity.documentCount} document${activity.documentCount > 1 ? 's' : ''} created`}
              {activity.documentCount > 0 && activity.queryCount > 0 && ' • '}
              {activity.queryCount > 0 && `${activity.queryCount} quer${activity.queryCount > 1 ? 'ies' : 'y'} executed`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.messages?.map((message: any, index: number) => (
                <div key={index}>
                  <div
                    className={`p-4 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-50 ml-0 md:ml-12'
                        : 'bg-gray-100 mr-0 md:mr-12'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900">
                        {message.sender === 'user' ? activity.user.split('@')[0] : 'AI Twin'}
                      </span>
                      <span className="text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                  
                  {/* Document created indicator */}
                  {message.documentCreated && (
                    <div className="mt-2 ml-4 mr-0 md:mr-16 p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{message.documentCreated.title}</p>
                          <p className="text-gray-600 text-sm">
                            {message.documentCreated.type} • {message.documentCreated.wordCount} words
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Query executed indicator */}
                  {message.queryExecuted && (
                    <div className="mt-2 ml-4 mr-0 md:mr-16 p-3 bg-green-50 border-l-4 border-green-400 rounded">
                      <div className="flex items-start gap-2">
                        <Search className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">Information Retrieved</p>
                          <p className="text-gray-600 text-sm">
                            Found {message.queryExecuted.resultsCount} results
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {activity.isShared && activity.twinOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Shared Twin Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 mb-1">Accessing User</p>
                      <p className="text-gray-900">{activity.user}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Twin Owner</p>
                      <p className="text-gray-900">{activity.twinOwner}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-3">Interaction Summary</p>
                  <p className="text-gray-700 leading-relaxed">{activity.interactionSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Context */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Session ID</p>
                <p className="text-gray-900 font-mono break-all">{activity.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Platform</p>
                <p className="text-gray-900">{activity.platform || 'Slack'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Device</p>
                <p className="text-gray-900">{activity.device || 'Desktop'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
