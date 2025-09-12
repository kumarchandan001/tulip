export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  availableSeats: number;
  category: string;
  image?: string;
}

export interface Passenger {
  name: string;
  email: string;
  phone: string;
  age?: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'premium' | 'vip';
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface BookingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface InteractionData {
  timestamp: number;
  eventType: 'mouseMove' | 'click' | 'keydown' | 'formFocus' | 'formBlur' | 'scroll' | 'backspace' | 'copy' | 'paste';
  x?: number;
  y?: number;
  key?: string;
  element?: string;
  duration?: number;
  typingSpeed?: number;
  mouseSpeed?: number;
  clickInterval?: number;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  interactions: InteractionData[];
  bookingSteps: BookingStep[];
  suspiciousActivity: boolean;
  riskScore: number;
}

export interface BookingData {
  ticketType: string;
  quantity: number;
  totalPrice: number;
  passengerDetails: Passenger;
  selectedSeats: string[];
}

export interface BotDetectionMetrics {
  typingSpeed: number;
  typingConsistency: number;
  backspaceCount: number;
  mouseSpeed: number;
  mousePathCurvature: number;
  clickIntervals: number[];
  formFillTime: number;
  requestFrequency: number;
  deviceFingerprint: string;
  riskScore: number;
  isBot: boolean;
}