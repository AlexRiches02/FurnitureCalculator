export interface Supplier {
  name: string;
  country: 'CAN' | 'USA';
  markup: number;
}

export const suppliers: Supplier[] = [
  { name: "BELLINI", country: "CAN", markup: 2.35 },
  { name: "CANADEL", country: "CAN", markup: 2.65 },
  { name: "CELADON ART", country: "CAN", markup: 2.48 },
  { name: "CHARLOTTE FABRICS", country: "CAN", markup: 2.33 },
  { name: "CUDDLE DOWN", country: "CAN", markup: 2.33 },
  { name: "JF FABRICS", country: "CAN", markup: 2.44 },
  { name: "KRAVET", country: "CAN", markup: 2.38 },
  { name: "LH HOME", country: "CAN", markup: 2.44 },
  { name: "MERCANA", country: "CAN", markup: 2.5 },
  { name: "METRO WALL", country: "CAN", markup: 2.48 },
  { name: "MOBITAL", country: "CAN", markup: 2.41 },
  { name: "MOE'S HOME", country: "CAN", markup: 2.6 },
  { name: "PHILLIP JEFFRIES", country: "CAN", markup: 2.27 },
  { name: "RATANA", country: "CAN", markup: 2.08 },
  { name: "RENWIL", country: "CAN", markup: 2.48 },
  { name: "ROMANO", country: "CAN", markup: 2.5 },
  { name: "SEALY/S&F", country: "CAN", markup: 2.38 },
  { name: "STYLE IN FORM", country: "CAN", markup: 2.34 },
  { name: "STYLUS", country: "CAN", markup: 2.44 },
  { name: "SUNPAN", country: "CAN", markup: 2.5 },
  { name: "SURYA", country: "CAN", markup: 2.28 },
  { name: "UNIVERSAL", country: "CAN", markup: 2.44 },
  { name: "VAN GOGH", country: "CAN", markup: 2.34 },
  { name: "WEST BROS", country: "CAN", markup: 2.46 },
  { name: "AMERICAN LEATHER", country: "USA", markup: 1.29 },
  { name: "AMITY HOME", country: "USA", markup: 4.2 },
  { name: "ANNIE SELKE", country: "USA", markup: 3.8 },
  { name: "ARMEN LIVING", country: "USA", markup: 3.65 },
  { name: "ARTERIORS", country: "USA", markup: 4.2 },
  { name: "BASSETT", country: "USA", markup: 3.99 },
  { name: "BERNHARDT", country: "USA", markup: 1.4 },
  { name: "CURREY AND CO.", country: "USA", markup: 3.8 },
  { name: "DOVETAIL", country: "USA", markup: 3.64 },
  { name: "EICHHOLTZ", country: "USA", markup: 3.24 },
  { name: "ESSENTIALS FOR LIVING", country: "USA", markup: 3.65 },
  { name: "ETHNICRAFT", country: "USA", markup: 3.5 },
  { name: "FOUR HANDS", country: "USA", markup: 3.95 },
  { name: "FURNITURE CLASSICS", country: "USA", markup: 3.8 },
  { name: "GLOBAL VIEWS", country: "USA", markup: 3.49 },
  { name: "JAIPUR LIVING", country: "USA", markup: 3.89 },
  { name: "LEFTBANK ART", country: "USA", markup: 3.8 },
  { name: "LEXINGTON", country: "USA", markup: 3.65 },
  { name: "LOLOI RUGS", country: "USA", markup: 3.92 },
  { name: "LUONTO", country: "USA", markup: 4 },
  { name: "PHILLIPS", country: "USA", markup: 4.58 },
  { name: "PALECEK", country: "USA", markup: 1.87 },
  { name: "ROWE FURNITURE", country: "USA", markup: 3.1 },
  { name: "SUMMER CLASSICS", country: "USA", markup: 3.8 },
  { name: "UTTERMOST", country: "USA", markup: 3.95 },
  { name: "VANGUARD", country: "USA", markup: 1.17 },
];

export const currencyConversion: Record<'CAN' | 'USA', number> = {
  CAN: 1,
  USA: 1.4,
};

export function getSupplierByName(name: string): Supplier | undefined {
  return suppliers.find(s => s.name === name);
}

export function calculateFinalPrice(
  baseCost: number,
  supplierName: string,
  quantity: number
): number {
  const supplier = getSupplierByName(supplierName);
  if (!supplier) return baseCost * quantity;
  
  const conversion = currencyConversion[supplier.country];
  return Math.round(baseCost * supplier.markup * conversion * quantity * 100) / 100;
}
