import { Check } from 'lucide-react';
import { BookingStep } from '@/types/booking';

interface ProgressStepsProps {
  currentStep: number;
}

export const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  const steps = [
    { id: 1, title: 'Select Tickets', description: 'Choose your tickets', completed: currentStep > 0, active: currentStep === 0 },
    { id: 2, title: 'Passenger Info', description: 'Enter details', completed: currentStep > 1, active: currentStep === 1 },
    { id: 3, title: 'Select Seats', description: 'Choose your seats', completed: currentStep > 2, active: currentStep === 2 },
    { id: 4, title: 'Confirmation', description: 'Review & pay', completed: currentStep > 3, active: currentStep === 3 },
  ];

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-smooth ${
                  step.completed
                    ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                    : step.active
                    ? 'bg-primary text-primary-foreground shadow-card'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.completed ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{step.id}</span>
                )}
              </div>
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-medium transition-smooth ${
                    step.active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-0.5 mx-4 mt-6 transition-smooth ${
                  step.completed ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};