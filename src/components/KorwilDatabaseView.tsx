import React, { useState } from 'react';
import { 
  Shield, 
  MapPin, 
  Users, 
  Radio, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Download, 
  Printer, 
  Layers, 
  Eye,
  Building2,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { Korwil } from '../types/dai';
import { INITIAL_KORWIL_LIST } from '../data/initialData';

interface KorwilDatabaseViewProps {
  korwilList: Korwil[];
  onOpenBulkImport: () => void;
  onSelectKorwil?: (korwil: Korwil) => void;
}

export const KorwilDatabaseView: React.FC<KorwilDatabaseViewProps> = ({
  korwilList,
  onOpenBulkImport,
  onSelectKorwil,
}) => {
  const [selectedKorwil, setSelectedKorwil] = useState<Korwil | null>(korwilList[0] || null);
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('Semua');

  const filteredKorwil = korwilList.filter((k) => {
    if (activeFilterStatus === 'Semua') return true;
    return k.statusOperasional === activeFilterStatus;
  });

  const totalDai = korwilList.reduce((acc, k) => acc + k.jumlahDaiSupervisi, 0);
  const totalTitik3T = korwilList.reduce((acc, k) => acc + k.jumlahTitik3T, 0);

  const handleExportKorwilCSV = () => {
    const headers = [
      'Kode Wilayah',
      'Nama Wilayah Teritorial',
      'Koordinator Wilayah',
      'Posko Induk',
      'Provinsi Cakupan',
      'Jumlah Da\'i',
      'Jumlah Titik 3T',
      'Jadwal Laporan',
      'Kanal Komunikasi',
      'Status Operasional',
      'Kontak Telepon',
    ];

    const rows = korwilList.map((k) => [
      `"${k.kodeWilayah}"`,
      `"${k.namaWilayah}"`,
      `"${k.namaKoordinator}${k.gelar ? ', ' + k.gelar : ''}"`,
      `"${k.poskoInduk}"`,
      `"${k.provinsiCakupan.join(', ')}"`,
      k.jumlahDaiSupervisi,
      k.jumlahTitik3T,
      `"${k.frekuensiLaporan}"`,
      `"${k.kanalKomunikasi}"`,
      `"${k.statusOperasional}"`,
      `"${k.telepon}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `database_korwil_sidau_nusantara_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>KOMANDO TERITORIAL KOORDINATOR WILAYAH (KORWIL)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Informasi Database Korwil Nusantara
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Direktori resmi 7 Koordinator Wilayah (Korwil) dari Sabang sampai Merauke yang mengemban mandat kepemimpinan teritorial, membawahi posko aju 3T, serta mengawal koordinasi harian ke pusat komando nasional.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={onOpenBulkImport}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors border border-blue-400 shadow-md whitespace-nowrap"
              title="Import data Korwil sekaligus dari Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Import Massal Korwil</span>
            </button>
            <button
              onClick={handleExportKorwilCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 shadow-sm whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 shadow-sm whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Mini KPI Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Total Wilayah Komando</span>
            <strong className="text-white text-base font-mono block">7 Korwil</strong>
            <span className="text-blue-400 text-[10px]">Cakupan Seluruh Indonesia</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Da'i di Bawah Supervisi</span>
            <strong className="text-white text-base font-mono block">{totalDai} Da'i Utusan</strong>
            <span className="text-emerald-400 text-[10px]">100% Terkoordinasi</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Posko Titik 3T &amp; Perbatasan</span>
            <strong className="text-white text-base font-mono block">{totalTitik3T} Titik</strong>
            <span className="text-sky-400 text-[10px]">Terhubung Jalur Radio/Satelit</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Kesiapan Siaga Operasi</span>
            <strong className="text-emerald-400 text-base font-mono block">24/7 Siaga</strong>
            <span className="text-slate-400 text-[10px]">Relay Nasional Real-Time</span>
          </div>
        </div>

        {/* Filter status buttons */}
        <div className="flex items-center gap-2 pt-2 text-xs overflow-x-auto">
          <span className="text-slate-400 text-xs mr-1">Status Kesiapan:</span>
          {['Semua', 'Siaga Penuh', 'Operasi Rutin', 'Siaga Bencana Cuaca'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilterStatus(status)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeFilterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Korwil Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKorwil.map((korwil) => {
          const isSelected = selectedKorwil?.id === korwil.id;

          return (
            <div
              key={korwil.id}
              onClick={() => setSelectedKorwil(korwil)}
              className={`rounded-2xl border p-5 space-y-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-blue-500 ring-2 ring-blue-500/30 shadow-xl'
                  : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Top Accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                isSelected ? 'bg-blue-500' : 'bg-slate-800'
              }`}></div>

              <div className="space-y-3">
                {/* Header Tag & Status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-950 text-blue-400 border border-blue-800">
                    {korwil.kodeWilayah}
                  </span>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    korwil.statusOperasional === 'Siaga Penuh'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : korwil.statusOperasional === 'Siaga Bencana Cuaca'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-sky-950 text-sky-300 border-sky-800'
                  }`}>
                    {korwil.statusOperasional}
                  </span>
                </div>

                {/* Korwil Name & Territory */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {korwil.namaWilayah}
                  </h3>
                  <div className="text-xs text-blue-300 font-medium mt-1">
                    Koordinator: <strong className="text-white font-bold">{korwil.namaKoordinator}</strong>
                    {korwil.gelar && <span className="text-slate-400 ml-1">({korwil.gelar})</span>}
                  </div>
                </div>

                {/* Base Camp / Posko Induk */}
                <div className="text-xs text-slate-300 space-y-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Posko Induk Komando:</span>
                  </div>
                  <div className="font-semibold text-white pl-5">{korwil.poskoInduk}</div>
                </div>

                {/* Provinces Pills */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Provinsi Cakupan ({korwil.provinsiCakupan.length} Provinsi):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {korwil.provinsiCakupan.slice(0, 4).map((p, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {p}
                      </span>
                    ))}
                    {korwil.provinsiCakupan.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-900 font-mono">
                        +{korwil.provinsiCakupan.length - 4} lainnya
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantitative Stats */}
                <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">DA'I SUPERVISI</span>
                    <strong className="text-sm font-bold text-white tabular-nums">{korwil.jumlahDaiSupervisi} Da'i</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">TITIK MEDAN 3T</span>
                    <strong className="text-sm font-bold text-sky-400 tabular-nums">{korwil.jumlahTitik3T} Titik Posko</strong>
                  </div>
                </div>

                {/* Strategic Focus */}
                <div className="text-xs text-slate-400 line-clamp-2">
                  <span className="text-slate-300 font-medium">Fokus: </span>
                  {korwil.fokusStrategis}
                </div>
              </div>

              {/* Action Strip */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-medium">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                  Kontak: {korwil.telepon}
                </span>
                <span className="inline-flex items-center gap-1 text-xs hover:underline text-blue-400">
                  <span>Lihat Detail</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Korwil Deep Detail Inspector Box */}
      {selectedKorwil && (
        <div className="bg-slate-950 text-white rounded-2xl border border-blue-900/60 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
                  {selectedKorwil.kodeWilayah}
                </span>
                <span className="text-xs text-slate-400 font-mono">RINCIAN KOMANDO WILAYAH</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {selectedKorwil.namaWilayah}
              </h3>
            </div>

            <span className={`px-3 py-1 rounded text-xs font-semibold border inline-flex items-center gap-1.5 ${
              selectedKorwil.statusOperasional === 'Siaga Penuh'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : selectedKorwil.statusOperasional === 'Siaga Bencana Cuaca'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-sky-950 text-sky-300 border-sky-800'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{selectedKorwil.statusOperasional}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Box 1 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-mono text-[11px] block">KOORDINATOR WILAYAH</span>
              <strong className="text-white text-sm block">{selectedKorwil.namaKoordinator}</strong>
              <span className="text-slate-400 text-[11px] block">{selectedKorwil.gelar}</span>
              <div className="pt-2 text-slate-400 font-mono text-[11px] space-y-0.5">
                <div>Telp: {selectedKorwil.telepon}</div>
                <div>Email: {selectedKorwil.email}</div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-mono text-[11px] block">MARKAS / POSKO INDUK</span>
              <strong className="text-white text-sm block">{selectedKorwil.poskoInduk}</strong>
              <p className="text-slate-400 text-[11px] pt-1">
                Pusat komando logistik, obat-obatan, dan cadangan Al-Qur'an teritorial.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-mono text-[11px] block">JADWAL BRIEFING NASIONAL</span>
              <strong className="text-blue-300 text-sm block">{selectedKorwil.frekuensiLaporan}</strong>
              <span className="text-slate-400 text-[11px] block pt-1 font-mono">
                Kanal: {selectedKorwil.kanalKomunikasi}
              </span>
            </div>

            {/* Box 4 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-mono text-[11px] block">DA'I &amp; TITIK MEDAN</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tabular-nums">{selectedKorwil.jumlahDaiSupervisi}</span>
                <span className="text-slate-400 text-xs">Da'i Bertugas</span>
              </div>
              <span className="text-sky-400 text-[11px] block font-mono">
                {selectedKorwil.jumlahTitik3T} Titik Medan Terisolir
              </span>
            </div>
          </div>

          {/* All Provinces list */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-300 font-mono uppercase text-[11px] block">
              Daftar Seluruh Provinsi Wilayah Komando {selectedKorwil.kodeWilayah}:
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedKorwil.provinsiCakupan.map((prov, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                  {prov}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
