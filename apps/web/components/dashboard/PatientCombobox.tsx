"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import type { Patient } from "@repo/types";

interface PatientComboboxProps {
  patients: Patient[];
  selected: Patient | null;
  onSelect: (patient: Patient | null) => void;
}

export function PatientCombobox({
  patients,
  selected,
  onSelect,
}: PatientComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-2"
        >
          {selected ? (
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">{selected.name}</span>
              <span className="text-xs text-muted-foreground">
                {selected.whatsappNumber}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Pilih pasien...</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari pasien..." />
          <CommandList>
            <CommandEmpty>Pasien tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={`${patient.name}__${patient.id}`}
                  onSelect={() => {
                    onSelect(patient);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selected?.id === patient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{patient.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {patient.whatsappNumber}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
