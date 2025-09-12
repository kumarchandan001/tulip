import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InteractionData {
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  keystrokes: Array<{ key: string; timestamp: number; delay?: number }>;
  formFillTime: number;
  clickIntervals: number[];
  typingSpeed: number;
  riskScore: number;
}

export const useInteractionTracker = () => {
  const [data, setData] = useState<InteractionData>({
    mouseMovements: [],
    keystrokes: [],
    formFillTime: 0,
    clickIntervals: [],
    typingSpeed: 0,
    riskScore: 0,
  });
  
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [lastKeystroke, setLastKeystroke] = useState<number>(0);
  const [lastClick, setLastClick] = useState<number>(0);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);

  const saveInteractionData = useCallback(async (interactionType: string, interactionData: any) => {
    try {
      const sessionId = sessionStorage.getItem('session-id') || 
        Math.random().toString(36).substring(2, 15);
      
      if (!sessionStorage.getItem('session-id')) {
        sessionStorage.setItem('session-id', sessionId);
      }

      const { error } = await supabase
        .from('user_interactions')
        .insert({
          session_id: sessionId,
          interaction_type: interactionType,
          data: interactionData,
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Error saving interaction data:', error);
      }
    } catch (error) {
      console.error('Error saving interaction data:', error);
    }
  }, []);

  const calculateRiskScore = useCallback(() => {
    let risk = 0;
    
    // Check typing speed (too fast = suspicious)
    if (data.typingSpeed > 200) risk += 30;
    
    // Check form fill time (too fast = suspicious)
    if (data.formFillTime < 2000) risk += 25;
    
    // Check mouse movement patterns
    if (data.mouseMovements.length < 10) risk += 20;
    
    // Check click intervals (too regular = suspicious)
    const avgInterval = data.clickIntervals.reduce((a, b) => a + b, 0) / data.clickIntervals.length;
    if (avgInterval < 100) risk += 25;
    
    return Math.min(risk, 100);
  }, [data]);

  const trackMouseMovement = useCallback((e: MouseEvent) => {
    const movement = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    };
    
    setData(prev => ({
      ...prev,
      mouseMovements: [...prev.mouseMovements.slice(-49), movement],
    }));

    // Save mouse movement data periodically
    if (Date.now() - lastSaveTime > 5000) {
      saveInteractionData('mouse_movement', { movements: [movement] });
      setLastSaveTime(Date.now());
    }
  }, [saveInteractionData, lastSaveTime]);

  const trackKeyPress = useCallback((e: KeyboardEvent) => {
    const now = Date.now();
    const keystroke = {
      key: e.key,
      timestamp: now,
      delay: lastKeystroke ? now - lastKeystroke : 0,
    };
    
    setLastKeystroke(now);
    
    setData(prev => {
      const newKeystrokes = [...prev.keystrokes.slice(-49), keystroke];
      const delays = newKeystrokes.map(k => k.delay).filter(d => d && d > 0);
      const avgDelay = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
      const typingSpeed = avgDelay > 0 ? 60000 / avgDelay : 0;
      
      return {
        ...prev,
        keystrokes: newKeystrokes,
        typingSpeed,
      };
    });

    saveInteractionData('keystroke', keystroke);
  }, [lastKeystroke, saveInteractionData]);

  const trackClick = useCallback(() => {
    const now = Date.now();
    const interval = lastClick ? now - lastClick : 0;
    
    setLastClick(now);
    
    if (interval > 0) {
      setData(prev => ({
        ...prev,
        clickIntervals: [...prev.clickIntervals.slice(-19), interval],
      }));
      
      saveInteractionData('click', { interval });
    }
  }, [lastClick, saveInteractionData]);

  const startTracking = useCallback(() => {
    setStartTime(Date.now());
    setIsTracking(true);
    
    document.addEventListener('mousemove', trackMouseMovement);
    document.addEventListener('keydown', trackKeyPress);
    document.addEventListener('click', trackClick);
  }, [trackMouseMovement, trackKeyPress, trackClick]);

  const stopTracking = useCallback(() => {
    const endTime = Date.now();
    const fillTime = startTime ? endTime - startTime : 0;
    
    setData(prev => {
      const newData = {
        ...prev,
        formFillTime: fillTime,
        riskScore: calculateRiskScore(),
      };
      
      // Save final interaction summary
      saveInteractionData('session_summary', {
        totalTime: fillTime,
        mouseMovements: newData.mouseMovements.length,
        keystrokes: newData.keystrokes.length,
        averageTypingSpeed: newData.typingSpeed,
        riskScore: newData.riskScore,
      });
      
      return newData;
    });
    
    setIsTracking(false);
    
    document.removeEventListener('mousemove', trackMouseMovement);
    document.removeEventListener('keydown', trackKeyPress);
    document.removeEventListener('click', trackClick);
  }, [startTime, trackMouseMovement, trackKeyPress, trackClick, calculateRiskScore, saveInteractionData]);

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
  };
};