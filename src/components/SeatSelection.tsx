import { useState } from 'react';
import { Monitor, Crown, Star, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Seat, Event } from '@/types/booking';

interface SeatSelectionProps {
  onNext: (seats: string[]) => void;
  onBack: () => void;
  ticketQuantity: number;
}

const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  rows.forEach((row, rowIndex) => {
    const seatsInRow = rowIndex < 3 ? 12 : rowIndex < 6 ? 14 : 16;
    
    for (let i = 1; i <= seatsInRow; i++) {
      const seatType = 
        rowIndex < 2 ? 'vip' : 
        rowIndex < 4 ? 'premium' : 
        'standard';
      
      const basePrice = seatType === 'vip' ? 150 : seatType === 'premium' ? 120 : 89;
      const isAvailable = Math.random() > 0.15; // 85% availability
      
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        type: seatType,
        price: basePrice,
        isAvailable,
        isSelected: false,
      });
    }
  });
  
  return seats;
};

export const SeatSelection = ({ onNext, onBack, ticketQuantity }: SeatSelectionProps) => {
  const [seats, setSeats] = useState<Seat[]>(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const handleSeatClick = (seatId: string) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.id === seatId
          ? { ...seat, isSelected: !seat.isSelected }
          : seat
      )
    );

    const updatedSeat = seats.find(s => s.id === seatId);
    if (updatedSeat) {
      if (updatedSeat.isSelected) {
        setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
      } else {
        setSelectedSeats(prev => [...prev, { ...updatedSeat, isSelected: true }]);
      }
    }
  };

  const getSeatIcon = (type: Seat['type']) => {
    switch (type) {
      case 'vip':
        return <Crown className="w-3 h-3" />;
      case 'premium':
        return <Star className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (!seat.isAvailable) return 'bg-muted text-muted-foreground cursor-not-allowed';
    if (seat.isSelected) return 'bg-primary text-primary-foreground shadow-glow';
    
    switch (seat.type) {
      case 'vip':
        return 'bg-warning/20 text-warning hover:bg-warning hover:text-warning-foreground border-warning';
      case 'premium':
        return 'bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground border-accent';
      default:
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border';
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleContinue = () => {
    const seatIds = selectedSeats.map(seat => seat.id);
    onNext(seatIds);
  };

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Select Your Seats
        </h2>
        <p className="text-muted-foreground">Concert Night 2024</p>
        <p className="text-sm text-muted-foreground">
          March 15, 2024 at 7:30 PM
        </p>
        <p className="text-sm text-muted-foreground">
          Select {ticketQuantity} seat{ticketQuantity !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Stage/Screen */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-primary text-primary-foreground rounded-lg shadow-glow">
            <Monitor className="w-5 h-5" />
            <span className="font-medium">STAGE</span>
          </div>
        </div>

        {/* Seat Map */}
        <Card className="p-6 bg-gradient-card shadow-elevated">
          <div className="space-y-3">
            {Object.entries(groupedSeats).map(([row, rowSeats]) => (
              <div key={row} className="flex items-center justify-center gap-2">
                <div className="w-8 text-center font-medium text-sm text-muted-foreground">
                  {row}
                </div>
                <div className="flex gap-1">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => seat.isAvailable && handleSeatClick(seat.id)}
                      disabled={!seat.isAvailable}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-smooth border
                        ${getSeatColor(seat)}
                        ${seat.isAvailable ? 'hover:scale-105' : ''}
                      `}
                      title={`Seat ${seat.id} - $${seat.price} (${seat.type})`}
                    >
                      <div className="flex items-center justify-center">
                        {getSeatIcon(seat.type) || seat.number}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 pt-6 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-secondary border border-border rounded"></div>
              <span className="text-sm">Standard ($89)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent/20 border border-accent rounded flex items-center justify-center">
                <Star className="w-2 h-2 text-accent" />
              </div>
              <span className="text-sm">Premium ($120)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning/20 border border-warning rounded flex items-center justify-center">
                <Crown className="w-2 h-2 text-warning" />
              </div>
              <span className="text-sm">VIP ($150)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </Card>

        {/* Selected Seats Summary */}
        {selectedSeats.length > 0 && (
          <Card className="mt-6 p-6 bg-gradient-card shadow-elevated">
            <h3 className="text-lg font-semibold mb-4">Selected Seats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {selectedSeats.map((seat) => (
                <div key={seat.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-2">
                    {getSeatIcon(seat.type)}
                    <span className="font-medium">{seat.id}</span>
                    <Badge variant={seat.type === 'vip' ? 'default' : 'secondary'}>
                      {seat.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{seat.price}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-2xl font-bold flex items-center gap-1">
                <DollarSign className="w-6 h-6 text-primary" />
                <span className="text-primary">{totalPrice}</span>
                <span className="text-sm text-muted-foreground font-normal">
                  ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  className="bg-gradient-primary hover:bg-primary/90 shadow-glow"
                  size="lg"
                  disabled={selectedSeats.length !== ticketQuantity}
                >
                  Continue to Confirmation
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};