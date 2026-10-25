import React, { useState } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  Download, 
  Printer, 
  Edit3, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  Check
} from 'lucide-react';
import { DaiUtusan, StatusDana } from '../types/dai';
import { formatRupiah, formatRupiahSingkat } from '../data/initialData';

interface FundManagerProps {
  daiList: DaiUtusan[];
  onOpenFundModal: (dai: DaiUtusan) => void;
  onUpdateDaiDana: (daiId: string, updatedDana: Partial<DaiUtusan['dana']>) => void;
  onNavigateToTab: (tab: 'tren' | 'database' | 'dana' | 'panduan') => void;
}

export const FundManager: React.FC<FundManagerProps> = ({
  daiList,
  onOpenFundModal,
  onUpdateDaiDana,
  onNavigateToTab,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [quickAmountModalDai, setQuickAmountModalDai] = useState<DaiUtusan | null>(null);
  const [customNominal, setCustomNominal] = useState<string>('');

  // Calculations
  const totalKebutuhan = daiList.reduce((acc, d) => acc + d.dana.totalKebutuhanPerBulan, 0);
  const totalTersalur = daiList.reduce((acc, d) => acc + d.dana.danaTersalurkan, 0);
  const totalDefisit = Math.max(0, totalKebutuhan - totalTersalur);
  const persentaseRealisasi = totalKebutuhan > 0 ? Math.round((totalTersalur / totalKebutuhan) * 100) : 0;

  // Breakdown by component
  const totalKafalah = daiList.reduce((acc, d) => acc + d.dana.honorKafalah, 0);
  const totalTransport = daiList.reduce((acc, d) => acc + d.dana.operasionalTransport, 0);
  const totalSarana = daiList.reduce((acc, d) => acc + d.dana.saranaDakwah, 0);
  const totalLogistik = daiList.reduce((acc, d) => acc + d.dana.tunjanganKesehatanLogistik, 0);

  // Filtered list
  const filteredDai = daiList.filter((d) => {
    if (filterStatus === 'semua') return true;
    if (filterStatus === 'belum_penuh') return d.dana.statusPencairan !== 'Tersalurkan Penuh';
    return d.dana.statusPencairan === filterStatus;
  });

  // 1-Click: Mark as 100% Disbursed
  const handleMarkFullDisbursed = (dai: DaiUtusan) => {
    onUpdateDaiDana(dai.id, {
      danaTersalurkan: dai.dana.totalKebutuhanPerBulan,
      statusPencairan: 'Tersalurkan Penuh',
    });
  };

  // Quick Disburse Custom Nominal
  const handleApplyCustomDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAmountModalDai) return;
    const nominal = parseInt(customNominal.replace(/\D/g, ''), 10) || 0;
    const isFull = nominal >= quickAmountModalDai.dana.totalKebutuhanPerBulan;
    const isZero = nominal <= 0;

    let newStatus: StatusDana = 'Tersalurkan Sebagian';
    if (isFull) newStatus = 'Tersalurkan Penuh';
    else if (isZero) newStatus = 'Menunggu Pencairan';

    onUpdateDaiDana(quickAmountModalDai.id, {
      danaTersalurkan: nominal,
      statusPencairan: newStatus,
    });
    setQuickAmountModalDai(null);
    setCustomNominal('');
  };

  const handleExportFinancialReport = () => {
    const headers = [
      'Nama Da\'i',
      'Wilayah',
      'Kafalah (Rp)',
      'Transport (Rp)',
      'Sarana Dakwah (Rp)',
      'Logistik/Kesehatan (Rp)',
      'Total Kebutuhan/Bulan (Rp)',
      'Tersalurkan (Rp)',
      'Selisih/Defisit (Rp)',
      'Status Pencairan',
      'Sumber Donatur',
      'Rekening Bank',
    ];

    const rows = daiList.map((d) => [
      `"${d.nama}"`,
      `"${d.kabupaten}, ${d.pulau}"`,
      d.dana.honorKafalah,
      d.dana.operasionalTransport,
      d.dana.saranaDakwah,
      d.dana.tunjanganKesehatanLogistik,
      d.dana.totalKebutuhanPerBulan,
      d.dana.danaTersalurkan,
      Math.max(0, d.dana.totalKebutuhanPerBulan - d.dana.danaTersalurkan),
      `"${d.dana.statusPencairan}"`,
      `"${d.dana.sumberDonatur}"`,
      `"${d.dana.rekeningBank || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_anggaran_dana_dai_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Header */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Wallet className="w-4 h-4 text-emerald-700" />
              <span>Modul Tata Kelola Anggaran Dakwah</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Kafalah &amp; Operasional Lapangan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
              Penataan Dana &amp; Anggaran Da'i Utusan
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pantau rincian kafalah, biaya perahu dan motor trail medan pedalaman, pengadaan mushaf, serta status pencairan donatur secara transparan.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportFinancialReport}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Ekspor Rekap Keuangan</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </section>

      {/* Financial KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Needs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1.5">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Kebutuhan Anggaran / Bulan</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatRupiah(totalKebutuhan)}
          </div>
          <div className="text-[11px] text-slate-500">
            Alokasi untuk <strong className="text-slate-700 tabular-nums">{daiList.length}</strong> da'i utusan
          </div>
        </div>

        {/* Disbursed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1.5">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Dana Telah Tersalurkan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {formatRupiah(totalTersalur)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Tingkat Serapan: <span className="tabular-nums font-bold">{persentaseRealisasi}%</span>
          </div>
        </div>

        {/* Deficit / Needs Donor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1.5">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Kebutuhan Tambahan / Defisit</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900 tabular-nums">
            {formatRupiah(totalDefisit)}
          </div>
          <div className="text-[11px] text-amber-700">
            {totalDefisit > 0 ? 'Perlu dibuka open donasi dakwah' : 'Seluruh anggaran telah tercukupi'}
          </div>
        </div>

        {/* Average per Da'i */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1.5">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Rata-Rata Anggaran / Da'i</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {daiList.length > 0 ? formatRupiah(Math.round(totalKebutuhan / daiList.length)) : 'Rp 0'}
          </div>
          <div className="text-[11px] text-slate-500">
            Termasuk kafalah &amp; akomodasi medan 3T
          </div>
        </div>
      </section>

      {/* Budget Breakdown by 4 Main Components */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Komposisi Penggunaan Dana Dakwah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rincian 4 pilar utama pembiayaan da'i utusan ke pedalaman Nusantara
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Component 1: Kafalah */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-600">1. Kafalah Pokok Da'i</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {formatRupiah(totalKafalah)}
            </div>
            <span className="text-[11px] text-slate-500 block">
              {totalKebutuhan > 0 ? Math.round((totalKafalah / totalKebutuhan) * 100) : 0}% dari total anggaran
            </span>
          </div>

          {/* Component 2: Transport & Field Ops */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-600">2. Transport &amp; Medan Sulit</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {formatRupiah(totalTransport)}
            </div>
            <span className="text-[11px] text-slate-500 block">
              {totalKebutuhan > 0 ? Math.round((totalTransport / totalKebutuhan) * 100) : 0}% (BBM, sewa perahu/motor trail)
            </span>
          </div>

          {/* Component 3: Sarana Dakwah */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-600">3. Sarana Dakwah &amp; Mushaf</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {formatRupiah(totalSarana)}
            </div>
            <span className="text-[11px] text-slate-500 block">
              {totalKebutuhan > 0 ? Math.round((totalSarana / totalKebutuhan) * 100) : 0}% (Buku Iqra, Al-Qur'an, sound)
            </span>
          </div>

          {/* Component 4: Logistik & Kesehatan */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-600">4. Tunjangan Logistik &amp; P3K</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {formatRupiah(totalLogistik)}
            </div>
            <span className="text-[11px] text-slate-500 block">
              {totalKebutuhan > 0 ? Math.round((totalLogistik / totalKebutuhan) * 100) : 0}% (Sembako &amp; obat darurat)
            </span>
          </div>
        </div>
      </section>

      {/* Table: Per-Da'i Fund Allocation & 1-Click Action */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Alokasi &amp; Status Pencairan Dana Da'i
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola nominal, tandai pencairan, dan update sumber donatur per da'i
            </p>
          </div>

          {/* Filter status buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterStatus('semua')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterStatus === 'semua' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({daiList.length})
            </button>
            <button
              onClick={() => setFilterStatus('belum_penuh')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterStatus === 'belum_penuh' ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Lunas ({daiList.filter((d) => d.dana.statusPencairan !== 'Tersalurkan Penuh').length})
            </button>
            <button
              onClick={() => setFilterStatus('Butuh Donatur')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterStatus === 'Butuh Donatur' ? 'bg-white text-rose-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Butuh Donatur ({daiList.filter((d) => d.dana.statusPencairan === 'Butuh Donatur').length})
            </button>
          </div>
        </div>

        {/* Fund Allocation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3">Nama Da'i &amp; Lokasi</th>
                <th className="py-3 px-3 text-right">Kafalah</th>
                <th className="py-3 px-3 text-right">Transport</th>
                <th className="py-3 px-3 text-right">Sarana Dakwah</th>
                <th className="py-3 px-3 text-right">Total Kebutuhan</th>
                <th className="py-3 px-3 text-right">Tersalurkan</th>
                <th className="py-3 px-3">Status Dana</th>
                <th className="py-3 px-3 text-center">Aksi Cepat Penataan Dana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredDai.map((dai) => {
                const sisa = Math.max(0, dai.dana.totalKebutuhanPerBulan - dai.dana.danaTersalurkan);
                const isFull = dai.dana.statusPencairan === 'Tersalurkan Penuh';

                return (
                  <tr key={dai.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & Location */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900">{dai.nama}</div>
                      <div className="text-[11px] text-slate-500">
                        {dai.kabupaten}, {dai.pulau}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Rek: {dai.dana.rekeningBank || 'Belum diisi'}
                      </div>
                    </td>

                    {/* Kafalah */}
                    <td className="py-3.5 px-3 text-right tabular-nums">
                      {formatRupiahSingkat(dai.dana.honorKafalah)}
                    </td>

                    {/* Transport */}
                    <td className="py-3.5 px-3 text-right tabular-nums">
                      {formatRupiahSingkat(dai.dana.operasionalTransport)}
                    </td>

                    {/* Sarana */}
                    <td className="py-3.5 px-3 text-right tabular-nums">
                      {formatRupiahSingkat(dai.dana.saranaDakwah)}
                    </td>

                    {/* Total Kebutuhan */}
                    <td className="py-3.5 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatRupiah(dai.dana.totalKebutuhanPerBulan)}
                    </td>

                    {/* Tersalurkan */}
                    <td className="py-3.5 px-3 text-right tabular-nums">
                      <div className={`font-semibold ${isFull ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {formatRupiah(dai.dana.danaTersalurkan)}
                      </div>
                      {sisa > 0 && (
                        <div className="text-[10px] text-rose-600">
                          Kurang {formatRupiahSingkat(sisa)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className={`text-xs font-semibold block ${
                        isFull
                          ? 'text-emerald-700'
                          : dai.dana.statusPencairan === 'Tersalurkan Sebagian'
                          ? 'text-amber-700'
                          : dai.dana.statusPencairan === 'Menunggu Pencairan'
                          ? 'text-blue-700'
                          : 'text-rose-700'
                      }`}>
                        {dai.dana.statusPencairan}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                        {dai.dana.sumberDonatur}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        {/* 1-Click Lunas Button */}
                        {!isFull ? (
                          <button
                            onClick={() => handleMarkFullDisbursed(dai)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors whitespace-nowrap"
                            title="Tandai telah tersalurkan 100% lunas bulan ini"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Cairkan Penuh</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Lunas</span>
                          </span>
                        )}

                        {/* Partial amount trigger */}
                        <button
                          onClick={() => {
                            setQuickAmountModalDai(dai);
                            setCustomNominal(dai.dana.danaTersalurkan.toString());
                          }}
                          className="px-2 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                          title="Input nominal pencairan bertahap"
                        >
                          Isi Nominal
                        </button>

                        {/* Full Edit Breakdown Modal */}
                        <button
                          onClick={() => onOpenFundModal(dai)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          title="Ubah rincian kafalah, transport, atau donatur"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Nominal Modal */}
      {quickAmountModalDai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-lg space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pencairan Dana Da'i
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {quickAmountModalDai.nama} ({quickAmountModalDai.kabupaten})
              </p>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span>Total Kebutuhan Anggaran:</span>
                <strong className="text-slate-800 tabular-nums">
                  {formatRupiah(quickAmountModalDai.dana.totalKebutuhanPerBulan)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Rekening Da'i:</span>
                <span className="text-slate-700">{quickAmountModalDai.dana.rekeningBank || 'Belum diisi'}</span>
              </div>
            </div>

            <form onSubmit={handleApplyCustomDisbursement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Dana Yang Dicairkan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100000000"
                  step="50000"
                  value={customNominal}
                  onChange={(e) => setCustomNominal(e.target.value)}
                  placeholder="Misal: 5000000"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Jika nominal sama dengan total kebutuhan, status otomatis menjadi "Tersalurkan Penuh".
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuickAmountModalDai(null);
                    setCustomNominal('');
                  }}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
                >
                  Simpan Pencairan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
