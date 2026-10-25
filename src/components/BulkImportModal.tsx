import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Sparkles, 
  Layers, 
  Users, 
  Building2,
  Trash2
} from 'lucide-react';
import { DaiUtusan, Korwil } from '../types/dai';
import { 
  downloadDaiCsvTemplate, 
  downloadKorwilCsvTemplate, 
  parseBulkDaiText, 
  generate300NationalDaiList 
} from '../utils/bulkImportHelper';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'dai' | 'korwil';
  onImportDai: (data: DaiUtusan[], replaceAll: boolean) => void;
  onImportKorwil?: (data: Korwil[], replaceAll: boolean) => void;
  onOpenGoogleSheets?: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  onImportDai,
  onImportKorwil,
  onOpenGoogleSheets,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'auto300'>('paste');
  const [rawText, setRawText] = useState('');
  const [replaceMode, setReplaceMode] = useState(false);
  const [previewData, setPreviewData] = useState<DaiUtusan[]>([]);
  const [parseMessage, setParseMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle parsing text
  const handleParseText = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setPreviewData([]);
      setParseMessage(null);
      return;
    }
    const result = parseBulkDaiText(text);
    setPreviewData(result.data);
    setParseMessage(result.message);
  };

  // Handle file upload (.csv or .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParseText(content);
    };
    reader.readAsText(file);
  };

  // 1-Click Load 300+ National Da'i
  const handleLoadInstant300 = () => {
    const data300 = generate300NationalDaiList();
    setPreviewData(data300);
    setParseMessage(`Berhasil menghasilkan ${data300.length} data da'i utusan nasional lengkap di 34 provinsi.`);
    setActiveTab('auto300');
  };

  // Submit bulk import
  const handleConfirmImport = () => {
    if (previewData.length === 0) return;
    onImportDai(previewData, replaceMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl my-6 overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-950/80">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>IMPORT DATA (BULK DATA INGESTION)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {targetType === 'dai'
                ? 'Import Data Seluruh Da\'i (Hingga 300+ Sekaligus)'
                : 'Import Data Koordinator Wilayah (Korwil)'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Anda tidak perlu menginput satu per satu. Cukup salin dari Excel, unggah berkas CSV, atau muat data otomatis.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin-Tempel dari Excel</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Berkas CSV</span>
            </button>
            {targetType === 'dai' && (
              <button
                onClick={handleLoadInstant300}
                className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'auto300'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Isi Otomatis 300 Da'i</span>
              </button>
            )}
            {onOpenGoogleSheets && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoogleSheets();
                }}
                className="py-3 px-3 font-semibold border-b-2 border-transparent text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                title="Buka panel impor & sinkronisasi Google Sheets resmi"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Sheets Cloud</span>
              </button>
            )}
          </div>

          {/* Template Download Button */}
          <button
            type="button"
            onClick={() => {
              if (targetType === 'dai') downloadDaiCsvTemplate();
              else downloadKorwilCsvTemplate();
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline py-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Format Template Excel/CSV</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: PASTE FROM EXCEL */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold text-white">
                  Tempel (Paste) Baris Tabel dari Excel atau Google Sheets di Bawah:
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Format: Nama [TAB] Tempat Pengutusan [TAB] Asal Daerah [TAB] Provinsi Pengutusan
                </span>
              </div>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => handleParseText(e.target.value)}
                placeholder="Contoh: Blok tabel Anda di Excel lalu tekan Ctrl+V di sini:&#10;Ustadz Abdullah Pratama	Dusun Taileleu	Padang, Sumbar	Sumatera Barat&#10;Ustadz Muhammad Haikal	Desa Long Midang	Tarakan, Kaltara	Kalimantan Utara&#10;Ustadz Syarif Hidayatullah	Distrik Kurulu	Bandung, Jabar	Papua Pegunungan..."
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                Tips: Anda dapat menyalin ratusan baris sekaligus dari Excel. Kolom: Nama Da'i, Tempat Pengutusan (beserta Provinsinya), Asal Daerah (Kota/Provinsi Asal), dan Provinsi Pengutusan (Provinsi Tempat Diutus).
              </p>
            </div>
          )}

          {/* TAB 2: UPLOAD CSV FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-950/60 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center mx-auto border border-blue-800">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {fileName ? `Berkas terpilih: ${fileName}` : 'Pilih atau Seret Berkas CSV ke Sini'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Mendukung berkas berekstensi .csv atau .txt dari ekspor spreadsheet Excel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTO 300+ DA'I PRESET */}
          {activeTab === 'auto300' && (
            <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-900/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Paket Data Formasi Nasional 300 Da'i Utusan Indonesia</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Paket ini memuat 300 profil da'i lengkap yang terdistribusi merata di 34 provinsi se-Indonesia (Sumatera, Kalimantan, Sulawesi, Maluku, Papua, Nusa Tenggara, Jawa), lengkap dengan titik 3T pedalaman, asal lembaga pengutus, dan estimasi anggaran bulanan.
              </p>
            </div>
          )}

          {/* Validation & Feedback Status */}
          {parseMessage && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200 font-medium">{parseMessage}</span>
            </div>
          )}

          {/* Live Preview Table */}
          {previewData.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  Pratinjau Data yang Akan Masuk ({previewData.length} Baris):
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Menampilkan 5 dari {previewData.length} baris
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 text-[10px] font-mono uppercase border-b border-slate-800">
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Da'i</th>
                      <th className="py-2.5 px-3">Tempat Pengutusan</th>
                      <th className="py-2.5 px-3">Asal Daerah</th>
                      <th className="py-2.5 px-3">Provinsi Pengutusan (Tempat Diutus)</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {previewData.slice(0, 5).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-white">{item.nama}</td>
                        <td className="py-2 px-3 text-slate-300">
                          {item.titikDakwah} {item.provinsi && !item.titikDakwah.toLowerCase().includes(item.provinsi.toLowerCase()) ? `(${item.provinsi})` : ''}
                        </td>
                        <td className="py-2 px-3 text-slate-300 font-medium">
                          {item.asalDaerah || item.asalLembaga || '-'}
                        </td>
                        <td className="py-2 px-3 font-medium text-blue-400">
                          {item.provinsi}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {item.statusTugas}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Merge Option Checkbox */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={replaceMode}
                onChange={(e) => setReplaceMode(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-300">
                Gantikan seluruh data lama dengan {previewData.length} data baru ini (Replace All)
              </span>
            </label>
            <span className="text-[11px] text-slate-500">
              {replaceMode ? 'Data lama akan direset' : 'Akan ditambahkan ke data saat ini'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400 font-mono">
            TOTAL SIAP DISIMPAN: <strong className="text-white">{previewData.length} DATA</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={previewData.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/30 border border-blue-500"
            >
              Simpan &amp; Import {previewData.length > 0 ? `${previewData.length} Data Sekaligus` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
