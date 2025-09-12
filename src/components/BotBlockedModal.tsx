import { AlertTriangle, Shield, RefreshCw, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BotBlockedModalProps {
  riskScore: number;
  onRetry: () => void;
  onContactSupport: () => void;
}

export const BotBlockedModal = ({ riskScore, onRetry, onContactSupport }: BotBlockedModalProps) => {
  const getRiskLevel = (score: number) => {
    if (score >= 90) return { level: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    if (score >= 80) return { level: 'High', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    if (score >= 70) return { level: 'Medium', color: 'text-warning', bgColor: 'bg-warning/10' };
    return { level: 'Low', color: 'text-success', bgColor: 'bg-success/10' };
  };

  const riskInfo = getRiskLevel(riskScore);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full border-destructive/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-destructive/10">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">Access Blocked</CardTitle>
          <CardDescription className="text-lg">
            Suspicious activity detected. Your booking request has been blocked for security reasons.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="border-destructive/50 bg-destructive/5">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Our advanced bot detection system has identified patterns consistent with automated behavior. 
              This helps protect legitimate users from ticket scalping and ensures fair access to events.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detection Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Risk Score</span>
                  <span className={`text-lg font-bold ${riskInfo.color}`}>
                    {Math.round(riskScore)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      riskScore >= 90 ? 'bg-destructive' : 
                      riskScore >= 80 ? 'bg-destructive' : 
                      riskScore >= 70 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(riskScore, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Risk Level: {riskInfo.level}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Protection Status</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bot detection algorithms have analyzed your interaction patterns and determined this session 
                  exhibits characteristics of automated behavior.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What This Means</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Your booking request has been automatically blocked to prevent ticket scalping</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>This helps ensure fair access to tickets for genuine human users</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>If you believe this is an error, you can retry or contact support</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={onRetry}
                variant="outline"
                className="w-full h-12"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={onContactSupport}
                className="w-full h-12 bg-gradient-primary hover:opacity-90"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              This system uses advanced machine learning algorithms to detect and prevent automated ticket purchasing. 
              If you're a legitimate user experiencing issues, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
