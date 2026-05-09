"use client";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function Stepper({ value, onChange, min = 1 }: StepperProps) {
  return (
    <div className="stepper">
      <span className="stepper-val">{value}</span>
      <button
        type="button"
        className="stepper-btn"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
