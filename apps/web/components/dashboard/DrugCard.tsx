import type { Drug } from "@repo/types";
import { formatCurrency } from "@repo/utils/format";

interface DrugCardProps {
  drug: Drug;
  onClick?: () => void;
}

export function DrugCard({ drug, onClick }: DrugCardProps) {
  return (
    <div className={`dc card ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <p className="name">{drug.name}</p>
        <p className="price">{formatCurrency(drug.sellPricePerDispense)}</p>
      </div>
      <div className="row">
        <span className="cat">{drug.category}</span>
        <span className="cat">·</span>
        <span className="cat">{drug.dispenseUnit}</span>
        {!drug.isActive && (
          <>
            <span className="cat">·</span>
            <span className="inactive">Nonaktif</span>
          </>
        )}
      </div>
    </div>
  );
}
