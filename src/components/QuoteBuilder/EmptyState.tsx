import { Sofa } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Sofa className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 font-serif">No items yet</h3>
      <p className="text-muted-foreground max-w-sm">
        Start building your quote by adding furniture items using the form on the left.
      </p>
    </div>
  );
}
