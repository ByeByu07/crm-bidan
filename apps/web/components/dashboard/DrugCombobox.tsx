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
import type { Drug } from "@repo/types";

interface DrugComboboxProps {
  drugs: Drug[];
  selected: Drug | null;
  onSelect: (drug: Drug | null) => void;
}

export function DrugCombobox({ drugs, selected, onSelect }: DrugComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? selected.name : "Pilih obat..."}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari obat..." />
          <CommandList>
            <CommandEmpty>Obat tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {drugs.map((drug) => (
                <CommandItem
                  key={drug.id}
                  value={`${drug.name}__${drug.id}`}
                  onSelect={() => {
                    onSelect(drug);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selected?.id === drug.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {drug.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {drug.dispenseUnit}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
