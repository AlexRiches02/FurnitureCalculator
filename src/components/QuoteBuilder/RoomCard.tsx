import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FurnitureItem } from "@/types/quote";

interface RoomCardProps {
  roomName: string;
  items: FurnitureItem[];
  onRemoveItem: (itemId: string) => void;
}

export function RoomCard({ roomName, items, onRemoveItem }: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const roomTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden card-shadow animate-slide-up">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <h3 className="text-lg font-semibold text-foreground font-serif">{roomName}</h3>
          <span className="text-sm text-muted-foreground">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-foreground">
            ${roomTotal.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Product
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Supplier
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  SKU
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Qty
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Base
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Final
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.productName}</p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {item.supplier}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                    {item.sku || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                    ${item.baseCost.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground text-right">
                    ${item.finalPrice.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
