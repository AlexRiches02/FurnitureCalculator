import { useState, useMemo, useEffect } from "react";
import { QuoteHeader } from "@/components/QuoteBuilder/QuoteHeader";
import { FurnitureForm } from "@/components/QuoteBuilder/FurnitureForm";
import { RoomCard } from "@/components/QuoteBuilder/RoomCard";
import { SubmitQuoteDialog } from "@/components/QuoteBuilder/SubmitQuoteDialog";
import { ProjectInfo } from "@/components/QuoteBuilder/ProjectInfo";
import { EmptyState } from "@/components/QuoteBuilder/EmptyState";
import { calculateFinalPrice } from "@/data/suppliers";
import { exportProjectToExcel, importProjectFromExcel } from "@/lib/excelUtils";
import { useQuotePersistence, loadSavedQuote } from "@/hooks/useQuotePersistence";
import { toast } from "@/hooks/use-toast";
import type { FurnitureItem } from "@/types/quote";

const DEFAULT_ROOMS = ["Living Room", "Bedroom", "Dining Room", "Office"];

export default function Index() {
  const [projectName, setProjectName] = useState("New Furniture Quote");
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [rooms, setRooms] = useState<string[]>(DEFAULT_ROOMS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved quote on mount
  useEffect(() => {
    const savedQuote = loadSavedQuote();
    if (savedQuote) {
      setProjectName(savedQuote.projectName);
      setItems(savedQuote.items);
      // Merge saved rooms with defaults
      const allRooms = [...new Set([...DEFAULT_ROOMS, ...savedQuote.rooms])];
      setRooms(allRooms);
      
      toast({
        title: "Draft Restored",
        description: `Loaded your saved quote from ${new Date(savedQuote.lastSaved).toLocaleString()}`,
      });
    }
    setIsInitialized(true);
  }, []);

  // Auto-save quote data (only after initial load)
  useQuotePersistence(
    isInitialized ? projectName : "",
    isInitialized ? items : [],
    isInitialized ? rooms : []
  );

  const handleAddItem = (itemData: Omit<FurnitureItem, 'id' | 'finalPrice'>) => {
    const finalPrice = calculateFinalPrice(itemData.baseCost, itemData.supplier, itemData.quantity);
    const newItem: FurnitureItem = {
      ...itemData,
      id: crypto.randomUUID(),
      finalPrice,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddRoom = (roomName: string) => {
    if (!rooms.includes(roomName)) {
      setRooms(prev => [...prev, roomName]);
    }
  };

  const handleExport = async () => {
    try {
      await exportProjectToExcel({
        projectName,
        items,
        rooms
      });
      toast({
        title: "Export Successful",
        description: `Quote exported as "${projectName}.xlsx"`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      const projectData = await importProjectFromExcel(file);
      setProjectName(projectData.projectName);
      setItems(projectData.items);
      // Merge imported rooms with existing default rooms
      const allRooms = [...new Set([...DEFAULT_ROOMS, ...projectData.rooms])];
      setRooms(allRooms);
      toast({
        title: "Import Successful",
        description: `Loaded ${projectData.items.length} items from "${file.name}"`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import quote. Please check the file format.",
        variant: "destructive",
      });
    }
  };


  const itemsByRoom = useMemo(() => {
    const grouped: Record<string, FurnitureItem[]> = {};
    items.forEach(item => {
      if (!grouped[item.roomName]) {
        grouped[item.roomName] = [];
      }
      grouped[item.roomName].push(item);
    });
    return grouped;
  }, [items]);

  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + item.finalPrice, 0);
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <QuoteHeader 
        projectName={projectName} 
        totalCost={totalCost} 
        itemCount={items.length}
        onExport={handleExport}
        onImport={handleImport}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[380px_1fr] gap-8">
          {/* Left Sidebar - Form */}
          <aside className="space-y-6">
            <ProjectInfo 
              projectName={projectName} 
              onProjectNameChange={setProjectName} 
            />
            <FurnitureForm 
              rooms={rooms} 
              onAddItem={handleAddItem} 
              onAddRoom={handleAddRoom} 
            />
          </aside>

          {/* Main Content - Quote Items */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground font-serif">Quote Items</h2>
              <SubmitQuoteDialog 
                items={items} 
                totalCost={totalCost} 
                projectName={projectName}
                disabled={items.length === 0}
              />
            </div>

            {items.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {Object.entries(itemsByRoom).map(([roomName, roomItems]) => (
                  <RoomCard
                    key={roomName}
                    roomName={roomName}
                    items={roomItems}
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-5 card-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Project Cost</p>
                    <p className="text-3xl font-semibold text-foreground font-serif mt-1">
                      ${totalCost.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <SubmitQuoteDialog 
                    items={items} 
                    totalCost={totalCost} 
                    projectName={projectName}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
