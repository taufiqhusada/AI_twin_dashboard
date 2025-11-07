import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
      case 'shared':
        return <Users className="h-6 w-6 text-orange-600" />;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">User</p>
                  <p className="text-gray-900">{activity.user}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Time</p>
                  <p className="text-gray-900">{activity.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="text-gray-900">{activity.duration}</p>
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
        {activity.type === 'conversation' && (
          <Card>
            <CardHeader>
              <CardTitle>Conversation Thread</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.messages?.map((message: any, index: number) => (
                  <div
                    key={index}
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activity.type === 'document' && (
          <Card>
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-1">Document Title</p>
                  <p className="text-gray-900">{activity.documentTitle}</p>
                </div>
                <Separator />
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <p className="text-gray-600 mb-3">Content Preview</p>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{activity.documentPreview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activity.type === 'query' && (
          <Card>
            <CardHeader>
              <CardTitle>Query Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">User Query</p>
                  <p className="text-gray-900">{activity.query}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-3">Retrieved Information</p>
                  <p className="text-gray-700 leading-relaxed">{activity.retrievedInfo}</p>
                  {activity.sources && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-600 mb-2">Sources</p>
                      <ul className="space-y-2">
                        {activity.sources.map((source: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="text-gray-700">{source}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activity.type === 'shared' && (
          <Card>
            <CardHeader>
              <CardTitle>Shared Twin Interaction</CardTitle>
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
