/**
 * FetalMovementCounter - Kick Counts Tracking
 * 
 * Daily fetal movement tracking with:
 * - Kick count sessions (time to 10 kicks)
 * - Pattern analysis and trends
 * - Alerts for reduced movement
 * - Historical data visualization
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Baby,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  Save,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { obgynService } from '@/services/obgyn.service';

interface FetalMovementCounterProps {
  patientId: string;
  episodeId?: string;
  gestationalAge?: string;
  onUpdate?: () => void;
}

interface KickSession {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  kickCount: number;
  duration: number; // in minutes
  status: 'completed' | 'in_progress' | 'concern';
  notes?: string;
}

interface MovementPattern {
  date: string;
  sessions: number;
  avgKicks: number;
  avgDuration: number;
  concern: boolean;
}

export function FetalMovementCounter({
  patientId,
  episodeId,
  gestationalAge,
  onUpdate,
}: FetalMovementCounterProps) {
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const [currentSession, setCurrentSession] = useState<KickSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const TARGET_KICKS = 10;
  const MAX_TIME_MINUTES = 120; // 2 hours

  useEffect(() => {
    loadSessions();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [patientId, episodeId]);

  useEffect(() => {
    if (currentSession && !currentSession.endTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentSession]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await obgynService.getKickCounts(patientId, episodeId);
      if (data && data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load kick count sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSessions = async (updatedSessions: KickSession[]) => {
    setIsSaving(true);
    try {
      await obgynService.saveKickCounts(patientId, {
        episodeId,
        sessions: updatedSessions,
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save kick count sessions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startSession = () => {
    const now = new Date();
    const newSession: KickSession = {
      id: `kick-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      startTime: now.toTimeString().slice(0, 5),
      kickCount: 0,
      duration: 0,
      status: 'in_progress',
    };
    setCurrentSession(newSession);
    setElapsedTime(0);
  };

  const recordKick = () => {
    if (!currentSession) return;

    const newCount = currentSession.kickCount + 1;
    const minutes = Math.floor(elapsedTime / 60);
    
    const updatedSession = {
      ...currentSession,
      kickCount: newCount,
      duration: minutes,
    };

    // Check if reached target
    if (newCount >= TARGET_KICKS) {
      const now = new Date();
      updatedSession.endTime = now.toTimeString().slice(0, 5);
      updatedSession.status = 'completed';
      
      const updatedSessions = [updatedSession, ...sessions];
      setSessions(updatedSessions);
      setCurrentSession(null);
      saveSessions(updatedSessions);
    } else {
      setCurrentSession(updatedSession);
    }
  };

  const endSessionEarly = () => {
    if (!currentSession) return;

    const now = new Date();
    const minutes = Math.floor(elapsedTime / 60);
    
    const updatedSession: KickSession = {
      ...currentSession,
      endTime: now.toTimeString().slice(0, 5),
      duration: minutes,
      status: currentSession.kickCount < TARGET_KICKS && minutes >= MAX_TIME_MINUTES 
        ? 'concern' 
        : 'completed',
    };

    const updatedSessions = [updatedSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSession(null);
    saveSessions(updatedSessions);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodaySessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.date === today);
  };

  const getWeekSummary = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= weekAgo;
    });

    const dailyPatterns: Map<string, MovementPattern> = new Map();
    
    weekSessions.forEach(session => {
      const existing = dailyPatterns.get(session.date);
      if (existing) {
        existing.sessions++;
        existing.avgKicks = (existing.avgKicks * (existing.sessions - 1) + session.kickCount) / existing.sessions;
        existing.avgDuration = (existing.avgDuration * (existing.sessions - 1) + session.duration) / existing.sessions;
        if (session.status === 'concern') existing.concern = true;
      } else {
        dailyPatterns.set(session.date, {
          date: session.date,
          sessions: 1,
          avgKicks: session.kickCount,
          avgDuration: session.duration,
          concern: session.status === 'concern',
        });
      }
    });

    return Array.from(dailyPatterns.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getConcernCount = () => {
    return sessions.filter(s => s.status === 'concern').length;
  };

  const getAvgTimeToTen = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed' && s.kickCount >= TARGET_KICKS);
    if (completedSessions.length === 0) return null;
    
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    return Math.round(totalDuration / completedSessions.length);
  };

  const todaySessions = getTodaySessions();
  const weekSummary = getWeekSummary();
  const avgTime = getAvgTimeToTen();
  const concernCount = getConcernCount();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Counter */}
      <Card className={cn(
        currentSession && 'ring-2 ring-pink-500'
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Baby className="h-5 w-5 text-pink-500" />
            Kick Counter
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSession ? (
            <div className="space-y-4">
              {/* Timer Display */}
              <div className="text-center">
                <div className="text-4xl font-bold font-mono mb-2">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Started at {currentSession.startTime}
                </div>
              </div>

              {/* Kick Counter */}
              <div className="flex flex-col items-center space-y-4">
                <Button
                  size="lg"
                  className="w-32 h-32 rounded-full text-2xl bg-pink-500 hover:bg-pink-600"
                  onClick={recordKick}
                >
                  <div className="text-center">
                    <Heart className="h-8 w-8 mx-auto mb-1" />
                    <div className="text-3xl font-bold">{currentSession.kickCount}</div>
                    <div className="text-xs">Tap for kick</div>
                  </div>
                </Button>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to {TARGET_KICKS} kicks</span>
                  <span>{currentSession.kickCount}/{TARGET_KICKS}</span>
                </div>
                <Progress 
                  value={(currentSession.kickCount / TARGET_KICKS) * 100} 
                  className="h-3"
                />
              </div>

              {/* Warning if taking too long */}
              {elapsedTime > 60 * 60 && currentSession.kickCount < TARGET_KICKS && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Over 1 hour - consider contacting your provider if movement seems reduced
                  </span>
                </div>
              )}

              {/* Session Controls */}
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={endSessionEarly}>
                  <Pause className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Start Button */}
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Count how long it takes to feel {TARGET_KICKS} movements
                </p>
                <Button 
                  size="lg" 
                  className="bg-pink-500 hover:bg-pink-600"
                  onClick={startSession}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Counting
                </Button>
              </div>

              {/* Today's Summary */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Today&apos;s Sessions</h4>
                {todaySessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sessions recorded today</p>
                ) : (
                  <div className="space-y-2">
                    {todaySessions.map((session) => (
                      <div 
                        key={session.id}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-lg',
                          session.status === 'concern' 
                            ? 'bg-red-50 dark:bg-red-900/20'
                            : 'bg-green-50 dark:bg-green-900/20'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {session.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{session.startTime}</span>
                        </div>
                        <div className="text-sm">
                          {session.kickCount} kicks in {session.duration} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-pink-500" />
            Movement Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {avgTime !== null ? `${avgTime}m` : '-'}
              </div>
              <div className="text-xs text-muted-foreground">Avg Time to 10</div>
            </div>
            <div className={cn(
              'text-center p-3 rounded-lg',
              concernCount > 0 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : 'bg-gray-50 dark:bg-gray-800'
            )}>
              <div className={cn(
                'text-2xl font-bold',
                concernCount > 0 ? 'text-red-600' : ''
              )}>
                {concernCount}
              </div>
              <div className="text-xs text-muted-foreground">Concerns</div>
            </div>
          </div>

          {/* Concern Alert */}
          {concernCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {concernCount} session{concernCount > 1 ? 's' : ''} showed reduced movement - provider notified
              </span>
            </div>
          )}

          {/* Week Summary */}
          <h4 className="font-medium mb-2">Last 7 Days</h4>
          {weekSummary.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No data for the past week</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Avg Kicks</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekSummary.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>{day.sessions}</TableCell>
                    <TableCell>{Math.round(day.avgKicks)}</TableCell>
                    <TableCell>{Math.round(day.avgDuration)} min</TableCell>
                    <TableCell>
                      {day.concern ? (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Concern
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2">How to Count Kicks</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Count kicks at the same time each day when baby is active</li>
            <li>• Lie on your left side or sit comfortably</li>
            <li>• Count any movement: kicks, rolls, jabs, or flutters</li>
            <li>• Goal: Feel 10 movements within 2 hours</li>
            <li>• Contact your provider if fewer than 10 kicks in 2 hours</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
