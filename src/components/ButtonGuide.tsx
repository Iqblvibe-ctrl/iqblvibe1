import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Wallet, 
  TrendingUp, 
  Database, 
  FileText, 
  Check, 
  HelpCircle, 
  Lightbulb, 
  Plus, 
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';
import { TombolConfig } from '../types/dai';

interface ButtonGuideProps {
  tombolConfig: TombolConfig;
  onUpdateTombolConfig: (config: TombolConfig) => void;
  onNavigateToTab: (tab: 'tren' | 'database' | 'dana' | 'panduan') => void;
}

const STORAGE_KEY_CUSTOM_BUTTONS = 'simdai_custom_buttons_wishlist_v1';

export const ButtonGuide: React.FC<ButtonGuideProps> = ({
  tombolConfig,
  onUpdateTombolConfig,
  onNavigateToTab,
}) => {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_BUTTONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      'Tombol Kirim Laporan via WhatsApp langsung ke Da\'i di pedalaman',
      'Tombol Cetak Surat Tugas Resmi Penempatan Da\'i',
      'Tombol Integrasi Laporan Donatur Zakat Otomatis',
    ];
  });

  const [newButtonIdea, setNewButtonIdea] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_BUTTONS, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const handleToggle = (key: keyof TombolConfig) => {
    onUpdateTombolConfig({
      ...tombolConfig,
      [key]: !tombolConfig[key],
    });
  };

  const handleApplyPreset = (mode: 'sederhana' | 'lengkap') => {
    if (mode === 'sederhana') {
      onUpdateTombolConfig({
        tampilkanAksiCepatDana: true,
        tampilkanAksiUpdateTren: false,
        tampilkanTombolCetak: false,
        tampilkanTombolEkspor: true,
        tampilkanFilterKategori: false,
        modeTampilanKompak: true,
      });
    } else {
      onUpdateTombolConfig({
        tampilkanAksiCepatDana: true,
        tampilkanAksiUpdateTren: true,
        tampilkanTombolCetak: true,
        tampilkanTombolEkspor: true,
        tampilkanFilterKategori: true,
        modeTampilanKompak: false,
      });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newButtonIdea.trim()) return;
    setWishlist([...wishlist, newButtonIdea.trim()]);
    setNewButtonIdea('');
  };

  const handleRemoveWishlist = (index: number) => {
    setWishlist(wishlist.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Intro Header */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span>Panduan &amp; Tata Kelola Tombol</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal">Kustomisasi Antarmuka Sederhana</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
            Daftar &amp; Penataan Tombol yang Anda Perlukan
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Halaman ini dirancang khusus untuk memandu Anda memahami fungsi setiap tombol aksi, memilih tombol apa saja yang ingin ditampilkan agar tampilan tetap sederhana, serta mencatat tombol-tombol yang ingin Anda tambahkan kemudian.
          </p>
        </div>
      </section>

      {/* Preset Switcher: Mode Sederhana vs Mode Lengkap */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pilihan Mode Antarmuka
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih mode tampilan sesuai tingkat kebutuhan kemudahan Anda saat ini
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyPreset('sederhana')}
              className="px-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
            >
              Set ke Mode Sederhana (Minimalis)
            </button>
            <button
              onClick={() => handleApplyPreset('lengkap')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
            >
              Set ke Mode Lengkap (Semua Tombol)
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan tombol berhasil diterapkan ke halaman Database dan Penataan Dana.</span>
          </div>
        )}
      </section>

      {/* Checklist: Toggle Tombol yang Aktif di Tabel */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Aktifkan / Sembunyikan Tombol di Tabel Utama
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centang untuk menampilkan atau sembunyikan tombol agar tabel data tetap bersih dan mudah dibaca
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Toggle 1: Tombol Dana Cepat */}
          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50/70 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={tombolConfig.tampilkanAksiCepatDana}
              onChange={() => handleToggle('tampilkanAksiCepatDana')}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-600" />
                Tombol Cepat Alokasi Dana ($) di Baris Tabel
              </span>
              <p className="text-[11px] text-slate-500">
                Memudahkan Anda mengubah nominal kafalah atau menandai pencairan langsung dari tabel tanpa berpindah halaman.
              </p>
            </div>
          </label>

          {/* Toggle 2: Tombol Update Tren */}
          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50/70 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={tombolConfig.tampilkanAksiUpdateTren}
              onChange={() => handleToggle('tampilkanAksiUpdateTren')}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Tombol Update Perkembangan Tren di Baris Tabel
              </span>
              <p className="text-[11px] text-slate-500">
                Memunculkan tombol untuk memperbarui jumlah jamaah binaan, santri mengaji, dan catatan kendala medan.
              </p>
            </div>
          </label>

          {/* Toggle 3: Tombol Ekspor CSV */}
          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50/70 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={tombolConfig.tampilkanTombolEkspor}
              onChange={() => handleToggle('tampilkanTombolEkspor')}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                Tombol Ekspor CSV
              </span>
              <p className="text-[11px] text-slate-500">
                Mengunduh data tabel lengkap ke format spreadsheet Excel/CSV untuk arsip yayasan.
              </p>
            </div>
          </label>

          {/* Toggle 4: Tombol Cetak / Print */}
          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50/70 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={tombolConfig.tampilkanTombolCetak}
              onChange={() => handleToggle('tampilkanTombolCetak')}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                Tombol Cetak / Print Dokumen
              </span>
              <p className="text-[11px] text-slate-500">
                Mencetak tampilan laporan da'i ke kertas atau PDF untuk rapat koordinasi pimpinan.
              </p>
            </div>
          </label>

          {/* Toggle 5: Filter Kategori Wilayah */}
          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50/70 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={tombolConfig.tampilkanFilterKategori}
              onChange={() => handleToggle('tampilkanFilterKategori')}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                Dropdown Filter Kategori Wilayah (3T, Pedalaman, Pesisir)
              </span>
              <p className="text-[11px] text-slate-500">
                Menyediakan filter tambahan kategori medan penugasan di bilah pencarian.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Guide: Penjelasan Rinci 4 Kategori Tombol yang Tersedia */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Penjelasan Lengkap Kategori Tombol yang Disediakan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Berikut penjelasan detail fungsi tombol dan tempat penggunaannya di dalam aplikasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Group 1: Dana */}
          <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Wallet className="w-4 h-4 text-amber-700" />
              <span>1. Kelompok Tombol Penataan Dana</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li>
                <strong className="text-slate-800">[+ Tambah Da'i]</strong>: Menginput nominal awal kafalah pokok, biaya transportasi medan, dan kebutuhan sarana dakwah.
              </li>
              <li>
                <strong className="text-slate-800">[Atur Dana ($)]</strong>: Membuka modal rincian dana untuk mengubah alokasi honor da'i, sewa perahu sungai, serta mencatat rekening bank.
              </li>
              <li>
                <strong className="text-slate-800">[Cairkan Penuh]</strong>: 1-klik untuk menandai bahwa dana operasional bulan berjalan telah disalurkan 100% lunas.
              </li>
              <li>
                <strong className="text-slate-800">[Isi Nominal]</strong>: Mencatat pencairan sebagian jika transfer dilakukan bertahap.
              </li>
            </ul>
          </div>

          {/* Group 2: Tren & Laporan */}
          <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              <span>2. Kelompok Tombol Laporan &amp; Tren</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li>
                <strong className="text-slate-800">[Update Progres]</strong>: Memperbarui jumlah jamaah terkini, santri mengaji yang bertambah, dan mualaf yang dibina.
              </li>
              <li>
                <strong className="text-slate-800">[Detail Profil (Eye)]</strong>: Menampilkan kurva pertumbuhan jamaah dan riwayat laporan bulanan da'i.
              </li>
              <li>
                <strong className="text-slate-800">[Catat Kendala]</strong>: Mendokumentasikan kondisi darurat seperti gelombang laut, jalur darat longsor, atau ketiadaan listrik.
              </li>
            </ul>
          </div>

          {/* Group 3: Navigasi & Filter */}
          <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>3. Kelompok Tombol Database &amp; Navigasi</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li>
                <strong className="text-slate-800">[Filter Pulau]</strong>: Menyaring da'i per wilayah (Sumatera, Kalimantan, Sulawesi, Maluku, Papua, Nusa Tenggara, Jawa).
              </li>
              <li>
                <strong className="text-slate-800">[Filter Status Dana]</strong>: Menemukan titik dakwah mana saja yang masih kekurangan dana atau butuh donatur.
              </li>
              <li>
                <strong className="text-slate-800">[Tabel vs Kartu]</strong>: Tombol beralih antara tampilan spreadsheet baris rapat atau kotak kartu visual.
              </li>
              <li>
                <strong className="text-slate-800">[Reset Filter]</strong>: 1-klik untuk mengembalikan semua filter ke posisi awal.
              </li>
            </ul>
          </div>

          {/* Group 4: Administrasi */}
          <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>4. Kelompok Tombol Output &amp; Dokumen</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li>
                <strong className="text-slate-800">[Ekspor CSV]</strong>: Menghasilkan berkas data yang kompatibel dengan Microsoft Excel dan Google Sheets.
              </li>
              <li>
                <strong className="text-slate-800">[Cetak / Print]</strong>: Memformat laporan ke ukuran kertas A4 siap cetak untuk pimpinan atau donatur.
              </li>
              <li>
                <strong className="text-slate-800">[Edit Data &amp; Hapus]</strong>: Memperbarui kontak telepon, masa kontrak tugas, atau menghapus data da'i.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Wishlist / Catatan Tombol Masa Depan */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Catatan Ide Tombol yang Anda Inginkan Selanjutnya
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tuliskan tombol apa saja yang sekiranya Anda butuhkan berikutnya. Catatan tersimpan otomatis di peramban Anda.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddWishlist} className="flex gap-2">
          <input
            type="text"
            placeholder="Tulis ide tombol baru (contoh: Tombol Cetak Kartu Da'i, Tombol Kirim SMS)..."
            value={newButtonIdea}
            onChange={(e) => setNewButtonIdea(e.target.value)}
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan</span>
          </button>
        </form>

        {/* List of Wishlist Buttons */}
        <div className="space-y-2 pt-2">
          {wishlist.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Belum ada catatan ide tombol tambahan.</p>
          ) : (
            wishlist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{item}</span>
                </div>
                <button
                  onClick={() => handleRemoveWishlist(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Hapus ide ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
