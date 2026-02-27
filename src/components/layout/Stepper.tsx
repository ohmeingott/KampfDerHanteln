interface Step {
  label: string;
  number: number;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-4 py-2 border-brutal-thin font-bold text-sm
              whitespace-nowrap transition-colors
              ${
                currentStep === step.number
                  ? 'bg-primary text-white'
                  : currentStep > step.number
                    ? 'bg-accent/20 text-dark'
                    : 'bg-gray-100 text-gray-400'
              }`}
          >
            <span
              className={`w-6 h-6 flex items-center justify-center border-brutal-thin text-xs
                ${
                  currentStep === step.number
                    ? 'bg-white text-primary'
                    : currentStep > step.number
                      ? 'bg-accent text-dark'
                      : 'bg-gray-200 text-gray-400'
                }`}
            >
              {currentStep > step.number ? '\u2713' : step.number}
            </span>
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <div className="w-6 h-0.5 bg-gray-300 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
