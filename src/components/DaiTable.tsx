import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  RotateCcw, 
  MapPin, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  DollarSign, 
  FileText, 
  LayoutList, 
  LayoutGrid,
  Plus,
  Eye
} from 'lucide-react';
import { DaiUtusan, FilterState, TombolConfig } from '../types/dai';
import { 
  DAFTAR_PULAU, 
  DAFTAR_KATEGORI, 
  DAFTAR_STATUS_TUGAS, 
  DAFTAR_STATUS_DANA,
  formatRupiah,
  formatRupiahSingkat,
  hitungPertumbuhan
} from '../data/initialData';

interface DaiTableProps {
  daiList: DaiUtusan[];
  tombolConfig: TombolConfig;
  onOpenAddModal: () => void;
  onOpenEditModal: (dai: DaiUtusan) => void;
  onOpenFundModal: (dai: DaiUtusan) => void;
  onOpenProgressModal: (dai: DaiUtusan) => void;
  onOpenDetailModal: (dai: DaiUtusan) => void;
  onDeleteDai: (id: string) => void;
}

export const DaiTable: React.FC<DaiTableProps> = ({
  daiList,
  tombolConfig,
  onOpenAddModal,
  onOpenEditModal,
  onOpenFundModal,
  onOpenProgressModal,
  onOpenDetailModal,
  onDeleteDai,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    pulau: 'Semua Pulau',
    kategori: 'Semua Kategori',
    statusTugas: 'Semua Status',
    statusDana: 'Semua Status Dana',
  });

  const [viewMode, setViewMode] = useState<'tabel' | 'kartu'>('tabel');

  // Filter logic
  const filteredList = useMemo(() => {
    return daiList.filter((dai) => {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        dai.nama.toLowerCase().includes(q) ||
        dai.titikDakwah.toLowerCase().includes(q) ||
        dai.kabupaten.toLowerCase().includes(q) ||
        dai.provinsi.toLowerCase().includes(q) ||
        (dai.asalDaerah ? dai.asalDaerah.toLowerCase().includes(q) : false) ||
        (dai.asalLembaga ? dai.asalLembaga.toLowerCase().includes(q) : false);

      const matchPulau = filters.pulau === 'Semua Pulau' || dai.pulau === filters.pulau;
      const matchKategori = filters.kategori === 'Semua Kategori' || dai.kategoriWilayah === filters.kategori;
      const matchTugas = filters.statusTugas === 'Semua Status' || dai.statusTugas === filters.statusTugas;
      const matchDana = filters.statusDana === 'Semua Status Dana' || dai.dana.statusPencairan === filters.statusDana;

      return matchSearch && matchPulau && matchKategori && matchTugas && matchDana;
    });
  }, [daiList, filters]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Nama Da\'i',
      'Lembaga',
      'Pulau',
      'Provinsi',
      'Kabupaten',
      'Titik Dakwah',
      'Kategori Wilayah',
      'Jamaah Awal',
      'Jamaah Kini',
      'Santri TPQ',
      'Mualaf',
      'Kafalah Bulanan',
      'Operasional Transport',
      'Total Kebutuhan/Bulan',
      'Dana Tersalurkan',
      'Status Pencairan',
      'Sumber Donatur',
    ];

    const rows = filteredList.map((d) => [
      d.id,
      `"${d.nama}${d.gelar ? ', ' + d.gelar : ''}"`,
      `"${d.asalLembaga}"`,
      `"${d.pulau}"`,
      `"${d.provinsi}"`,
      `"${d.kabupaten}"`,
      `"${d.titikDakwah}"`,
      `"${d.kategoriWilayah}"`,
      d.tren.jamaahAwal,
      d.tren.jamaahKini,
      d.tren.jumlahSantriTPQ,
      d.tren.jumlahMualaf,
      d.dana.honorKafalah,
      d.dana.operasionalTransport,
      d.dana.totalKebutuhanPerBulan,
      d.dana.danaTersalurkan,
      `"${d.dana.statusPencairan}"`,
      `"${d.dana.sumberDonatur}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_dai_utusan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      pulau: 'Semua Pulau',
      kategori: 'Semua Kategori',
      statusTugas: 'Semua Status',
      statusDana: 'Semua Status Dana',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls: Search & Action Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
        {/* Search & Top Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama da'i, pulau, kabupaten, atau titik dakwah..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('tabel')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'tabel' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kartu')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'kartu' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export & Print */}
            {tombolConfig.tampilkanTombolEkspor && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Ekspor CSV</span>
              </button>
            )}

            {tombolConfig.tampilkanTombolCetak && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Da'i Baru</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Pulau Wilayah</label>
            <select
              value={filters.pulau}
              onChange={(e) => setFilters({ ...filters, pulau: e.target.value })}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {DAFTAR_PULAU.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Status Dana</label>
            <select
              value={filters.statusDana}
              onChange={(e) => setFilters({ ...filters, statusDana: e.target.value })}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {DAFTAR_STATUS_DANA.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {tombolConfig.tampilkanFilterKategori && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Kategori Wilayah</label>
              <select
                value={filters.kategori}
                onChange={(e) => setFilters({ ...filters, kategori: e.target.value })}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
              >
                {DAFTAR_KATEGORI.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Status Penugasan</label>
            <select
              value={filters.statusTugas}
              onChange={(e) => setFilters({ ...filters, statusTugas: e.target.value })}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {DAFTAR_STATUS_TUGAS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Stats info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Menampilkan <strong className="text-slate-800 tabular-nums">{filteredList.length}</strong> dari{' '}
            <strong className="text-slate-800 tabular-nums">{daiList.length}</strong> Da'i Utusan
          </div>
          {(filters.searchQuery || filters.pulau !== 'Semua Pulau' || filters.statusDana !== 'Semua Status Dana' || filters.kategori !== 'Semua Kategori' || filters.statusTugas !== 'Semua Status') && (
            <span className="text-emerald-700 font-medium">Filter sedang aktif</span>
          )}
        </div>
      </div>

      {/* Main Content Area: Table View or Card View */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Tidak ada data da'i yang sesuai</h3>
            <p className="text-xs text-slate-500">
              Silakan sesuaikan kata kunci pencarian atau bersihkan filter di atas untuk melihat seluruh data da'i utusan.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua Filter</span>
          </button>
        </div>
      ) : viewMode === 'tabel' ? (
        /* High-Density Data Grid */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Da'i &amp; Lembaga</th>
                  <th className="py-3 px-3">Titik Penugasan</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-right">Tren Jamaah</th>
                  <th className="py-3 px-3 text-right">Santri TPQ</th>
                  <th className="py-3 px-3 text-right">Kebutuhan Dana</th>
                  <th className="py-3 px-3">Status Dana</th>
                  <th className="py-3 px-4 text-center">Tombol Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredList.map((dai) => {
                  const growth = hitungPertumbuhan(dai.tren.jamaahAwal, dai.tren.jamaahKini);
                  return (
                    <tr 
                      key={dai.id} 
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Name & Origin */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenDetailModal(dai)}
                            className="hover:text-emerald-700 transition-colors text-left font-bold"
                          >
                            {dai.nama}
                            {dai.gelar && <span className="font-normal text-slate-500 ml-1">({dai.gelar})</span>}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Asal Daerah: <span className="text-slate-700 font-medium">{dai.asalDaerah || dai.asalLembaga}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{dai.titikDakwah}</div>
                        <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1 mt-0.5">
                          <span>Prov. {dai.provinsi}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500">{dai.kabupaten}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="text-[11px] text-slate-600 font-medium block">
                          {dai.kategoriWilayah.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {dai.kategoriWilayah.includes('3T') ? '3T Terluar' : dai.kategoriWilayah.split('/')[0]}
                        </span>
                      </td>

                      {/* Jamaah Trend */}
                      <td className="py-3.5 px-3 text-right tabular-nums">
                        <div className="font-bold text-slate-900">
                          {dai.tren.jamaahKini}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          +{growth.delta} ({growth.persen > 0 ? `+${growth.persen}%` : `${growth.persen}%`})
                        </div>
                      </td>

                      {/* Santri TPQ */}
                      <td className="py-3.5 px-3 text-right tabular-nums">
                        <div className="font-medium text-slate-900">{dai.tren.jumlahSantriTPQ}</div>
                        <div className="text-[10px] text-blue-600">{dai.tren.jumlahMualaf} mualaf</div>
                      </td>

                      {/* Fund */}
                      <td className="py-3.5 px-3 text-right tabular-nums">
                        <div className="font-bold text-slate-900">
                          {formatRupiahSingkat(dai.dana.totalKebutuhanPerBulan)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Tersalur: {formatRupiahSingkat(dai.dana.danaTersalurkan)}
                        </div>
                      </td>

                      {/* Fund Status (Clean text, no garish badge) */}
                      <td className="py-3.5 px-3">
                        <div className={`text-xs font-semibold ${
                          dai.dana.statusPencairan === 'Tersalurkan Penuh'
                            ? 'text-emerald-700'
                            : dai.dana.statusPencairan === 'Tersalurkan Sebagian'
                            ? 'text-amber-700'
                            : dai.dana.statusPencairan === 'Menunggu Pencairan'
                            ? 'text-blue-700'
                            : 'text-rose-700'
                        }`}>
                          {dai.dana.statusPencairan}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {dai.dana.sumberDonatur}
                        </div>
                      </td>

                      {/* Action Buttons Toolbar */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 justify-center">
                          {/* Detail Button */}
                          <button
                            onClick={() => onOpenDetailModal(dai)}
                            className="p-1.5 rounded text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                            title="Lihat Detail Profil & Riwayat"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Fund Button */}
                          {tombolConfig.tampilkanAksiCepatDana && (
                            <button
                              onClick={() => onOpenFundModal(dai)}
                              className="p-1.5 rounded text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Atur Alokasi Dana & Pencairan"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Update Progress Button */}
                          {tombolConfig.tampilkanAksiUpdateTren && (
                            <button
                              onClick={() => onOpenProgressModal(dai)}
                              className="p-1.5 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Update Perkembangan Jamaah & Laporan Lapangan"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Dai Button */}
                          <button
                            onClick={() => onOpenEditModal(dai)}
                            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Data Da'i"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data ${dai.nama}? Tindakan ini tidak dapat dibatalkan.`)) {
                                onDeleteDai(dai.id);
                              }
                            }}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Da'i"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((dai) => {
            const growth = hitungPertumbuhan(dai.tren.jamaahAwal, dai.tren.jamaahKini);
            return (
              <div 
                key={dai.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:border-emerald-300 transition-colors shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 
                      onClick={() => onOpenDetailModal(dai)}
                      className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {dai.nama}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{dai.kabupaten}, {dai.pulau}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${
                    dai.statusTugas === 'Aktif' ? 'text-emerald-700' : 'text-slate-600'
                  }`}>
                    {dai.statusTugas}
                  </span>
                </div>

                {/* Sub details */}
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Titik Dakwah:</span>
                    <span className="font-medium text-slate-800 text-right truncate max-w-[170px]">{dai.titikDakwah}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kategori Wilayah:</span>
                    <span className="text-slate-700">{dai.kategoriWilayah.split('/')[0]}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Jamaah</span>
                    <span className="font-bold text-slate-900 tabular-nums">{dai.tren.jamaahKini}</span>
                    <span className="text-[10px] text-emerald-600 block">+{growth.delta}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Santri TPQ</span>
                    <span className="font-bold text-slate-900 tabular-nums">{dai.tren.jumlahSantriTPQ}</span>
                    <span className="text-[10px] text-blue-600 block">{dai.tren.jumlahMualaf} mualaf</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Dana/Bulan</span>
                    <span className="font-bold text-slate-900 tabular-nums">{formatRupiahSingkat(dai.dana.totalKebutuhanPerBulan)}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{dai.dana.statusPencairan.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Latest Field Update */}
                <div className="text-xs text-slate-600 line-clamp-2">
                  <span className="font-medium text-slate-700">Laporan: </span>
                  {dai.tren.catatanProgresTerbaru}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenDetailModal(dai)}
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>Buka Profil</span>
                    <span>&rarr;</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenFundModal(dai)}
                      className="px-2 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                      title="Atur Dana"
                    >
                      Dana
                    </button>
                    <button
                      onClick={() => onOpenProgressModal(dai)}
                      className="px-2 py-1 text-xs text-blue-800 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      title="Update Laporan"
                    >
                      Progres
                    </button>
                    <button
                      onClick={() => onOpenEditModal(dai)}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
