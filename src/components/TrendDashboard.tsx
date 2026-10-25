import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  MapPin, 
  BookOpen, 
  AlertCircle, 
  ArrowUpRight,
  Compass,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DaiUtusan } from '../types/dai';
import { formatRupiah, formatRupiahSingkat, hitungPertumbuhan } from '../data/initialData';

interface TrendDashboardProps {
  daiList: DaiUtusan[];
  onSelectDai: (dai: DaiUtusan) => void;
  onNavigateToTab: (tab: 'tren' | 'database' | 'dana' | 'panduan') => void;
  onOpenAddModal: () => void;
}

export const TrendDashboard: React.FC<TrendDashboardProps> = ({
  daiList,
  onSelectDai,
  onNavigateToTab,
  onOpenAddModal,
}) => {
  // Aggregate stats
  const totalDai = daiList.length;
  const totalJamaahAwal = daiList.reduce((acc, d) => acc + d.tren.jamaahAwal, 0);
  const totalJamaahKini = daiList.reduce((acc, d) => acc + d.tren.jamaahKini, 0);
  const growthJamaah = hitungPertumbuhan(totalJamaahAwal, totalJamaahKini);

  const totalSantri = daiList.reduce((acc, d) => acc + d.tren.jumlahSantriTPQ, 0);
  const totalMualaf = daiList.reduce((acc, d) => acc + d.tren.jumlahMualaf, 0);

  const totalKebutuhanDana = daiList.reduce((acc, d) => acc + d.dana.totalKebutuhanPerBulan, 0);
  const totalDanaTersalurkan = daiList.reduce((acc, d) => acc + d.dana.danaTersalurkan, 0);
  const persentasePenyaluran = totalKebutuhanDana > 0 
    ? Math.round((totalDanaTersalurkan / totalKebutuhanDana) * 100) 
    : 0;

  // Breakdown by island
  const pulauCounts = daiList.reduce((acc, d) => {
    acc[d.pulau] = (acc[d.pulau] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pulauList = [
    { nama: 'Sumatera', count: pulauCounts['Sumatera'] || 0 },
    { nama: 'Kalimantan', count: pulauCounts['Kalimantan'] || 0 },
    { nama: 'Sulawesi', count: pulauCounts['Sulawesi'] || 0 },
    { nama: 'Papua', count: pulauCounts['Papua'] || 0 },
    { nama: 'Maluku', count: pulauCounts['Maluku'] || 0 },
    { nama: 'Bali & Nusa Tenggara', count: pulauCounts['Bali & Nusa Tenggara'] || 0 },
    { nama: 'Jawa', count: pulauCounts['Jawa'] || 0 },
  ];

  // Aggregated monthly trend (Mei, Jun, Jul, Agt)
  const monthlyTrendData = [
    { bulan: 'Mei 2026', jamaah: 333, santri: 212, dana: 48650000 },
    { bulan: 'Jun 2026', jamaah: 382, santri: 247, dana: 50400000 },
    { bulan: 'Jul 2026', jamaah: 432, santri: 283, dana: 45650000 },
    { bulan: 'Agt 2026', jamaah: totalJamaahKini, santri: totalSantri, dana: totalDanaTersalurkan },
  ];

  const maxMonthlyJamaah = Math.max(...monthlyTrendData.map((m) => m.jamaah), 500);

  // Status Dana Counts
  const lunasCount = daiList.filter((d) => d.dana.statusPencairan === 'Tersalurkan Penuh').length;
  const sebagianCount = daiList.filter((d) => d.dana.statusPencairan === 'Tersalurkan Sebagian').length;
  const pendingCount = daiList.filter((d) => d.dana.statusPencairan === 'Menunggu Pencairan').length;
  const butuhDonaturCount = daiList.filter((d) => d.dana.statusPencairan === 'Butuh Donatur').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Intro Banner */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>Sistem Monitoring Dakwah Nusantara</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Tahun Anggaran 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
              Database &amp; Laporan Tren Da'i Utusan Indonesia
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Memudahkan Anda menata alokasi dana operasional da'i, memantau perkembangan jumlah jamaah binaan, santri TPQ pedalaman, serta mengontrol tombol aksi yang Anda butuhkan.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToTab('dana')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <Wallet className="w-4 h-4 text-emerald-700" />
              <span>Kelola Alokasi Dana</span>
            </button>
            <button
              onClick={() => onNavigateToTab('database')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-300"
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span>Buka Database ({totalDai})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 KPI Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Da'i */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Da'i Utusan Aktif</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalDai}</span>
            <span className="text-xs text-slate-500">Da'i di 6 Kepulauan</span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Wilayah 3T &amp; Pedalaman</span>
            <span className="font-semibold text-slate-700 tabular-nums">100%</span>
          </div>
        </div>

        {/* KPI 2: Total Jamaah & Growth */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pertumbuhan Jamaah Binaan</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalJamaahKini}</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{growthJamaah.persen}%
            </span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Awal penugasan: <strong className="font-normal text-slate-700 tabular-nums">{totalJamaahAwal}</strong></span>
            <span className="text-emerald-700 font-medium tabular-nums">+{growthJamaah.delta} jamaah baru</span>
          </div>
        </div>

        {/* KPI 3: Santri TPQ & Muallaf */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Santri TPQ &amp; Muallaf</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalSantri}</span>
            <span className="text-xs text-slate-500">Santri Al-Qur'an</span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Muallaf Terbina</span>
            <span className="font-semibold text-blue-700 tabular-nums">{totalMualaf} Jiwa</span>
          </div>
        </div>

        {/* KPI 4: Kebutuhan Dana & Realisasi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Alokasi Dana Bulanan</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupiahSingkat(totalDanaTersalurkan)}
            </span>
            <span className="text-xs text-slate-500">
              dari {formatRupiahSingkat(totalKebutuhanDana)}
            </span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Realisasi Penyaluran</span>
            <span className={`font-semibold tabular-nums ${persentasePenyaluran >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {persentasePenyaluran}%
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Visual Trend Chart & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Growth Trend Visualization */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tren Perkembangan Jamaah &amp; Santri Al-Qur'an
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Grafik pertumbuhan jamaah terbina dan santri mengaji dalam 4 bulan terakhir
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block"></span>
                <span>Jamaah ({totalJamaahKini})</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
                <span>Santri TPQ ({totalSantri})</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 h-52 items-end pt-6 px-4 bg-slate-50 rounded-lg border border-slate-100">
              {monthlyTrendData.map((item, idx) => {
                const heightJamaahPct = Math.round((item.jamaah / maxMonthlyJamaah) * 100);
                const heightSantriPct = Math.round((item.santri / maxMonthlyJamaah) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end gap-2 w-full justify-center h-40">
                      {/* Jamaah Bar */}
                      <div className="flex flex-col items-center gap-1 w-8 sm:w-12">
                        <span className="text-[10px] font-semibold text-slate-600 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.jamaah}
                        </span>
                        <div
                          style={{ height: `${heightJamaahPct}%` }}
                          className="w-full bg-emerald-600 rounded-t transition-all duration-300 hover:bg-emerald-700"
                          title={`Jamaah: ${item.jamaah}`}
                        />
                      </div>

                      {/* Santri Bar */}
                      <div className="flex flex-col items-center gap-1 w-8 sm:w-12">
                        <span className="text-[10px] font-semibold text-blue-600 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.santri}
                        </span>
                        <div
                          style={{ height: `${heightSantriPct}%` }}
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          title={`Santri TPQ: ${item.santri}`}
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <span className="text-xs font-medium text-slate-700 block whitespace-nowrap">
                        {item.bulan}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 bg-emerald-50/60 border border-emerald-100 rounded-lg p-3 flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900 font-semibold">Analisis Tren Positif:</strong> Rata-rata penambahan jamaah sebesar{' '}
                <span className="font-semibold text-emerald-800">22% per bulan</span>. Efektivitas dakwah tertinggi tercatat di daerah kepulauan terluar (Morotai &amp; Lembata) di mana kegiatan kajian dipadukan dengan pembagian buku Iqra dan renovasi sarana air wudhu.
              </div>
            </div>
          </div>

          {/* Quick Status Dana Breakdown */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Kesiapan Dana Operasional Da'i Bulan Berjalan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-800 block">Tersalurkan Penuh</span>
                <span className="text-lg font-bold text-emerald-900 tabular-nums">{lunasCount}</span>
                <span className="text-[11px] text-emerald-700 block">Da'i aman operasional</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-xs text-amber-800 block">Tersalur Sebagian</span>
                <span className="text-lg font-bold text-amber-900 tabular-nums">{sebagianCount}</span>
                <span className="text-[11px] text-amber-700 block">Kekurangan biaya transport</span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-xs text-blue-800 block">Menunggu Pencairan</span>
                <span className="text-lg font-bold text-blue-900 tabular-nums">{pendingCount}</span>
                <span className="text-[11px] text-blue-700 block">Proses verifikasi bank</span>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-xs text-rose-800 block">Butuh Donatur</span>
                <span className="text-lg font-bold text-rose-900 tabular-nums">{butuhDonaturCount}</span>
                <span className="text-[11px] text-rose-700 block">Perlu orang tua asuh dakwah</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Sebaran Da'i per Pulau */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Sebaran Da'i di Indonesia
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi penugasan da'i utusan berdasarkan pulau
            </p>
          </div>

          <div className="space-y-3">
            {pulauList.map((item) => {
              const pct = totalDai > 0 ? Math.round((item.count / totalDai) * 100) : 0;
              return (
                <div key={item.nama} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.nama}</span>
                    <span className="text-slate-500 tabular-nums">
                      {item.count} Da'i ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.count > 0 ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(pct, item.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-700">
              Kategori Medan Penugasan
            </h3>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span>Pedalaman &amp; Suku Terasing</span>
                <span className="font-semibold text-slate-800 tabular-nums">3 Titik</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span>Pesisir &amp; Kepulauan Terluar</span>
                <span className="font-semibold text-slate-800 tabular-nums">2 Titik</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span>3T (Terdepan, Terluar, Tertinggal)</span>
                <span className="font-semibold text-slate-800 tabular-nums">2 Titik</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Perbatasan Antar Negara</span>
                <span className="font-semibold text-slate-800 tabular-nums">1 Titik</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab('panduan')}
              className="w-full text-center text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline py-2 bg-slate-50 rounded-lg border border-slate-200"
            >
              Lihat Penjelasan Tombol yang Diperlukan &rarr;
            </button>
          </div>
        </section>
      </div>

      {/* Field Reports & Highlights */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Catatan Lapangan &amp; Kendala Medan Terbaru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Laporan langsung kondisi dakwah, logistik perahu, dan sarana ibadah dari da'i bertugas
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('database')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Lihat Semua Da'i &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daiList.slice(0, 4).map((dai) => (
            <div
              key={dai.id}
              onClick={() => onSelectDai(dai)}
              className="p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50 transition-colors cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                    {dai.nama}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dai.kabupaten}, {dai.provinsi}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-700 tabular-nums">
                    {dai.tren.jamaahKini} Jamaah
                  </span>
                  <span className="text-[11px] text-emerald-600 block tabular-nums">
                    +{dai.tren.jamaahKini - dai.tren.jamaahAwal} baru
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 line-clamp-2">
                <strong className="text-slate-800">Progres:</strong> {dai.tren.catatanProgresTerbaru}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="text-amber-800 flex items-center gap-1 truncate max-w-[240px]">
                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{dai.tren.kendalaLapangan}</span>
                </span>
                <span className="text-slate-400 shrink-0">Klik rincian &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
