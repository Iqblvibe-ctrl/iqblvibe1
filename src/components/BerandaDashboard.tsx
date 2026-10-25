import React, { useState, useMemo } from 'react';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Newspaper, 
  Shield, 
  ChevronRight, 
  Search, 
  Filter, 
  Building2, 
  Compass, 
  Flame, 
  Layers, 
  ArrowUpRight, 
  Plus, 
  X, 
  Share2, 
  Calendar, 
  Award, 
  HeartHandshake, 
  UserCheck, 
  BookMarked,
  Eye,
  Navigation,
  Lock
} from 'lucide-react';
import { DaiUtusan, BeritaAktivitas } from '../types/dai';
import { loadBeritaListFromStorage, saveBeritaListToStorage } from '../data/newsData';
import { ensureDaiMetrics } from '../data/initialData';

interface BerandaDashboardProps {
  daiList: DaiUtusan[];
  onSelectDai: (dai: DaiUtusan) => void;
  onNavigateToDatabase?: (filterPreset?: { status?: string; provinsi?: string; lembaga?: string }) => void;
  isAdmin?: boolean;
  onRequestAdminLogin?: () => void;
}

// Koordinat representatif provinsi di peta SVG Indonesia
interface ProvinceMarker {
  id: string;
  name: string;
  pulau: string;
  coords: { x: number; y: number };
}

const PROVINSI_MAP_COORDS: ProvinceMarker[] = [
  { id: 'Aceh', name: 'Aceh', pulau: 'Sumatera', coords: { x: 12, y: 25 } },
  { id: 'Sumatera Utara', name: 'Sumatera Utara', pulau: 'Sumatera', coords: { x: 15, y: 35 } },
  { id: 'Sumatera Barat', name: 'Sumatera Barat', pulau: 'Sumatera', coords: { x: 18, y: 52 } },
  { id: 'Riau', name: 'Riau', pulau: 'Sumatera', coords: { x: 22, y: 45 } },
  { id: 'Bengkulu', name: 'Bengkulu', pulau: 'Sumatera', coords: { x: 23, y: 65 } },
  { id: 'Sumatera Selatan', name: 'Sumatera Selatan', pulau: 'Sumatera', coords: { x: 26, y: 60 } },
  { id: 'DKI Jakarta', name: 'DKI Jakarta', pulau: 'Jawa', coords: { x: 30, y: 76 } },
  { id: 'Jawa Barat', name: 'Jawa Barat', pulau: 'Jawa', coords: { x: 34, y: 79 } },
  { id: 'Jawa Tengah', name: 'Jawa Tengah', pulau: 'Jawa', coords: { x: 39, y: 81 } },
  { id: 'Jawa Timur', name: 'Jawa Timur', pulau: 'Jawa', coords: { x: 44, y: 82 } },
  { id: 'Kalimantan Barat', name: 'Kalimantan Barat', pulau: 'Kalimantan', coords: { x: 38, y: 48 } },
  { id: 'Kalimantan Tengah', name: 'Kalimantan Tengah', pulau: 'Kalimantan', coords: { x: 45, y: 55 } },
  { id: 'Kalimantan Selatan', name: 'Kalimantan Selatan', pulau: 'Kalimantan', coords: { x: 50, y: 62 } },
  { id: 'Kalimantan Timur', name: 'Kalimantan Timur', pulau: 'Kalimantan', coords: { x: 53, y: 44 } },
  { id: 'Kalimantan Utara', name: 'Kalimantan Utara', pulau: 'Kalimantan', coords: { x: 50, y: 30 } },
  { id: 'Sulawesi Selatan', name: 'Sulawesi Selatan', pulau: 'Sulawesi', coords: { x: 61, y: 68 } },
  { id: 'Sulawesi Tengah', name: 'Sulawesi Tengah', pulau: 'Sulawesi', coords: { x: 64, y: 52 } },
  { id: 'Sulawesi Tenggara', name: 'Sulawesi Tenggara', pulau: 'Sulawesi', coords: { x: 66, y: 66 } },
  { id: 'Sulawesi Utara', name: 'Sulawesi Utara', pulau: 'Sulawesi', coords: { x: 68, y: 34 } },
  { id: 'Bali', name: 'Bali', pulau: 'Bali & Nusa Tenggara', coords: { x: 49, y: 86 } },
  { id: 'Nusa Tenggara Barat', name: 'Nusa Tenggara Barat', pulau: 'Bali & Nusa Tenggara', coords: { x: 54, y: 86 } },
  { id: 'Nusa Tenggara Timur', name: 'Nusa Tenggara Timur', pulau: 'Bali & Nusa Tenggara', coords: { x: 62, y: 85 } },
  { id: 'Maluku', name: 'Maluku', pulau: 'Maluku', coords: { x: 74, y: 62 } },
  { id: 'Maluku Utara', name: 'Maluku Utara', pulau: 'Maluku', coords: { x: 73, y: 40 } },
  { id: 'Papua', name: 'Papua', pulau: 'Papua', coords: { x: 88, y: 52 } },
  { id: 'Papua Barat', name: 'Papua Barat', pulau: 'Papua', coords: { x: 79, y: 50 } },
  { id: 'Papua Barat Daya', name: 'Papua Barat Daya', pulau: 'Papua', coords: { x: 76, y: 46 } },
  { id: 'Papua Pegunungan', name: 'Papua Pegunungan', pulau: 'Papua', coords: { x: 89, y: 60 } },
  { id: 'Papua Selatan', name: 'Papua Selatan', pulau: 'Papua', coords: { x: 91, y: 74 } },
  { id: 'Papua Tengah', name: 'Papua Tengah', pulau: 'Papua', coords: { x: 84, y: 58 } },
];

export function BerandaDashboard({
  daiList: rawDaiList,
  onSelectDai,
  onNavigateToDatabase,
  isAdmin = false,
  onRequestAdminLogin,
}: BerandaDashboardProps) {
  // Pastikan metrik binaan dan karya unggulan terhitung rapi pada tiap dai
  const daiList = useMemo(() => rawDaiList.map(ensureDaiMetrics), [rawDaiList]);

  // Section 1: Perhitungan Status Da'i
  const totalDai = daiList.length;
  const daiAktifList = useMemo(() => daiList.filter((d) => d.statusTugas === 'Aktif'), [daiList]);
  const daiNonAktifList = useMemo(() => daiList.filter((d) => d.statusTugas !== 'Aktif'), [daiList]);
  
  const daiPersiapanList = useMemo(() => daiList.filter((d) => d.statusTugas === 'Persiapan'), [daiList]);
  const daiCutiList = useMemo(() => daiList.filter((d) => d.statusTugas === 'Cuti / Istirahat'), [daiList]);
  const daiSelesaiList = useMemo(() => daiList.filter((d) => d.statusTugas === 'Selesai'), [daiList]);

  const persenAktif = totalDai > 0 ? Math.round((daiAktifList.length / totalDai) * 100) : 0;
  const persenNonAktif = totalDai > 0 ? Math.round((daiNonAktifList.length / totalDai) * 100) : 0;

  // Filter & Toggle Da'i Status List
  const [selectedStatusTab, setSelectedStatusTab] = useState<'semua' | 'aktif' | 'non-aktif'>('semua');

  // Section 2: Rekapan Provinsi
  const [searchProvinsi, setSearchProvinsi] = useState('');
  const provinsiStats = useMemo(() => {
    const map = new Map<string, { total: number; aktif: number; pulau: string; daies: DaiUtusan[] }>();
    daiList.forEach((dai) => {
      const prov = dai.provinsi || 'Belum Terdata';
      const existing = map.get(prov) || { total: 0, aktif: 0, pulau: dai.pulau || 'Lainnya', daies: [] };
      existing.total += 1;
      if (dai.statusTugas === 'Aktif') existing.aktif += 1;
      existing.daies.push(dai);
      map.set(prov, existing);
    });

    const list = Array.from(map.entries()).map(([provinsi, data]) => ({
      provinsi,
      ...data,
    }));

    list.sort((a, b) => b.total - a.total || a.provinsi.localeCompare(b.provinsi));
    return list;
  }, [daiList]);

  const filteredProvinsi = useMemo(() => {
    if (!searchProvinsi) return provinsiStats;
    return provinsiStats.filter((p) => p.provinsi.toLowerCase().includes(searchProvinsi.toLowerCase()));
  }, [provinsiStats, searchProvinsi]);

  const [selectedProvinsiDetail, setSelectedProvinsiDetail] = useState<string | null>(null);

  // Section 3: Rekapan Lulusan / Instansi Pengutus
  const instansiStats = useMemo(() => {
    const map = new Map<string, { total: number; aktif: number; daies: DaiUtusan[] }>();
    daiList.forEach((dai) => {
      const instansi = dai.asalLembaga || dai.almamater || 'Lainnya';
      const existing = map.get(instansi) || { total: 0, aktif: 0, daies: [] };
      existing.total += 1;
      if (dai.statusTugas === 'Aktif') existing.aktif += 1;
      existing.daies.push(dai);
      map.set(instansi, existing);
    });

    const list = Array.from(map.entries()).map(([instansi, data]) => ({
      instansi,
      ...data,
      persen: totalDai > 0 ? Math.round((data.total / totalDai) * 100) : 0,
    }));

    list.sort((a, b) => b.total - a.total);
    return list;
  }, [daiList, totalDai]);

  const [selectedInstansiDetail, setSelectedInstansiDetail] = useState<string | null>(null);

  // Section 4: Peta Persebaran Interaktif
  const [activeMapPin, setActiveMapPin] = useState<string | null>(null);
  const [selectedMapPulau, setSelectedMapPulau] = useState<string>('Semua');

  // Section 5: Capaian Binaan
  const capaianBinaanTotal = useMemo(() => {
    let kelompokTarbiyah = 0;
    let pesertaTarbiyah = 0;
    let kelompokHalaqahQuran = 0;
    let pesertaHalaqahQuran = 0;

    daiList.forEach((d) => {
      if (d.capaianBinaan) {
        kelompokTarbiyah += d.capaianBinaan.kelompokTarbiyah;
        pesertaTarbiyah += d.capaianBinaan.pesertaTarbiyah;
        kelompokHalaqahQuran += d.capaianBinaan.kelompokHalaqahQuran;
        pesertaHalaqahQuran += d.capaianBinaan.pesertaHalaqahQuran;
      }
    });

    return {
      kelompokTarbiyah,
      pesertaTarbiyah,
      kelompokHalaqahQuran,
      pesertaHalaqahQuran,
      totalKelompok: kelompokTarbiyah + kelompokHalaqahQuran,
      totalPeserta: pesertaTarbiyah + pesertaHalaqahQuran,
      avgPesertaTarbiyah: kelompokTarbiyah > 0 ? (pesertaTarbiyah / kelompokTarbiyah).toFixed(1) : '0',
      avgPesertaHalaqah: kelompokHalaqahQuran > 0 ? (pesertaHalaqahQuran / kelompokHalaqahQuran).toFixed(1) : '0',
    };
  }, [daiList]);

  // Section 6: Capaian Karya Unggulan
  const karyaUnggulanTotal = useMemo(() => {
    let pengajarQuran = 0;
    let murabbiDanCalon = 0;
    let pengurusDanCalon = 0;
    let camabaStiba = 0;
    let camabaSekolahDai = 0;

    daiList.forEach((d) => {
      if (d.karyaUnggulan) {
        pengajarQuran += d.karyaUnggulan.pengajarQuran;
        murabbiDanCalon += d.karyaUnggulan.murabbiDanCalon;
        pengurusDanCalon += d.karyaUnggulan.pengurusDanCalon;
        camabaStiba += d.karyaUnggulan.camabaStiba;
        camabaSekolahDai += d.karyaUnggulan.camabaSekolahDai;
      }
    });

    const totalKader = pengajarQuran + murabbiDanCalon + pengurusDanCalon + camabaStiba + camabaSekolahDai;

    return {
      pengajarQuran,
      murabbiDanCalon,
      pengurusDanCalon,
      camabaStiba,
      camabaSekolahDai,
      totalKader,
    };
  }, [daiList]);

  // Section 7: Berita Berita Aktivitas Da'i
  const [beritaList, setBeritaList] = useState<BeritaAktivitas[]>(() => loadBeritaListFromStorage());
  const [selectedKategoriBerita, setSelectedKategoriBerita] = useState<string>('Semua');
  const [searchBerita, setSearchBerita] = useState('');
  const [selectedBeritaDetail, setSelectedBeritaDetail] = useState<BeritaAktivitas | null>(null);

  // Modal Tambah Berita
  const [isAddBeritaOpen, setIsAddBeritaOpen] = useState(false);
  const [newJudul, setNewJudul] = useState('');
  const [newDaiNama, setNewDaiNama] = useState(daiList[0]?.nama || '');
  const [newProvinsi, setNewProvinsi] = useState(daiList[0]?.provinsi || 'Papua');
  const [newKabupaten, setNewKabupaten] = useState('');
  const [newLokasi, setNewLokasi] = useState('');
  const [newKategori, setNewKategori] = useState<BeritaAktivitas['kategori']>('Pendidikan Al-Qur\'an');
  const [newRingkasan, setNewRingkasan] = useState('');
  const [newIsiLengkap, setNewIsiLengkap] = useState('');
  const [newPeserta, setNewPeserta] = useState<number>(30);

  const handleAddBeritaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudul.trim() || !newRingkasan.trim()) return;

    const newArticle: BeritaAktivitas = {
      id: `berita-${Date.now()}`,
      judul: newJudul.trim(),
      daiNama: newDaiNama,
      provinsi: newProvinsi,
      kabupaten: newKabupaten || 'Wilayah Penugasan 3T',
      lokasi: newLokasi || 'Posko Dakwah',
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      kategori: newKategori,
      ringkasan: newRingkasan.trim(),
      isiLengkap: newIsiLengkap.trim() || newRingkasan.trim(),
      pesertaCount: Number(newPeserta) || 25,
      fotoUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80',
      statusVerifikasi: 'Terverifikasi',
    };

    const updated = [newArticle, ...beritaList];
    setBeritaList(updated);
    saveBeritaListToStorage(updated);
    setIsAddBeritaOpen(false);

    // Reset Form
    setNewJudul('');
    setNewRingkasan('');
    setNewIsiLengkap('');
  };

  const filteredBerita = useMemo(() => {
    return beritaList.filter((b) => {
      const matchKategori = selectedKategoriBerita === 'Semua' || b.kategori === selectedKategoriBerita;
      const matchSearch = 
        !searchBerita || 
        b.judul.toLowerCase().includes(searchBerita.toLowerCase()) || 
        b.daiNama.toLowerCase().includes(searchBerita.toLowerCase()) ||
        b.provinsi.toLowerCase().includes(searchBerita.toLowerCase());
      return matchKategori && matchSearch;
    });
  }, [beritaList, selectedKategoriBerita, searchBerita]);

  return (
    <div className="space-y-12">
      {/* ============================================================== */}
      {/* HEADER UTAMA BERANDA: DASHBOARD REKAPAN DA'I UTUSAN            */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/70 to-slate-900 border border-blue-900/60 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-600/80 text-blue-200 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>DASHBOARD REKAPAN NASIONAL DA'I UTUSAN INDONESIA</span>
              <span className="text-blue-500">·</span>
              <span className="text-emerald-300 font-mono">KOMANDO 3T</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
              Rekapitulasi Kinerja &amp; Sebaran Da'i Nusantara
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ringkasan komprehensif data formasi da'i, sebaran wilayah 3T nusantara, almamater utusan, capaian binaan tarbiyah &amp; halaqah Qur'an, karya unggulan kaderisasi, serta warta aktivitas dakwah lapangan.
            </p>
          </div>

          {/* Quick Metrics Badge in Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Total Da'i</span>
              <span className="text-2xl font-black text-white font-mono">{totalDai}</span>
              <span className="text-[10px] text-blue-400 block font-semibold">{persenAktif}% Aktif</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Provinsi Terjangkau</span>
              <span className="text-2xl font-black text-sky-400 font-mono">{provinsiStats.length}</span>
              <span className="text-[10px] text-slate-400 block">Titik Penugasan</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Total Binaan</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{capaianBinaanTotal.totalPeserta}</span>
              <span className="text-[10px] text-emerald-300 block">{capaianBinaanTotal.totalKelompok} Kelompok</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Karya Unggulan</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{karyaUnggulanTotal.totalKader}</span>
              <span className="text-[10px] text-amber-300 block">Kader Tercetak</span>
            </div>
          </div>
        </div>

        {/* Anchor Navigation Pills */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-medium mr-1 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Rekapan:
          </span>
          <a
            href="#rekapan-status"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-500 text-slate-200 transition whitespace-nowrap"
          >
            1. Status Da'i
          </a>
          <a
            href="#rekapan-provinsi"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-500 text-slate-200 transition whitespace-nowrap"
          >
            2. Provinsi
          </a>
          <a
            href="#rekapan-lulusan"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-500 text-slate-200 transition whitespace-nowrap"
          >
            3. Lulusan Instansi
          </a>
          <a
            href="#rekapan-peta"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-500 text-slate-200 transition whitespace-nowrap"
          >
            4. Peta Sebaran
          </a>
          <a
            href="#rekapan-binaan"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-500 text-slate-200 transition whitespace-nowrap"
          >
            5. Capaian Binaan
          </a>
          <a
            href="#rekapan-karya"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-500 text-slate-200 transition whitespace-nowrap"
          >
            6. Karya Unggulan
          </a>
          <a
            href="#rekapan-berita"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-500 text-slate-200 transition whitespace-nowrap"
          >
            7. Warta Aktivitas
          </a>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 1. REKAPAN JUMLAH DA'I UTUSAN: AKTIF DAN TIDAK AKTIF          */}
      {/* ============================================================== */}
      <section id="rekapan-status" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Rekapan Jumlah Da'i Utusan (Aktif &amp; Tidak Aktif)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Statistik kesiapan personel da'i bertugas di medan dakwah 3T nusantara.
            </p>
          </div>

          {/* Tab Filter Da'i List Preview */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedStatusTab('semua')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                selectedStatusTab === 'semua' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({totalDai})
            </button>
            <button
              onClick={() => setSelectedStatusTab('aktif')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                selectedStatusTab === 'aktif' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Aktif ({daiAktifList.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('non-aktif')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                selectedStatusTab === 'non-aktif' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tidak Aktif ({daiNonAktifList.length})
            </button>
          </div>
        </div>

        {/* 3 Kotak Utama Status Da'i */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Da'i Utusan */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Da'i Utusan</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">{totalDai}</span>
                  <span className="text-xs text-slate-400 font-semibold">Da'i Terdata</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-900/50 border border-blue-700/50 flex items-center justify-center text-blue-300">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Cakupan Nasional:</span>
              <strong className="text-blue-300 font-mono">{provinsiStats.length} Provinsi</strong>
            </div>
          </div>

          {/* Card 2: Da'i Aktif */}
          <div className="bg-slate-900/90 rounded-2xl border border-emerald-900/60 p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Da'i Aktif Bertugas</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-emerald-300 font-mono">{daiAktifList.length}</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">({persenAktif}%)</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-600/50 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Status Operasional:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                Siaga di Garis Depan
              </span>
            </div>
          </div>

          {/* Card 3: Da'i Tidak Aktif / Non-Aktif */}
          <div className="bg-slate-900/90 rounded-2xl border border-amber-900/60 p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Da'i Tidak Aktif (Non-Aktif)</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono">{daiNonAktifList.length}</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">({persenNonAktif}%)</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-900/40 border border-amber-600/50 flex items-center justify-center text-amber-300">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-1">
              <span className="text-slate-400">Rincian:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Persiapan: <strong>{daiPersiapanList.length}</strong>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Cuti: <strong>{daiCutiList.length}</strong>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Selesai: <strong>{daiSelesaiList.length}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rekapitulasi Formasi Sebaran Wilayah Kepulauan (Tanpa Menampilkan Nama Da'i) */}
        <div className="bg-slate-900/70 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Rekapan Formasi Wilayah Kepulauan Indonesia ({totalDai} Da'i Utusan):</span>
            </span>
            {onNavigateToDatabase && (
              <button
                onClick={() => {
                  if (isAdmin) {
                    onNavigateToDatabase();
                  } else if (onRequestAdminLogin) {
                    onRequestAdminLogin();
                  }
                }}
                className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{isAdmin ? 'Buka di Database Penuh' : 'Database Penuh (Admin)'}</span>
                {isAdmin ? <ArrowUpRight className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              'Sumatera',
              'Jawa',
              'Kalimantan',
              'Sulawesi',
              'Bali & Nusa Tenggara',
              'Maluku',
              'Papua'
            ].map((pulau) => {
              const countTotal = daiList.filter((d) => d.pulau === pulau).length;
              const countAktif = daiList.filter((d) => d.pulau === pulau && d.statusTugas === 'Aktif').length;
              const persenPulau = totalDai > 0 ? Math.round((countTotal / totalDai) * 100) : 0;

              return (
                <div
                  key={pulau}
                  className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/90 flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{pulau}</h4>
                      <span className="text-[10px] text-slate-400 block font-medium">Zona Kepulauan</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-blue-300 font-mono">{countTotal}</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">Da'i</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.round((countTotal / (daiList.length || 1)) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-emerald-400 font-semibold">{countAktif} Aktif</span>
                      <span>{persenPulau}% Total</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. REKAPAN JUMLAH DA'I BERDASARKAN PROVINSI                    */}
      {/* ============================================================== */}
      <section id="rekapan-provinsi" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Rekapan Jumlah Da'i Berdasarkan Provinsi
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Distribusi penempatan da'i di {provinsiStats.length} provinsi di seluruh wilayah Indonesia.
            </p>
          </div>

          {/* Search Box Provinsi */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari provinsi..."
              value={searchProvinsi}
              onChange={(e) => setSearchProvinsi(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Grid List Provinsi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProvinsi.map((item, idx) => {
            const maxVal = provinsiStats[0]?.total || 1;
            const barWidth = Math.min(100, Math.round((item.total / maxVal) * 100));

            return (
              <div
                key={item.provinsi}
                className="bg-slate-900/80 rounded-xl border border-slate-800 hover:border-blue-600/70 p-4 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-tight">{item.provinsi}</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 ml-6 block">{item.pulau}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white font-mono">{item.total}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Da'i</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.aktif} Aktif Bertugas</span>
                    <span>{Math.round((item.total / totalDai) * 100)}% dari Total</span>
                  </div>
                </div>

                {/* Info Rincian Provinsi (Tanpa Menampilkan Nama Da'i) */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{item.total} Titik Penugasan</span>
                  </div>
                  {onNavigateToDatabase && (
                    <button
                      onClick={() => {
                        if (isAdmin) {
                          onNavigateToDatabase({ provinsi: item.provinsi });
                        } else if (onRequestAdminLogin) {
                          onRequestAdminLogin();
                        }
                      }}
                      className="text-blue-400 hover:text-blue-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAdmin ? 'Filter DB' : 'Buka DB (Admin)'}</span>
                      {isAdmin ? <span>&rarr;</span> : <Lock className="w-3 h-3 text-slate-500" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. DA'I LULUSAN INSTANSI ATAU UTUSAN MANA                      */}
      {/* ============================================================== */}
      <section id="rekapan-lulusan" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Rekapan Da'i Lulusan Instansi &amp; Lembaga Utusan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Rekapitulasi latar belakang almamater kampus dakwah, ma'had, dan lembaga pengutus da'i ke wilayah 3T.
            </p>
          </div>
        </div>

        {/* Instansi Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instansiStats.map((item) => (
            <div
              key={item.instansi}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-blue-600 p-5 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-700/60 flex items-center justify-center text-blue-300">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{item.instansi}</h3>
                      <span className="text-[11px] text-slate-400">Almamater / Pengutus</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white font-mono">{item.total}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Da'i</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full"
                      style={{ width: `${item.persen}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.aktif} Aktif Lapangan</span>
                    <strong className="text-blue-400 font-mono">{item.persen}% dari Total</strong>
                  </div>
                </div>
              </div>

              {/* Ringkasan Kontribusi Almamater (Tanpa Menampilkan Nama Da'i) */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Total Kader Utusan: <strong className="text-white font-mono">{item.total} Da'i</strong></span>
                <span className="text-emerald-400 font-semibold">{item.aktif} Aktif Lapangan</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. PETA PERSEBARAN DA'I DI SETIAP PROVINSI                    */}
      {/* ============================================================== */}
      <section id="rekapan-peta" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Peta Persebaran Da'i di Setiap Provinsinya
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Visualisasi geografis penempatan da'i di 38 provinsi kepulauan nusantara.
            </p>
          </div>

          {/* Filter Pulau */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['Semua', 'Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Bali & Nusa Tenggara', 'Maluku', 'Papua'].map((pulau) => (
              <button
                key={pulau}
                onClick={() => setSelectedMapPulau(pulau)}
                className={`px-2.5 py-1 rounded-md font-semibold transition whitespace-nowrap ${
                  selectedMapPulau === pulau
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {pulau}
              </button>
            ))}
          </div>
        </div>

        {/* Peta Interaktif Nusantara Card */}
        <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-4 sm:p-6 relative overflow-hidden shadow-xl">
          {/* Status Overlay */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
              <span className="font-semibold text-slate-300">Peta Radar Sebaran Da'i Komando 3T</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span>Provinsi Terisi Da'i</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
                <span>Belum Terdata</span>
              </span>
            </div>
          </div>

          {/* SVG PETA NUSANTARA INTERAKTIF */}
          <div className="relative w-full aspect-[2/1] min-h-[320px] max-h-[500px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
            {/* Background Grid Coordinates */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                backgroundSize: '4% 8%',
              }}
            />

            {/* SVG Kepulauan Indonesia Outline */}
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full object-contain select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Garis Khatulistiwa */}
              <line x1="0" y1="230" x2="1000" y2="230" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
              <text x="15" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">EKUATOR 0°00'00"</text>

              {/* Pulau Sumatera */}
              <path
                d="M100,100 L160,80 L230,190 L260,260 L240,310 L200,340 L160,270 L120,200 Z"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Pulau Jawa */}
              <path
                d="M260,370 L480,390 L490,415 L320,405 L260,385 Z"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Pulau Kalimantan */}
              <path
                d="M360,140 L490,130 L540,190 L530,290 L460,310 L390,290 L360,210 Z"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Pulau Sulawesi */}
              <path
                d="M600,160 L680,165 L660,230 L610,240 L650,290 L670,340 L620,335 L590,260 Z"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Bali & Nusa Tenggara */}
              <path
                d="M500,410 L540,415 L620,415 L680,410 L680,425 L500,425 Z"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Maluku */}
              <path
                d="M710,180 L760,190 L740,250 L770,310 L720,310 Z"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Papua */}
              <path
                d="M760,240 L820,210 L890,240 L970,260 L960,390 L880,390 L820,330 L760,270 Z"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.8"
              />
            </svg>

            {/* Interactive Pins on Map */}
            {PROVINSI_MAP_COORDS.map((marker) => {
              const provStat = provinsiStats.find((p) => p.provinsi.toLowerCase() === marker.name.toLowerCase());
              const count = provStat?.total || 0;
              const hasDai = count > 0;

              // Filter pulau jika dipilih
              if (selectedMapPulau !== 'Semua' && marker.pulau !== selectedMapPulau) {
                return null;
              }

              return (
                <div
                  key={marker.id}
                  style={{ left: `${marker.coords.x}%`, top: `${marker.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                >
                  <button
                    onClick={() => setActiveMapPin(activeMapPin === marker.id ? null : marker.id)}
                    className={`relative flex items-center justify-center transition-transform hover:scale-125 focus:outline-hidden ${
                      hasDai ? 'cursor-pointer' : 'opacity-60 cursor-default'
                    }`}
                  >
                    {/* Pulsing ring for provinces with Da'i */}
                    {hasDai && (
                      <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-60"></span>
                    )}

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow-lg border transition ${
                        hasDai
                          ? activeMapPin === marker.id
                            ? 'bg-amber-500 border-amber-300 text-slate-950 scale-125 ring-2 ring-amber-400'
                            : 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {count}
                    </div>
                  </button>

                  {/* Tooltip on Hover / Click */}
                  <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 z-30 ${
                    activeMapPin === marker.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                  }`}>
                    <div className="bg-slate-900 border border-blue-500 text-white rounded-lg p-2.5 shadow-2xl text-left whitespace-nowrap min-w-[140px]">
                      <div className="text-xs font-bold text-blue-300">{marker.name}</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {hasDai ? (
                          <>
                            <strong className="text-white font-mono">{count}</strong> Da'i Utusan
                            <span className="text-emerald-400 text-[10px] block">({provStat?.aktif || 0} Aktif)</span>
                          </>
                        ) : (
                          <span className="text-slate-500">Belum ada penugasan</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel Info Provinsi yang Sedang Aktif di Peta */}
          {activeMapPin && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-blue-600/80 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                    Provinsi {activeMapPin}
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Daftar da'i yang bertugas di posko dan pedalaman wilayah {activeMapPin}:
                </p>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {provinsiStats
                    .find((p) => p.provinsi.toLowerCase() === activeMapPin.toLowerCase())
                    ?.daies.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => onSelectDai(d)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition"
                      >
                        <span className="font-semibold">{d.nama}</span>
                        <span className="text-[10px] text-blue-400 font-mono">({d.titikDakwah})</span>
                      </button>
                    )) || (
                    <span className="text-xs text-slate-500">Tidak ada da'i yang terdata di provinsi ini.</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveMapPin(null)}
                className="self-end sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-semibold"
              >
                Tutup Pin
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. CAPAIAN BINAAN DA'I (TARBIYAH & HALAQAH QUR'AN)            */}
      {/* ============================================================== */}
      <section id="rekapan-binaan" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Capaian Binaan Da'i (Tarbiyah &amp; Halaqah Qur'an)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Rekapitulasi kelompok binaan tarbiyah berkesinambungan dan lingkaran halaqah Al-Qur'an nusantara.
            </p>
          </div>
        </div>

        {/* 2 Kotak Pilar Binaan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pilar 1: Binaan Tarbiyah */}
          <div className="bg-slate-900/90 rounded-2xl border border-blue-900/70 p-6 space-y-5 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>KADERISASI BERJENJANG</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Capaian Binaan Tarbiyah</h3>
                <p className="text-xs text-slate-400">Pembinaan akidah, ibadah fardhu, dan akhlak berkesinambungan.</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-900/40 border border-blue-600/50 flex items-center justify-center text-blue-300">
                <HeartHandshake className="w-6 h-6" />
              </div>
            </div>

            {/* Stat Tarbiyah */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block">Kelompok Tarbiyah</span>
                <span className="text-3xl font-black text-white font-mono mt-1 block">
                  {capaianBinaanTotal.kelompokTarbiyah}
                </span>
                <span className="text-[10px] text-blue-400 block font-semibold mt-1">Lingkaran Aktif</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block">Total Peserta Tarbiyah</span>
                <span className="text-3xl font-black text-blue-400 font-mono mt-1 block">
                  {capaianBinaanTotal.pesertaTarbiyah}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold mt-1">
                  Rata-rata {capaianBinaanTotal.avgPesertaTarbiyah} org/kelompok
                </span>
              </div>
            </div>

            {/* Jenjang Pembinaan Visual */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Distribusi Jenjang Marhalah:</span>
                <span className="text-blue-400 font-mono text-[11px]">100% Terstruktur</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Ta'rif (Pemula)</span>
                  <strong className="text-white font-mono text-sm">62%</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Takwin (Kader)</span>
                  <strong className="text-white font-mono text-sm">28%</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tanfidz (Pelaksana)</span>
                  <strong className="text-white font-mono text-sm">10%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Pilar 2: Binaan Halaqah Qur'an */}
          <div className="bg-slate-900/90 rounded-2xl border border-emerald-900/70 p-6 space-y-5 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>LITERASI KITABULLAH</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Capaian Binaan Halaqah Qur'an</h3>
                <p className="text-xs text-slate-400">Pemberantasan buta aksara hijaiyah, tahsin, dan hafalan juz amma.</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-600/50 flex items-center justify-center text-emerald-300">
                <BookMarked className="w-6 h-6" />
              </div>
            </div>

            {/* Stat Halaqah */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block">Kelompok Halaqah Qur'an</span>
                <span className="text-3xl font-black text-white font-mono mt-1 block">
                  {capaianBinaanTotal.kelompokHalaqahQuran}
                </span>
                <span className="text-[10px] text-emerald-400 block font-semibold mt-1">Halaqah Berjalan</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block">Total Santri &amp; Jamaah</span>
                <span className="text-3xl font-black text-emerald-400 font-mono mt-1 block">
                  {capaianBinaanTotal.pesertaHalaqahQuran}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold mt-1">
                  Rata-rata {capaianBinaanTotal.avgPesertaHalaqah} org/halaqah
                </span>
              </div>
            </div>

            {/* Capaian Tingkatan Qur'an */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Capaian Kemampuan Membaca:</span>
                <span className="text-emerald-400 font-mono text-[11px]">TPQ &amp; Dewasa</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Iqra / Dirosa</span>
                  <strong className="text-white font-mono text-sm">54%</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tahsin Al-Qur'an</span>
                  <strong className="text-white font-mono text-sm">31%</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tahfidz Juz 'Amma</span>
                  <strong className="text-white font-mono text-sm">15%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. CAPAIAN KARYA UNGGULAN DA'I                                 */}
      {/* ============================================================== */}
      <section id="rekapan-karya" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
                6
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Capaian Karya Unggulan Kaderisasi Da'i
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Rekapitulasi 5 indikator karya unggulan mencetak kader dakwah mandiri di pedalaman &amp; perbatasan.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-bold">
            Total {karyaUnggulanTotal.totalKader} Kader Telah Dicetak
          </div>
        </div>

        {/* 5 Kartu Karya Unggulan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Pengajar Qur'an */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500 p-4 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pengajar Qur'an</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Kader lokal mandiri mengajar Al-Qur'an</p>
            </div>
            <div>
              <span className="text-3xl font-black text-emerald-400 font-mono block">
                {karyaUnggulanTotal.pengajarQuran}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Kader Mu'allim</span>
            </div>
          </div>

          {/* 2. Murabbi / Calon Murabbi */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-blue-500 p-4 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-2">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Murabbi / Calon</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Pembina lingkaran tarbiyah baru</p>
            </div>
            <div>
              <span className="text-3xl font-black text-blue-400 font-mono block">
                {karyaUnggulanTotal.murabbiDanCalon}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Kader Pembina</span>
            </div>
          </div>

          {/* 3. Pengurus / Calon Pengurus */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-indigo-500 p-4 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 mb-2">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pengurus / Calon</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Pengurus DKM &amp; posko dakwah</p>
            </div>
            <div>
              <span className="text-3xl font-black text-indigo-400 font-mono block">
                {karyaUnggulanTotal.pengurusDanCalon}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Kader Pengurus</span>
            </div>
          </div>

          {/* 4. Camaba STIBA */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-sky-500 p-4 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 mb-2">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Camaba STIBA</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Calon mahasiswa kuliah ke STIBA</p>
            </div>
            <div>
              <span className="text-3xl font-black text-sky-400 font-mono block">
                {karyaUnggulanTotal.camabaStiba}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Kader Dikirim</span>
            </div>
          </div>

          {/* 5. Camaba Sekolah Da'i */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500 p-4 transition flex flex-col justify-between space-y-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Camaba Sekolah Da'i</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Calon santri kader Sekolah Da'i</p>
            </div>
            <div>
              <span className="text-3xl font-black text-amber-400 font-mono block">
                {karyaUnggulanTotal.camabaSekolahDai}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Kader Dikirim</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. BERITA BERITA AKTIVITAS DA'I DALAM KEGIATAN DAKWAHNYA        */}
      {/* ============================================================== */}
      <section id="rekapan-berita" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
                7
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Warta &amp; Berita Aktivitas Da'i Lapangan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kabar terkini kegiatan dakwah langsung dari garis depan pedalaman dan kepulauan terluar.
            </p>
          </div>

          {/* Action: Tambah Berita Baru */}
          <button
            onClick={() => {
              if (isAdmin) {
                setIsAddBeritaOpen(true);
              } else if (onRequestAdminLogin) {
                onRequestAdminLogin();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 rounded-lg transition border border-blue-500 shadow-sm self-start sm:self-auto cursor-pointer"
          >
            {isAdmin ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-blue-200" />}
            <span>{isAdmin ? '+ Tulis Laporan Aktivitas' : 'Login Admin untuk Tulis Warta'}</span>
          </button>
        </div>

        {/* Filter Kategori Berita & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 md:pb-0">
            {['Semua', 'Pendidikan Al-Qur\'an', 'Pembinaan Tarbiyah', 'Karya Unggulan & Kaderisasi'].map((kat) => (
              <button
                key={kat}
                onClick={() => setSelectedKategoriBerita(kat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedKategoriBerita === kat
                    ? 'bg-blue-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berita atau da'i..."
              value={searchBerita}
              onChange={(e) => setSearchBerita(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Feed Berita Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBerita.map((item) => (
            <article
              key={item.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-blue-600 transition flex flex-col justify-between overflow-hidden group shadow-md"
            >
              {/* Image banner */}
              {item.fotoUrl && (
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.fotoUrl}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  
                  {/* Category Pill on Image */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-blue-900/90 backdrop-blur-md text-white border border-blue-600 text-[10px] font-bold tracking-wide uppercase">
                      {item.kategori}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.tanggal}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                      <Users className="w-3 h-3" />
                      {item.pesertaCount} Hadir
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>{item.lokasi}, {item.provinsi}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition line-clamp-2 leading-snug">
                    {item.judul}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {item.ringkasan}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <div className="w-7 h-7 rounded-full bg-blue-900 border border-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {item.daiNama.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-300 font-semibold truncate">
                      {item.daiNama}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedBeritaDetail(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold transition shrink-0 cursor-pointer"
                  >
                    <span>Baca</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* MODAL 1: BACA BERITA DETAIL                                    */}
      {/* ============================================================== */}
      {selectedBeritaDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              <img
                src={selectedBeritaDetail.fotoUrl}
                alt={selectedBeritaDetail.judul}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedBeritaDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white transition border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="px-3 py-1 rounded-md bg-blue-900 text-white text-xs font-bold border border-blue-600">
                  {selectedBeritaDetail.kategori}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-blue-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedBeritaDetail.lokasi}, {selectedBeritaDetail.provinsi}
                </span>
                <span>{selectedBeritaDetail.tanggal}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {selectedBeritaDetail.judul}
              </h2>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center font-bold text-white shrink-0">
                  {selectedBeritaDetail.daiNama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white">{selectedBeritaDetail.daiNama}</div>
                  <div className="text-[11px] text-slate-400">Da'i Pelapor Aktivitas Lapangan</div>
                </div>
                <div className="ml-auto text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                    {selectedBeritaDetail.pesertaCount} Jamaah Hadir
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line pt-2">
                {selectedBeritaDetail.isiLengkap}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
              <button
                onClick={() => setSelectedBeritaDetail(null)}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition"
              >
                Tutup Warta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: TULIS LAPORAN BERITA BARU                             */}
      {/* ============================================================== */}
      {isAddBeritaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Kirim Laporan Aktivitas Dakwah Baru</h3>
              </div>
              <button
                onClick={() => setIsAddBeritaOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBeritaSubmit} className="p-5 space-y-4 flex-1 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul Laporan / Warta</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Peresmian 2 Kelompok Tarbiyah Baru & Pembagian Iqra"
                  value={newJudul}
                  onChange={(e) => setNewJudul(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Da'i Pelapor</label>
                  <select
                    value={newDaiNama}
                    onChange={(e) => setNewDaiNama(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    {daiList.map((d) => (
                      <option key={d.id} value={d.nama}>
                        {d.nama} ({d.provinsi})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Aktivitas</label>
                  <select
                    value={newKategori}
                    onChange={(e) => setNewKategori(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="Pendidikan Al-Qur'an">Pendidikan Al-Qur'an</option>
                    <option value="Pembinaan Tarbiyah">Pembinaan Tarbiyah</option>
                    <option value="Karya Unggulan & Kaderisasi">Karya Unggulan &amp; Kaderisasi</option>
                    <option value="Muallaf Pedalaman">Muallaf Pedalaman</option>
                    <option value="Safari Dakwah">Safari Dakwah</option>
                    <option value="Sosial & Logistik">Sosial &amp; Logistik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Provinsi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Papua"
                    value={newProvinsi}
                    onChange={(e) => setNewProvinsi(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kabupaten</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jayawijaya"
                    value={newKabupaten}
                    onChange={(e) => setNewKabupaten(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Peserta Hadir</label>
                  <input
                    type="number"
                    min="1"
                    value={newPeserta}
                    onChange={(e) => setNewPeserta(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lokasi Posko / Titik Spesifik</label>
                <input
                  type="text"
                  placeholder="Contoh: Dusun Rogdok, Desa Siberut Selatan"
                  value={newLokasi}
                  onChange={(e) => setNewLokasi(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ringkasan Berita</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tuliskan 1-2 kalimat ringkasan kegiatan dakwah..."
                  value={newRingkasan}
                  onChange={(e) => setNewRingkasan(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Laporan Lengkap &amp; Catatan Perkembangan</label>
                <textarea
                  rows={4}
                  placeholder="Uraikan detail perkembangan binaan, respons masyarakat, serta evaluasi lapangan..."
                  value={newIsiLengkap}
                  onChange={(e) => setNewIsiLengkap(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBeritaOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-bold"
                >
                  Publikasikan Warta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
