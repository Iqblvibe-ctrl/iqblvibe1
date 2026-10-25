import React, { useState, useEffect } from 'react';
import { X, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { DaiUtusan } from '../types/dai';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  dai: DaiUtusan | null;
  onSave: (daiId: string, updatedTren: DaiUtusan['tren']) => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  dai,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    jamaahKini: 0,
    jumlahSantriTPQ: 0,
    jumlahMualaf: 0,
    frekuensiKajianMingguan: 0,
    catatanProgresTerbaru: '',
    kendalaLapangan: '',
    tambahEntriBulanBaru: true,
    namaBulanBaru: 'Sep 2026',
    catatanBulanBaru: 'Kajian rutin pekanan dan penambahan santri baru',
  });

  useEffect(() => {
    if (dai) {
      setFormData({
        jamaahKini: dai.tren.jamaahKini,
        jumlahSantriTPQ: dai.tren.jumlahSantriTPQ,
        jumlahMualaf: dai.tren.jumlahMualaf,
        frekuensiKajianMingguan: dai.tren.frekuensiKajianMingguan,
        catatanProgresTerbaru: dai.tren.catatanProgresTerbaru,
        kendalaLapangan: dai.tren.kendalaLapangan,
        tambahEntriBulanBaru: false,
        namaBulanBaru: 'Sep 2026',
        catatanBulanBaru: 'Kajian rutin pekanan dan penambahan santri baru',
      });
    }
  }, [dai, isOpen]);

  if (!isOpen || !dai) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedRiwayat = [...dai.tren.riwayatBulanan];
    if (formData.tambahEntriBulanBaru && formData.namaBulanBaru.trim()) {
      updatedRiwayat.push({
        bulan: formData.namaBulanBaru.trim(),
        jamaah: Number(formData.jamaahKini),
        santriTPQ: Number(formData.jumlahSantriTPQ),
        danaTersalur: dai.dana.danaTersalurkan,
        catatanKegiatan: formData.catatanBulanBaru.trim() || 'Laporan bulanan rutin da\'i utusan',
      });
    }

    onSave(dai.id, {
      ...dai.tren,
      jamaahKini: Number(formData.jamaahKini),
      jumlahSantriTPQ: Number(formData.jumlahSantriTPQ),
      jumlahMualaf: Number(formData.jumlahMualaf),
      frekuensiKajianMingguan: Number(formData.frekuensiKajianMingguan),
      catatanProgresTerbaru: formData.catatanProgresTerbaru.trim(),
      kendalaLapangan: formData.kendalaLapangan.trim(),
      riwayatBulanan: updatedRiwayat,
      terakhirUpdate: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  const deltaJamaah = Number(formData.jamaahKini) - dai.tren.jamaahAwal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white text-slate-900 rounded-xl border border-slate-200 max-w-lg w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Update Tren &amp; Laporan Lapangan Da'i
            </h2>
            <p className="text-xs text-slate-500">
              {dai.nama} ({dai.titikDakwah}, {dai.kabupaten})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Comparison strip */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block">Jamaah Awal Penugasan</span>
              <strong className="text-slate-800 text-sm tabular-nums">{dai.tren.jamaahAwal} Jiwa</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Pertumbuhan Total</span>
              <span className={`text-sm font-bold tabular-nums ${deltaJamaah >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {deltaJamaah >= 0 ? `+${deltaJamaah}` : deltaJamaah} Jiwa
              </span>
            </div>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jumlah Jamaah Terkini *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.jamaahKini}
                onChange={(e) => setFormData({ ...formData, jamaahKini: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jumlah Santri TPQ / Mengaji *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.jumlahSantriTPQ}
                onChange={(e) => setFormData({ ...formData, jumlahSantriTPQ: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jumlah Mualaf Yang Dibina
              </label>
              <input
                type="number"
                min="0"
                value={formData.jumlahMualaf}
                onChange={(e) => setFormData({ ...formData, jumlahMualaf: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kajian Rutin / Pekan
              </label>
              <input
                type="number"
                min="0"
                value={formData.frekuensiKajianMingguan}
                onChange={(e) => setFormData({ ...formData, frekuensiKajianMingguan: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>
          </div>

          {/* Narrative update */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Laporan Progres Dakwah Terbaru
              </label>
              <textarea
                rows={3}
                required
                value={formData.catatanProgresTerbaru}
                onChange={(e) => setFormData({ ...formData, catatanProgresTerbaru: e.target.value })}
                placeholder="Misal: Telah dibuka kelas tahsin pemuda dusun, 10 anak tamat juz amma..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kendala Lapangan &amp; Kebutuhan Mendesak
              </label>
              <textarea
                rows={2}
                value={formData.kendalaLapangan}
                onChange={(e) => setFormData({ ...formData, kendalaLapangan: e.target.value })}
                placeholder="Misal: Perlu tambahan 30 Al-Qur'an terjemah dan papan tulis TPQ..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Optional New Monthly Log Entry */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tambahEntriBulanBaru}
                onChange={(e) => setFormData({ ...formData, tambahEntriBulanBaru: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-800">
                Arsipkan sebagai catatan grafik bulanan baru
              </span>
            </label>

            {formData.tambahEntriBulanBaru && (
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Nama Bulan</label>
                  <input
                    type="text"
                    value={formData.namaBulanBaru}
                    onChange={(e) => setFormData({ ...formData, namaBulanBaru: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Ringkasan Kegiatan</label>
                  <input
                    type="text"
                    value={formData.catatanBulanBaru}
                    onChange={(e) => setFormData({ ...formData, catatanBulanBaru: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
            >
              Simpan Laporan Progres
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
