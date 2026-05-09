"use client";

function IPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

interface FABProps {
  onClick: () => void;
  label?: string;
}

export function FAB({ onClick, label = "Tambah" }: FABProps) {
  return (
    <button className="fab" aria-label={label} onClick={onClick}>
      <IPlus />
    </button>
  );
}
