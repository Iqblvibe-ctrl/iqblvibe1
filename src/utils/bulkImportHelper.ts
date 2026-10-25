import { DaiUtusan, Korwil, PulauWilayah, KategoriWilayah, StatusTugas } from '../types/dai';

// Determine island by province
export function getPulauFromProvinsi(prov: string): PulauWilayah {
  const p = prov.toLowerCase();
  if (p.includes('aceh') || p.includes('sumatera') || p.includes('riau') || p.includes('jambi') || p.includes('bengkulu') || p.includes('lampung') || p.includes('bangka')) {
    return 'Sumatera';
  }
  if (p.includes('jakarta') || p.includes('jawa') || p.includes('banten') || p.includes('yogyakarta')) {
    return 'Jawa';
  }
  if (p.includes('kalimantan')) {
    return 'Kalimantan';
  }
  if (p.includes('sulawesi') || p.includes('gorontalo')) {
    return 'Sulawesi';
  }
  if (p.includes('bali') || p.includes('nusa tenggara') || p.includes('ntb') || p.includes('ntt')) {
    return 'Bali & Nusa Tenggara';
  }
  if (p.includes('maluku')) {
    return 'Maluku';
  }
  if (p.includes('papua')) {
    return 'Papua';
  }
  return 'Sumatera';
}

// Download Da'i CSV Template
export function downloadDaiCsvTemplate() {
  const headers = [
    'Nama Da\'i',
    'Gelar (Opsional)',
    'Tempat Pengutusan (Titik/Dusun & Kabupaten)',
    'Provinsi Pengutusan (Tempat Diutus)',
    'Asal Daerah (Kota/Provinsi Asal Da\'i)',
    'Kategori Wilayah (3T/Pedalaman/Perbatasan/Pesisir)',
    'Telepon',
    'Status Tugas (Aktif/Persiapan/Cuti)',
    'Kafalah Bulanan (Rp)',
  ];

  const sampleRows = [
    [
      'Ustadz Abdullah Pratama',
      'S.Pd.I',
      'Dusun Taileleu, Kepulauan Mentawai',
      'Sumatera Barat',
      'Padang, Sumatera Barat',
      'Pedalaman / Suku Terpencil',
      '081234567801',
      'Aktif',
      '3500000',
    ],
    [
      'Ustadz Muhammad Haikal',
      'Lc.',
      'Desa Long Midang, Nunukan',
      'Kalimantan Utara',
      'Banjarmasin, Kalimantan Selatan',
      'Perbatasan Antar Negara',
      '082199887711',
      'Aktif',
      '3800000',
    ],
    [
      'Ustadz Syarif Hidayatullah',
      'S.Ag',
      'Kampung Wamarek, Distrik Kurulu, Jayawijaya',
      'Papua Pegunungan',
      'Solo, Jawa Tengah',
      'Pedalaman / Suku Terpencil',
      '085277112233',
      'Aktif',
      '4000000',
    ],
    [
      'Ustadz Ilham Wahyudi',
      'S.Ud',
      'Dusun Atan Gane, Lereng Ile Ape, Lembata',
      'Nusa Tenggara Timur',
      'Yogyakarta',
      '3T (Terdepan, Terluar, Tertinggal)',
      '081344556677',
      'Aktif',
      '3300000',
    ],
  ];

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...sampleRows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'template_input_massal_dai_300.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download Korwil CSV Template
export function downloadKorwilCsvTemplate() {
  const headers = [
    'Kode Wilayah (misal: KORWIL-I)',
    'Nama Wilayah Teritorial',
    'Nama Koordinator',
    'Gelar',
    'Telepon',
    'Email',
    'Posko Induk Komando',
    'Provinsi Cakupan (Pisahkan koma)',
    'Jumlah Da\'i Binaan',
    'Jumlah Titik 3T',
    'Status Operasional (Siaga Penuh/Operasi Rutin/Siaga Bencana Cuaca)',
    'Fokus Strategis',
  ];

  const sampleRows = [
    [
      'KORWIL-VIII',
      'Wilayah VIII — Khusus Kepulauan Natuna & Terluar',
      'Ustadz H. Zulkarnain',
      'M.Pd.I',
      '0812-9900-1122',
      'korwil8.natuna@sidau.id',
      'Ranai Natuna / Posko Pulau Laut',
      'Kepulauan Riau',
      '12',
      '7',
      'Siaga Penuh',
      'Pengawalan Dakwah Pesisir Perbatasan Laut Natuna Utara',
    ],
  ];

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...sampleRows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'template_input_massal_korwil.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Robust Parser for Da'i text input (CSV, Semicolon, or Tab-separated from Excel)
export function parseBulkDaiText(rawText: string): { data: DaiUtusan[]; errorCount: number; message: string } {
  const lines = rawText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { data: [], errorCount: 0, message: 'Teks input kosong.' };
  }

  // Detect delimiter: tab (\t), comma (,), or semicolon (;)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.split(';').length > firstLine.split(',').length) delimiter = ';';

  // Check if first line is a header
  const isHeader =
    firstLine.toLowerCase().includes('nama') ||
    firstLine.toLowerCase().includes('da\'i') ||
    firstLine.toLowerCase().includes('tempat') ||
    firstLine.toLowerCase().includes('provinsi');

  const dataLines = isHeader ? lines.slice(1) : lines;
  const parsedData: DaiUtusan[] = [];
  let errorCount = 0;

  dataLines.forEach((line, index) => {
    // Regex to split by delimiter while respecting quotes
    let tokens: string[] = [];
    if (delimiter === '\t') {
      tokens = line.split('\t').map((t) => t.trim().replace(/^["']|["']$/g, ''));
    } else {
      // Split by comma or semicolon
      const regex = new RegExp(`(?:^|${delimiter})("(?:[^"]|"")*"|[^${delimiter}]*)`, 'g');
      let match;
      while ((match = regex.exec(line)) !== null) {
        let val = match[1] || '';
        val = val.trim().replace(/^["']|["']$/g, '').replace(/""/g, '"');
        tokens.push(val);
      }
    }

    if (tokens.length < 3 || !tokens[0]) {
      errorCount++;
      return;
    }

    // Expected columns:
    // 0: Nama
    // 1: Gelar (or if user provided Tempat, handle gracefully)
    // 2: Tempat Pengutusan
    // 3: Kabupaten
    // 4: Provinsi
    // 5: Asal Lembaga
    // 6: Kategori
    // 7: Telepon
    // 8: Status Tugas
    // 9: Kafalah

    let nama = tokens[0] || `Da'i ${index + 1}`;
    let gelar = tokens[1] && tokens[1].length <= 10 ? tokens[1] : '';
    let tempatInput = tokens[2] || tokens[1] || 'Posko Dakwah Pedalaman';
    let provinsi = tokens[3] || tokens[4] || 'Sumatera Barat';
    let asalDaerah = tokens[4] || tokens[5] || 'Solo, Jawa Tengah';
    let kabupaten = tokens[5] || 'Daerah 3T';
    let kategori = (tokens[6] as KategoriWilayah) || 'Pedalaman / Suku Terpencil';
    let telepon = tokens[7] || `0812-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    let statusTugas = (tokens[8] as StatusTugas) || 'Aktif';
    let kafalah = parseInt(tokens[9]?.replace(/\D/g, '') || '3500000', 10) || 3500000;

    // Ensure tempat pengutusan includes province name if not already present
    let titikDakwah = tempatInput;
    if (!titikDakwah.toLowerCase().includes(provinsi.toLowerCase())) {
      titikDakwah = `${tempatInput}, Prov. ${provinsi}`;
    }

    const pulau = getPulauFromProvinsi(provinsi);

    const dai: DaiUtusan = {
      id: `dai-bulk-${Date.now().toString().slice(-4)}-${index + 1}`,
      nama,
      gelar: gelar || undefined,
      telepon,
      asalDaerah,
      asalLembaga: 'Biro Dakwah Pedalaman Nusantara',
      pulau,
      provinsi,
      kabupaten,
      kecamatan: '',
      titikDakwah,
      kategoriWilayah: kategori,
      tanggalMulaiTugas: new Date().toISOString().slice(0, 10),
      durasiKontrakBulan: 24,
      statusTugas,
      programFokus: ['Pendidikan Al-Qur\'an / TPQ', 'Pembinaan Muallaf'],
      dana: {
        honorKafalah: kafalah,
        operasionalTransport: 1500000,
        saranaDakwah: 700000,
        tunjanganKesehatanLogistik: 500000,
        totalKebutuhanPerBulan: kafalah + 2700000,
        danaTersalurkan: kafalah + 2700000,
        statusPencairan: 'Tersalurkan Penuh',
        sumberDonatur: 'Zakat & Donatur Terpadu',
        rekeningBank: 'BSI 7123xxxxxx',
      },
      tren: {
        jamaahAwal: 15 + (index % 20),
        jamaahKini: 35 + (index % 45),
        jumlahMualaf: 5 + (index % 12),
        jumlahSantriTPQ: 20 + (index % 30),
        frekuensiKajianMingguan: 4,
        catatanProgresTerbaru: 'Program pembinaan berjalan aktif bersama warga binaan.',
        kendalaLapangan: 'Keterbatasan akses transportasi jalan dan sinyal komunikasi.',
        riwayatBulanan: [
          {
            bulan: 'Bulan Berjalan',
            jamaah: 35 + (index % 45),
            santriTPQ: 20 + (index % 30),
            danaTersalur: kafalah + 2700000,
            catatanKegiatan: 'Pembinaan rutin pekanan',
          },
        ],
        terakhirUpdate: new Date().toISOString().slice(0, 10),
      },
    };

    parsedData.push(dai);
  });

  return {
    data: parsedData,
    errorCount,
    message: `Berhasil memproses ${parsedData.length} data da'i.${errorCount > 0 ? ` (${errorCount} baris diabaikan karena format tidak lengkap)` : ''}`,
  };
}

// Generate 300+ Realistic National Da'i Dataset across 34 Provinces
export function generate300NationalDaiList(): DaiUtusan[] {
  const PROVINSI_DATA = [
    { prov: 'Aceh', kab: 'Simeulue', titik: 'Pulau Siumat & Pesisir Teupah', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Sumatera Utara', kab: 'Nias Barat', titik: 'Desa Hinako & Sirombu', kat: '3T (Terdepan, Terluar, Tertinggal)' as KategoriWilayah },
    { prov: 'Sumatera Barat', kab: 'Kepulauan Mentawai', titik: 'Dusun Rogdok, Siberut Selatan', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Riau', kab: 'Kepulauan Meranti', titik: 'Pulau Rangsang & Suku Akit', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Kepulauan Riau', kab: 'Natuna', titik: 'Pulau Laut & Sedanau', kat: 'Perbatasan Antar Negara' as KategoriWilayah },
    { prov: 'Jambi', kab: 'Sarolangun', titik: 'Kawasan Hutan Suku Anak Dalam', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Sumatera Selatan', kab: 'Ogan Komering Ilir', titik: 'Perairan Sungai Tulung Selapan', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Bengkulu', kab: 'Bengkulu Utara', titik: 'Desa Meok, Pulau Enggano', kat: '3T (Terdepan, Terluar, Tertinggal)' as KategoriWilayah },
    { prov: 'Lampung', kab: 'Pesisir Barat', titik: 'Way Haru & Balimbing', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Banten', kab: 'Lebak', titik: 'Garis Luar Kanekes Suku Baduy', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Jawa Barat', kab: 'Sukabumi', titik: 'Cisolok & Kasepuhan Ciptagelar', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Jawa Tengah', kab: 'Cilacap', titik: 'Kampung Laut Segara Anakan', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Jawa Timur', kab: 'Sumenep', titik: 'Pulau Masalembu & Kangean', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Kalimantan Barat', kab: 'Sambas', titik: 'Desa Temajuk (Garis Batas Sarawak)', kat: 'Perbatasan Antar Negara' as KategoriWilayah },
    { prov: 'Kalimantan Tengah', kab: 'Murung Raya', titik: 'Hulu Sungai Barito', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Kalimantan Selatan', kab: 'Hulu Sungai Tengah', titik: 'Balai Kiyu Suku Dayak Meratus', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Kalimantan Timur', kab: 'Mahakam Ulu', titik: 'Long Apari & Riam Udang', kat: 'Perbatasan Antar Negara' as KategoriWilayah },
    { prov: 'Kalimantan Utara', kab: 'Nunukan', titik: 'Krayan Selatan & Long Layu', kat: 'Perbatasan Antar Negara' as KategoriWilayah },
    { prov: 'Sulawesi Utara', kab: 'Kepulauan Talaud', titik: 'Pulau Miangas (Batas Filipina)', kat: 'Perbatasan Antar Negara' as KategoriWilayah },
    { prov: 'Sulawesi Tengah', kab: 'Banggai Laut', titik: 'Dusun Toropot Suku Bajo', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Sulawesi Selatan', kab: 'Kepulauan Selayar', titik: 'Pulau Jampea & Takabonerate', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Sulawesi Tenggara', kab: 'Wakatobi', titik: 'Pulau Runduma & Binongko', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Gorontalo', kab: 'Boalemo', titik: 'Suku Polahi Lereng Gunung', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Sulawesi Barat', kab: 'Mamasa', titik: 'Kecamatan Tabang Lereng Terjal', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Nusa Tenggara Barat', kab: 'Bima', titik: 'Kecamatan Tambora Pesisir', kat: '3T (Terdepan, Terluar, Tertinggal)' as KategoriWilayah },
    { prov: 'Nusa Tenggara Timur', kab: 'Lembata', titik: 'Desa Atan Gane, Lereng Ile Ape', kat: '3T (Terdepan, Terluar, Tertinggal)' as KategoriWilayah },
    { prov: 'Nusa Tenggara Timur', kab: 'Alor', titik: 'Pulau Pantar & Baranusa', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Maluku', kab: 'Kepulauan Aru', titik: 'Dusun Dobo Pedalaman & Batugoyang', kat: '3T (Terdepan, Terluar, Tertinggal)' as KategoriWilayah },
    { prov: 'Maluku Utara', kab: 'Pulau Morotai', titik: 'Desa Tutuhu & Ngele-Ngele', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Papua Induk', kab: 'Supiori', titik: 'Kepulauan Mapia Terluar', kat: 'Perbatasan Antar Negara' as KategoriWilayah },
    { prov: 'Papua Pegunungan', kab: 'Jayawijaya', titik: 'Distrik Kurulu, Lembah Baliem', kat: 'Pedalaman / Suku Terpencil' as KategoriWilayah },
    { prov: 'Papua Selatan', kab: 'Merauke', titik: 'Distrik Sota (Batas Papua Nugini)', kat: 'Perbatasan Antar Negara' as KategoriWilayah },
    { prov: 'Papua Tengah', kab: 'Nabire', titik: 'Pesisir Teluk Cenderawasih', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
    { prov: 'Papua Barat Daya', kab: 'Raja Ampat', titik: 'Pulau Batanta & Salawati', kat: 'Pesisir & Kepulauan Terluar' as KategoriWilayah },
  ];

  const DEWAN_ASAL = [
    'Dewan Dakwah Islamiyah Indonesia',
    'Biro Dakwah Pedalaman Nusantara',
    'Yayasan Bina Muallaf Nasional',
    'Sahabat Da\'i Nusantara',
    'Lembaga Pelayanan Masyarakat Islam',
    'Pesantren Kader Da\'i Mandiri',
    'Inisiatif Dakwah Perbatasan',
    'Bina Umat Kepulauan Samudra',
  ];

  const NAMA_DEPAN = [
    'Ahmad', 'Muhammad', 'Fathurrahman', 'Muhsin', 'Syamsul', 'Ilham', 'Wahyudi',
    'Zulkifli', 'Mansyur', 'Hasan', 'Ridwan', 'Khairul', 'Sulaiman', 'Mustafa',
    'Farhan', 'Habib', 'Luqman', 'Hidayat', 'Nur', 'Fadilah', 'Ibrahim', 'Yusuf',
    'Hamzah', 'Bilal', 'Taufiq', 'Burhan', 'Anas', 'Mahmud', 'Arif', 'Rasyid',
  ];

  const NAMA_BELAKANG = [
    'Ridwan', 'Al-Banjari', 'Al-Papuani', 'Bahri', 'Pratama', 'Al-Bontani', 'Harahap',
    'Al-Makassari', 'Nusantara', 'Al-Fatih', 'Syahputra', 'Siregar', 'Hutapea',
    'Lubis', 'Kurniawan', 'Ramadhan', 'Wijaya', 'Suryanto', 'Saputra', 'Ar-Rasyid',
    'Al-Ayyubi', 'Hakim', 'Anwar', 'Hasyim', 'Siddiq', 'Subagyo', 'Darussalam',
  ];

  const ASAL_DAERAH_LIST = [
    'Solo, Jawa Tengah',
    'Padang, Sumatera Barat',
    'Banjarmasin, Kalimantan Selatan',
    'Bandung, Jawa Barat',
    'Yogyakarta',
    'Makassar, Sulawesi Selatan',
    'Surabaya, Jawa Timur',
    'Medan, Sumatera Utara',
    'Bogor, Jawa Barat',
    'Semarang, Jawa Tengah',
    'Palembang, Sumatera Selatan',
    'Mataram, NTB',
    'Malang, Jawa Timur',
    'Cirebon, Jawa Barat',
    'Banda Aceh, Aceh',
    'Bukittinggi, Sumatera Barat',
  ];

  const GELAR_LIST = ['S.Pd.I', 'Lc.', 'S.Ag', 'S.Sos.I', 'S.Ud', 'M.Ag', ''];

  const result: DaiUtusan[] = [];

  for (let i = 0; i < 300; i++) {
    const provObj = PROVINSI_DATA[i % PROVINSI_DATA.length];
    const depan = NAMA_DEPAN[i % NAMA_DEPAN.length];
    const belakang = NAMA_BELAKANG[(i * 3 + 7) % NAMA_BELAKANG.length];
    const gelar = GELAR_LIST[i % GELAR_LIST.length];
    const asal = DEWAN_ASAL[i % DEWAN_ASAL.length];
    const asalDaerah = ASAL_DAERAH_LIST[(i * 5 + 3) % ASAL_DAERAH_LIST.length];
    const pulau = getPulauFromProvinsi(provObj.prov);
    const id = `dai-${String(i + 1).padStart(3, '0')}`;

    const kafalah = 3200000 + (i % 5) * 200000;
    const transport = 1400000 + (i % 6) * 150000;
    const sarana = 600000 + (i % 4) * 100000;
    const logistik = 500000;
    const total = kafalah + transport + sarana + logistik;

    const jAwal = 15 + (i % 25);
    const jKini = jAwal + 15 + (i % 50);

    result.push({
      id,
      nama: `Ustadz ${depan} ${belakang}`,
      gelar: gelar || undefined,
      telepon: `08${10 + (i % 89)}-${1000 + (i * 27) % 8999}-${1000 + (i * 43) % 8999}`,
      asalDaerah,
      asalLembaga: asal,
      pulau,
      provinsi: provObj.prov, // Provinsi tempat diutus
      kabupaten: provObj.kab,
      kecamatan: `Kec. Titik ${((i % 7) + 1)}`,
      titikDakwah: `${provObj.titik}, Kab. ${provObj.kab}, Prov. ${provObj.prov}`,
      kategoriWilayah: provObj.kat,
      tanggalMulaiTugas: '2025-08-01',
      durasiKontrakBulan: 24,
      statusTugas: i % 25 === 0 ? 'Persiapan' : 'Aktif',
      programFokus: ['Pendidikan Al-Qur\'an / TPQ', 'Pembinaan Muallaf', 'Pemberdayaan Ekonomi Umat'],
      dana: {
        honorKafalah: kafalah,
        operasionalTransport: transport,
        saranaDakwah: sarana,
        tunjanganKesehatanLogistik: logistik,
        totalKebutuhanPerBulan: total,
        danaTersalurkan: i % 7 === 0 ? total - 1000000 : total,
        statusPencairan: i % 7 === 0 ? 'Tersalurkan Sebagian' : 'Tersalurkan Penuh',
        sumberDonatur: 'Zakat & Wakaf Kaum Muslimin',
        rekeningBank: `BSI 71${String(i * 12345).padStart(8, '0')} an ${depan}`,
      },
      tren: {
        jamaahAwal: jAwal,
        jamaahKini: jKini,
        jumlahMualaf: 4 + (i % 22),
        jumlahSantriTPQ: 18 + (i % 38),
        frekuensiKajianMingguan: 4 + (i % 4),
        catatanProgresTerbaru: `Pembinaan halaqah Qur'an dan silaturahmi tokoh adat dusun binaan posko ${i + 1} berjalan tertib.`,
        kendalaLapangan: 'Jalur sungai/medan tanah dan stabilitas pasokan BBM perahu posko.',
        riwayatBulanan: [
          { bulan: 'Mei 2026', jamaah: jAwal + 8, santriTPQ: 18, danaTersalur: total, catatanKegiatan: 'Pembentukan TPQ anak' },
          { bulan: 'Jun 2026', jamaah: jAwal + 15, santriTPQ: 24, danaTersalur: total, catatanKegiatan: 'Kajian pekanan muallaf' },
          { bulan: 'Jul 2026', jamaah: jAwal + 22, santriTPQ: 30, danaTersalur: total, catatanKegiatan: 'Pembagian sarana iqro' },
          { bulan: 'Agt 2026', jamaah: jKini, santriTPQ: 35, danaTersalur: total, catatanKegiatan: 'Wisuda santri dan pengajian warga' },
        ],
        terakhirUpdate: '2026-08-28',
      },
    });
  }

  return result;
}
