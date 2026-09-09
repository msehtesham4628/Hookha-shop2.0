import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ArrowLeft, CheckCircle2, FileSpreadsheet, RefreshCw, UploadCloud, AlertTriangle } from 'lucide-react';
import { getApiBaseUrl } from '../services/api.js';
import { useStore } from '../store/useStore.js';

interface Props {
  onNavigate: (path: string) => void;
}

export const ExcelProductSyncPage: React.FC<Props> = ({ onNavigate }) => {
  const { showToast } = useStore();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [fileName, setFileName] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const columns = useMemo(() => {
    const set = new Set<string>();
    rows.slice(0, 10).forEach(row => Object.keys(row).forEach(key => set.add(key)));
    return [...set].slice(0, 12);
  }, [rows]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setResult(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) throw new Error('The Excel workbook has no worksheets.');
      const worksheet = workbook.Sheets[firstSheet];
      const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
      if (!parsed.length) throw new Error('The first worksheet is empty.');
      setRows(parsed);
      setFileName(file.name);
      setSheetName(firstSheet);
      showToast(`${parsed.length} Excel rows loaded`, 'success');
    } catch (err: any) {
      setRows([]);
      setFileName('');
      setSheetName('');
      setError(err?.message || 'Could not read the Excel file.');
    }
  };

  const sync = async () => {
    if (!rows.length) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const token = localStorage.getItem('sultan_auth_token');
      if (!token) throw new Error('Admin login is required before syncing Excel.');

      const response = await fetch(`${getApiBaseUrl()}/admin/products/excel-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ rows })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message || `Excel sync failed (${response.status}).`);
      }
      setResult(payload.data);
      showToast('Excel catalog synchronized with MongoDB', 'success');
    } catch (err: any) {
      setError(err?.message || 'Excel synchronization failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => onNavigate('/admin')} className="mb-6 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900">
          <ArrowLeft size={18} /> Back to Admin Dashboard
        </button>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
                <FileSpreadsheet size={14} /> Product Master
              </div>
              <h1 className="text-2xl font-semibold text-stone-900 md:text-3xl">Excel → MongoDB Product Sync</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                Excel is treated as the authoritative product catalog. Existing products are matched by SKU, new SKUs are created, and products missing from the workbook are removed from the live MongoDB catalog.
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <div><strong>Important:</strong> use a complete product workbook when syncing. Every row must have <strong>SKU, Name and Price</strong>. SKU is the permanent matching key.</div>
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center hover:border-amber-400 hover:bg-amber-50/30">
            <UploadCloud size={34} className="text-stone-500" />
            <span className="mt-3 font-medium text-stone-800">Choose Excel workbook</span>
            <span className="mt-1 text-xs text-stone-500">.xlsx or .xls • first worksheet is imported</span>
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
          </label>

          {fileName && (
            <div className="mt-5 rounded-xl border border-stone-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-stone-900">{fileName}</div>
                  <div className="text-sm text-stone-500">Sheet: {sheetName} • {rows.length} product rows</div>
                </div>
                <button disabled={busy} onClick={sync} className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {busy ? <RefreshCw size={17} className="animate-spin" /> : <RefreshCw size={17} />}
                  {busy ? 'Syncing…' : 'Sync Products'}
                </button>
              </div>

              {columns.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {columns.map(column => <span key={column} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">{column}</span>)}
                </div>
              )}
            </div>
          )}

          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

          {result && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 font-semibold text-emerald-900"><CheckCircle2 size={20} /> Catalog synchronized</div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                {[
                  ['Total', result.total],
                  ['Updated', result.updated],
                  ['Created', result.created],
                  ['Removed', result.removed],
                  ['Imported', result.imported]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/70 p-3"><div className="text-xs text-stone-500">{label}</div><div className="mt-1 text-xl font-semibold text-stone-900">{value}</div></div>
                ))}
              </div>
              <p className="mt-4 text-sm text-emerald-800">The live MongoDB product collection and current server memory now match this Excel catalog.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelProductSyncPage;
