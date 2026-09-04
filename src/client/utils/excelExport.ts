import * as XLSX from 'xlsx';
import { Product, User } from '../../types/index.js';

/**
 * Formats a date string to a human-readable format for spreadsheets (YYYY-MM-DD HH:mm)
 */
function formatDate(isoStr?: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toISOString().replace('T', ' ').substring(0, 16);
  } catch {
    return isoStr;
  }
}

/**
 * Calculates optimal column widths based on content length
 */
function autoFitColumns(rows: Record<string, any>[]): { wch: number }[] {
  if (!rows || rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    for (let i = 0; i < Math.min(rows.length, 200); i++) {
      const val = rows[i][key];
      const str = val !== null && val !== undefined ? String(val) : '';
      if (str.length > maxLen) {
        maxLen = str.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });
}

/**
 * Generates and triggers download of the Customer Registry Excel workbook (.xlsx)
 */
export function exportCustomersToExcel(customers: User[], filename?: string): void {
  const exportDate = new Date().toISOString().split('T')[0];
  const targetFilename = filename || `fumare_customers_${exportDate}.xlsx`;

  const customerRows = customers.map((c, index) => {
    const addressDetails = c.addressDetails;
    return {
      '#': index + 1,
      'Customer ID': c.id,
      'First Name': c.firstName || '',
      'Last Name': c.lastName || '',
      'Full Name': `${c.firstName || ''} ${c.lastName || ''}`.trim(),
      'Email Address': c.email || '',
      'Phone Number': c.phone || '',
      'Role': c.role || 'CUSTOMER',
      'Account Status': c.status || 'ACTIVE',
      'House / Flat / Office No': addressDetails?.houseNo || '',
      'Area / Road / Colony': addressDetails?.areaRoad || '',
      'City': addressDetails?.city || '',
      'State': addressDetails?.state || '',
      'Pincode': addressDetails?.pincode || '',
      'Full Delivery Address': c.address || '',
      '21+ Age Verified': 'Yes',
      'Email Verified': c.isEmailVerified ? 'Yes' : 'No',
      'Phone Verified': c.isPhoneVerified ? 'Yes' : 'No',
      'Total Orders': c.orderCount || 0,
      'Total Spent ($)': Number((c.totalSpent || 0).toFixed(2)),
      'Wholesale Customer': c.isWholesaleCustomer ? 'Yes' : 'No',
      'Wholesale Company': c.wholesaleCompany || '',
      'Registration Date': formatDate(c.createdAt),
      'Last Login': formatDate(c.lastLoginAt)
    };
  });

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(customerRows);

  // Set column widths
  ws['!cols'] = autoFitColumns(customerRows);

  // Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');

  // Trigger browser download
  XLSX.writeFile(wb, targetFilename);
}

/**
 * Generates and triggers download of the Inventory / Product Catalog Excel workbook (.xlsx)
 */
export function exportInventoryToExcel(products: Product[], filename?: string): void {
  const exportDate = new Date().toISOString().split('T')[0];
  const targetFilename = filename || `fumare_inventory_${exportDate}.xlsx`;

  // Sheet 1: Detailed Inventory
  const inventoryRows = products.map((p, index) => {
    let stockStatus = 'In Stock';
    if (p.stock === 0) {
      stockStatus = 'Out of Stock';
    } else if (p.stock <= (p.lowStockThreshold || 5)) {
      stockStatus = 'Low Stock';
    }

    const price = Number(p.price || 0);
    const salePrice = p.salePrice !== undefined && p.salePrice !== null ? Number(p.salePrice) : '';
    const totalValue = Number((price * (p.stock || 0)).toFixed(2));

    return {
      '#': index + 1,
      'Product ID': p.id,
      'SKU': p.sku || '',
      'Product Name': p.name || '',
      'Category': p.category || '',
      'Subcategory': p.subcategory || '',
      'Brand': p.brand || '',
      'Stock Quantity': p.stock || 0,
      'Low Stock Alert Level': p.lowStockThreshold || 5,
      'Stock Status': stockStatus,
      'Retail Price ($)': price,
      'Sale Price ($)': salePrice,
      'Total Stock Value ($)': totalValue,
      'Flavor / Aroma': p.flavor || '',
      'Material': p.material || '',
      'Color / Finish': p.color || '',
      'Weight (g)': p.weight || '',
      '21+ Age Restricted': p.ageRestricted ? 'Yes' : 'No',
      'Active In Store': p.isActive !== false ? 'Yes' : 'No',
      'Best Seller': p.isBestSeller ? 'Yes' : 'No',
      'On Sale': p.isOnSale ? 'Yes' : 'No',
      'Featured': p.isFeatured ? 'Yes' : 'No',
      'Customer Rating': p.rating ? Number(p.rating.toFixed(1)) : 5.0,
      'Reviews Count': p.reviewCount || 0,
      'Primary Image URL': p.images?.[0]?.url || '',
      'Date Created': formatDate(p.createdAt),
      'Last Updated': formatDate(p.updatedAt)
    };
  });

  // Sheet 2: Inventory Summary & Valuation Breakdown
  const totalItems = products.length;
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length;
  const inStockCount = products.filter((p) => p.stock > (p.lowStockThreshold || 5)).length;

  // Category breakdown
  const categoryMap: Record<string, { count: number; units: number; val: number }> = {};
  products.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, units: 0, val: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].units += p.stock || 0;
    categoryMap[cat].val += (p.price || 0) * (p.stock || 0);
  });

  const summaryRows = [
    { 'Metric': 'Total Catalog SKUs', 'Value': totalItems },
    { 'Metric': 'Total Physical Units in Stock', 'Value': totalUnits },
    { 'Metric': 'Total Inventory Valuation ($)', 'Value': `$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { 'Metric': 'Optimal Stocked Items', 'Value': inStockCount },
    { 'Metric': 'Low Stock Alert Items', 'Value': lowStockCount },
    { 'Metric': 'Out of Stock Items', 'Value': outOfStockCount },
    { 'Metric': 'Report Generated At', 'Value': new Date().toLocaleString() }
  ];

  const categoryRows = Object.entries(categoryMap).map(([cat, data]) => ({
    'Category Name': cat,
    'SKU Count': data.count,
    'Stock Units': data.units,
    'Inventory Value ($)': Number(data.val.toFixed(2))
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Master Inventory
  const wsInventory = XLSX.utils.json_to_sheet(inventoryRows);
  wsInventory['!cols'] = autoFitColumns(inventoryRows);
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventory Stock');

  // Sheet 2: Executive Summary
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Inventory Overview');

  // Sheet 3: Category Breakdown
  const wsCategory = XLSX.utils.json_to_sheet(categoryRows);
  wsCategory['!cols'] = autoFitColumns(categoryRows);
  XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Valuation');

  // Trigger download
  XLSX.writeFile(wb, targetFilename);
}
