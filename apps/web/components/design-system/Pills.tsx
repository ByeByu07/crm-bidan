"use client";

interface PillsProps {
  options: string[];
  active: string;
  onChange: (value: string) => void;
}

export function Pills({ options, active, onChange }: PillsProps) {
  return (
    <div className="pillrow">
      {options.map((o) => (
        <button
          key={o}
          className={`pill ${active === o ? "on" : ""}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
