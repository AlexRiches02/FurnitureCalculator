import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import logo from "@/assets/logo.webp";
import { Button } from "@/components/ui/button";

interface QuoteHeaderProps {
  projectName: string;
  totalCost: number;
  itemCount: number;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function QuoteHeader({ 
  projectName, 
  totalCost, 
  itemCount,
  onExport,
  onImport
}: QuoteHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={logo} 
              alt="Furnish by Isabey Interiors" 
              className="h-10 w-auto"
            />
            <div className="border-l border-border pl-4">
              <h1 className="text-lg font-serif font-medium text-foreground leading-tight">
                {projectName || "Quote Builder"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in quote
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleImportClick}
              >
                <Upload className="h-4 w-4 mr-1.5" />
                Import Quote
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export Quote
              </Button>
            </div>
            
            <div className="text-right border-l border-border pl-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Total Estimate</p>
              <p className="text-2xl font-serif font-medium text-foreground">
                ${totalCost.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
