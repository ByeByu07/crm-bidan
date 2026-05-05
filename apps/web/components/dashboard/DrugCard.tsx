import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import type { Drug } from "@repo/types";
import { formatCurrency } from "@repo/utils/format";
import { Pill } from "lucide-react";

interface DrugCardProps {
  drug: Drug;
  onClick?: () => void;
}

export function DrugCard({ drug, onClick }: DrugCardProps) {
  return (
    <Card className={onClick ? "cursor-pointer" : ""} onClick={onClick}>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Pill className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-medium">{drug.name}</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-[10px]">
              {drug.category}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {drug.dispenseUnit}
            </Badge>
            {!drug.isActive && (
              <Badge variant="destructive" className="text-[10px]">
                Nonaktif
              </Badge>
            )}
          </div>
          <p className="text-sm font-semibold">
            {formatCurrency(drug.sellPricePerDispense)} / {drug.dispenseUnit}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
