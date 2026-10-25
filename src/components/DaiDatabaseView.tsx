import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Building, 
  Filter, 
  Download, 
  Printer, 
  RotateCcw, 
  Users, 
  Eye, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { DaiUtusan } from '../types/dai';

interface DaiDatabaseViewProps {
  daiList: DaiUtusan[];
  onSelectDai: (dai: DaiUtusan) => void;
  onOpenAddModal: () => void;
  onOpenBulkImport: () => void;
  onOpenGoogleSheets?: () => void;
}

export const DaiDatabaseView: React.FC<DaiDatabaseViewProps> = ({
  daiList,
  onSelectDai,
  onOpenAddModal,
  onOpenBulkImport,
  onOpenGoogleSheets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinsi, setSelectedProvinsi] = useState('Semua Provinsi');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');

  // Pagination states for 300+ Da'i
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Extract unique provinces
  const provinceList = useMemo(() => {
    const set = new Set<string>();
    daiList.forEach((d) => {
      if (d.provinsi) set.add(d.provinsi);
    });
    return ['Semua Provinsi', ...Array.from(set).sort()];
  }, [daiList]);

  // Filtered Da'i List
  const filteredList = useMemo(() => {
    return daiList.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.nama.toLowerCase().includes(q) ||
        d.titikDakwah.toLowerCase().includes(q) ||
        d.kabupaten.toLowerCase().includes(q) ||
        d.provinsi.toLowerCase().includes(q) ||
        (d.asalDaerah && d.asalDaerah.toLowerCase().includes(q)) ||
        (d.asalLembaga && d.asalLembaga.toLowerCase().includes(q));

      const matchProvinsi =
        selectedProvinsi === 'Semua Provinsi' || d.provinsi === selectedProvinsi;

      const matchStatus =
        selectedStatus === 'Semua Status' || d.statusTugas === selectedStatus;

      return matchSearch && matchProvinsi && matchStatus;
    });
  }, [daiList, searchQuery, selectedProvinsi, selectedStatus]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProvinsi, selectedStatus, pageSize]);

  // Pagination slice
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Da\'i Utusan',
      'Tempat Pengutusan (Termasuk Nama Provinsi)',
      'Asal Daerah (Kota/Provinsi Asal)',
      'Provinsi Pengutusan (Tempat Diutus)',
      'Pulau',
      'Status Tugas',
      'Kontak Telepon',
    ];

    const rows = filteredList.map((d, i) => {
      const tempatLengkap = d.titikDakwah.includes(d.provinsi)
        ? d.titikDakwah
        : `${d.titikDakwah}, ${d.kabupaten}, Prov. ${d.provinsi}`;

      return [
        i + 1,
        `"${d.nama}${d.gelar ? ', ' + d.gelar : ''}"`,
        `"${tempatLengkap}"`,
        `"${d.asalDaerah || d.asalLembaga || '-'}"`,
        `"${d.provinsi}"`,
        `"${d.pulau}"`,
        `"${d.statusTugas}"`,
        `"${d.telepon || '-'}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `database_dai_utusan_nasional_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Framed Command Center & Quick-Action Hub */}
      <div className="relative rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-950/40 p-5 sm:p-7 text-white space-y-5 shadow-2xl backdrop-blur-md ring-1 ring-white/10">
        {/* Row 1: Header Brand & Total Counter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/90">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/90 border border-blue-700/80 text-blue-300 text-xs font-semibold shadow-xs">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>DIREKTORI RESMI DA'I UTUSAN NASIONAL</span>
              <span className="text-blue-500">·</span>
              <span className="text-emerald-400 font-mono">{filteredList.length} dari {daiList.length} Da'i</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-tight">
              Database Da'i Utusan Indonesia
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Pusat kendali dan pengelolaan database nama da'i, alumni instansi, tempat pengutusan/titik dakwah, serta kategori wilayah di seluruh nusantara.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <div className="px-3 py-1.5 text-center border-r border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">Total</span>
              <span className="text-base font-black text-white font-mono">{daiList.length}</span>
            </div>
            <div className="px-3 py-1.5 text-center border-r border-slate-800">
              <span className="text-[10px] text-emerald-400 font-semibold block">Aktif</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {daiList.filter((d) => d.statusTugas === 'Aktif').length}
              </span>
            </div>
            <div className="px-3 py-1.5 text-center">
              <span className="text-[10px] text-sky-400 font-semibold block">Provinsi</span>
              <span className="text-base font-black text-sky-400 font-mono">{provinceList.length - 1}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Ergonomic Action Buttons (Mudah Dijangkau & Tidak Perlu Menggeser Jauh) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Menu Aksi Cepat Database:</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Semua aksi dapat diakses langsung</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. Tambah Da'i Baru (Primary Highlight) */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-blue-900/30 border border-blue-400/50 cursor-pointer active:scale-95"
            >
              <Users className="w-4 h-4 text-white shrink-0" />
              <span>+ Da'i Baru</span>
            </button>

            {/* 2. Import Data (Requirement: Ubah dari "Import Massal (300+ Sekaligus)" menjadi "Import Data") */}
            <button
              onClick={onOpenBulkImport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all border border-blue-500/40 hover:border-blue-400 shadow-md cursor-pointer group"
              title="Import data da'i dari file Excel atau CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400 group-hover:text-blue-300 shrink-0" />
              <span>Import Data</span>
            </button>

            {/* 3. Google Sheets */}
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-900/60 hover:bg-emerald-800/80 active:scale-95 rounded-xl transition-all border border-emerald-600/60 hover:border-emerald-500 shadow-md cursor-pointer group"
                title="Buka integrasi Google Sheets (Sinkronisasi, Impor & Ekspor)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 shrink-0" />
                <span>Google Sheets</span>
              </button>
            )}

            {/* 4. Ekspor CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 active:scale-95 rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow-sm cursor-pointer"
              title="Download database saat ini dalam format CSV"
            >
              <Download className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Ekspor CSV</span>
            </button>

            {/* 5. Cetak Dokumen */}
            <button
              onClick={() => window.print()}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 active:scale-95 rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow-sm cursor-pointer"
              title="Cetak direktori da'i utusan"
            >
              <Printer className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* Row 3: Quick Status Filter Chips & Filter Row */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          {/* Quick status tabs for instant 1-click filtering */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Status:</span>
              {['Semua Status', 'Aktif', 'Persiapan', 'Cuti / Istirahat', 'Selesai'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    selectedStatus === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 font-mono shrink-0">
              {filteredList.length} da'i ditemukan
            </div>
          </div>

          {/* Search & Select dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Search Input (7 cols) */}
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama da'i, alumni instansi, titik dakwah, atau provinsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Filter Provinsi (4 cols) */}
            <div className="sm:col-span-4">
              <select
                value={selectedProvinsi}
                onChange={(e) => setSelectedProvinsi(e.target.value)}
                className="w-full py-2.5 px-3 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
              >
                {provinceList.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {/* Reset Button (1 col) */}
            <div className="sm:col-span-1">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvinsi('Semua Provinsi');
                  setSelectedStatus('Semua Status');
                }}
                className="w-full h-full min-h-[38px] py-2 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                title="Reset Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Counter Badge & Page Size Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 pt-1 font-mono">
          <div>
            TOTAL TERDATA: <strong className="text-white font-bold">{daiList.length} DA'I UTUSAN</strong>
            {selectedProvinsi !== 'Semua Provinsi' && (
              <span className="text-blue-400 ml-2">({filteredList.length} di {selectedProvinsi})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main High-Density Table with Pagination */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Da'i Utusan</th>
                <th className="py-3.5 px-4">Tempat Pengutusan (Termasuk Provinsi)</th>
                <th className="py-3.5 px-4">Asal Daerah</th>
                <th className="py-3.5 px-4">Provinsi Pengutusan (Tempat Diutus)</th>
                <th className="py-3.5 px-3">Status Tugas</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data da'i yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedList.map((dai) => (
                  <tr
                    key={dai.id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* 1. Nama Seluruh Da'i Utusan */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectDai(dai)}
                          className="hover:underline text-left font-bold text-sm text-white"
                        >
                          {dai.nama}
                        </button>
                        {dai.gelar && (
                          <span className="font-normal text-slate-400 text-xs">
                            ({dai.gelar})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        ID: {dai.id} · Kontak: {dai.telepon || '-'}
                      </div>
                    </td>

                    {/* 2. Tempat Pengutusan (Termasuk Provinsi) */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{dai.titikDakwah}</span>
                      </div>
                      <div className="text-[11px] text-blue-300 font-medium mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-400 font-normal">Provinsi:</span>
                        <span className="bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800 text-blue-300 font-mono text-[10px]">
                          {dai.provinsi}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Kabupaten: <strong className="text-slate-300 font-normal">{dai.kabupaten}</strong>
                        {dai.kecamatan && <span> ({dai.kecamatan})</span>}
                      </div>
                      <span className="inline-block text-[10px] text-slate-500 font-mono mt-0.5">
                        {dai.kategoriWilayah}
                      </span>
                    </td>

                    {/* 3. Asal Daerah */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-100 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{dai.asalDaerah || dai.asalLembaga}</span>
                      </div>
                      {dai.asalLembaga && dai.asalDaerah && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Lembaga: {dai.asalLembaga}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Kontrak: {dai.durasiKontrakBulan} Bulan
                      </div>
                    </td>

                    {/* 4. Provinsi Pengutusan (Tempat Diutus) */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                        <span>{dai.provinsi}</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                        Provinsi Tempat Diutus
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Kepulauan: {dai.pulau}
                      </div>
                    </td>

                    {/* Status Tugas */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        dai.statusTugas === 'Aktif'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : dai.statusTugas === 'Persiapan'
                          ? 'bg-sky-950 text-sky-300 border-sky-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {dai.statusTugas}
                      </span>
                    </td>

                    {/* Aksi Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectDai(dai)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-300 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredList.length > 0 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="font-mono">
              Halaman <strong className="text-white">{currentPage}</strong> dari{' '}
              <strong className="text-white">{totalPages}</strong> (Menampilkan {paginatedList.length} dari {filteredList.length} da'i)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              {/* Page Number Chips */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded text-xs font-mono font-semibold transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 flex items-center gap-1"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
