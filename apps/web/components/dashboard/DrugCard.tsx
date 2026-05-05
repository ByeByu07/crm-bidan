import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import type { Drug } from "@repo/types";
import { formatCurrency } from "@repo/utils/format";

interface DrugCardProps {
  drug: Drug;
  onClick?: () => void;
}

export function DrugCard({ drug, onClick }: DrugCardProps) {
  return (
    <Card className={onClick ? "cursor-pointer" : ""} onClick={onClick}>
      <CardContent className="p-2.5">
        {/* Row 1: Name + Price */}
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{drug.name}</p>
          <p className="shrink-0 text-sm font-semibold">
            {formatCurrency(drug.sellPricePerDispense)}
          </p>
        </div>

        {/* Row 2: Category + Unit + Status */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {drug.category}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {drug.dispenseUnit}
          </span>
          {!drug.isActive && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-destructive">Nonaktif</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
