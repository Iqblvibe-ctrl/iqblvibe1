export type KategoriWilayah = 
  | 'Berkembang'
  | 'Mandiri'
  | 'Aktif'
  | 'Rintisan'
  | 'Tidak Aktif'
  | '3T (Terdepan, Terluar, Tertinggal)'
  | 'Pedalaman / Suku Terpencil'
  | 'Perbatasan Antar Negara'
  | 'Pesisir & Kepulauan Terluar'
  | 'Urban / Komunitas Marjinal';

export type PulauWilayah = 
  | 'Sumatera'
  | 'Jawa'
  | 'Kalimantan'
  | 'Sulawesi'
  | 'Bali & Nusa Tenggara'
  | 'Maluku'
  | 'Papua';

export type StatusTugas = 'Aktif' | 'Persiapan' | 'Cuti / Istirahat' | 'Selesai';

export type StatusDana = 'Tersalurkan Penuh' | 'Tersalurkan Sebagian' | 'Menunggu Pencairan' | 'Butuh Donatur';

export interface RiwayatBulanan {
  bulan: string; // e.g. "Jul 2026", "Agt 2026", etc.
  jamaah: number;
  santriTPQ: number;
  danaTersalur: number;
  catatanKegiatan: string;
}

export interface AlokasiDana {
  honorKafalah: number; // Kafalah pokok da'i
  operasionalTransport: number; // Transportasi medan sulit (perahu, sewa motor trail, bbm)
  saranaDakwah: number; // Buku Iqro, Al-Qur'an, sound system portable, papan tulis
  tunjanganKesehatanLogistik: number; // Logistik sembako & perlengkapan P3K
  totalKebutuhanPerBulan: number;
  danaTersalurkan: number;
  statusPencairan: StatusDana;
  sumberDonatur: string; // nama yayasan, donatur tetap, zakat, infaq umum
  catatanDana?: string;
  rekeningBank?: string;
}

export interface TrenPerkembangan {
  jamaahAwal: number;
  jamaahKini: number;
  jumlahMualaf: number;
  jumlahSantriTPQ: number;
  frekuensiKajianMingguan: number;
  catatanProgresTerbaru: string;
  kendalaLapangan: string;
  riwayatBulanan: RiwayatBulanan[];
  terakhirUpdate: string;
}

export interface CapaianBinaan {
  kelompokTarbiyah: number;
  pesertaTarbiyah: number;
  kelompokHalaqahQuran: number;
  pesertaHalaqahQuran: number;
}

export interface CapaianKaryaUnggulan {
  pengajarQuran: number;
  murabbiDanCalon: number;
  pengurusDanCalon: number;
  camabaStiba: number;
  camabaSekolahDai: number;
}

export interface BeritaAktivitas {
  id: string;
  judul: string;
  daiNama: string;
  daiId?: string;
  provinsi: string;
  kabupaten: string;
  lokasi: string;
  tanggal: string;
  kategori: 'Pendidikan Al-Qur\'an' | 'Pembinaan Tarbiyah' | 'Karya Unggulan & Kaderisasi' | 'Muallaf Pedalaman' | 'Safari Dakwah' | 'Sosial & Logistik';
  ringkasan: string;
  isiLengkap: string;
  pesertaCount: number;
  fotoUrl?: string;
  statusVerifikasi: 'Terverifikasi' | 'Menunggu';
}

export interface DaiUtusan {
  id: string;
  nama: string;
  gelar?: string;
  telepon: string;
  asalDaerah: string; // Asal daerah / kota asal pengutus
  asalLembaga?: string; // Alumni Instansi / Lembaga pengutus (STIBA Makassar, Sekolah Da'i, DDII, dll)
  almamater?: string; // Almamater lulusan
  pulau: PulauWilayah;
  provinsi: string; // Provinsi tempat diutus
  kabupaten: string;
  kecamatan: string;
  titikDakwah: string; // Tempat pengutusan / titik dakwah
  kategoriWilayah: KategoriWilayah;
  tanggalMulaiTugas: string;
  durasiKontrakBulan: number;
  statusTugas: StatusTugas;
  programFokus: string[];
  catatanKhusus?: string; // Catatan khusus da'i
  dana: AlokasiDana;
  tren: TrenPerkembangan;
  capaianBinaan?: CapaianBinaan;
  karyaUnggulan?: CapaianKaryaUnggulan;
}

export interface FilterState {
  searchQuery: string;
  pulau: string;
  kategori: string;
  statusTugas: string;
  statusDana: string;
}

export interface TombolConfig {
  tampilkanAksiCepatDana: boolean;
  tampilkanAksiUpdateTren: boolean;
  tampilkanTombolCetak: boolean;
  tampilkanTombolEkspor: boolean;
  tampilkanFilterKategori: boolean;
  modeTampilanKompak: boolean;
}

export interface Korwil {
  id: string;
  kodeWilayah: string;
  namaWilayah: string;
  namaKoordinator: string;
  gelar: string;
  telepon: string;
  email: string;
  poskoInduk: string;
  provinsiCakupan: string[];
  jumlahDaiSupervisi: number;
  jumlahTitik3T: number;
  frekuensiLaporan: string;
  kanalKomunikasi: string;
  statusOperasional: 'Siaga Penuh' | 'Operasi Rutin' | 'Siaga Bencana Cuaca';
  fokusStrategis: string;
}
