import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Eye, 
  Lock, 
  KeyRound, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  Database,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';

export type UserRole = 'tamu' | 'admin';

interface AuthRoleModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  // If true, shows direct login form without the two choices
  forceLoginForm?: boolean;
  initialNotice?: string | null;
}

export function AuthRoleModal({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  forceLoginForm = false,
  initialNotice = null,
}: AuthRoleModalProps) {
  const [activeTab, setActiveTab] = useState<'pilih' | 'login-admin'>(
    forceLoginForm ? 'login-admin' : 'pilih'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'admin' && cleanPass === 'admin123') {
      onSelectRole('admin');
      setUsername('');
      setPassword('');
      if (onClose) onClose();
    } else {
      setErrorMessage('Username atau password salah! (Gunakan username: admin & password: admin123)');
    }
  };

  const handleChooseTamu = () => {
    onSelectRole('tamu');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col relative text-slate-100">
        
        {/* Header Dialog */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-blue-950/50 to-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-600/60 text-blue-300 text-[11px] font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>SISTEM INFORMASI &amp; KOMANDO 3T</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pilihan Hak Akses Pengguna
            </h2>
            <p className="text-xs text-slate-400">
              Silakan pilih mode akses untuk menjelajahi portal SIDAU Nusantara.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Notice Banner jika dipicu oleh upaya akses fitur admin */}
        {initialNotice && (
          <div className="px-6 py-2.5 bg-amber-950/70 border-b border-amber-800/80 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{initialNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'pilih' && !forceLoginForm ? (
            <div className="space-y-4">
              {/* Opsi 1: TAMU (Hanya Dashboard Rekapan) */}
              <div 
                onClick={handleChooseTamu}
                className="group p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500 transition-all cursor-pointer space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                          Akses Khusus Tamu (Publik)
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                          Mode Tamu
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Eksklusif melihat dashboard rekapan nasional tanpa hak ubah data.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/70 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Dashboard Rekapan 7 Poin</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Peta Persebaran Provinsi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Capaian Binaan &amp; Karya Unggulan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Warta Berita Aktivitas Da'i</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleChooseTamu}
                    className="w-full py-2 bg-slate-900 hover:bg-blue-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <span>Lanjut sebagai Tamu (Hanya Dashboard)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Opsi 2: ADMINISTRATOR (Akses Penuh Database) */}
              <div 
                onClick={() => setActiveTab('login-admin')}
                className="group p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500 transition-all cursor-pointer space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                          Akses Khusus Administrator
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Akses Penuh
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Kelola seluruh database, tambah/edit/hapus da'i, dana &amp; progres.
                      </p>
                    </div>
                  </div>
                  <KeyRound className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/70 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Database Da'i &amp; Korwil</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Tambah, Edit, &amp; Hapus Data</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Atur Alokasi Dana &amp; Progres</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Import Massal &amp; Google Sheets</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('login-admin')}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-emerald-600 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Login Administrator (Masuk Akun)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* FORM LOGIN ADMIN */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Masukkan Kredensial Administrator</span>
                </div>
                {!forceLoginForm && (
                  <button
                    onClick={() => {
                      setActiveTab('pilih');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    &larr; Kembali ke Pilihan
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Username Admin</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan username (contoh: admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password Admin</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password admin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-mono"
                  />
                </div>

                {/* Info Card Kredensial */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kredensial Resmi Admin Sistem:</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300 font-mono text-xs pt-0.5">
                    <span>User: <strong className="text-emerald-400">admin</strong></span>
                    <span>·</span>
                    <span>Pass: <strong className="text-emerald-400">admin123</strong></span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  {!forceLoginForm && (
                    <button
                      type="button"
                      onClick={handleChooseTamu}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition"
                    >
                      Batal, Masuk sebagai Tamu
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs transition shadow-md flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk sebagai Admin</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
