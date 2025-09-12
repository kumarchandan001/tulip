import { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Passenger } from '@/types/booking';

interface PassengerDetailsProps {
  onNext: (details: { name: string; email: string; phone: string }) => void;
  onBack: () => void;
  trackFormInteraction?: (field: string, action: 'focus' | 'blur' | 'input') => void;
}

export const PassengerDetails = ({ onNext, onBack, trackFormInteraction }: PassengerDetailsProps) => {
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
    };

    if (!details.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (details.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!details.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(details.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!details.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(details.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(details);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    trackFormInteraction?.(field, 'input');
  };

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Passenger Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={details.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onFocus={() => trackFormInteraction?.('name', 'focus')}
            onBlur={() => trackFormInteraction?.('name', 'blur')}
            className={errors.name ? 'border-destructive' : ''}
            required
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={details.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onFocus={() => trackFormInteraction?.('email', 'focus')}
            onBlur={() => trackFormInteraction?.('email', 'blur')}
            className={errors.email ? 'border-destructive' : ''}
            required
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={details.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onFocus={() => trackFormInteraction?.('phone', 'focus')}
            onBlur={() => trackFormInteraction?.('phone', 'blur')}
            className={errors.phone ? 'border-destructive' : ''}
            required
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone}</p>
          )}
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Card>
  );
};