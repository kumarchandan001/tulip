import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MapPin, Users, CreditCard } from 'lucide-react';
import { BookingData } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BookingConfirmationProps {
  bookingData: BookingData;
  onNewBooking: () => void;
  riskScore: number;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ 
  bookingData, 
  onNewBooking,
  riskScore
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const saveBooking = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          event_name: 'Concert Night 2024',
          ticket_type: bookingData.ticketType,
          quantity: bookingData.quantity,
          total_price: bookingData.totalPrice,
          passenger_name: bookingData.passengerDetails.name,
          passenger_email: bookingData.passengerDetails.email,
          passenger_phone: bookingData.passengerDetails.phone,
          selected_seats: bookingData.selectedSeats,
          risk_score: riskScore,
          is_suspicious: riskScore > 70,
        });

      if (error) {
        console.error('Error saving booking:', error);
        toast({
          title: "Error",
          description: "Failed to save booking to database",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Saved",
          description: "Your booking has been securely stored",
        });
      }
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  React.useEffect(() => {
    if (user) {
      saveBooking();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-muted-foreground">
          Your ticket booking has been successfully processed
        </p>
      </div>

      <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Event:</strong> Concert Night 2024</p>
                <p><strong>Ticket Type:</strong> {bookingData.ticketType}</p>
                <p><strong>Quantity:</strong> {bookingData.quantity}</p>
                <p><strong>Total Price:</strong> ${bookingData.totalPrice}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Passenger Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {bookingData.passengerDetails.name}</p>
                <p><strong>Email:</strong> {bookingData.passengerDetails.email}</p>
                <p><strong>Phone:</strong> {bookingData.passengerDetails.phone}</p>
              </div>
            </div>
          </div>

          {bookingData.selectedSeats.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Selected Seats
              </h3>
              <div className="flex flex-wrap gap-2">
                {bookingData.selectedSeats.map((seat, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Security Risk Score: {riskScore}%
              </span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                riskScore > 70 ? 'bg-destructive/10 text-destructive' : 
                riskScore > 40 ? 'bg-warning/10 text-warning' : 
                'bg-success/10 text-success'
              }`}>
                {riskScore > 70 ? 'High Risk' : riskScore > 40 ? 'Medium Risk' : 'Low Risk'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={onNewBooking}
          size="lg"
          className="bg-gradient-primary hover:opacity-90"
        >
          Book Another Ticket
        </Button>
      </div>
    </div>
  );
};

export { BookingConfirmation };