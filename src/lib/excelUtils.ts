import ExcelJS from 'exceljs';
import type { FurnitureItem } from '@/types/quote';

export interface ProjectData {
  projectName: string;
  items: FurnitureItem[];
  rooms: string[];
}

/**
 * Export a project to an Excel workbook.
 * Each room becomes its own sheet with the room's furniture items.
 */
export async function exportProjectToExcel(project: ProjectData): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Furnish by Isabey Interiors';
  workbook.created = new Date();
  
  // Group items by room
  const itemsByRoom: Record<string, FurnitureItem[]> = {};
  project.items.forEach(item => {
    if (!itemsByRoom[item.roomName]) {
      itemsByRoom[item.roomName] = [];
    }
    itemsByRoom[item.roomName].push(item);
  });

  // Create a sheet for each room
  const roomsWithItems = Object.keys(itemsByRoom);
  
  if (roomsWithItems.length === 0) {
    // Create an empty summary sheet if no items
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Project Name', project.projectName]);
    summarySheet.addRow(['Total Items', '0']);
    summarySheet.addRow(['Total Cost', '$0.00']);
    summarySheet.addRow([]);
    summarySheet.addRow(['No items in this quote yet.']);
  } else {
    roomsWithItems.forEach(roomName => {
      const roomItems = itemsByRoom[roomName];
      
      // Sanitize sheet name (Excel has restrictions)
      const safeSheetName = roomName.substring(0, 31).replace(/[\\/*?:\[\]]/g, '_');
      const worksheet = workbook.addWorksheet(safeSheetName);
      
      // Set column widths
      worksheet.columns = [
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Supplier', key: 'supplier', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Base Cost', key: 'baseCost', width: 12 },
        { header: 'Final Price', key: 'finalPrice', width: 12 },
        { header: 'Notes', key: 'notes', width: 30 },
      ];
      
      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add data rows
      roomItems.forEach(item => {
        worksheet.addRow({
          sku: item.sku,
          productName: item.productName,
          supplier: item.supplier,
          quantity: item.quantity,
          baseCost: item.baseCost,
          finalPrice: item.finalPrice,
          notes: item.notes
        });
      });
      
      // Add room total row
      const roomTotal = roomItems.reduce((sum, item) => sum + item.finalPrice, 0);
      worksheet.addRow([]);
      const totalRow = worksheet.addRow(['', '', '', '', 'Room Total:', roomTotal, '']);
      totalRow.font = { bold: true };
    });
  }

  // Generate filename from project name
  const safeFileName = project.projectName.replace(/[^a-zA-Z0-9\s-]/g, '').trim() || 'Quote';
  
  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeFileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_SHEETS = 50;
const MAX_ROWS_PER_SHEET = 1000;
const MAX_STRING_LENGTH = 500;
const MAX_NOTES_LENGTH = 1000;
const MAX_QUANTITY = 10000;
const MAX_COST = 10000000; // 10 million

/**
 * Sanitize a string value with length limit
 */
function sanitizeString(value: unknown, maxLength: number = MAX_STRING_LENGTH): string {
  return String(value || '').slice(0, maxLength).trim();
}

/**
 * Validate and clamp a numeric value
 */
function sanitizeNumber(value: unknown, min: number, max: number, defaultValue: number): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Import a project from an Excel workbook.
 * Each sheet is treated as a room with furniture items.
 * Includes validation to prevent malicious file processing.
 */
export async function importProjectFromExcel(file: File): Promise<ProjectData> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
  }

  // Validate file type
  if (!file.name.match(/\.xlsx?$/i)) {
    throw new Error('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
  }

  let workbook: ExcelJS.Workbook;
  try {
    const arrayBuffer = await file.arrayBuffer();
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
  } catch (error) {
    throw new Error('Failed to read Excel file. The file may be corrupted or in an unsupported format.');
  }

  // Validate sheet count
  if (workbook.worksheets.length > MAX_SHEETS) {
    throw new Error(`Too many sheets. Maximum allowed is ${MAX_SHEETS}`);
  }

  const items: FurnitureItem[] = [];
  const rooms: string[] = [];
  
  // Get project name from filename (strip extension) and sanitize
  const projectName = sanitizeString(file.name.replace(/\.xlsx?$/i, ''), 100);
  
  // Process each sheet as a room
  workbook.worksheets.forEach(worksheet => {
    const sheetName = sanitizeString(worksheet.name, 50);
    
    // Skip summary sheets
    if (sheetName.toLowerCase() === 'summary') return;
    
    rooms.push(sheetName);
    
    let rowCount = 0;
    
    // Get rows (skip header row at index 1)
    worksheet.eachRow((row, rowNumber) => {
      // Skip header row
      if (rowNumber === 1) return;
      
      // Enforce row limit per sheet
      rowCount++;
      if (rowCount > MAX_ROWS_PER_SHEET) return;
      
      const values = row.values as unknown[];
      // ExcelJS row values are 1-indexed, so values[0] is undefined
      const sku = sanitizeString(values[1], 50);
      const productName = sanitizeString(values[2], MAX_STRING_LENGTH);
      const supplier = sanitizeString(values[3], 100);
      const quantity = sanitizeNumber(values[4], 1, MAX_QUANTITY, 1);
      const baseCost = sanitizeNumber(values[5], 0, MAX_COST, 0);
      const finalPrice = sanitizeNumber(values[6], 0, MAX_COST, 0);
      const notes = sanitizeString(values[7], MAX_NOTES_LENGTH);
      
      // Skip empty rows or total rows
      if (!sku && !productName) return;
      if (sku.toLowerCase().includes('total')) return;
      if (sanitizeString(values[5]).toLowerCase().includes('total')) return;
      
      items.push({
        id: crypto.randomUUID(),
        roomName: sheetName,
        sku,
        productName,
        supplier,
        quantity,
        baseCost,
        finalPrice,
        notes
      });
    });
  });
  
  return {
    projectName,
    items,
    rooms
  };
}
