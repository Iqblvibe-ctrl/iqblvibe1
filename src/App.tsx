import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Users, 
  Radio, 
  Wallet, 
  Printer, 
  Clock, 
  Compass, 
  Database,
  Building2,
  Activity,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  Cloud,
  CloudOff,
  RefreshCw,
  Lock,
  ShieldCheck,
  Eye,
  LogOut
} from 'lucide-react';
import { BerandaDashboard } from './components/BerandaDashboard';
import { AuthRoleModal, UserRole } from './components/AuthRoleModal';
import { NationalMap } from './components/NationalMap';
import { KpiMetrics } from './components/KpiMetrics';
import { CoordinationMethods } from './components/CoordinationMethods';
import { CoordinatorProfile } from './components/CoordinatorProfile';
import { DaiDatabaseView } from './components/DaiDatabaseView';
import { KorwilDatabaseView } from './components/KorwilDatabaseView';
import { BulkImportModal } from './components/BulkImportModal';
import { DaiModal } from './components/DaiModal';
import { DetailModal } from './components/DetailModal';
import { FundModal } from './components/FundModal';
import { ProgressModal } from './components/ProgressModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { User } from 'firebase/auth';
import { initAuth } from './services/googleAuth';
import { DaiUtusan, Korwil } from './types/dai';
import { 
  loadDaiListFromStorage, 
  saveDaiListToStorage, 
  INITIAL_DAI_LIST, 
  INITIAL_KORWIL_LIST 
} from './data/initialData';
import {
  subscribeToDaiList,
  subscribeToKorwilList,
  saveDaiToFirestore,
  deleteDaiFromFirestore,
  bulkSaveDaiToFirestore,
  saveKorwilToFirestore,
  bulkSaveKorwilToFirestore,
  fetchDaiListFromFirestore,
} from './services/firebaseDb';

const STORAGE_KEY_KORWIL = 'sidau_korwil_v1';
const STORAGE_KEY_ROLE = 'sidau_auth_role_v1';

export default function App() {
  // Role & Auth State ('tamu' | 'admin')
  const [authRole, setAuthRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved === 'admin' || saved === 'tamu') return saved;
    } catch {}
    return 'tamu';
  });

  // Modal selector role (muncul jika pengguna pertama kali berkunjung atau ketika diminta login)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(STORAGE_KEY_ROLE);
    } catch {
      return false;
    }
  });

  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);
  const [forceAdminLoginForm, setForceAdminLoginForm] = useState(false);

  const [activeMenu, setActiveMenu] = useState<'beranda' | 'database-dai' | 'database-korwil' | 'kpi' | 'metode'>('beranda');
  const [daiList, setDaiList] = useState<DaiUtusan[]>(() => loadDaiListFromStorage());
  const [korwilList, setKorwilList] = useState<Korwil[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_KORWIL);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_KORWIL_LIST;
  });

  // Handle Role Selection (Tamu vs Admin)
  const handleSelectRole = (role: UserRole) => {
    setAuthRole(role);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch {}
    setIsAuthModalOpen(false);
    setAuthModalNotice(null);
    setForceAdminLoginForm(false);

    if (role === 'admin') {
      showToast('Akses Administrator aktif! Akses penuh seluruh database terbuka.');
    } else {
      setActiveMenu('beranda');
      showToast('Akses Tamu aktif. Menampilkan Dashboard Rekapan.');
    }
  };

  const handleOpenAdminLogin = (notice?: string) => {
    setAuthModalNotice(notice || null);
    setForceAdminLoginForm(true);
    setIsAuthModalOpen(true);
  };

  const handleLogoutAdmin = () => {
    setAuthRole('tamu');
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, 'tamu');
    } catch {}
    setActiveMenu('beranda');
    showToast('Telah keluar dari mode Admin. Kembali ke akses Tamu.');
  };

  // Navigasi dengan proteksi hak akses
  const handleMenuClick = (menu: 'beranda' | 'database-dai' | 'database-korwil' | 'kpi' | 'metode') => {
    if (menu === 'beranda') {
      setActiveMenu('beranda');
      return;
    }

    if (authRole !== 'admin') {
      const menuLabel = 
        menu === 'database-dai' ? "Database Da'i" :
        menu === 'database-korwil' ? "Database Korwil" :
        menu === 'kpi' ? "Metrik Kinerja (KPI)" : "Metode Koordinasi";
      handleOpenAdminLogin(`Menu "${menuLabel}" khusus Administrator. Silakan login (username: admin, pass: admin123).`);
      return;
    }

    setActiveMenu(menu);
  };

  // Pastikan tamu hanya diizinkan di halaman beranda
  useEffect(() => {
    if (authRole === 'tamu' && activeMenu !== 'beranda') {
      setActiveMenu('beranda');
    }
  }, [authRole, activeMenu]);

  // Cloud Real-Time Sync status
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Manual Cloud Sync trigger
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const items = await fetchDaiListFromFirestore();
      if (items.length > 0) {
        setDaiList(items);
        saveDaiListToStorage(items);
        showToast(`Sinkronisasi berhasil! ${items.length} da'i termutakhir dari cloud.`);
      } else {
        showToast('Terhubung ke database cloud, siap digunakan.');
      }
      setIsCloudConnected(true);
    } catch (err: any) {
      console.error('Manual sync error:', err);
      showToast(`Gagal sinkronisasi: ${err.message || 'Periksa koneksi internet'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Modal states
  const [selectedDaiForDetail, setSelectedDaiForDetail] = useState<DaiUtusan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDai, setEditingDai] = useState<DaiUtusan | null>(null);
  const [fundModalDai, setFundModalDai] = useState<DaiUtusan | null>(null);
  const [progressModalDai, setProgressModalDai] = useState<DaiUtusan | null>(null);

  // Bulk Import state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportTarget, setBulkImportTarget] = useState<'dai' | 'korwil'>('dai');

  // Google Sheets state & Auth
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 1. Google Workspace Auth Listener
  useEffect(() => {
    const unsub = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // 2. Real-Time Cloud Firestore Multi-Device Listeners
  useEffect(() => {
    setIsSyncing(true);

    const unsubDai = subscribeToDaiList(
      (items) => {
        setDaiList(items);
        saveDaiListToStorage(items);
        setIsCloudConnected(true);
        setIsSyncing(false);
      },
      (err) => {
        console.warn('Real-time sync notice:', err);
        setIsSyncing(false);
      }
    );

    const unsubKorwil = subscribeToKorwilList(
      (items) => {
        setKorwilList(items);
        try {
          localStorage.setItem(STORAGE_KEY_KORWIL, JSON.stringify(items));
        } catch {}
        setIsCloudConnected(true);
      },
      (err) => {
        console.warn('Korwil sync notice:', err);
      }
    );

    return () => {
      unsubDai();
      unsubKorwil();
    };
  }, []);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync Korwil to storage fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KORWIL, JSON.stringify(korwilList));
    } catch (e) {
      console.error(e);
    }
  }, [korwilList]);

  // Handle Save (Add / Update) Da'i with automatic Cloud Sync
  const handleSaveDai = async (savedDai: DaiUtusan) => {
    const exists = daiList.some((d) => d.id === savedDai.id);
    let updated: DaiUtusan[];
    if (exists) {
      updated = daiList.map((d) => (d.id === savedDai.id ? savedDai : d));
    } else {
      updated = [savedDai, ...daiList];
    }
    setDaiList(updated);
    saveDaiListToStorage(updated);

    try {
      setIsSyncing(true);
      await saveDaiToFirestore(savedDai);
      showToast(
        exists
          ? `Data ${savedDai.nama} berhasil diperbarui & disinkronkan ke seluruh perangkat!`
          : `Da'i baru ${savedDai.nama} berhasil didaftarkan & tersinkronisasi ke seluruh perangkat!`
      );
    } catch (e: any) {
      console.error('Gagal menyimpan ke Firestore:', e);
      showToast(`Peringatan: Gagal sinkronisasi cloud (${e?.message || 'Periksa koneksi'}).`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Delete Da'i
  const handleDeleteDai = async (daiId: string, daiNama: string) => {
    const updated = daiList.filter((d) => d.id !== daiId);
    setDaiList(updated);
    saveDaiListToStorage(updated);
    setSelectedDaiForDetail(null);

    try {
      setIsSyncing(true);
      await deleteDaiFromFirestore(daiId);
      showToast(`Data ${daiNama} telah dihapus dari seluruh perangkat.`);
    } catch (e: any) {
      console.error('Gagal menghapus dari Firestore:', e);
      showToast(`Gagal menghapus di cloud: ${e?.message || 'Error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Bulk Import Handler for Da'i (supports 300+ entries) with Cloud Sync
  const handleBulkImportDai = async (newData: DaiUtusan[], replaceAll: boolean) => {
    let result: DaiUtusan[];
    if (replaceAll) {
      result = newData;
      showToast(`Menyinkronkan ${newData.length} data da'i baru ke seluruh perangkat...`);
    } else {
      const existingNames = new Set(daiList.map((d) => d.nama.toLowerCase().trim()));
      const filteredNew = newData.filter((d) => !existingNames.has(d.nama.toLowerCase().trim()));
      result = [...filteredNew, ...daiList];
      showToast(`Menyinkronkan ${filteredNew.length} da'i baru ke seluruh perangkat...`);
    }
    setDaiList(result);
    saveDaiListToStorage(result);

    try {
      setIsSyncing(true);
      await bulkSaveDaiToFirestore(result, replaceAll);
      showToast(`Database berhasil disinkronkan ke seluruh perangkat (${result.length} da'i).`);
    } catch (e) {
      console.error('Gagal sinkronisasi impor massal ke Firestore:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Bulk Import Handler for Korwil
  const handleBulkImportKorwil = async (newData: Korwil[], replaceAll: boolean) => {
    let result: Korwil[];
    if (replaceAll) {
      result = newData;
    } else {
      result = [...newData, ...korwilList];
    }
    setKorwilList(result);
    try {
      localStorage.setItem(STORAGE_KEY_KORWIL, JSON.stringify(result));
      setIsSyncing(true);
      await bulkSaveKorwilToFirestore(result);
      showToast(`Data Korwil (${result.length} wilayah) tersinkronisasi ke seluruh perangkat.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-blue-900 text-white text-xs rounded-xl shadow-2xl border border-blue-600 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-16">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-sm tracking-widest shadow-md border border-blue-500">
                SN
              </div>
              <button
                onClick={() => setActiveMenu('beranda')}
                className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-blue-400 transition-colors text-left"
              >
                SIDAU NUSANTARA
              </button>
            </div>

            {/* Zone 2: Navigation Links (5 Focused Menus) */}
            <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <button
                onClick={() => handleMenuClick('beranda')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeMenu === 'beranda'
                    ? 'bg-blue-900/80 text-white font-bold border border-blue-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Beranda (Dashboard Rekapan)
              </button>
              <button
                onClick={() => handleMenuClick('database-dai')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeMenu === 'database-dai'
                    ? 'bg-blue-900/80 text-white font-bold border border-blue-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={authRole !== 'admin' ? 'Khusus Akses Administrator' : undefined}
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Database Da'i ({daiList.length})</span>
                {authRole !== 'admin' && (
                  <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />
                )}
              </button>
              <button
                onClick={() => handleMenuClick('database-korwil')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeMenu === 'database-korwil'
                    ? 'bg-blue-900/80 text-white font-bold border border-blue-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={authRole !== 'admin' ? 'Khusus Akses Administrator' : undefined}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Database Korwil ({korwilList.length})</span>
                {authRole !== 'admin' && (
                  <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />
                )}
              </button>
              <button
                onClick={() => handleMenuClick('kpi')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeMenu === 'kpi'
                    ? 'bg-blue-900/80 text-white font-bold border border-blue-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={authRole !== 'admin' ? 'Khusus Akses Administrator' : undefined}
              >
                <span>Metrik Kinerja (KPI)</span>
                {authRole !== 'admin' && (
                  <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />
                )}
              </button>
              <button
                onClick={() => handleMenuClick('metode')}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeMenu === 'metode'
                    ? 'bg-blue-900/80 text-white font-bold border border-blue-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={authRole !== 'admin' ? 'Khusus Akses Administrator' : undefined}
              >
                <span>Metode Koordinasi</span>
                {authRole !== 'admin' && (
                  <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />
                )}
              </button>
            </nav>

            {/* Zone 3: Primary Action Button & Role Access Control */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Cloud Sync Status Indicator & Manual Refresh Button */}
              <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700/80 text-slate-300 shadow-xs transition cursor-pointer group"
                title="Status Sinkronisasi Multi-Perangkat. Klik untuk menyinkronkan data terbaru dari Cloud Firestore."
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                ) : isCloudConnected ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                ) : (
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="font-semibold text-[11px] text-slate-200 hidden xl:inline">
                  {isSyncing ? 'Sinkronisasi...' : isCloudConnected ? 'Cloud Realtime' : 'Hubungkan Cloud'}
                </span>
                <RefreshCw className="w-3 h-3 text-slate-400 group-hover:text-blue-300 group-hover:rotate-180 transition-transform" />
              </button>

              {/* ROLE BADGE & AUTH CONTROLS */}
              {authRole === 'admin' ? (
                <>
                  {/* Status Admin Aktif */}
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mode Admin</span>
                  </span>

                  {/* GOOGLE SHEETS BUTTON */}
                  <button
                    onClick={() => setIsGoogleSheetsOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors border border-emerald-500 shadow-sm whitespace-nowrap"
                    title="Buka Integrasi Google Sheets (Ekspor, Impor, & Sinkronisasi)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                    <span className="hidden sm:inline">Google Sheets</span>
                    {currentUser && (
                      <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block animate-pulse ml-0.5" title="Terhubung ke Google Workspace"></span>
                    )}
                  </button>

                  {/* IMPORT DATA BUTTON */}
                  <button
                    onClick={() => {
                      setBulkImportTarget(activeMenu === 'database-korwil' ? 'korwil' : 'dai');
                      setIsBulkImportOpen(true);
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors border border-blue-500 shadow-sm whitespace-nowrap"
                    title="Import data da'i dari file Excel atau CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Import Data</span>
                  </button>

                  {/* CETAK BUTTON */}
                  <button
                    onClick={() => window.print()}
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 shadow-sm whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cetak</span>
                  </button>

                  {/* + DA'I BARU BUTTON */}
                  <button
                    onClick={() => {
                      setEditingDai(null);
                      setIsAddModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap border border-blue-400/40"
                  >
                    <span>+ Da'i Baru</span>
                  </button>

                  {/* LOGOUT BUTTON */}
                  <button
                    onClick={handleLogoutAdmin}
                    className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-900/50"
                    title="Keluar dari sesi Administrator"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Status Mode Tamu */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span className="hidden sm:inline">Akses:</span>
                      <strong className="text-white">Tamu</strong>
                    </span>

                    {/* Tombol Login Admin */}
                    <button
                      onClick={() => handleOpenAdminLogin('Silakan login sebagai Administrator untuk mengelola seluruh database.')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 active:scale-95 rounded-lg transition-all shadow-md border border-blue-500 whitespace-nowrap cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Login Admin</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Tab Bar */}
          <div className="lg:hidden flex items-center gap-2 py-2.5 overflow-x-auto border-t border-slate-800/80 text-xs">
            <button
              onClick={() => handleMenuClick('beranda')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                activeMenu === 'beranda' ? 'bg-blue-800 text-white font-bold' : 'text-slate-300'
              }`}
            >
              Beranda (Dashboard)
            </button>
            <button
              onClick={() => handleMenuClick('database-dai')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1.5 ${
                activeMenu === 'database-dai' ? 'bg-blue-800 text-white font-bold' : 'text-slate-300'
              }`}
            >
              <span>Database Da'i ({daiList.length})</span>
              {authRole !== 'admin' && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </button>
            <button
              onClick={() => handleMenuClick('database-korwil')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1.5 ${
                activeMenu === 'database-korwil' ? 'bg-blue-800 text-white font-bold' : 'text-slate-300'
              }`}
            >
              <span>Database Korwil ({korwilList.length})</span>
              {authRole !== 'admin' && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </button>
            <button
              onClick={() => handleMenuClick('kpi')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1.5 ${
                activeMenu === 'kpi' ? 'bg-blue-800 text-white font-bold' : 'text-slate-300'
              }`}
            >
              <span>Metrik KPI</span>
              {authRole !== 'admin' && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </button>
            <button
              onClick={() => handleMenuClick('metode')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1.5 ${
                activeMenu === 'metode' ? 'bg-blue-800 text-white font-bold' : 'text-slate-300'
              }`}
            >
              <span>Metode Koordinasi</span>
              {authRole !== 'admin' && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 flex-1">
        {/* VIEW 1: BERANDA - DASHBOARD REKAPAN NASIONAL (7 POIN REKAPITULASI) */}
        {activeMenu === 'beranda' && (
          <div className="animate-fade-in">
            <BerandaDashboard
              daiList={daiList}
              onSelectDai={(dai) => setSelectedDaiForDetail(dai)}
              onNavigateToDatabase={() => handleMenuClick('database-dai')}
              isAdmin={authRole === 'admin'}
              onRequestAdminLogin={() => handleOpenAdminLogin('Login sebagai Administrator untuk mengakses seluruh database & fitur manajemen.')}
            />
          </div>
        )}

        {/* VIEW 2: MENU DATABASE DA'I */}
        {activeMenu === 'database-dai' && (
          <div className="animate-fade-in space-y-6">
            <DaiDatabaseView
              daiList={daiList}
              onSelectDai={(dai) => setSelectedDaiForDetail(dai)}
              onOpenAddModal={() => {
                setEditingDai(null);
                setIsAddModalOpen(true);
              }}
              onOpenBulkImport={() => {
                setBulkImportTarget('dai');
                setIsBulkImportOpen(true);
              }}
              onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
            />
          </div>
        )}

        {/* VIEW 3: MENU INFORMASI DATABASE KORWIL */}
        {activeMenu === 'database-korwil' && (
          <div className="animate-fade-in space-y-6">
            <KorwilDatabaseView
              korwilList={korwilList}
              onOpenBulkImport={() => {
                setBulkImportTarget('korwil');
                setIsBulkImportOpen(true);
              }}
            />
          </div>
        )}

        {/* VIEW 4: METRIK KINERJA KPI */}
        {activeMenu === 'kpi' && (
          <div className="animate-fade-in space-y-8">
            <KpiMetrics />
            <div className="text-center pt-4">
              <button
                onClick={() => handleMenuClick('beranda')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                &larr; Kembali ke Beranda &amp; Peta Indonesia
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: METODE KOORDINASI */}
        {activeMenu === 'metode' && (
          <div className="animate-fade-in space-y-8">
            <CoordinationMethods />
            <div className="text-center pt-4">
              <button
                onClick={() => handleMenuClick('beranda')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                &larr; Kembali ke Beranda &amp; Peta Indonesia
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 mt-auto text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-blue-700 flex items-center justify-center text-white font-bold text-xs">
                SN
              </div>
              <span className="font-bold text-white text-sm tracking-tight">SIDAU NUSANTARA</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Direktori Da'i Utusan &amp; Informasi Korwil Nusantara</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <button onClick={() => handleMenuClick('beranda')} className="hover:text-blue-400 transition-colors">
                Beranda
              </button>
              <span>·</span>
              <button onClick={() => handleMenuClick('database-dai')} className="hover:text-blue-400 transition-colors">
                Database Da'i ({daiList.length})
              </button>
              <span>·</span>
              <button onClick={() => handleMenuClick('database-korwil')} className="hover:text-blue-400 transition-colors">
                Database Korwil ({korwilList.length})
              </button>
              <span>·</span>
              <button onClick={() => handleMenuClick('kpi')} className="hover:text-blue-400 transition-colors">
                KPI
              </button>
              <span>·</span>
              <button onClick={() => handleMenuClick('metode')} className="hover:text-blue-400 transition-colors">
                Metode
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
            <p>
              &copy; 2026 SIDAU Nusantara. Didedikasikan untuk perjuangan da'i utusan dan koordinator wilayah se-Indonesia.
            </p>
            <p className="text-slate-400 font-mono">
              STATUS: {daiList.length} DA'I TERDATA · {korwilList.length} KORWIL AKTIF
            </p>
          </div>
        </div>
      </footer>

      {/* BULK IMPORT MODAL (300+ Da'i & Korwil Ingestion) */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        targetType={bulkImportTarget}
        onImportDai={handleBulkImportDai}
        onImportKorwil={handleBulkImportKorwil}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
      />

      {/* Google Sheets Modal (Export, Import, & Sync) */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        daiList={daiList}
        onImportDai={(data, replace) => handleBulkImportDai(data, replace)}
        currentUser={currentUser}
        onAuthChange={(user) => setCurrentUser(user)}
      />

      {/* Detail Modal with Role Access Restrictions */}
      <DetailModal
        isOpen={Boolean(selectedDaiForDetail)}
        onClose={() => setSelectedDaiForDetail(null)}
        dai={selectedDaiForDetail}
        isAdmin={authRole === 'admin'}
        onOpenFundModal={(dai) => setFundModalDai(dai)}
        onOpenProgressModal={(dai) => setProgressModalDai(dai)}
        onOpenEditModal={(dai) => {
          setEditingDai(dai);
          setIsAddModalOpen(true);
        }}
        onDeleteDai={handleDeleteDai}
      />

      {/* Single Add Modal */}
      <DaiModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDai(null);
        }}
        onSave={handleSaveDai}
        editingDai={editingDai}
      />

      {/* Fund Modal */}
      <FundModal
        isOpen={Boolean(fundModalDai)}
        onClose={() => setFundModalDai(null)}
        dai={fundModalDai}
        onSave={async (daiId, updatedDana) => {
          const target = daiList.find((d) => d.id === daiId);
          if (target) {
            const updated = { ...target, dana: updatedDana };
            const nextList = daiList.map((d) => (d.id === daiId ? updated : d));
            setDaiList(nextList);
            saveDaiListToStorage(nextList);
            try {
              await saveDaiToFirestore(updated);
              showToast(`Alokasi dana ${target.nama} tersinkronisasi ke seluruh perangkat.`);
            } catch (e) {
              console.error(e);
            }
          }
          setFundModalDai(null);
        }}
      />

      {/* Progress Modal */}
      <ProgressModal
        isOpen={Boolean(progressModalDai)}
        onClose={() => setProgressModalDai(null)}
        dai={progressModalDai}
        onSave={async (daiId, updatedTren) => {
          const target = daiList.find((d) => d.id === daiId);
          if (target) {
            const updated = { ...target, tren: updatedTren };
            const nextList = daiList.map((d) => (d.id === daiId ? updated : d));
            setDaiList(nextList);
            saveDaiListToStorage(nextList);
            try {
              await saveDaiToFirestore(updated);
              showToast(`Progres dakwah ${target.nama} tersinkronisasi ke seluruh perangkat.`);
            } catch (e) {
              console.error(e);
            }
          }
          setProgressModalDai(null);
        }}
      />

      {/* Welcome / Role Selector & Admin Login Modal */}
      <AuthRoleModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={authRole}
        onSelectRole={handleSelectRole}
        forceLoginForm={forceAdminLoginForm}
        initialNotice={authModalNotice}
      />
    </div>
  );
}
