import React, { useState, useRef, useMemo } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Search,
  FileText,
  X,
  Layers,
  HelpCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Product } from '../../types/index.js';
import { api } from '../services/api.js';

interface BulkProductUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSuccess: (message?: string) => void;
}

interface ParsedUpdateRow {
  rowNumber: number;
  rawIdentifier: string;
  sku?: string;
  id?: string;
  stock?: number;
  price?: number;
  salePrice?: number | null;
  lowStockThreshold?: number;
  matchedProduct?: Product;
  status: 'VALID_UPDATE' | 'NO_CHANGE' | 'NOT_FOUND' | 'INVALID_DATA';
  statusMessage: string;
  stockDiff?: number;
  priceDiff?: number;
}

export const BulkProductUpdateModal: React.FC<BulkProductUpdateModalProps> = ({
  isOpen,
  onClose,
  products,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);

  // Parsing & Diff state
  const [parsedRows, setParsedRows] = useState<ParsedUpdateRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [filterView, setFilterView] = useState<'all' | 'changes' | 'warnings'>('all');
  const [tableSearch, setTableSearch] = useState('');

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    total: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lookup map for ultra fast matching: by normalized SKU and ID
  const productLookup = useMemo(() => {
    const skuMap = new Map<string, Product>();
    const idMap = new Map<string, Product>();
    const nameMap = new Map<string, Product>();

    products.forEach((p) => {
      if (p.sku) skuMap.set(p.sku.trim().toUpperCase(), p);
      if (p.id) idMap.set(p.id.trim(), p);
      if (p.name) nameMap.set(p.name.trim().toLowerCase(), p);
    });

    return { skuMap, idMap, nameMap };
  }, [products]);

  // Simple CSV delimiter and quote-aware parser
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length < 2) return [];

    // Detect delimiter from header: comma, tab, or semicolon
    const headerLine = lines[0];
    let delimiter = ',';
    if (headerLine.includes('\t')) delimiter = '\t';
    else if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';

    const parseLine = (line: string): string[] => {
      const values: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          values.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      values.push(cur.trim());
      return values;
    };

    const headers = parseLine(lines[0]).map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, '')
    );

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = parseLine(lines[i]);
      if (vals.length === 0 || vals.every((v) => !v)) continue;
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = vals[idx] !== undefined ? vals[idx] : '';
      });
      rows.push(row);
    }
    return rows;
  };

  const parseAndValidateData = (rawText: string) => {
    setParseError(null);
    setSubmitResult(null);

    const trimmed = rawText.trim();
    if (!trimmed) {
      setParseError('The file or text content is empty. Please upload or paste data.');
      setParsedRows([]);
      return;
    }

    let records: any[] = [];

    // Try parsing as JSON first
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json)) {
          records = json;
        } else if (Array.isArray(json.products)) {
          records = json.products;
        } else if (Array.isArray(json.updates)) {
          records = json.updates;
        } else if (Array.isArray(json.data)) {
          records = json.data;
        } else {
          throw new Error('JSON must be an array of product updates or have a products/updates array property.');
        }
      } catch (err: any) {
        // If it starts with { or [ but fails JSON parse, show error
        setParseError(`JSON Syntax Error: ${err.message}`);
        setParsedRows([]);
        return;
      }
    } else {
      // Treat as CSV / TSV
      try {
        const csvRows = parseCSV(trimmed);
        if (csvRows.length === 0) {
          setParseError('Could not find valid rows in the CSV. Make sure you have a header line followed by data.');
          setParsedRows([]);
          return;
        }
        records = csvRows;
      } catch (err: any) {
        setParseError(`CSV Parsing Error: ${err.message}`);
        setParsedRows([]);
        return;
      }
    }

    // Process & Normalize Rows
    const evaluatedRows: ParsedUpdateRow[] = [];

    records.forEach((raw, idx) => {
      // Find SKU or ID key
      const skuVal =
        raw.sku ||
        raw.productsku ||
        raw.itemsku ||
        raw.code ||
        raw.SKU ||
        raw['Product SKU'] ||
        '';
      const idVal = raw.id || raw.productid || raw['Product ID'] || raw.ID || '';
      const nameVal = raw.name || raw.title || raw.productname || '';

      const rawIdentifier = String(skuVal || idVal || nameVal || `Row ${idx + 1}`).trim();

      // Find stock key
      const stockRaw =
        raw.stock !== undefined
          ? raw.stock
          : raw.qty !== undefined
          ? raw.qty
          : raw.quantity !== undefined
          ? raw.quantity
          : raw.newstock !== undefined
          ? raw.newstock
          : raw.inventory !== undefined
          ? raw.inventory
          : undefined;

      // Find price key
      const priceRaw =
        raw.price !== undefined
          ? raw.price
          : raw.unitprice !== undefined
          ? raw.unitprice
          : raw.retailprice !== undefined
          ? raw.retailprice
          : raw.newprice !== undefined
          ? raw.newprice
          : undefined;

      // Find sale price key
      const salePriceRaw =
        raw.saleprice !== undefined
          ? raw.saleprice
          : raw.sale_price !== undefined
          ? raw.sale_price
          : raw.discountprice !== undefined
          ? raw.discountprice
          : raw.discount_price !== undefined
          ? raw.discount_price
          : undefined;

      // Find low stock threshold key
      const thresholdRaw =
        raw.lowstockthreshold !== undefined
          ? raw.lowstockthreshold
          : raw.lowstock !== undefined
          ? raw.lowstock
          : raw.threshold !== undefined
          ? raw.threshold
          : undefined;

      // Lookup product
      let matched: Product | undefined;
      if (skuVal) {
        matched = productLookup.skuMap.get(String(skuVal).trim().toUpperCase());
      }
      if (!matched && idVal) {
        matched = productLookup.idMap.get(String(idVal).trim());
      }
      if (!matched && nameVal) {
        matched = productLookup.nameMap.get(String(nameVal).trim().toLowerCase());
      }

      if (!matched) {
        evaluatedRows.push({
          rowNumber: idx + 1,
          rawIdentifier,
          sku: skuVal ? String(skuVal) : undefined,
          id: idVal ? String(idVal) : undefined,
          status: 'NOT_FOUND',
          statusMessage: `No product found in catalog matching identifier "${rawIdentifier}".`
        });
        return;
      }

      // Parse numerical values
      let parsedStock: number | undefined;
      let parsedPrice: number | undefined;
      let parsedSalePrice: number | null | undefined;
      let parsedThreshold: number | undefined;

      if (stockRaw !== undefined && stockRaw !== null && String(stockRaw).trim() !== '') {
        const s = parseInt(String(stockRaw).replace(/[^0-9-]/g, ''), 10);
        if (!isNaN(s)) parsedStock = Math.max(0, s);
      }

      if (priceRaw !== undefined && priceRaw !== null && String(priceRaw).trim() !== '') {
        const p = parseFloat(String(priceRaw).replace(/[^0-9.]/g, ''));
        if (!isNaN(p)) parsedPrice = Math.max(0, Math.round(p * 100) / 100);
      }

      if (salePriceRaw !== undefined && salePriceRaw !== null) {
        const sStr = String(salePriceRaw).trim();
        if (sStr === '' || sStr.toLowerCase() === 'null' || sStr === '0') {
          parsedSalePrice = null;
        } else {
          const sp = parseFloat(sStr.replace(/[^0-9.]/g, ''));
          if (!isNaN(sp)) parsedSalePrice = Math.max(0, Math.round(sp * 100) / 100);
        }
      }

      if (thresholdRaw !== undefined && thresholdRaw !== null && String(thresholdRaw).trim() !== '') {
        const t = parseInt(String(thresholdRaw).replace(/[^0-9-]/g, ''), 10);
        if (!isNaN(t)) parsedThreshold = Math.max(0, t);
      }

      const hasStockChange = parsedStock !== undefined && parsedStock !== matched.stock;
      const hasPriceChange = parsedPrice !== undefined && parsedPrice !== matched.price;
      const hasSaleChange =
        parsedSalePrice !== undefined &&
        ((parsedSalePrice === null && matched.salePrice !== undefined) ||
          (parsedSalePrice !== null && parsedSalePrice !== matched.salePrice));
      const hasThresholdChange =
        parsedThreshold !== undefined && parsedThreshold !== matched.lowStockThreshold;

      const isChanged = hasStockChange || hasPriceChange || hasSaleChange || hasThresholdChange;

      const stockDiff = parsedStock !== undefined ? parsedStock - matched.stock : undefined;
      const priceDiff = parsedPrice !== undefined ? parsedPrice - matched.price : undefined;

      evaluatedRows.push({
        rowNumber: idx + 1,
        rawIdentifier,
        sku: matched.sku,
        id: matched.id,
        stock: parsedStock,
        price: parsedPrice,
        salePrice: parsedSalePrice,
        lowStockThreshold: parsedThreshold,
        matchedProduct: matched,
        status: isChanged ? 'VALID_UPDATE' : 'NO_CHANGE',
        statusMessage: isChanged
          ? 'Values differ from current catalog. Ready to update.'
          : 'Values match catalog exactly. No modification needed.',
        stockDiff,
        priceDiff
      });
    });

    setParsedRows(evaluatedRows);
  };

  const handleFileUpload = (file: File) => {
    setSelectedFileName(file.name);
    setSelectedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      parseAndValidateData(content);
    };
    reader.onerror = () => {
      setParseError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Download Sample CSV
  const handleDownloadSample = () => {
    // Pick 3 sample products from catalog if available
    const sampleItems = products.slice(0, 3);
    const sampleRows = sampleItems.map((p) => ({
      sku: p.sku || 'SAMPLE-SKU-01',
      stock: (p.stock + 10).toString(),
      price: (p.price + 2.5).toFixed(2),
      salePrice: p.salePrice ? (p.salePrice + 1).toFixed(2) : '',
      lowStockThreshold: (p.lowStockThreshold || 5).toString()
    }));

    if (sampleRows.length === 0) {
      sampleRows.push(
        { sku: 'FUM-MUSTHAVE-PINKMAN', stock: '45', price: '24.99', salePrice: '21.99', lowStockThreshold: '5' },
        { sku: 'FUM-DARKSIDE-SUPERNOVA', stock: '30', price: '26.50', salePrice: '', lowStockThreshold: '5' }
      );
    }

    const headers = 'sku,stock,price,salePrice,lowStockThreshold';
    const csvContent =
      headers +
      '\n' +
      sampleRows
        .map((r) => `${r.sku},${r.stock},${r.price},${r.salePrice},${r.lowStockThreshold}`)
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'fumare_bulk_inventory_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Entire Catalog as Editable CSV Template
  const handleExportCurrentCatalog = () => {
    const headers = 'sku,name,current_stock,current_price,new_stock,new_price,sale_price,low_stock_threshold';
    const rows = products.map((p) => {
      const cleanName = `"${(p.name || '').replace(/"/g, '""')}"`;
      const sku = p.sku || p.id;
      const stock = p.stock || 0;
      const price = p.price || 0;
      const salePrice = p.salePrice || '';
      const threshold = p.lowStockThreshold || 5;
      // Pre-fill new_stock and new_price with current values so admin can simply edit them
      return `${sku},${cleanName},${stock},${price},${stock},${price},${salePrice},${threshold}`;
    });

    const csvContent = headers + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fumare_catalog_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = parsedRows.length;
    const toUpdate = parsedRows.filter((r) => r.status === 'VALID_UPDATE');
    const noChange = parsedRows.filter((r) => r.status === 'NO_CHANGE');
    const notFound = parsedRows.filter((r) => r.status === 'NOT_FOUND');
    const stockChangeCount = parsedRows.filter((r) => r.stockDiff !== undefined && r.stockDiff !== 0).length;
    const priceChangeCount = parsedRows.filter((r) => r.priceDiff !== undefined && r.priceDiff !== 0).length;

    return {
      total,
      toUpdateCount: toUpdate.length,
      noChangeCount: noChange.length,
      notFoundCount: notFound.length,
      stockChangeCount,
      priceChangeCount
    };
  }, [parsedRows]);

  // Filtered rows for the preview table
  const displayedRows = useMemo(() => {
    let list = parsedRows;
    if (filterView === 'changes') {
      list = list.filter((r) => r.status === 'VALID_UPDATE');
    } else if (filterView === 'warnings') {
      list = list.filter((r) => r.status === 'NOT_FOUND' || r.status === 'NO_CHANGE');
    }

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.rawIdentifier.toLowerCase().includes(q) ||
          (r.sku && r.sku.toLowerCase().includes(q)) ||
          (r.matchedProduct && r.matchedProduct.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [parsedRows, filterView, tableSearch]);

  // Execute Bulk Update
  const handleApplyUpdates = async () => {
    const validUpdates = parsedRows.filter((r) => r.status === 'VALID_UPDATE');
    if (validUpdates.length === 0) return;

    setIsSubmitting(true);
    setParseError(null);

    const payload = validUpdates.map((r) => ({
      sku: r.sku,
      id: r.id,
      stock: r.stock,
      price: r.price,
      salePrice: r.salePrice,
      lowStockThreshold: r.lowStockThreshold
    }));

    try {
      const res = await api.bulkUpdateProducts(payload);
      if (res.success) {
        setSubmitResult({
          total: res.data.total,
          updated: res.data.updated,
          skipped: res.data.skipped,
          errors: res.data.errors || []
        });
        onSuccess(
          `Successfully updated ${res.data.updated} product${res.data.updated === 1 ? '' : 's'} across catalog and inventory.`
        );
      } else {
        setParseError(res.message || 'Bulk update failed');
      }
    } catch (err: any) {
      setParseError(err.message || 'An error occurred during bulk update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setParsedRows([]);
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setPasteContent('');
    setParseError(null);
    setSubmitResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div
      id="bulk-product-update-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-xs border border-stone-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xs bg-amber-900/60 border border-amber-700/50 flex items-center justify-center text-amber-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                Bulk Stock & Price Update
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs bg-amber-950 text-amber-300 border border-amber-800/80">
                CSV / JSON
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1.5 max-w-2xl leading-relaxed">
              Upload a CSV spreadsheet or JSON array to synchronize warehouse inventory levels, retail pricing, and promotional sale prices across your product catalog in one batch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xs transition-colors cursor-pointer"
              title="Download empty CSV template with standard column headers"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Sample CSV</span>
            </button>
            <button
              onClick={handleExportCurrentCatalog}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800/80 rounded-xs transition-colors cursor-pointer"
              title="Export all existing SKUs & current prices into an editable CSV spreadsheet"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Catalog CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50/50">
          {/* Success Banner if finished */}
          {submitResult && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xs flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Bulk Update Applied Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Updated <strong className="font-mono">{submitResult.updated}</strong> catalog items. {submitResult.skipped > 0 && <span>({submitResult.skipped} skipped or unchanged)</span>} Warehouse stock adjustments have been recorded in the inventory transaction ledger.
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs transition-colors shrink-0 cursor-pointer"
              >
                Upload Another
              </button>
            </div>
          )}

          {/* Error Banner */}
          {parseError && (
            <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-xs flex items-start gap-3 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Error:</span> {parseError}
              </div>
              <button onClick={() => setParseError(null)} className="text-rose-500 hover:text-rose-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload & Paste Controls (When no rows or when resetting) */}
          {parsedRows.length === 0 && !submitResult && (
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-amber-900 text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File (.csv / .json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                    activeTab === 'paste'
                      ? 'bg-amber-900 text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Direct Paste Mode</span>
                </button>
              </div>

              {activeTab === 'upload' ? (
                /* Drag and Drop Zone */
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xs p-8 sm:p-12 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-amber-800 bg-amber-50/60 scale-[0.99]'
                      : 'border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.json,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-amber-900 mb-3.5 border border-stone-200">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800">
                    Drag and drop your CSV or JSON file here
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Supports <span className="font-mono font-semibold text-stone-700">.csv</span>,{' '}
                    <span className="font-mono font-semibold text-stone-700">.json</span>, or{' '}
                    <span className="font-mono font-semibold text-stone-700">.tsv</span> files. Click to browse from your computer.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-stone-400">
                    <span className="bg-stone-100 px-2 py-0.5 rounded-xs border border-stone-200">Headers: sku / id</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded-xs border border-stone-200">stock</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded-xs border border-stone-200">price</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded-xs border border-stone-200">salePrice (optional)</span>
                  </div>
                </div>
              ) : (
                /* Paste Mode */
                <div className="space-y-3 bg-white p-4 rounded-xs border border-stone-200">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-semibold">Paste CSV text or JSON array:</span>
                    <span className="text-[11px] text-stone-400 font-mono">e.g. sku,stock,price</span>
                  </div>
                  <textarea
                    rows={8}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder={`sku,stock,price,salePrice\nFUM-MUSTHAVE-PINKMAN,50,24.99,21.99\nFUM-DARKSIDE-SUPERNOVA,35,26.50,\n\nOR JSON array:\n[\n  { "sku": "FUM-MUSTHAVE-PINKMAN", "stock": 50, "price": 24.99 }\n]`}
                    className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-300 rounded-xs focus:outline-none focus:border-amber-800 text-stone-800"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!pasteContent.trim()}
                      onClick={() => parseAndValidateData(pasteContent)}
                      className="px-4 py-2 bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Parse & Validate Data</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions & Template Helper Box */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xs text-xs text-stone-700 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-950">
                  <HelpCircle className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>File Formatting Instructions:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px] pl-1">
                  <li>
                    <strong>Identifier:</strong> Each row must include a <code>sku</code> or <code>id</code> column matching an existing item.
                  </li>
                  <li>
                    <strong>Stock:</strong> Sets the new absolute inventory count. The server automatically generates an audit trail and logs the diff in the inventory transaction ledger.
                  </li>
                  <li>
                    <strong>Price & Sale Price:</strong> Numeric dollar values. If a row leaves <code>price</code> or <code>stock</code> blank, that attribute remains untouched.
                  </li>
                  <li>
                    <strong>Excel / Google Sheets:</strong> Use <em>Export Catalog CSV</em> above to modify prices directly in your spreadsheet editor, then upload back here!
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Parsed Verification & Diff Matrix */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xs border border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-100 text-amber-900 rounded-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {selectedFileName || 'Manual Text Input'}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {selectedFileSize && `${selectedFileSize} • `}
                      {parsedRows.length} rows evaluated
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload Different File</span>
                  </button>
                </div>
              </div>

              {/* Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xs border border-stone-200">
                  <div className="text-[11px] font-medium text-stone-500">Total Rows</div>
                  <div className="text-xl font-bold font-mono text-stone-900 mt-1">{stats.total}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Parsed from input</div>
                </div>

                <div className="bg-white p-3.5 rounded-xs border border-emerald-200 bg-emerald-50/30">
                  <div className="text-[11px] font-medium text-emerald-800">Pending Updates</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                    {stats.toUpdateCount}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Catalog values differ</div>
                </div>

                <div className="bg-white p-3.5 rounded-xs border border-stone-200">
                  <div className="text-[11px] font-medium text-stone-500">Stock Changes</div>
                  <div className="text-xl font-bold font-mono text-amber-800 mt-1">
                    {stats.stockChangeCount}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Units to adjust</div>
                </div>

                <div className="bg-white p-3.5 rounded-xs border border-stone-200">
                  <div className="text-[11px] font-medium text-stone-500">Price Changes</div>
                  <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                    {stats.priceChangeCount}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Retail or sale updates</div>
                </div>
              </div>

              {/* Filter Tabs & Table Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xs border border-stone-200">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterView('all')}
                    className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                      filterView === 'all'
                        ? 'bg-stone-800 text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    onClick={() => setFilterView('changes')}
                    className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                      filterView === 'changes'
                        ? 'bg-emerald-800 text-white'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    With Changes ({stats.toUpdateCount})
                  </button>
                  <button
                    onClick={() => setFilterView('warnings')}
                    className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                      filterView === 'warnings'
                        ? 'bg-amber-800 text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Unchanged / Skipped ({stats.noChangeCount + stats.notFoundCount})
                  </button>
                </div>

                <div className="flex items-center gap-2 border border-stone-200 px-2.5 py-1 rounded-xs bg-stone-50/50">
                  <Search className="w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search preview by SKU, title..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="text-xs bg-transparent focus:outline-none w-48 text-stone-800"
                  />
                </div>
              </div>

              {/* Diff Preview Table */}
              <div className="bg-white border border-stone-200 rounded-xs overflow-x-auto max-h-[360px] shadow-2xs">
                <table className="w-full text-left text-xs min-w-[720px]">
                  <thead className="bg-stone-100/80 sticky top-0 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px] tracking-wider z-10">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Target Product</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Stock Diff</th>
                      <th className="py-2.5 px-3">Price Diff</th>
                      <th className="py-2.5 px-3">Sale Price</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {displayedRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-stone-400">
                          No items match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      displayedRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={`hover:bg-stone-50 transition-colors ${
                            row.status === 'NOT_FOUND' ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-stone-400 font-mono text-[11px]">
                            {row.rowNumber}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.matchedProduct ? (
                              <div className="flex items-center gap-2.5 max-w-[240px]">
                                <div className="w-8 h-8 rounded-xs bg-stone-100 border border-stone-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={row.matchedProduct.images[0]?.url}
                                    alt=""
                                    className="w-full h-full object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <span className="font-semibold text-stone-900 truncate">
                                  {row.matchedProduct.name}
                                </span>
                              </div>
                            ) : (
                              <div className="text-stone-500 italic max-w-[240px] truncate">
                                Unmatched identifier "{row.rawIdentifier}"
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-stone-700">
                            {row.sku || row.rawIdentifier}
                          </td>

                          {/* Stock Column */}
                          <td className="py-2.5 px-3">
                            {row.matchedProduct ? (
                              row.stock !== undefined ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-stone-400 font-mono">{row.matchedProduct.stock}</span>
                                  <ArrowRight className="w-3 h-3 text-stone-400" />
                                  <span className="font-bold font-mono text-stone-900">{row.stock}</span>
                                  {row.stockDiff !== 0 && (
                                    <span
                                      className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded-xs flex items-center gap-0.5 ${
                                        row.stockDiff! > 0
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {row.stockDiff! > 0 ? (
                                        <TrendingUp className="w-2.5 h-2.5" />
                                      ) : (
                                        <TrendingDown className="w-2.5 h-2.5" />
                                      )}
                                      {row.stockDiff! > 0 ? `+${row.stockDiff}` : row.stockDiff}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-stone-400 text-[11px] font-mono">
                                  {row.matchedProduct.stock} (unchanged)
                                </span>
                              )
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>

                          {/* Price Column */}
                          <td className="py-2.5 px-3">
                            {row.matchedProduct ? (
                              row.price !== undefined ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-stone-400 font-mono">
                                    ${row.matchedProduct.price.toFixed(2)}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-stone-400" />
                                  <span className="font-bold font-mono text-stone-900">
                                    ${row.price.toFixed(2)}
                                  </span>
                                  {row.priceDiff !== 0 && (
                                    <span
                                      className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded-xs ${
                                        row.priceDiff! > 0
                                          ? 'bg-amber-100 text-amber-900'
                                          : 'bg-blue-100 text-blue-900'
                                      }`}
                                    >
                                      {row.priceDiff! > 0
                                        ? `+$${row.priceDiff!.toFixed(2)}`
                                        : `-$${Math.abs(row.priceDiff!).toFixed(2)}`}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-stone-400 text-[11px] font-mono">
                                  ${row.matchedProduct.price.toFixed(2)} (unchanged)
                                </span>
                              )
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>

                          {/* Sale Price */}
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            {row.salePrice !== undefined ? (
                              row.salePrice === null ? (
                                <span className="text-rose-600 text-[10px] bg-rose-50 px-1 py-0.5 rounded-xs">
                                  Sale Removed
                                </span>
                              ) : (
                                <span className="font-bold text-amber-800">${row.salePrice.toFixed(2)}</span>
                              )
                            ) : row.matchedProduct?.salePrice ? (
                              <span className="text-stone-400">
                                ${row.matchedProduct.salePrice.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-stone-300">-</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3 text-right">
                            {row.status === 'VALID_UPDATE' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Ready
                              </span>
                            )}
                            {row.status === 'NO_CHANGE' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-xs">
                                Unchanged
                              </span>
                            )}
                            {row.status === 'NOT_FOUND' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-xs">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                SKU Not Found
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            {parsedRows.length > 0 ? (
              <span>
                <strong className="text-stone-800 font-mono">{stats.toUpdateCount}</strong> product
                {stats.toUpdateCount === 1 ? '' : 's'} queued for immediate update.{' '}
                {stats.notFoundCount > 0 && (
                  <span className="text-amber-800 font-medium">
                    ({stats.notFoundCount} unmatched rows will be skipped)
                  </span>
                )}
              </span>
            ) : (
              <span>Choose a file or paste data above to start previewing changes.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 border border-stone-300 rounded-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                id="apply-bulk-product-updates-btn"
                disabled={isSubmitting || stats.toUpdateCount === 0}
                onClick={handleApplyUpdates}
                className="px-5 py-2 bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Applying Updates...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Updates ({stats.toUpdateCount})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
