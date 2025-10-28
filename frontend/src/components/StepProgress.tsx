import React from 'react';

interface StepProgressProps {
  current: number; // 1-based index of current step
  labels?: string[]; // optional custom labels
}

export const StepProgress: React.FC<StepProgressProps> = ({ current, labels }) => {
  const steps = labels || ['เลือกบริการ', 'เลือกพนักงาน', 'วันและเวลา', 'ยืนยัน'];

  return (
    <div className="booking-steps" aria-label="Booking steps">
      {steps.map((label, idx) => {
        const stepIndex = idx + 1;
        const isComplete = stepIndex < current;
        const isCurrent = stepIndex === current;
        const className = [
          'booking-step',
          isComplete ? 'is-complete' : '',
          isCurrent ? 'is-current' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={label} className={className}>
            <div className="step-circle" aria-hidden>
              {isComplete ? '✓' : stepIndex}
            </div>
            <div className="step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
};