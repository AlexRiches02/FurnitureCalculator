import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { suppliers, calculateFinalPrice, getSupplierByName } from "@/data/suppliers";
import type { FurnitureItem } from "@/types/quote";

interface FurnitureFormProps {
  rooms: string[];
  onAddItem: (item: Omit<FurnitureItem, 'id' | 'finalPrice'>) => void;
  onAddRoom: (roomName: string) => void;
}

export function FurnitureForm({ rooms, onAddItem, onAddRoom }: FurnitureFormProps) {
  const [formData, setFormData] = useState({
    roomName: "",
    supplier: "",
    sku: "",
    quantity: 1,
    productName: "",
    baseCost: 0,
    notes: "",
  });
  const [newRoomName, setNewRoomName] = useState("");
  const [showNewRoom, setShowNewRoom] = useState(false);

  const selectedSupplier = getSupplierByName(formData.supplier);
  const estimatedFinal = formData.baseCost > 0 && formData.supplier
    ? calculateFinalPrice(formData.baseCost, formData.supplier, formData.quantity)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomName || !formData.supplier || !formData.productName || formData.baseCost <= 0) {
      return;
    }
    onAddItem(formData);
    setFormData(prev => ({
      ...prev,
      sku: "",
      productName: "",
      baseCost: 0,
      notes: "",
      quantity: 1,
    }));
  };

  const handleAddRoom = () => {
    if (newRoomName.trim()) {
      onAddRoom(newRoomName.trim());
      setFormData(prev => ({ ...prev, roomName: newRoomName.trim() }));
      setNewRoomName("");
      setShowNewRoom(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-5 card-shadow animate-fade-in">
      <h2 className="text-base font-serif font-medium text-foreground mb-5">Add Furniture Item</h2>
      
      <div className="grid gap-5">
        {/* Room Selection */}
        <div className="space-y-2">
          <Label htmlFor="room" className="text-sm font-medium">Room</Label>
          {showNewRoom ? (
            <div className="flex gap-2">
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="flex-1"
              />
              <Button type="button" onClick={handleAddRoom} size="sm">
                Add
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewRoom(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Select
                value={formData.roomName}
                onValueChange={(value) => setFormData(prev => ({ ...prev, roomName: value }))}
              >
                <SelectTrigger className="flex-1 bg-background">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {rooms.map((room) => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={() => setShowNewRoom(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplier" className="text-sm font-medium">Supplier</Label>
          <Select
            value={formData.supplier}
            onValueChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-[300px] z-50">
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.name} value={supplier.name}>
                  <span className="flex items-center justify-between w-full gap-4">
                    <span>{supplier.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {supplier.country} • {supplier.markup}x
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSupplier && (
            <p className="text-xs text-muted-foreground">
              Markup: {selectedSupplier.markup}x • Currency: {selectedSupplier.country}
            </p>
          )}
        </div>

        {/* SKU and Quantity Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku" className="text-sm font-medium">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="e.g., FN61203"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              className="bg-background"
            />
          </div>
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-sm font-medium">Product Name</Label>
          <Input
            id="productName"
            value={formData.productName}
            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
            placeholder="e.g., 2.5 Seater Sofa"
            className="bg-background"
          />
        </div>

        {/* Base Cost with Live Calculation */}
        <div className="space-y-2">
          <Label htmlFor="baseCost" className="text-sm font-medium">Base Cost ($)</Label>
          <Input
            id="baseCost"
            type="number"
            step="0.01"
            min={0}
            value={formData.baseCost || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, baseCost: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            className="bg-background"
          />
          {estimatedFinal > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg mt-2">
              <span className="text-sm text-muted-foreground">Calculated Final Price:</span>
              <span className="text-lg font-semibold text-accent">
                ${estimatedFinal.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Special requests, colors, finishes..."
            className="bg-background resize-none"
            rows={2}
          />
        </div>

        <Button type="submit" className="w-full mt-2" size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add to Quote
        </Button>
      </div>
    </form>
  );
}
