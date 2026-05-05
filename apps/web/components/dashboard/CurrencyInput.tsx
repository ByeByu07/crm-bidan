"use client";

import { useState, useEffect, forwardRef } from "react";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  disabled?: boolean;
  id?: string;
  required?: boolean;
}

function formatNumber(num: number): string {
  if (num === 0) return "";
  return new Intl.NumberFormat("id-ID").format(num);
}

function parseDigits(str: string): number {
  const digits = str.replace(/\D/g, "");
  return digits === "" ? 0 : parseInt(digits, 10);
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder, className, min = 0, disabled, id, required }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => formatNumber(value));

    // Sync display when value prop changes externally
    useEffect(() => {
      setDisplayValue(formatNumber(value));
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value;

      // If empty, clear everything
      if (raw === "") {
        setDisplayValue("");
        onChange(0);
        return;
      }

      // Extract digits only and parse
      const num = parseDigits(raw);

      // Enforce minimum
      if (num < min) {
        setDisplayValue(formatNumber(min));
        onChange(min);
        return;
      }

      // Update state and format display in real-time
      onChange(num);
      setDisplayValue(formatNumber(num));
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          Rp
        </span>
        <Input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={cn("pl-10", className)}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
