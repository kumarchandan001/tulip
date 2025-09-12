import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BotDetectionMetrics, InteractionData } from '@/types/booking';

export interface AdvancedInteractionData {
  mouseMovements: Array<{ x: number; y: number; timestamp: number; speed?: number }>;
  keystrokes: Array<{ key: string; timestamp: number; delay?: number; isBackspace?: boolean }>;
  clicks: Array<{ x: number; y: number; timestamp: number; interval?: number }>;
  formInteractions: Array<{ field: string; timestamp: number; action: 'focus' | 'blur' | 'input' }>;
  scrollEvents: Array<{ timestamp: number; direction: 'up' | 'down' }>;
  copyPasteEvents: Array<{ timestamp: number; type: 'copy' | 'paste' }>;
  formFillTime: number;
  typingSpeed: number;
  typingConsistency: number;
  backspaceCount: number;
  mouseSpeed: number;
  mousePathCurvature: number;
  clickIntervals: number[];
  requestFrequency: number;
  deviceFingerprint: string;
  riskScore: number;
  isBot: boolean;
}

export const useAdvancedBotDetection = () => {
  const [data, setData] = useState<AdvancedInteractionData>({
    mouseMovements: [],
    keystrokes: [],
    clicks: [],
    formInteractions: [],
    scrollEvents: [],
    copyPasteEvents: [],
    formFillTime: 0,
    typingSpeed: 0,
    typingConsistency: 0,
    backspaceCount: 0,
    mouseSpeed: 0,
    mousePathCurvature: 0,
    clickIntervals: [],
    requestFrequency: 0,
    deviceFingerprint: '',
    riskScore: 0,
    isBot: false,
  });
  
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [lastKeystroke, setLastKeystroke] = useState<number>(0);
  const [lastClick, setLastClick] = useState<number>(0);
  const [lastMouseMove, setLastMouseMove] = useState<number>(0);
  const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const sessionIdRef = useRef<string>('');

  // Generate device fingerprint
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.maxTouchPoints || 0,
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }, []);

  // Calculate mouse path curvature
  const calculateMousePathCurvature = useCallback((movements: Array<{ x: number; y: number; timestamp: number }>) => {
    if (movements.length < 3) return 0;
    
    let totalCurvature = 0;
    for (let i = 1; i < movements.length - 1; i++) {
      const p1 = movements[i - 1];
      const p2 = movements[i];
      const p3 = movements[i + 1];
      
      const a = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const b = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
      const c = Math.sqrt(Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2));
      
      if (a > 0 && b > 0 && c > 0) {
        const curvature = Math.acos((a * a + b * b - c * c) / (2 * a * b));
        totalCurvature += curvature;
      }
    }
    
    return totalCurvature / (movements.length - 2);
  }, []);

  // Calculate typing consistency (standard deviation of typing speeds)
  const calculateTypingConsistency = useCallback((keystrokes: Array<{ delay?: number }>) => {
    const delays = keystrokes.map(k => k.delay).filter(d => d && d > 0) as number[];
    if (delays.length < 2) return 0;
    
    const mean = delays.reduce((a, b) => a + b, 0) / delays.length;
    const variance = delays.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / delays.length;
    return Math.sqrt(variance);
  }, []);

  // Advanced risk calculation
  const calculateAdvancedRiskScore = useCallback((data: AdvancedInteractionData) => {
    let risk = 0;
    
    // Typing behavior analysis (40% weight)
    if (data.typingSpeed > 200) risk += 15; // Too fast
    if (data.typingSpeed < 20) risk += 10;  // Too slow
    if (data.typingConsistency < 50) risk += 20; // Too consistent (bot-like)
    if (data.backspaceCount === 0 && data.keystrokes.length > 10) risk += 15; // No corrections
    if (data.copyPasteEvents.length > 3) risk += 10; // Too much copy-paste
    
    // Mouse behavior analysis (30% weight)
    if (data.mouseSpeed > 1000) risk += 15; // Too fast mouse movement
    if (data.mousePathCurvature < 0.1) risk += 20; // Too straight (bot-like)
    if (data.mouseMovements.length < 5) risk += 15; // Too few mouse movements
    if (data.clicks.length > 0) {
      const avgClickInterval = data.clickIntervals.reduce((a, b) => a + b, 0) / data.clickIntervals.length;
      if (avgClickInterval < 100) risk += 15; // Too fast clicking
    }
    
    // Form behavior analysis (20% weight)
    if (data.formFillTime < 2000) risk += 20; // Too fast form completion
    if (data.formFillTime > 300000) risk += 5; // Too slow (but less suspicious)
    if (data.formInteractions.length < 3) risk += 10; // Too few form interactions
    
    // Request pattern analysis (10% weight)
    if (data.requestFrequency > 5) risk += 15; // Too many requests per second
    
    // Device fingerprint analysis
    if (data.deviceFingerprint.length < 10) risk += 5; // Suspicious fingerprint
    
    return Math.min(risk, 100);
  }, []);

  // Save interaction data to Supabase
  const saveInteractionData = useCallback(async (interactionType: string, interactionData: any) => {
    try {
      if (!sessionIdRef.current) {
        sessionIdRef.current = sessionStorage.getItem('session-id') || 
          Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('session-id', sessionIdRef.current);
      }

      const { error } = await supabase
        .from('user_interactions')
        .insert({
          session_id: sessionIdRef.current,
          interaction_type: interactionType,
          data: interactionData,
          user_agent: navigator.userAgent,
          ip_address: null, // Would be set by backend
        });

      if (error) {
        console.error('Error saving interaction data:', error);
      }
    } catch (error) {
      console.error('Error saving interaction data:', error);
    }
  }, []);

  // Track mouse movement with speed calculation
  const trackMouseMovement = useCallback((e: MouseEvent) => {
    const now = Date.now();
    const movement = {
      x: e.clientX,
      y: e.clientY,
      timestamp: now,
    };
    
    // Calculate speed
    if (lastMouseMove > 0) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastMousePosition.x, 2) + 
        Math.pow(e.clientY - lastMousePosition.y, 2)
      );
      const timeDiff = now - lastMouseMove;
      const speed = timeDiff > 0 ? distance / timeDiff : 0;
      movement.speed = speed;
    }
    
    setLastMouseMove(now);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
    
    setData(prev => ({
      ...prev,
      mouseMovements: [...prev.mouseMovements.slice(-99), movement],
    }));

    // Save mouse movement data periodically
    if (now - lastMouseMove > 5000) {
      saveInteractionData('mouse_movement', { movements: [movement] });
    }
  }, [lastMouseMove, lastMousePosition, saveInteractionData]);

  // Track keystrokes with backspace detection
  const trackKeyPress = useCallback((e: KeyboardEvent) => {
    const now = Date.now();
    const isBackspace = e.key === 'Backspace' || e.key === 'Delete';
    const keystroke = {
      key: e.key,
      timestamp: now,
      delay: lastKeystroke ? now - lastKeystroke : 0,
      isBackspace,
    };
    
    setLastKeystroke(now);
    
    setData(prev => {
      const newKeystrokes = [...prev.keystrokes.slice(-99), keystroke];
      const delays = newKeystrokes.map(k => k.delay).filter(d => d && d > 0);
      const avgDelay = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
      const typingSpeed = avgDelay > 0 ? 60000 / avgDelay : 0;
      const typingConsistency = calculateTypingConsistency(newKeystrokes);
      const backspaceCount = newKeystrokes.filter(k => k.isBackspace).length;
      
      return {
        ...prev,
        keystrokes: newKeystrokes,
        typingSpeed,
        typingConsistency,
        backspaceCount,
      };
    });

    saveInteractionData('keystroke', keystroke);
  }, [lastKeystroke, calculateTypingConsistency, saveInteractionData]);

  // Track clicks with interval calculation
  const trackClick = useCallback((e: MouseEvent) => {
    const now = Date.now();
    const click = {
      x: e.clientX,
      y: e.clientY,
      timestamp: now,
      interval: lastClick ? now - lastClick : 0,
    };
    
    setLastClick(now);
    
    if (click.interval > 0) {
      setData(prev => ({
        ...prev,
        clicks: [...prev.clicks.slice(-19), click],
        clickIntervals: [...prev.clickIntervals.slice(-19), click.interval],
      }));
      
      saveInteractionData('click', click);
    }
  }, [lastClick, saveInteractionData]);

  // Track copy/paste events
  const trackCopyPaste = useCallback((e: ClipboardEvent) => {
    const now = Date.now();
    const event = {
      timestamp: now,
      type: e.type as 'copy' | 'paste',
    };
    
    setData(prev => ({
      ...prev,
      copyPasteEvents: [...prev.copyPasteEvents.slice(-9), event],
    }));
    
    saveInteractionData('clipboard', event);
  }, [saveInteractionData]);

  // Track form interactions
  const trackFormInteraction = useCallback((field: string, action: 'focus' | 'blur' | 'input') => {
    const now = Date.now();
    const interaction = {
      field,
      timestamp: now,
      action,
    };
    
    setData(prev => ({
      ...prev,
      formInteractions: [...prev.formInteractions.slice(-49), interaction],
    }));
    
    saveInteractionData('form_interaction', interaction);
  }, [saveInteractionData]);

  // Track scroll events
  const trackScroll = useCallback((e: Event) => {
    const now = Date.now();
    const scrollEvent = {
      timestamp: now,
      direction: (e as WheelEvent).deltaY > 0 ? 'down' : 'up' as 'up' | 'down',
    };
    
    setData(prev => ({
      ...prev,
      scrollEvents: [...prev.scrollEvents.slice(-19), scrollEvent],
    }));
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    setStartTime(Date.now());
    setIsTracking(true);
    setData(prev => ({
      ...prev,
      deviceFingerprint: generateDeviceFingerprint(),
    }));
    
    document.addEventListener('mousemove', trackMouseMovement);
    document.addEventListener('keydown', trackKeyPress);
    document.addEventListener('click', trackClick);
    document.addEventListener('copy', trackCopyPaste);
    document.addEventListener('paste', trackCopyPaste);
    document.addEventListener('wheel', trackScroll);
  }, [trackMouseMovement, trackKeyPress, trackClick, trackCopyPaste, trackScroll, generateDeviceFingerprint]);

  // Stop tracking and calculate final metrics
  const stopTracking = useCallback(() => {
    const endTime = Date.now();
    const fillTime = startTime ? endTime - startTime : 0;
    
    setData(prev => {
      const mouseSpeed = prev.mouseMovements.length > 0 
        ? prev.mouseMovements.reduce((sum, m) => sum + (m.speed || 0), 0) / prev.mouseMovements.length
        : 0;
      
      const mousePathCurvature = calculateMousePathCurvature(prev.mouseMovements);
      const requestFrequency = requestCount / (fillTime / 1000); // requests per second
      
      const newData = {
        ...prev,
        formFillTime: fillTime,
        mouseSpeed,
        mousePathCurvature,
        requestFrequency,
        riskScore: 0, // Will be calculated below
        isBot: false,
      };
      
      const riskScore = calculateAdvancedRiskScore(newData);
      newData.riskScore = riskScore;
      newData.isBot = riskScore > 70;
      
      // Save final interaction summary
      saveInteractionData('session_summary', {
        totalTime: fillTime,
        mouseMovements: newData.mouseMovements.length,
        keystrokes: newData.keystrokes.length,
        clicks: newData.clicks.length,
        formInteractions: newData.formInteractions.length,
        scrollEvents: newData.scrollEvents.length,
        copyPasteEvents: newData.copyPasteEvents.length,
        averageTypingSpeed: newData.typingSpeed,
        typingConsistency: newData.typingConsistency,
        backspaceCount: newData.backspaceCount,
        mouseSpeed: newData.mouseSpeed,
        mousePathCurvature: newData.mousePathCurvature,
        clickIntervals: newData.clickIntervals,
        formFillTime: newData.formFillTime,
        requestFrequency: newData.requestFrequency,
        deviceFingerprint: newData.deviceFingerprint,
        riskScore: newData.riskScore,
        isBot: newData.isBot,
      });
      
      return newData;
    });
    
    setIsTracking(false);
    
    document.removeEventListener('mousemove', trackMouseMovement);
    document.removeEventListener('keydown', trackKeyPress);
    document.removeEventListener('click', trackClick);
    document.removeEventListener('copy', trackCopyPaste);
    document.removeEventListener('paste', trackCopyPaste);
    document.removeEventListener('wheel', trackScroll);
  }, [startTime, trackMouseMovement, trackKeyPress, trackClick, trackCopyPaste, trackScroll, calculateMousePathCurvature, calculateAdvancedRiskScore, saveInteractionData, requestCount]);

  // Track request frequency
  const trackRequest = useCallback(() => {
    const now = Date.now();
    setRequestCount(prev => prev + 1);
    setLastRequestTime(now);
  }, []);

  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [isTracking, stopTracking]);

  return {
    data,
    startTracking,
    stopTracking,
    isTracking,
    trackFormInteraction,
    trackRequest,
  };
};
