import { DaiUtusan, PulauWilayah, KategoriWilayah, StatusTugas } from '../types/dai';

export interface DriveSpreadsheetItem {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  rowCount: number;
}

/**
 * List recent spreadsheets from user's Google Drive.
 */
export async function listUserSpreadsheets(accessToken: string): Promise<DriveSpreadsheetItem[]> {
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime%20desc&pageSize=15&fields=files(id,name,modifiedTime,webViewLink)`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal memuat daftar Google Sheets dari Drive: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Helper to extract spreadsheet ID from standard URL or direct ID.
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  // If user pasted a full URL: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Create a new Google Spreadsheet with all Da'i database rows and professional styling.
 */
export async function createDaiSpreadsheet(
  accessToken: string,
  title: string,
  daiList: DaiUtusan[]
): Promise<ExportResult> {
  const headers = [
    'No',
    'Nama Da\'i Utusan',
    'Gelar',
    'Tempat Pengutusan (Termasuk Provinsi)',
    'Asal Daerah',
    'Provinsi Pengutusan (Tempat Diutus)',
    'Kabupaten',
    'Kecamatan',
    'Pulau',
    'Kategori Wilayah',
    'Status Tugas',
    'No Telepon / WhatsApp',
    'Lembaga Pengutus',
    'Honor Kafalah (Rp)',
    'Operasional Transport (Rp)',
    'Sarana Dakwah (Rp)',
    'Tunjangan Logistik (Rp)',
    'Total Kebutuhan/Bulan (Rp)',
    'Status Pencairan Dana',
    'Sumber Donatur',
    'Rekening Bank',
    'Jamaah Awal',
    'Jamaah Kini',
    'Santri TPQ',
    'Mualaf Terbina',
    'Kendala Lapangan',
    'Terakhir Diperbarui',
  ];

  const rows = daiList.map((dai, index) => [
    index + 1,
    dai.nama,
    dai.gelar || '',
    dai.titikDakwah,
    dai.asalDaerah || dai.asalLembaga || '',
    dai.provinsi,
    dai.kabupaten,
    dai.kecamatan || '',
    dai.pulau,
    dai.kategoriWilayah,
    dai.statusTugas,
    dai.telepon || '',
    dai.asalLembaga,
    dai.dana.honorKafalah,
    dai.dana.operasionalTransport,
    dai.dana.saranaDakwah,
    dai.dana.tunjanganKesehatanLogistik,
    dai.dana.totalKebutuhanPerBulan,
    dai.dana.statusPencairan,
    dai.dana.sumberDonatur,
    dai.dana.rekeningBank || '',
    dai.tren.jamaahAwal,
    dai.tren.jamaahKini,
    dai.tren.jumlahSantriTPQ,
    dai.tren.jumlahMualaf,
    dai.tren.kendalaLapangan,
    dai.tren.terakhirUpdate,
  ]);

  const requestBody = {
    properties: {
      title: title || `SIDAU NUSANTARA - Database Da'i (${new Date().toLocaleDateString('id-ID')})`,
    },
    sheets: [
      {
        properties: {
          title: 'Database Da\'i Utusan',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: headers.map((h) => ({
                  userEnteredValue: { stringValue: h },
                  userEnteredFormat: {
                    backgroundColor: { red: 0.08, green: 0.15, blue: 0.28 }, // Dark Navy
                    textFormat: {
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      bold: true,
                      fontSize: 10,
                    },
                  },
                })),
              },
              ...rows.map((row) => ({
                values: row.map((cell) => {
                  if (typeof cell === 'number') {
                    return {
                      userEnteredValue: { numberValue: cell },
                    };
                  }
                  return {
                    userEnteredValue: { stringValue: String(cell ?? '') },
                  };
                }),
              })),
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membuat Google Spreadsheet baru: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const spreadsheetId = result.spreadsheetId;
  const spreadsheetUrl = result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: result.properties?.title || title,
    rowCount: rows.length,
  };
}

/**
 * Fetch first sheet title to avoid hardcoding "Sheet1".
 */
export async function getFirstSheetTitle(accessToken: string, spreadsheetId: string): Promise<string> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membaca informasi lembar kerja: ${response.status} ${errorText}`);
  }

  const meta = await response.json();
  const firstSheet = meta.sheets?.[0]?.properties?.title || 'Sheet1';
  return firstSheet;
}

/**
 * Read Da'i rows from an existing Google Spreadsheet.
 */
export async function readDaiFromSpreadsheet(
  accessToken: string,
  rawInput: string
): Promise<{ data: DaiUtusan[]; totalRows: number; sheetTitle: string }> {
  const spreadsheetId = extractSpreadsheetId(rawInput);
  if (!spreadsheetId) {
    throw new Error('ID atau tautan Google Sheets tidak valid.');
  }

  const sheetTitle = await getFirstSheetTitle(accessToken, spreadsheetId);
  const range = `${encodeURIComponent(sheetTitle)}!A1:Z500`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membaca baris Google Sheets: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const values: any[][] = result.values || [];

  if (values.length <= 1) {
    return { data: [], totalRows: 0, sheetTitle };
  }

  // Header inspection
  const headers = values[0].map((h: any) => String(h || '').trim().toLowerCase());
  
  // Find column indices
  const findCol = (keywords: string[]) => {
    return headers.findIndex((h: string) => keywords.some((k) => h.includes(k)));
  };

  const colNama = findCol(['nama', 'name', 'ustadz']);
  const colTempat = findCol(['tempat', 'titik', 'posko', 'lokasi', 'desa', 'dusun']);
  const colAsal = findCol(['asal daerah', 'daerah asal', 'asal']);
  const colProvinsi = findCol(['provinsi', 'propinsi', 'wilayah']);
  const colKabupaten = findCol(['kabupaten', 'kota', 'kab']);
  const colKecamatan = findCol(['kecamatan', 'kec']);
  const colPulau = findCol(['pulau']);
  const colKategori = findCol(['kategori']);
  const colStatus = findCol(['status']);
  const colKontak = findCol(['telepon', 'kontak', 'wa', 'hp']);
  const colLembaga = findCol(['lembaga', 'ormas', 'pengutus']);
  const colKafalah = findCol(['kafalah', 'honor', 'gaji']);
  const colJamaah = findCol(['jamaah kini', 'jamaah']);
  const colSantri = findCol(['santri', 'tpq']);

  const parsedDai: DaiUtusan[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0) continue;

    const nama = colNama !== -1 && row[colNama] ? String(row[colNama]).trim() : String(row[1] || row[0] || '').trim();
    if (!nama || nama.toLowerCase().startsWith('nama')) continue;

    const tempat = colTempat !== -1 && row[colTempat] ? String(row[colTempat]).trim() : (row[3] || row[1] || 'Titik Pedalaman');
    const asal = colAsal !== -1 && row[colAsal] ? String(row[colAsal]).trim() : (row[4] || row[2] || 'Indonesia');
    const provinsi = colProvinsi !== -1 && row[colProvinsi] ? String(row[colProvinsi]).trim() : (row[5] || row[3] || 'Nusantara');
    const kabupaten = colKabupaten !== -1 && row[colKabupaten] ? String(row[colKabupaten]).trim() : (row[6] || 'Kabupaten Pedalaman');
    const kecamatan = colKecamatan !== -1 && row[colKecamatan] ? String(row[colKecamatan]).trim() : '';
    const pulauRaw = colPulau !== -1 && row[colPulau] ? String(row[colPulau]).trim() : '';
    const kategoriRaw = colKategori !== -1 && row[colKategori] ? String(row[colKategori]).trim() : '';
    const statusRaw = colStatus !== -1 && row[colStatus] ? String(row[colStatus]).trim() : 'Aktif';
    const telepon = colKontak !== -1 && row[colKontak] ? String(row[colKontak]).trim() : '';
    const lembaga = colLembaga !== -1 && row[colLembaga] ? String(row[colLembaga]).trim() : (asal || 'Dewan Dakwah');
    const kafalah = colKafalah !== -1 && row[colKafalah] ? Number(String(row[colKafalah]).replace(/[^0-9]/g, '')) || 3500000 : 3500000;
    const jamaah = colJamaah !== -1 && row[colJamaah] ? Number(String(row[colJamaah]).replace(/[^0-9]/g, '')) || 25 : 25;
    const santri = colSantri !== -1 && row[colSantri] ? Number(String(row[colSantri]).replace(/[^0-9]/g, '')) || 15 : 15;

    // Normalizing Pulau
    let pulau: PulauWilayah = 'Sumatera';
    const pLow = (pulauRaw + ' ' + provinsi).toLowerCase();
    if (pLow.includes('jawa')) pulau = 'Jawa';
    else if (pLow.includes('kalimantan')) pulau = 'Kalimantan';
    else if (pLow.includes('sulawesi')) pulau = 'Sulawesi';
    else if (pLow.includes('papua')) pulau = 'Papua';
    else if (pLow.includes('maluku')) pulau = 'Maluku';
    else if (pLow.includes('nusa') || pLow.includes('bali') || pLow.includes('ntb') || pLow.includes('ntt')) pulau = 'Bali & Nusa Tenggara';

    // Normalizing Kategori
    let kategori: KategoriWilayah = 'Pedalaman / Suku Terpencil';
    const kLow = (kategoriRaw + ' ' + tempat).toLowerCase();
    if (kLow.includes('perbatasan')) kategori = 'Perbatasan Antar Negara';
    else if (kLow.includes('pesisir') || kLow.includes('kepulauan') || kLow.includes('pulau')) kategori = 'Pesisir & Kepulauan Terluar';
    else if (kLow.includes('3t') || kLow.includes('tertinggal') || kLow.includes('terluar')) kategori = '3T (Terdepan, Terluar, Tertinggal)';
    else if (kLow.includes('urban') || kLow.includes('marjinal') || kLow.includes('kota')) kategori = 'Urban / Komunitas Marjinal';

    // Normalizing Status
    let statusTugas: StatusTugas = 'Aktif';
    if (statusRaw.toLowerCase().includes('persiapan')) statusTugas = 'Persiapan';
    else if (statusRaw.toLowerCase().includes('cuti') || statusRaw.toLowerCase().includes('istirahat')) statusTugas = 'Cuti / Istirahat';
    else if (statusRaw.toLowerCase().includes('selesai') || statusRaw.toLowerCase().includes('purna')) statusTugas = 'Selesai';

    const item: DaiUtusan = {
      id: `gsheet-${Date.now().toString().slice(-4)}-${i}`,
      nama,
      asalDaerah: asal,
      asalLembaga: lembaga,
      provinsi,
      kabupaten,
      kecamatan,
      titikDakwah: tempat,
      pulau,
      kategoriWilayah: kategori,
      tanggalMulaiTugas: new Date().toISOString().slice(0, 10),
      durasiKontrakBulan: 24,
      statusTugas,
      telepon: telepon || '0812-XXXX-XXXX',
      programFokus: ['Pendidikan Al-Qur\'an / TPQ', 'Pembinaan Muallaf'],
      dana: {
        honorKafalah: kafalah,
        operasionalTransport: 1500000,
        saranaDakwah: 500000,
        tunjanganKesehatanLogistik: 400000,
        totalKebutuhanPerBulan: kafalah + 2400000,
        danaTersalurkan: kafalah + 2400000,
        statusPencairan: 'Tersalurkan Penuh',
        sumberDonatur: 'Infaq Kaum Muslimin',
      },
      tren: {
        jamaahAwal: Math.max(10, Math.floor(jamaah * 0.7)),
        jamaahKini: jamaah,
        jumlahSantriTPQ: santri,
        jumlahMualaf: 5,
        frekuensiKajianMingguan: 4,
        catatanProgresTerbaru: 'Sinkronisasi data otomatis dari Google Sheets.',
        kendalaLapangan: 'Akses medan geografis kepulauan/pedalaman.',
        riwayatBulanan: [
          {
            bulan: 'Bulan Berjalan',
            jamaah,
            santriTPQ: santri,
            danaTersalur: kafalah + 2400000,
            catatanKegiatan: 'Aktivitas dakwah berjalan rutin di titik penugasan.',
          },
        ],
        terakhirUpdate: new Date().toISOString().slice(0, 10),
      },
    };

    parsedDai.push(item);
  }

  return {
    data: parsedDai,
    totalRows: parsedDai.length,
    sheetTitle,
  };
}

/**
 * Overwrite existing Google Spreadsheet with fresh data (Requires user confirmation before invoking).
 */
export async function overwriteSpreadsheetData(
  accessToken: string,
  rawInput: string,
  daiList: DaiUtusan[]
): Promise<{ updatedRows: number; spreadsheetUrl: string }> {
  const spreadsheetId = extractSpreadsheetId(rawInput);
  const sheetTitle = await getFirstSheetTitle(accessToken, spreadsheetId);

  const headers = [
    'No',
    'Nama Da\'i Utusan',
    'Gelar',
    'Tempat Pengutusan (Termasuk Provinsi)',
    'Asal Daerah',
    'Provinsi Pengutusan (Tempat Diutus)',
    'Kabupaten',
    'Kecamatan',
    'Pulau',
    'Kategori Wilayah',
    'Status Tugas',
    'No Telepon / WhatsApp',
    'Lembaga Pengutus',
    'Honor Kafalah (Rp)',
    'Operasional Transport (Rp)',
    'Sarana Dakwah (Rp)',
    'Tunjangan Logistik (Rp)',
    'Total Kebutuhan/Bulan (Rp)',
    'Status Pencairan Dana',
    'Sumber Donatur',
    'Rekening Bank',
    'Jamaah Awal',
    'Jamaah Kini',
    'Santri TPQ',
    'Mualaf Terbina',
    'Kendala Lapangan',
    'Terakhir Diperbarui',
  ];

  const rows = daiList.map((dai, index) => [
    index + 1,
    dai.nama,
    dai.gelar || '',
    dai.titikDakwah,
    dai.asalDaerah || dai.asalLembaga || '',
    dai.provinsi,
    dai.kabupaten,
    dai.kecamatan || '',
    dai.pulau,
    dai.kategoriWilayah,
    dai.statusTugas,
    dai.telepon || '',
    dai.asalLembaga,
    dai.dana.honorKafalah,
    dai.dana.operasionalTransport,
    dai.dana.saranaDakwah,
    dai.dana.tunjanganKesehatanLogistik,
    dai.dana.totalKebutuhanPerBulan,
    dai.dana.statusPencairan,
    dai.dana.sumberDonatur,
    dai.dana.rekeningBank || '',
    dai.tren.jamaahAwal,
    dai.tren.jamaahKini,
    dai.tren.jumlahSantriTPQ,
    dai.tren.jumlahMualaf,
    dai.tren.kendalaLapangan,
    dai.tren.terakhirUpdate,
  ]);

  const range = `${encodeURIComponent(sheetTitle)}!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `${sheetTitle}!A1`,
      majorDimension: 'ROWS',
      values: [headers, ...rows],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal memperbarui Google Sheets: ${response.status} ${errorText}`);
  }

  return {
    updatedRows: rows.length,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}
