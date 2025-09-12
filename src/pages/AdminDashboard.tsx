import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Bot, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Mouse, 
  Keyboard,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface BotDetectionStats {
  totalSessions: number;
  botSessions: number;
  humanSessions: number;
  averageRiskScore: number;
  blockedBookings: number;
  successfulBookings: number;
  topRiskFactors: Array<{ factor: string; count: number }>;
  hourlyStats: Array<{ hour: string; bots: number; humans: number }>;
}

interface SessionData {
  id: string;
  session_id: string;
  user_id: string | null;
  interaction_type: string;
  data: any;
  timestamp: string;
  user_agent: string | null;
}

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<BotDetectionStats>({
    totalSessions: 0,
    botSessions: 0,
    humanSessions: 0,
    averageRiskScore: 0,
    blockedBookings: 0,
    successfulBookings: 0,
    topRiskFactors: [],
    hourlyStats: [],
  });
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Check if user is admin (in a real app, this would be based on user role)
  const isAdmin = user?.email === 'admin@ticketsecure.com';

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch interaction data
      const { data: interactionData, error: interactionError } = await supabase
        .from('user_interactions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (interactionError) {
        console.error('Error fetching interaction data:', interactionError);
        return;
      }

      // Fetch booking data
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingError) {
        console.error('Error fetching booking data:', bookingError);
        return;
      }

      setSessions(interactionData || []);
      calculateStats(interactionData || [], bookingData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (interactionData: SessionData[], bookingData: any[]) => {
    const sessionSummaries = interactionData.filter(s => s.interaction_type === 'session_summary');
    const totalSessions = sessionSummaries.length;
    
    const botSessions = sessionSummaries.filter(s => s.data?.isBot).length;
    const humanSessions = totalSessions - botSessions;
    
    const averageRiskScore = sessionSummaries.length > 0 
      ? sessionSummaries.reduce((sum, s) => sum + (s.data?.riskScore || 0), 0) / sessionSummaries.length
      : 0;

    const blockedBookings = bookingData.filter(b => b.is_suspicious).length;
    const successfulBookings = bookingData.length - blockedBookings;

    // Calculate top risk factors
    const riskFactors: { [key: string]: number } = {};
    sessionSummaries.forEach(session => {
      const data = session.data;
      if (data?.typingSpeed > 200) riskFactors['Fast Typing'] = (riskFactors['Fast Typing'] || 0) + 1;
      if (data?.formFillTime < 2000) riskFactors['Quick Form Fill'] = (riskFactors['Quick Form Fill'] || 0) + 1;
      if (data?.mouseMovements < 10) riskFactors['Low Mouse Activity'] = (riskFactors['Low Mouse Activity'] || 0) + 1;
      if (data?.backspaceCount === 0 && data?.keystrokes > 10) riskFactors['No Corrections'] = (riskFactors['No Corrections'] || 0) + 1;
      if (data?.copyPasteEvents > 3) riskFactors['Excessive Copy-Paste'] = (riskFactors['Excessive Copy-Paste'] || 0) + 1;
      if (data?.mousePathCurvature < 0.1) riskFactors['Straight Mouse Paths'] = (riskFactors['Straight Mouse Paths'] || 0) + 1;
    });

    const topRiskFactors = Object.entries(riskFactors)
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate hourly stats
    const hourlyStats: { [key: string]: { bots: number; humans: number } } = {};
    sessionSummaries.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      const hourKey = `${hour}:00`;
      if (!hourlyStats[hourKey]) {
        hourlyStats[hourKey] = { bots: 0, humans: 0 };
      }
      if (session.data?.isBot) {
        hourlyStats[hourKey].bots++;
      } else {
        hourlyStats[hourKey].humans++;
      }
    });

    const hourlyStatsArray = Object.entries(hourlyStats)
      .map(([hour, stats]) => ({ hour, ...stats }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    setStats({
      totalSessions,
      botSessions,
      humanSessions,
      averageRiskScore,
      blockedBookings,
      successfulBookings,
      topRiskFactors,
      hourlyStats: hourlyStatsArray,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Bot Detection Analytics & Monitoring
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                All tracked sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bot Detections</CardTitle>
              <Bot className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.botSessions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSessions > 0 ? Math.round((stats.botSessions / stats.totalSessions) * 100) : 0}% of sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Human Sessions</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.humanSessions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSessions > 0 ? Math.round((stats.humanSessions / stats.totalSessions) * 100) : 0}% of sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageRiskScore)}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="risk-factors">Risk Factors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Statistics</CardTitle>
                  <CardDescription>Success vs blocked bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success"></div>
                        <span className="text-sm">Successful Bookings</span>
                      </div>
                      <span className="font-semibold">{stats.successfulBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive"></div>
                        <span className="text-sm">Blocked Bookings</span>
                      </div>
                      <span className="font-semibold">{stats.blockedBookings}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full transition-all"
                        style={{ 
                          width: `${stats.successfulBookings + stats.blockedBookings > 0 
                            ? (stats.successfulBookings / (stats.successfulBookings + stats.blockedBookings)) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Risk Factors</CardTitle>
                  <CardDescription>Most common bot indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topRiskFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{factor.factor}</span>
                        <Badge variant="secondary">{factor.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking attempts and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions
                    .filter(s => s.interaction_type === 'session_summary')
                    .slice(0, 10)
                    .map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Session {session.session_id.slice(0, 8)}</span>
                            <Badge variant={session.data?.isBot ? 'destructive' : 'success'}>
                              {session.data?.isBot ? 'Bot' : 'Human'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Risk Score: {Math.round(session.data?.riskScore || 0)}% | 
                            Typing Speed: {Math.round(session.data?.averageTypingSpeed || 0)} chars/min
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>Detailed interaction data for each session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions
                    .filter(s => s.interaction_type === 'session_summary')
                    .slice(0, 5)
                    .map((session, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Session {session.session_id.slice(0, 8)}</span>
                            <Badge variant={session.data?.isBot ? 'destructive' : 'success'}>
                              {session.data?.isBot ? 'Bot Detected' : 'Human User'}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(session.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Mouse Moves:</span>
                            <span className="ml-2 font-medium">{session.data?.mouseMovements || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Keystrokes:</span>
                            <span className="ml-2 font-medium">{session.data?.keystrokes || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Form Time:</span>
                            <span className="ml-2 font-medium">{Math.round((session.data?.totalTime || 0) / 1000)}s</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Backspaces:</span>
                            <span className="ml-2 font-medium">{session.data?.backspaceCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk-factors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Analysis</CardTitle>
                <CardDescription>Detailed breakdown of bot detection criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topRiskFactors.map((factor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{factor.factor}</span>
                        <span className="text-sm text-muted-foreground">{factor.count} occurrences</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-warning h-2 rounded-full transition-all"
                          style={{ 
                            width: `${stats.totalSessions > 0 ? (factor.count / stats.totalSessions) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
