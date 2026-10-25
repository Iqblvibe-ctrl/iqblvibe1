import React, { useState, useEffect } from 'react';
import { X, FileText, MapPin, User, Building, Compass } from 'lucide-react';
import { DaiUtusan, PulauWilayah, KategoriWilayah, StatusTugas } from '../types/dai';
import { DAFTAR_PULAU } from '../data/initialData';

interface DaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dai: DaiUtusan) => void;
  editingDai: DaiUtusan | null;
}

// 5 Kategori Wilayah sesuai arahan: Berkembang, Mandiri, Aktif, Rintisan, Tidak Aktif
const KATEGORI_WILAYAH_OPTIONS: KategoriWilayah[] = [
  'Berkembang',
  'Mandiri',
  'Aktif',
  'Rintisan',
  'Tidak Aktif',
];

const DAFTAR_PROVINSI_INDONESIA = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Bengkulu', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Lampung',
  'DKI Jakarta', 'Banten', 'Jawa Barat', 'Jawa Tengah', 'D.I. Yogyakarta', 'Jawa Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Maluku', 'Maluku Utara',
  'Papua', 'Papua Barat', 'Papua Barat Daya', 'Papua Pegunungan', 'Papua Selatan', 'Papua Tengah'
];

export const DaiModal: React.FC<DaiModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDai,
}) => {
  const [formData, setFormData] = useState({
    nama: '',
    gelar: '',
    telepon: '',
    asalDaerah: '',
    alumniInstansi: '', // Asal lembaga diubah menjadi alumni instansi
    pulau: 'Sumatera' as PulauWilayah,
    provinsi: 'Sumatera Barat',
    titikDakwah: '', // Cukup cantumkan tempat pengutusan/titik dakwah
    kategoriWilayah: 'Berkembang' as KategoriWilayah, // Berkembang, Mandiri, Aktif, Rintisan, Tidak Aktif
    tanggalMulaiTugas: new Date().toISOString().slice(0, 10),
    durasiKontrakBulan: 24,
    statusTugas: 'Aktif' as StatusTugas,
    catatanKhusus: '', // Menggantikan alokasi dana & data tren jamaah binaan
  });

  useEffect(() => {
    if (editingDai) {
      setFormData({
        nama: editingDai.nama,
        gelar: editingDai.gelar || '',
        telepon: editingDai.telepon || '',
        asalDaerah: editingDai.asalDaerah || '',
        alumniInstansi: editingDai.asalLembaga || editingDai.almamater || '',
        pulau: editingDai.pulau || 'Sumatera',
        provinsi: editingDai.provinsi || 'Sumatera Barat',
        titikDakwah: editingDai.titikDakwah || '',
        kategoriWilayah: (
          KATEGORI_WILAYAH_OPTIONS.includes(editingDai.kategoriWilayah as any)
            ? editingDai.kategoriWilayah
            : 'Berkembang'
        ) as KategoriWilayah,
        tanggalMulaiTugas: editingDai.tanggalMulaiTugas || new Date().toISOString().slice(0, 10),
        durasiKontrakBulan: editingDai.durasiKontrakBulan || 24,
        statusTugas: editingDai.statusTugas || 'Aktif',
        catatanKhusus: editingDai.catatanKhusus || editingDai.tren?.catatanProgresTerbaru || '',
      });
    } else {
      setFormData({
        nama: '',
        gelar: '',
        telepon: '',
        asalDaerah: '',
        alumniInstansi: 'STIBA Makassar',
        pulau: 'Sumatera',
        provinsi: 'Sumatera Barat',
        titikDakwah: '',
        kategoriWilayah: 'Berkembang',
        tanggalMulaiTugas: new Date().toISOString().slice(0, 10),
        durasiKontrakBulan: 24,
        statusTugas: 'Aktif',
        catatanKhusus: '',
      });
    }
  }, [editingDai, isOpen]);

  if (!isOpen) return null;

  // Auto-deduce Pulau based on Provinsi if possible
  const handleProvinsiChange = (newProv: string) => {
    let deducedPulau: PulauWilayah = formData.pulau;
    if (['Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Bengkulu', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Lampung'].includes(newProv)) {
      deducedPulau = 'Sumatera';
    } else if (['DKI Jakarta', 'Banten', 'Jawa Barat', 'Jawa Tengah', 'D.I. Yogyakarta', 'Jawa Timur'].includes(newProv)) {
      deducedPulau = 'Jawa';
    } else if (newProv.startsWith('Kalimantan')) {
      deducedPulau = 'Kalimantan';
    } else if (newProv.startsWith('Sulawesi') || newProv === 'Gorontalo') {
      deducedPulau = 'Sulawesi';
    } else if (['Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur'].includes(newProv)) {
      deducedPulau = 'Bali & Nusa Tenggara';
    } else if (newProv.startsWith('Maluku')) {
      deducedPulau = 'Maluku';
    } else if (newProv.startsWith('Papua')) {
      deducedPulau = 'Papua';
    }

    setFormData({
      ...formData,
      provinsi: newProv,
      pulau: deducedPulau,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const generatedId = editingDai
      ? editingDai.id
      : `dai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Safe fallback structures for legacy components
    const safeDana = editingDai?.dana || {
      honorKafalah: 3500000,
      operasionalTransport: 1500000,
      saranaDakwah: 700000,
      tunjanganKesehatanLogistik: 500000,
      totalKebutuhanPerBulan: 6200000,
      danaTersalurkan: 6200000,
      statusPencairan: 'Tersalurkan Penuh',
      sumberDonatur: 'Infaq Kaum Muslimin',
    };

    const safeTren = editingDai?.tren || {
      jamaahAwal: 20,
      jamaahKini: 35,
      jumlahMualaf: 5,
      jumlahSantriTPQ: 25,
      frekuensiKajianMingguan: 4,
      catatanProgresTerbaru: formData.catatanKhusus.trim() || 'Aktivitas dakwah berjalan rutin.',
      kendalaLapangan: 'Akses medan geografis.',
      riwayatBulanan: [],
      terakhirUpdate: new Date().toISOString().slice(0, 10),
    };

    const newDai: DaiUtusan = {
      id: generatedId,
      nama: formData.nama.trim(),
      gelar: formData.gelar.trim() || undefined,
      telepon: formData.telepon.trim() || '-',
      asalDaerah: formData.asalDaerah.trim() || 'Indonesia',
      asalLembaga: formData.alumniInstansi.trim() || 'STIBA Makassar',
      almamater: formData.alumniInstansi.trim() || 'STIBA Makassar',
      pulau: formData.pulau,
      provinsi: formData.provinsi.trim(),
      kabupaten: formData.titikDakwah.split(',')[1]?.trim() || formData.provinsi,
      kecamatan: formData.titikDakwah.split(',')[0]?.trim() || 'Posko',
      titikDakwah: formData.titikDakwah.trim(),
      kategoriWilayah: formData.kategoriWilayah,
      tanggalMulaiTugas: formData.tanggalMulaiTugas,
      durasiKontrakBulan: Number(formData.durasiKontrakBulan) || 12,
      statusTugas: formData.statusTugas,
      programFokus: editingDai?.programFokus || ['Pendidikan Al-Qur\'an', 'Pembinaan Tarbiyah'],
      catatanKhusus: formData.catatanKhusus.trim(),
      dana: safeDana,
      tren: {
        ...safeTren,
        catatanProgresTerbaru: formData.catatanKhusus.trim() || safeTren.catatanProgresTerbaru,
      },
      capaianBinaan: editingDai?.capaianBinaan,
      karyaUnggulan: editingDai?.karyaUnggulan,
    };

    onSave(newDai);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 max-w-2xl w-full shadow-2xl my-6 overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900/60 border border-blue-600/70 flex items-center justify-center text-blue-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {editingDai ? 'Edit Data Da\'i Utusan' : 'Tambah Da\'i Utusan Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Formulir pendaftaran profil da'i, alumni instansi, titik dakwah &amp; catatan khusus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Identitas & Alumni Instansi */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-700 text-white font-bold text-[11px]">1</span>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Identitas Da'i &amp; Alumni Instansi
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Da'i *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadz Ahmad Fauzi Ridwan"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gelar / Pendidikan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: S.Pd.I / Lc. / S.Ag"
                  value={formData.gelar}
                  onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-3489-1201"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Asal Daerah (Kota / Provinsi Asal Da'i) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Padang, Sumatera Barat / Solo, Jateng"
                  value={formData.asalDaerah}
                  onChange={(e) => setFormData({ ...formData, asalDaerah: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              {/* Requirement: Asal lembaga diubah menjadi alumni instansi */}
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alumni Instansi *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: STIBA Makassar / Sekolah Da'i / Ma'had Aly / DDII"
                  value={formData.alumniInstansi}
                  onChange={(e) => setFormData({ ...formData, alumniInstansi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-600/70 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 text-xs font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Almamater kampus dakwah atau lembaga pengutus da'i
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Titik Dakwah & Kategori Wilayah */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-700 text-white font-bold text-[11px]">2</span>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Tempat Pengutusan &amp; Kategori Wilayah
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Requirement: Cukup cantumkan "tempat pengutusan/titik dakwah" */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tempat Pengutusan / Titik Dakwah *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dusun Rogdok, Desa Tiop, Kec. Siberut Selatan, Kepulauan Mentawai"
                  value={formData.titikDakwah}
                  onChange={(e) => setFormData({ ...formData, titikDakwah: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-600/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-400 text-xs font-medium shadow-inner"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Cantumkan nama posko dakwah, dusun, atau lokasi penugasan da'i di lapangan.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Provinsi Pengutusan (Tempat Diutus) *
                </label>
                <select
                  value={formData.provinsi}
                  onChange={(e) => handleProvinsiChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-blue-500 text-xs font-medium"
                >
                  {DAFTAR_PROVINSI_INDONESIA.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* Requirement: Kategori wilayah cukup cantumkan: berkembang, mandiri, aktif, rintisan, tidak aktif */}
              <div>
                <label className="block text-xs font-semibold text-sky-300 mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Kategori Wilayah *</span>
                </label>
                <select
                  value={formData.kategoriWilayah}
                  onChange={(e) => setFormData({ ...formData, kategoriWilayah: e.target.value as KategoriWilayah })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-sky-600/80 rounded-lg text-white focus:outline-hidden focus:border-sky-400 text-xs font-semibold"
                >
                  {KATEGORI_WILAYAH_OPTIONS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Status perkembangan medan dakwah (Berkembang, Mandiri, Aktif, Rintisan, Tidak Aktif)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Penugasan Da'i *
                </label>
                <select
                  value={formData.statusTugas}
                  onChange={(e) => setFormData({ ...formData, statusTugas: e.target.value as StatusTugas })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-blue-500 text-xs"
                >
                  <option value="Aktif">Aktif Bertugas</option>
                  <option value="Persiapan">Persiapan Pemberangkatan</option>
                  <option value="Cuti / Istirahat">Cuti / Istirahat</option>
                  <option value="Selesai">Selesai Masa Tugas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Mulai Tugas
                </label>
                <input
                  type="date"
                  value={formData.tanggalMulaiTugas}
                  onChange={(e) => setFormData({ ...formData, tanggalMulaiTugas: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Catatan Khusus Da'i (Menggantikan alokasi dana operasional & tren jamaah binaan) */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-700 text-white font-bold text-[11px]">3</span>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Catatan Khusus Da'i</span>
              </h3>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Uraian Catatan Khusus, Karakteristik Wilayah &amp; Instruksi Lapangan
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan catatan khusus terkait da'i ini, misalnya: tantangan akses transportasi perahu/sungai, target perintisan TPQ, penguatan mualaf pedalaman, tokoh kunci lokal yang dirangkul, atau catatan koordinasi penting..."
                value={formData.catatanKhusus}
                onChange={(e) => setFormData({ ...formData, catatanKhusus: e.target.value })}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 text-xs leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 italic">
                * Catatan khusus ini menggantikan rincian alokasi dana dan data tren lama agar pengelolaan da'i lebih ringkas, fokus, dan relevan dengan kondisi riil di lapangan.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-blue-900/30 border border-blue-400/40 cursor-pointer"
            >
              {editingDai ? 'Simpan Perubahan' : 'Daftarkan Da\'i Utusan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
