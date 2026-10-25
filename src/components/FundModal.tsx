import React, { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, Check } from 'lucide-react';
import { DaiUtusan, StatusDana } from '../types/dai';
import { DAFTAR_STATUS_DANA, formatRupiah } from '../data/initialData';

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  dai: DaiUtusan | null;
  onSave: (daiId: string, updatedDana: DaiUtusan['dana']) => void;
}

export const FundModal: React.FC<FundModalProps> = ({
  isOpen,
  onClose,
  dai,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    honorKafalah: 0,
    operasionalTransport: 0,
    saranaDakwah: 0,
    tunjanganKesehatanLogistik: 0,
    danaTersalurkan: 0,
    statusPencairan: 'Tersalurkan Penuh' as StatusDana,
    sumberDonatur: '',
    rekeningBank: '',
    catatanDana: '',
  });

  useEffect(() => {
    if (dai) {
      setFormData({
        honorKafalah: dai.dana.honorKafalah,
        operasionalTransport: dai.dana.operasionalTransport,
        saranaDakwah: dai.dana.saranaDakwah,
        tunjanganKesehatanLogistik: dai.dana.tunjanganKesehatanLogistik,
        danaTersalurkan: dai.dana.danaTersalurkan,
        statusPencairan: dai.dana.statusPencairan,
        sumberDonatur: dai.dana.sumberDonatur,
        rekeningBank: dai.dana.rekeningBank || '',
        catatanDana: dai.dana.catatanDana || '',
      });
    }
  }, [dai, isOpen]);

  if (!isOpen || !dai) return null;

  const totalKebutuhan =
    Number(formData.honorKafalah) +
    Number(formData.operasionalTransport) +
    Number(formData.saranaDakwah) +
    Number(formData.tunjanganKesehatanLogistik);

  const selisih = Math.max(0, totalKebutuhan - Number(formData.danaTersalurkan));

  const handleSetFullDisburse = () => {
    setFormData({
      ...formData,
      danaTersalurkan: totalKebutuhan,
      statusPencairan: 'Tersalurkan Penuh',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(dai.id, {
      honorKafalah: Number(formData.honorKafalah),
      operasionalTransport: Number(formData.operasionalTransport),
      saranaDakwah: Number(formData.saranaDakwah),
      tunjanganKesehatanLogistik: Number(formData.tunjanganKesehatanLogistik),
      totalKebutuhanPerBulan: totalKebutuhan,
      danaTersalurkan: Number(formData.danaTersalurkan),
      statusPencairan: formData.statusPencairan,
      sumberDonatur: formData.sumberDonatur.trim(),
      rekeningBank: formData.rekeningBank.trim(),
      catatanDana: formData.catatanDana.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white text-slate-900 rounded-xl border border-slate-200 max-w-lg w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Penataan Anggaran &amp; Dana Da'i
            </h2>
            <p className="text-xs text-slate-500">
              {dai.nama} ({dai.kabupaten}, {dai.pulau})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-800 font-medium block">Total Anggaran Bulanan</span>
              <span className="text-lg font-bold text-emerald-900 tabular-nums">
                {formatRupiah(totalKebutuhan)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSetFullDisburse}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 rounded-md hover:bg-emerald-50 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>Cairkan Penuh 100%</span>
            </button>
          </div>

          {/* Breakdown inputs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Komponen Pembiayaan
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  1. Kafalah Pokok (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  value={formData.honorKafalah}
                  onChange={(e) => setFormData({ ...formData, honorKafalah: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  2. Transport Medan / BBM (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  value={formData.operasionalTransport}
                  onChange={(e) => setFormData({ ...formData, operasionalTransport: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  3. Sarana Dakwah &amp; Mushaf (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={formData.saranaDakwah}
                  onChange={(e) => setFormData({ ...formData, saranaDakwah: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  4. Logistik &amp; P3K (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={formData.tunjanganKesehatanLogistik}
                  onChange={(e) => setFormData({ ...formData, tunjanganKesehatanLogistik: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Realization & Status */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Realisasi Pencairan Bulan Ini
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dana Tersalurkan (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  value={formData.danaTersalurkan}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    let st = formData.statusPencairan;
                    if (val >= totalKebutuhan) st = 'Tersalurkan Penuh';
                    else if (val > 0) st = 'Tersalurkan Sebagian';
                    setFormData({ ...formData, danaTersalurkan: val, statusPencairan: st });
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Status Pencairan
                </label>
                <select
                  value={formData.statusPencairan}
                  onChange={(e) => setFormData({ ...formData, statusPencairan: e.target.value as StatusDana })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {DAFTAR_STATUS_DANA.filter((s) => s !== 'Semua Status Dana').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {selisih > 0 && (
              <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded border border-rose-200">
                Kekurangan / Defisit belum tersalurkan: <strong className="tabular-nums">{formatRupiah(selisih)}</strong>
              </div>
            )}
          </div>

          {/* Administrative details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sumber Donatur / Program Zakat
              </label>
              <input
                type="text"
                placeholder="Contoh: CSR BSI / Wakaf Al-Azhar / Donatur Pribadi"
                value={formData.sumberDonatur}
                onChange={(e) => setFormData({ ...formData, sumberDonatur: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nomor Rekening Da'i
              </label>
              <input
                type="text"
                placeholder="Contoh: BSI 7123984129 an Ahmad Fauzi"
                value={formData.rekeningBank}
                onChange={(e) => setFormData({ ...formData, rekeningBank: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Khusus Dana / Transport
              </label>
              <textarea
                rows={2}
                value={formData.catatanDana}
                onChange={(e) => setFormData({ ...formData, catatanDana: e.target.value })}
                placeholder="Misal: Biaya sewa speedboat naik karena cuaca buruk ombak tinggi..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer Action */}
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
              Simpan Penataan Dana
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
