import React from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Wallet, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Building,
  Printer,
  Edit3,
  Trash2,
  DollarSign,
  Lock
} from 'lucide-react';
import { DaiUtusan } from '../types/dai';
import { formatRupiah, formatRupiahSingkat, hitungPertumbuhan, ensureDaiMetrics } from '../data/initialData';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dai: DaiUtusan | null;
  onOpenFundModal: (dai: DaiUtusan) => void;
  onOpenProgressModal: (dai: DaiUtusan) => void;
  onOpenEditModal: (dai: DaiUtusan) => void;
  onDeleteDai?: (daiId: string, nama: string) => void;
  isAdmin?: boolean;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  dai: rawDai,
  onOpenFundModal,
  onOpenProgressModal,
  onOpenEditModal,
  onDeleteDai,
  isAdmin = true,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);
  if (!isOpen || !rawDai) return null;

  const dai = ensureDaiMetrics(rawDai);
  const growth = hitungPertumbuhan(dai.tren.jamaahAwal, dai.tren.jamaahKini);
  const isFull = dai.dana.statusPencairan === 'Tersalurkan Penuh';

  const handlePrintDetail = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl border border-slate-200 max-w-2xl w-full shadow-2xl my-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50/90">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
              <span>{dai.pulau}</span>
              <span aria-hidden="true">·</span>
              <span>{dai.kategoriWilayah}</span>
              <span aria-hidden="true">·</span>
              <span className={`font-medium ${dai.statusTugas === 'Aktif' ? 'text-emerald-700' : 'text-slate-600'}`}>
                {dai.statusTugas}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {dai.nama}
              {dai.gelar && <span className="font-normal text-slate-500 text-sm ml-1.5">({dai.gelar})</span>}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Asal Daerah: <strong className="text-slate-800">{dai.asalDaerah || dai.asalLembaga}</strong>
              {dai.asalLembaga && dai.asalDaerah && <span> · Lembaga: {dai.asalLembaga}</span>}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrintDetail}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              title="Cetak Profil Da'i"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Quick Action Toolbar inside Modal */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs font-medium text-slate-700">Tombol Aksi Cepat Da'i Ini:</span>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenFundModal(dai);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                  <span>Atur Dana</span>
                </button>
                <button
                  onClick={() => {
                    onOpenProgressModal(dai);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                  <span>Update Progres</span>
                </button>
                <button
                  onClick={() => {
                    onOpenEditModal(dai);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Profil</span>
                </button>
                {onDeleteDai && (
                  !isConfirmingDelete ? (
                    <button
                      onClick={() => setIsConfirmingDelete(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                      title="Hapus da'i dari seluruh perangkat"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-rose-50 p-1 rounded border border-rose-300">
                      <span className="text-[11px] text-rose-800 font-semibold px-1">Yakin hapus?</span>
                      <button
                        onClick={() => {
                          onDeleteDai(dai.id, dai.nama);
                          setIsConfirmingDelete(false);
                        }}
                        className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-xs">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Mode Tamu: Hak ubah dan kelola data da'i hanya untuk Administrator.</span>
              </div>
            )}
          </div>

          {/* Section: Penugasan & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Tempat Pengutusan (Termasuk Provinsi)</span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Provinsi Pengutusan:</span>
                  <strong className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                    {dai.provinsi}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-normal">(Tempat Diutus)</span>
                </div>
                <div>Tempat Pengutusan / Posko: <strong className="text-slate-900">{dai.titikDakwah}</strong></div>
                <div>Kabupaten: <strong className="text-slate-800">{dai.kabupaten}</strong></div>
                <div>Kecamatan: <span className="text-slate-700">{dai.kecamatan || '-'}</span></div>
                <div>Wilayah Kepulauan: <span className="text-slate-700">{dai.pulau}</span></div>
                <div className="pt-1 text-slate-500">Masa Tugas: {dai.tanggalMulaiTugas} ({dai.durasiKontrakBulan} Bulan)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Asal Daerah &amp; Kontak</span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div>Asal Daerah (Da'i): <strong className="text-emerald-700 font-semibold">{dai.asalDaerah || dai.asalLembaga}</strong></div>
                <div>Lembaga Pengutus: <span className="text-slate-800">{dai.asalLembaga}</span></div>
                <div>Nomor Telepon/WA: <strong className="text-slate-800">{dai.telepon || '-'}</strong></div>
                <div className="pt-1.5">
                  <span className="block font-medium text-slate-700 mb-1">Fokus Dakwah:</span>
                  <div className="flex flex-wrap gap-1">
                    {dai.programFokus?.map((prog, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-[11px]">
                        {prog}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Tren Pertumbuhan Jamaah */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Statistik Perkembangan Dakwah</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Update terakhir: {dai.tren.terakhirUpdate}
              </span>
            </div>

            {/* 4 metrics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase block">Jamaah Awal</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">{dai.tren.jamaahAwal}</span>
              </div>
              <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-emerald-700 uppercase block">Jamaah Kini</span>
                <span className="text-base font-bold text-emerald-900 tabular-nums">{dai.tren.jamaahKini}</span>
                <span className="text-[10px] text-emerald-700 block font-medium">+{growth.delta} ({growth.persen}%)</span>
              </div>
              <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-100">
                <span className="text-[10px] text-blue-700 uppercase block">Santri TPQ</span>
                <span className="text-base font-bold text-blue-900 tabular-nums">{dai.tren.jumlahSantriTPQ}</span>
              </div>
              <div className="p-2.5 bg-purple-50/70 rounded-lg border border-purple-100">
                <span className="text-[10px] text-purple-700 uppercase block">Mualaf</span>
                <span className="text-base font-bold text-purple-900 tabular-nums">{dai.tren.jumlahMualaf}</span>
              </div>
            </div>

            {/* Narrative Progress & Obstacles */}
            <div className="space-y-2 pt-1">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">Catatan Perkembangan Lapangan:</strong>
                <p className="text-slate-600 leading-relaxed">{dai.tren.catatanProgresTerbaru}</p>
              </div>

              <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-950 font-semibold">Kendala Medan &amp; Kebutuhan:</strong>
                  <p className="text-amber-800 leading-relaxed">{dai.tren.kendalaLapangan}</p>
                </div>
              </div>
            </div>

            {/* Monthly History Table */}
            {dai.tren.riwayatBulanan && dai.tren.riwayatBulanan.length > 0 && (
              <div className="pt-2">
                <span className="block font-semibold text-slate-800 mb-2">Riwayat Perkembangan Per Bulan:</span>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] text-slate-600 border-b border-slate-200">
                        <th className="py-2 px-3">Bulan</th>
                        <th className="py-2 px-3 text-right">Jamaah</th>
                        <th className="py-2 px-3 text-right">Santri TPQ</th>
                        <th className="py-2 px-3 text-right">Dana Tersalur</th>
                        <th className="py-2 px-3">Catatan Kegiatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dai.tren.riwayatBulanan.map((rw, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">{rw.bulan}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{rw.jamaah}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{rw.santriTPQ}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{formatRupiahSingkat(rw.danaTersalur)}</td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">{rw.catatanKegiatan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section: Capaian Binaan & Karya Unggulan */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Capaian Binaan &amp; Karya Unggulan</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Almamater: <strong className="text-slate-800">{dai.asalLembaga || dai.almamater || '-'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-100">
                <span className="text-[10px] text-blue-700 uppercase block font-semibold">Binaan Tarbiyah</span>
                <span className="text-sm font-bold text-blue-900">{dai.capaianBinaan?.pesertaTarbiyah || 0} Peserta</span>
                <span className="text-[10px] text-blue-600 block">({dai.capaianBinaan?.kelompokTarbiyah || 0} Kelompok)</span>
              </div>
              <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-emerald-700 uppercase block font-semibold">Halaqah Qur'an</span>
                <span className="text-sm font-bold text-emerald-900">{dai.capaianBinaan?.pesertaHalaqahQuran || 0} Santri</span>
                <span className="text-[10px] text-emerald-600 block">({dai.capaianBinaan?.kelompokHalaqahQuran || 0} Halaqah)</span>
              </div>
              <div className="p-2.5 bg-purple-50/70 rounded-lg border border-purple-100">
                <span className="text-[10px] text-purple-700 uppercase block font-semibold">Pengajar Qur'an</span>
                <span className="text-sm font-bold text-purple-900">{dai.karyaUnggulan?.pengajarQuran || 0} Kader</span>
                <span className="text-[10px] text-purple-600 block">Mu'allim Mandiri</span>
              </div>
              <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-100">
                <span className="text-[10px] text-amber-700 uppercase block font-semibold">Kader Dikirim</span>
                <span className="text-sm font-bold text-amber-900">
                  {(dai.karyaUnggulan?.camabaStiba || 0) + (dai.karyaUnggulan?.camabaSekolahDai || 0)} Camaba
                </span>
                <span className="text-[10px] text-amber-700 block">
                  {dai.karyaUnggulan?.camabaStiba || 0} STIBA · {dai.karyaUnggulan?.camabaSekolahDai || 0} Sek. Da'i
                </span>
              </div>
            </div>
          </div>

          {/* Section: Penataan Dana & Anggaran */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Rincian Dana &amp; Anggaran Bulanan</span>
              </div>
              <span className={`font-semibold ${
                isFull ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {dai.dana.statusPencairan}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase block">Kafalah Pokok</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">{formatRupiah(dai.dana.honorKafalah)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase block">Transport Medan</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">{formatRupiah(dai.dana.operasionalTransport)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase block">Sarana Dakwah</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">{formatRupiah(dai.dana.saranaDakwah)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase block">Logistik/P3K</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">{formatRupiah(dai.dana.tunjanganKesehatanLogistik)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Total Kebutuhan Bulanan</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">{formatRupiah(dai.dana.totalKebutuhanPerBulan)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Tersalurkan Saat Ini</span>
                <span className={`text-base font-bold tabular-nums ${isFull ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {formatRupiah(dai.dana.danaTersalurkan)}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-1">
              <div>Sumber Donatur: <strong className="text-slate-800">{dai.dana.sumberDonatur}</strong></div>
              <div>Rekening Bank: <span className="text-slate-800 font-mono">{dai.dana.rekeningBank || 'Belum diisi'}</span></div>
              {dai.dana.catatanDana && (
                <div>Catatan Dana: <span className="text-slate-600 italic">{dai.dana.catatanDana}</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
