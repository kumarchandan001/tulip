import { Shield, AlertTriangle, Activity, Mouse, Keyboard, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InteractionStatsProps {
  mouseMovements: number;
  keystrokes: number;
  typingSpeed: number;
  formFillTime: number;
  riskScore: number;
  isHighRisk: boolean;
  typingConsistency?: number;
  backspaceCount?: number;
  mouseSpeed?: number;
  mousePathCurvature?: number;
  copyPasteEvents?: number;
  isBot?: boolean;
}

export const InteractionStats = ({ 
  mouseMovements, 
  keystrokes, 
  typingSpeed, 
  formFillTime, 
  riskScore, 
  isHighRisk,
  typingConsistency = 0,
  backspaceCount = 0,
  mouseSpeed = 0,
  mousePathCurvature = 0,
  copyPasteEvents = 0,
  isBot = false
}: InteractionStatsProps) => {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-success';
    if (score < 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="p-6 bg-card/95 border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${isHighRisk ? 'bg-destructive/15' : 'bg-success/15'}`}>
          {isHighRisk ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <Shield className="w-5 h-5 text-success" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">Bot Detection Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Real-time behavioral analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <Activity className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-primary">{mouseMovements + keystrokes}</p>
          <p className="text-xs text-muted-foreground">Total Actions</p>
        </div>
        <div className="text-center">
          <Mouse className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-primary">{mouseMovements}</p>
          <p className="text-xs text-muted-foreground">Mouse Moves</p>
        </div>
        <div className="text-center">
          <Keyboard className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-primary">{keystrokes}</p>
          <p className="text-xs text-muted-foreground">Key Presses</p>
        </div>
        <div className="text-center">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xl font-bold">{formatDuration(formFillTime)}</p>
          <p className="text-xs text-muted-foreground">Session Time</p>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-lg font-bold text-primary">{Math.round(typingSpeed)}</p>
          <p className="text-xs text-muted-foreground">Typing Speed (chars/min)</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-lg font-bold text-primary">{backspaceCount}</p>
          <p className="text-xs text-muted-foreground">Backspaces</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-lg font-bold text-primary">{Math.round(mouseSpeed)}</p>
          <p className="text-xs text-muted-foreground">Mouse Speed (px/ms)</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-lg font-bold text-primary">{Math.round(mousePathCurvature * 100) / 100}</p>
          <p className="text-xs text-muted-foreground">Path Curvature</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-lg font-bold text-primary">{copyPasteEvents}</p>
          <p className="text-xs text-muted-foreground">Copy/Paste Events</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-lg font-bold text-primary">{Math.round(typingConsistency)}</p>
          <p className="text-xs text-muted-foreground">Typing Consistency</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Risk Assessment</span>
          <span className={`text-sm font-bold ${getRiskColor(riskScore)}`}>
            {Math.round(riskScore)}% Risk
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-smooth ${
              riskScore < 30 ? 'bg-success' : 
              riskScore < 60 ? 'bg-warning' : 'bg-destructive'
            }`}
            style={{ width: `${Math.min(riskScore, 100)}%` }}
          />
        </div>
        
        {riskScore > 50 && (
          <div className="mt-4 p-3 bg-warning/10 rounded-lg">
            <p className="text-sm font-medium text-warning mb-2">⚠️ Suspicious Patterns Detected:</p>
            <ul className="text-xs text-warning space-y-1">
              {typingSpeed > 200 && (
                <li>• Extremely fast typing speed detected ({Math.round(typingSpeed)} chars/min)</li>
              )}
              {typingSpeed < 20 && (
                <li>• Suspiciously slow typing speed ({Math.round(typingSpeed)} chars/min)</li>
              )}
              {typingConsistency < 50 && (
                <li>• Too consistent typing patterns (bot-like behavior)</li>
              )}
              {backspaceCount === 0 && keystrokes > 10 && (
                <li>• No corrections made (unusual for human typing)</li>
              )}
              {formFillTime < 2000 && (
                <li>• Form completed suspiciously quickly ({formatDuration(formFillTime)})</li>
              )}
              {mouseMovements < 10 && (
                <li>• Insufficient mouse movement patterns ({mouseMovements} movements)</li>
              )}
              {mousePathCurvature < 0.1 && mouseMovements > 5 && (
                <li>• Mouse movements too straight (bot-like paths)</li>
              )}
              {copyPasteEvents > 3 && (
                <li>• Excessive copy-paste activity ({copyPasteEvents} events)</li>
              )}
              {mouseSpeed > 1000 && (
                <li>• Mouse movement too fast ({Math.round(mouseSpeed)} px/ms)</li>
              )}
            </ul>
          </div>
        )}

        {isBot && (
          <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-2">🚫 Bot Detected:</p>
            <p className="text-xs text-destructive">
              This session has been flagged as automated behavior. Booking access has been restricted.
            </p>
          </div>
        )}
        
        {typingSpeed > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            Average typing speed: {Math.round(typingSpeed)} chars/min
            {typingSpeed > 200 && (
              <span className="text-warning ml-1">(Suspiciously fast)</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};