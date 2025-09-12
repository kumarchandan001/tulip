import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Shield, Bot, MousePointer, LogOut, User } from 'lucide-react';
import { ProgressSteps } from '@/components/ProgressSteps';
import { InteractionStats } from '@/components/InteractionStats';
import { TicketSelection } from '@/components/TicketSelection';
import { PassengerDetails } from '@/components/PassengerDetails';
import { SeatSelection } from '@/components/SeatSelection';
import { BookingConfirmation } from '@/components/BookingConfirmation';
import { useAdvancedBotDetection } from '@/hooks/useAdvancedBotDetection';
import { BotBlockedModal } from '@/components/BotBlockedModal';
import { useAuth } from '@/hooks/useAuth';
import { BookingData } from '@/types/booking';
import heroImage from '@/assets/hero-venue.jpg';
import { Link } from 'react-router-dom';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const { data: interactionData, startTracking, stopTracking, isTracking, trackFormInteraction, trackRequest } = useAdvancedBotDetection();
  const { user, signOut, loading } = useAuth();

  const [bookingData, setBookingData] = useState<BookingData>({
    ticketType: '',
    quantity: 0,
    totalPrice: 0,
    passengerDetails: { name: '', email: '', phone: '' },
    selectedSeats: [],
  });
  const [showBotBlocked, setShowBotBlocked] = useState(false);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookingComplete = () => {
    stopTracking();
    
    // Check if user is flagged as bot
    if (interactionData.isBot || interactionData.riskScore > 70) {
      setShowBotBlocked(true);
      return;
    }
    
    setCurrentStep(4);
  };

  const handleNewBooking = () => {
    setCurrentStep(0);
    setShowBotBlocked(false);
    setBookingData({
      ticketType: '',
      quantity: 0,
      totalPrice: 0,
      passengerDetails: { name: '', email: '', phone: '' },
      selectedSeats: [],
    });
  };

  const handleRetryBooking = () => {
    setShowBotBlocked(false);
    setCurrentStep(0);
    setBookingData({
      ticketType: '',
      quantity: 0,
      totalPrice: 0,
      passengerDetails: { name: '', email: '', phone: '' },
      selectedSeats: [],
    });
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or email
    window.open('mailto:support@ticketsecure.com?subject=Bot Detection False Positive', '_blank');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              TicketSecure
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Advanced Bot Detection for Secure Ticket Booking
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                Sign In to Book Tickets
              </Button>
            </Link>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Why TicketSecure?
                </CardTitle>
                <CardDescription>
                  Our advanced system protects against bot attacks while ensuring legitimate users have a smooth experience
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Bot Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time analysis of user behavior patterns to identify suspicious activity
                  </p>
                </div>
                <div className="text-center">
                  <MousePointer className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Interaction Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor mouse movements, typing patterns, and form completion behavior
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Secure Booking</h3>
                  <p className="text-sm text-muted-foreground">
                    Protected ticket booking process with risk assessment and fraud prevention
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TicketSecure
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Advanced Bot Detection for Secure Ticket Booking
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-4 w-4 mr-2" />
              Protected by AI
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              {showStats ? 'Hide' : 'Show'} Bot Detection Analysis
            </Button>
          </div>
        </div>

        {/* Interaction Stats */}
        {showStats && (
          <div className="max-w-4xl mx-auto mb-8">
            <InteractionStats 
              mouseMovements={interactionData.mouseMovements.length}
              keystrokes={interactionData.keystrokes.length}
              typingSpeed={interactionData.typingSpeed}
              formFillTime={interactionData.formFillTime}
              riskScore={interactionData.riskScore}
              isHighRisk={interactionData.riskScore > 70}
              typingConsistency={interactionData.typingConsistency}
              backspaceCount={interactionData.backspaceCount}
              mouseSpeed={interactionData.mouseSpeed}
              mousePathCurvature={interactionData.mousePathCurvature}
              copyPasteEvents={interactionData.copyPasteEvents.length}
              isBot={interactionData.isBot}
            />
          </div>
        )}

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <ProgressSteps currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <TicketSelection 
              onSelectTicket={(type, quantity, price) => {
                setBookingData(prev => ({ ...prev, ticketType: type, quantity, totalPrice: price }));
                setCurrentStep(1);
                startTracking();
              }}
            />
          )}

          {currentStep === 1 && (
            <PassengerDetails
              onNext={(details) => {
                setBookingData(prev => ({ ...prev, passengerDetails: details }));
                setCurrentStep(2);
              }}
              onBack={handlePreviousStep}
              trackFormInteraction={trackFormInteraction}
            />
          )}

          {currentStep === 2 && (
            <SeatSelection
              onNext={(seats) => {
                setBookingData(prev => ({ ...prev, selectedSeats: seats }));
                setCurrentStep(3);
              }}
              onBack={handlePreviousStep}
              ticketQuantity={bookingData.quantity}
            />
          )}

          {currentStep === 3 && (
            <BookingConfirmation 
              bookingData={bookingData} 
              onNewBooking={handleNewBooking}
              riskScore={interactionData.riskScore}
            />
          )}
        </div>
      </div>

      {/* Bot Blocked Modal */}
      {showBotBlocked && (
        <BotBlockedModal
          riskScore={interactionData.riskScore}
          onRetry={handleRetryBooking}
          onContactSupport={handleContactSupport}
        />
      )}
    </div>
  );
};

export default Index;