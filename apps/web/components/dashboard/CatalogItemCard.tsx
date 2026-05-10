import type { CatalogItem } from "@repo/types";
import { formatCurrency } from "@repo/utils/format";

interface CatalogItemCardProps {
  item: CatalogItem;
  onClick?: () => void;
}

export function CatalogItemCard({ item, onClick }: CatalogItemCardProps) {
  return (
    <div className={`dc card ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <p className="name">{item.name}</p>
        <p className="price">{formatCurrency(item.sellPrice)}</p>
      </div>
      <div className="row">
        <span className="cat">{item.category}</span>
        <span className="cat">·</span>
        <span className="cat">{item.unit}</span>
        <span className="cat">·</span>
        <span
          className="cat"
          style={{
            fontWeight: 600,
            color: item.type === "service" ? "#7c4dff" : "#2e7d32",
          }}
        >
          {item.type === "service" ? "Layanan" : "Produk"}
        </span>
        {!item.isActive && (
          <>
            <span className="cat">·</span>
            <span className="inactive">Nonaktif</span>
          </>
        )}
      </div>
    </div>
  );
}
