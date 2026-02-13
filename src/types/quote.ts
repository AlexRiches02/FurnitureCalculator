export interface FurnitureItem {
  id: string;
  roomName: string;
  supplier: string;
  sku: string;
  quantity: number;
  productName: string;
  baseCost: number;
  finalPrice: number;
  notes: string;
}

export interface Room {
  name: string;
  items: FurnitureItem[];
}

export interface Project {
  name: string;
  clientName: string;
  clientEmail: string;
  rooms: Room[];
  totalCost: number;
  createdAt: Date;
}
