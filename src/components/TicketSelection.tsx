import { useState } from 'react';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/booking';
import heroImage from '@/assets/hero-venue.jpg';

interface TicketSelectionProps {
  onSelectTicket: (type: string, quantity: number, price: number) => void;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Broadway Musical - The Lion King',
    date: '2024-03-15',
    time: '19:30',
    venue: 'Majestic Theatre, New York',
    price: 89,
    availableSeats: 150,
    category: 'Theater',
    image: heroImage,
  },
  {
    id: '2',
    title: 'Rock Concert - Arctic Monkeys',
    date: '2024-03-20',
    time: '20:00',
    venue: 'Madison Square Garden',
    price: 125,
    availableSeats: 89,
    category: 'Concert',
  },
  {
    id: '3',
    title: 'Stand-up Comedy Night',
    date: '2024-03-22',
    time: '21:00',
    venue: 'Comedy Cellar',
    price: 45,
    availableSeats: 45,
    category: 'Comedy',
  },
  {
    id: '4',
    title: 'Classical Orchestra Performance',
    date: '2024-03-25',
    time: '19:00',
    venue: 'Lincoln Center',
    price: 95,
    availableSeats: 200,
    category: 'Classical',
  },
];

export const TicketSelection = ({ onSelectTicket }: TicketSelectionProps) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const ticketTypes = [
    { type: 'Standard', price: 89, quantity: 1 },
    { type: 'Premium', price: 125, quantity: 1 },
    { type: 'VIP', price: 199, quantity: 1 },
  ];

  const handleSelect = (type: string, price: number) => {
    setSelectedType(type);
    onSelectTicket(type, 1, price);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Select Your Tickets
        </h2>
        <p className="text-muted-foreground">Choose from our ticket options</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {ticketTypes.map((ticket) => (
          <Card
            key={ticket.type}
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedType === ticket.type ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelect(ticket.type, ticket.price)}
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{ticket.type}</h3>
              <p className="text-3xl font-bold text-primary">${ticket.price}</p>
              <Button className="mt-4 w-full">Select</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};