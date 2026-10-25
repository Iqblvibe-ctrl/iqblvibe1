import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileCheck,
  ShieldCheck,
  LogIn,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DaiUtusan } from '../types/dai';
import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken 
} from '../services/googleAuth';
import { 
  createDaiSpreadsheet, 
  readDaiFromSpreadsheet, 
  overwriteSpreadsheetData, 
  listUserSpreadsheets, 
  DriveSpreadsheetItem,
  ExportResult 
} from '../services/googleSheetsService';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  daiList: DaiUtusan[];
  onImportDai: (data: DaiUtusan[], replaceAll: boolean) => void;
  currentUser: User | null;
  onAuthChange: (user: User | null) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  daiList,
  onImportDai,
  currentUser,
  onAuthChange,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'sync'>('export');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Export states
  const [exportTitle, setExportTitle] = useState(`SIDAU NUSANTARA - Database Da'i (${new Date().toLocaleDateString('id-ID')})`);
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);

  // Import states
  const [driveSheets, setDriveSheets] = useState<DriveSpreadsheetItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [inputSheetUrl, setInputSheetUrl] = useState('');
  const [previewImport, setPreviewImport] = useState<{ data: DaiUtusan[]; totalRows: number; sheetTitle: string } | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);

  // Sync / Overwrite states
  const [syncTargetUrl, setSyncTargetUrl] = useState('');
  const [confirmOverwriteOpen, setConfirmOverwriteOpen] = useState(false);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      handleLoadDriveSpreadsheets();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Sign In action
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const res = await googleSignIn();
      if (res) {
        onAuthChange(res.user);
        setStatusMessage({ type: 'success', text: `Berhasil masuk dengan akun Google: ${res.user.email}` });
        handleLoadDriveSpreadsheets();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal masuk dengan Google. Pastikan jendela otorisasi tidak ditutup.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out action
  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      onAuthChange(null);
      setDriveSheets([]);
      setPreviewImport(null);
      setLastExport(null);
      setStatusMessage({ type: 'success', text: 'Berhasil keluar dari akun Google Workspace.' });
    } catch (err: any) {
      console.error(err);
    }
  };

  // Load user spreadsheets from Drive
  const handleLoadDriveSpreadsheets = async () => {
    try {
      setIsLoadingDrive(true);
      const token = await getAccessToken();
      if (!token) return;
      const files = await listUserSpreadsheets(token);
      setDriveSheets(files);
    } catch (err: any) {
      console.error('Error fetching drive spreadsheets:', err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Export to new Google Spreadsheet
  const handleCreateNewSheet = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Sesi Google berakhir. Silakan masuk kembali dengan tombol Google.');
      }

      const res = await createDaiSpreadsheet(token, exportTitle, daiList);
      setLastExport(res);
      setStatusMessage({ 
        type: 'success', 
        text: `Berhasil membuat spreadsheet baru "${res.title}" dengan ${res.rowCount} baris da'i di Google Drive Anda!` 
      });
      handleLoadDriveSpreadsheets();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal mengekspor ke Google Sheets.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Read preview from Google Sheet
  const handlePreviewSheet = async (targetIdOrUrl?: string) => {
    const raw = targetIdOrUrl || inputSheetUrl;
    if (!raw.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan masukkan tautan atau ID Google Spreadsheet terlebih dahulu.' });
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage(null);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Sesi Google berakhir. Silakan masuk kembali dengan tombol Google.');
      }

      const result = await readDaiFromSpreadsheet(token, raw);
      if (result.totalRows === 0) {
        setStatusMessage({ type: 'error', text: `Lembar "${result.sheetTitle}" kosong atau tidak memiliki data baris.` });
        setPreviewImport(null);
      } else {
        setPreviewImport(result);
        setStatusMessage({ 
          type: 'success', 
          text: `Ditemukan ${result.totalRows} data da'i dari lembar "${result.sheetTitle}". Periksa pratinjau sebelum menyimpan.` 
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal membaca spreadsheet. Pastikan tautan benar dan dapat diakses.' });
      setPreviewImport(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm import into application
  const handleConfirmImport = () => {
    if (!previewImport || previewImport.data.length === 0) return;
    onImportDai(previewImport.data, replaceMode);
    setStatusMessage({
      type: 'success',
      text: `Berhasil mengimpor ${previewImport.data.length} data da'i dari Google Sheets ke dalam sistem!`,
    });
    setPreviewImport(null);
  };

  // Overwrite existing spreadsheet (Destructive - requires mandatory confirmation dialog)
  const handleExecuteOverwrite = async () => {
    try {
      setIsLoading(true);
      setConfirmOverwriteOpen(false);
      setStatusMessage(null);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Sesi Google berakhir. Silakan masuk kembali dengan tombol Google.');
      }

      const res = await overwriteSpreadsheetData(token, syncTargetUrl, daiList);
      setStatusMessage({
        type: 'success',
        text: `Berhasil memperbarui spreadsheet Google dengan ${res.updatedRows} data da'i terkini!`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal menyinkronkan data ke Google Sheets.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl my-6 overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-950/90">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>INTEGRASI GOOGLE SHEETS &amp; DRIVE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Integrasi Google Sheets SIDAU Nusantara</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ekspor langsung, impor otomatis, dan sinkronisasi database da'i dengan Google Spreadsheet resmi.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Banner */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold uppercase overflow-hidden">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  (currentUser.displayName?.[0] || currentUser.email?.[0] || 'U')
                )}
              </div>
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>{currentUser.displayName || 'Akun Google Terhubung'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                    Google Connected
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Masuk dengan Google Workspace untuk mengizinkan pembuatan &amp; pembacaan Google Sheets.</span>
            </div>
          )}

          <div>
            {currentUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Ganti / Putus Akun</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold transition-all shadow-md text-xs border border-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Masuk dengan Google (Sign in)</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('export')}
              className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'export'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Spreadsheet Baru</span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'import'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Impor dari Google Sheets</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'sync'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perbarui Spreadsheet Ada</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {daiList.length} DA'I TERSEDIA
          </div>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200' 
              : 'bg-red-950/70 border-red-800 text-red-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{statusMessage.text}</div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: EXPORT TO NEW GOOGLE SHEET */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-white">
                  Judul Berkas Google Spreadsheet yang Akan Dibuat:
                </label>
                <input
                  type="text"
                  value={exportTitle}
                  onChange={(e) => setExportTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Sistem akan membuat Google Spreadsheet resmi di Google Drive Anda dengan judul di atas, memuat seluruh {daiList.length} data da'i nasional, lengkap dengan header navy elegan, pemisah kolom, serta pembekuan baris judul (frozen header).
                </p>
              </div>

              {lastExport && (
                <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>Spreadsheet Berhasil Dibuat!</span>
                    </span>
                    <a
                      href={lastExport.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      <span>Buka di Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    URL: <span className="text-emerald-400 break-all">{lastExport.spreadsheetUrl}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  disabled={isLoading || !currentUser}
                  onClick={handleCreateNewSheet}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-950/50 border border-emerald-500"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    {isLoading ? 'Sedang Memproses Google Sheets...' : `Buat Spreadsheet Baru (${daiList.length} Da'i)`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT FROM GOOGLE SHEETS */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              {/* Option A: Pick from recent Drive files */}
              {driveSheets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-blue-400" />
                      <span>Pilih Berkas Spreadsheet Terbaru dari Google Drive Anda:</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleLoadDriveSpreadsheets}
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                      <span>Segarkan Berkas</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    {driveSheets.map((sheet) => (
                      <button
                        key={sheet.id}
                        type="button"
                        onClick={() => {
                          setInputSheetUrl(`https://docs.google.com/spreadsheets/d/${sheet.id}/edit`);
                          handlePreviewSheet(sheet.id);
                        }}
                        className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-emerald-500/50 text-left transition-all flex items-start gap-2.5 group"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="overflow-hidden">
                          <div className="font-semibold text-white text-xs truncate group-hover:text-emerald-300">
                            {sheet.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {sheet.id.slice(0, 16)}...
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Option B: Enter Sheet URL or ID */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-white">
                  Atau Tempelkan Tautan (URL) / ID Google Spreadsheet:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                    value={inputSheetUrl}
                    onChange={(e) => setInputSheetUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={isLoading || !currentUser || !inputSheetUrl.trim()}
                    onClick={() => handlePreviewSheet()}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    Muat &amp; Pratinjau
                  </button>
                </div>
              </div>

              {/* Preview table before importing */}
              {previewImport && (
                <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 text-xs">
                      Pratinjau {previewImport.totalRows} Baris dari Lembar "{previewImport.sheetTitle}":
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Menampilkan 5 baris pertama
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 text-[10px] font-mono uppercase">
                          <th className="p-2">Nama Da'i</th>
                          <th className="p-2">Tempat Pengutusan</th>
                          <th className="p-2">Asal Daerah</th>
                          <th className="p-2">Provinsi Diutus</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {previewImport.data.slice(0, 5).map((d, i) => (
                          <tr key={i} className="hover:bg-slate-900/50">
                            <td className="p-2 font-semibold text-white">{d.nama}</td>
                            <td className="p-2">{d.titikDakwah}</td>
                            <td className="p-2 text-emerald-300">{d.asalDaerah || d.asalLembaga}</td>
                            <td className="p-2 font-medium text-blue-400">{d.provinsi}</td>
                            <td className="p-2">{d.statusTugas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={replaceMode}
                        onChange={(e) => setReplaceMode(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Gantikan seluruh data saat ini (Replace All) dengan data Google Sheets ini</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
                    >
                      Konfirmasi Simpan {previewImport.totalRows} Da'i ke Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYNC / OVERWRITE EXISTING SHEET (WITH MANDATORY USER CONFIRMATION) */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-white">
                  Tautan atau ID Google Spreadsheet yang Akan Diperbarui:
                </label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  value={syncTargetUrl}
                  onChange={(e) => setSyncTargetUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Fitur ini akan memperbarui isi spreadsheet yang Anda tentukan di atas dengan {daiList.length} data da'i terkini di aplikasi SIDAU Nusantara.
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  disabled={isLoading || !currentUser || !syncTargetUrl.trim()}
                  onClick={() => setConfirmOverwriteOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg border border-amber-500"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sinkronkan &amp; Timpa Data Spreadsheet</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Didukung Google Sheets API v4 &amp; Google Drive v3</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* MANDATORY USER CONFIRMATION DIALOG FOR DATA OVERWRITE */}
      {confirmOverwriteOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-600/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Konfirmasi Pembaruan Spreadsheet</h3>
                <p className="text-xs text-amber-300/90 font-medium">Operasi ini akan mengubah data di Google Sheets</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menimpa baris data pada Google Spreadsheet yang dituju dengan <strong>{daiList.length} data da'i terbaru</strong> dari SIDAU Nusantara?
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
              Target: {syncTargetUrl}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOverwriteOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleExecuteOverwrite}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-900/40 border border-amber-500"
              >
                {isLoading ? 'Sedang Menyimpan...' : 'Ya, Perbarui Spreadsheet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
