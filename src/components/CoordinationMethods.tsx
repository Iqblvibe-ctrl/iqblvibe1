import React, { useState } from 'react';
import { 
  Radio, 
  Satellite, 
  Smartphone, 
  Clock, 
  ShieldAlert, 
  Users, 
  HeartHandshake, 
  Building2, 
  CheckCircle2, 
  FileText, 
  Headphones, 
  ArrowRight,
  Wifi,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface MethodItem {
  id: string;
  title: string;
  frequency: string;
  channel: string;
  timeSlot: string;
  icon: React.ReactNode;
  tag: string;
  description: string;
  deliverables: string[];
  protocolStatus: 'Standar Operasi Aktif' | 'Protokol Siaga 24 Jam' | 'Terjadwal Rutin';
}

const COORDINATION_METHODS: MethodItem[] = [
  {
    id: 'standup-harian',
    title: 'Morning Standup & Status Briefing Lapangan',
    frequency: 'Harian (Senin - Ahad)',
    timeSlot: '07:00 - 08:30 WIB / WITA / WIT',
    channel: 'Voice Relay, Radio SSB & WhatsApp Group Posko',
    icon: <Headphones className="w-6 h-6 text-blue-400" />,
    tag: 'KOMUNIKASI UTAMA',
    description: 'Pengecekan rutin kondisi kesehatan da\'i, situasi cuaca laut/sungai, dan konfirmasi rencana dakwah harian di dusun sasaran.',
    deliverables: [
      'Konfirmasi kesiapan fisik & keamanan da\'i',
      'Laporan dini cuaca ombak & pasang surut sungai',
      'Persetujuan rute perjalanan perahu/motor trail',
    ],
    protocolStatus: 'Standar Operasi Aktif',
  },
  {
    id: 'pelaporan-logistik',
    title: 'Pelaporan Logistik & Verifikasi Dana Digital',
    frequency: 'Harian & Cut-Off Pekanan',
    timeSlot: '16:00 - 18:00 WIB',
    channel: 'SIM-DAU Gateway & E-Wallet Syariah',
    icon: <Smartphone className="w-6 h-6 text-sky-400" />,
    tag: 'AKUNTABILITAS DANA',
    description: 'Pencatatan real-time pengeluaran BBM perahu, pembelian sembako darurat, serta konfirmasi transfer kafalah da\'i tepat waktu.',
    deliverables: [
      'Validasi digital struk bensin & sewa perahu',
      'Pemberitahuan otomatis pencairan kafalah da\'i',
      'Notifikasi stok Al-Qur\'an dan buku Iqra posko',
    ],
    protocolStatus: 'Standar Operasi Aktif',
  },
  {
    id: 'satelit-darurat',
    title: 'Komunikasi Satelit & Penanganan Krisis 3T',
    frequency: 'Standby 24/7 Non-Stop',
    timeSlot: 'Kanal Khusus Red-Alert',
    channel: 'Satelit Thuraya/Inmarsat & Radio Komunitas',
    icon: <Satellite className="w-6 h-6 text-emerald-400" />,
    tag: 'RESPON KRISIS',
    description: 'Jalur komando cepat untuk mitigasi bencana alam (longsor/banjir bandang), evakuasi medis darurat, atau insiden keamanan perbatasan.',
    deliverables: [
      'Panggilan darurat terhubung langsung ke Koordinator Nasional',
      'Koordinasi cepat helikopter/perahu evakuasi medis',
      'Koneksi koordinasi dengan pos perbatasan TNI/Polri',
    ],
    protocolStatus: 'Protokol Siaga 24 Jam',
  },
  {
    id: 'konseling-pekanan',
    title: 'Konseling Ruhiyah & Penguatan Mental Da\'i',
    frequency: 'Pekanan (Setiap Malam Jumat)',
    timeSlot: '20:00 - 21:30 WIB',
    channel: 'Sesi Virtual Interaktif & Telepon Khusus 1-on-1',
    icon: <HeartHandshake className="w-6 h-6 text-indigo-400" />,
    tag: 'SUPPORT MORAL',
    description: 'Sesi pendampingan psikologis, penguatan spiritualitas, dan diskusi kekeluargaan untuk da\'i yang bertugas jauh dari keluarga.',
    deliverables: [
      'Sharing problem-solving sosiokultural suku pedalaman',
      'Kajian tafsir & motivasi keteguhan dakwah',
      'Layanan sambung rasa keluarga & kabar anak-istri',
    ],
    protocolStatus: 'Terjadwal Rutin',
  },
  {
    id: 'sinergi-tokoh',
    title: 'Diplomasi Tokoh Adat & Aparat Wilayah',
    frequency: 'Bulanan & Insidental',
    timeSlot: 'Sesuai Agenda Daerah',
    channel: 'Surat Tugas Resmi & Audiensi Forkopimda',
    icon: <Building2 className="w-6 h-6 text-amber-400" />,
    tag: 'SINERGI EKSTERNAL',
    description: 'Membangun legitimasi dan kemitraan strategis dengan Kepala Suku, Tokoh Adat, Babinsa, Bhabinkamtibmas, dan Kementerian Agama.',
    deliverables: [
      'Pemberian surat tugas resmi penempatan da\'i',
      'Kesepakatan bersama harmonisasi warga lokal',
      'Izin penyelenggaraan TPQ dan musholla perintis',
    ],
    protocolStatus: 'Terjadwal Rutin',
  },
  {
    id: 'audit-donatur',
    title: 'Kompilasi Laporan Akuntabilitas Donatur',
    frequency: 'Bulanan (Tiap Tanggal 1)',
    timeSlot: 'Laporan Publikasi Terbuka',
    channel: 'E-Report PDF & Dasbor Publikasi Nasional',
    icon: <FileText className="w-6 h-6 text-blue-300" />,
    tag: 'TRANSPARANSI PUBLIK',
    description: 'Penyusunan laporan komprehensif perkembangan jumlah binaan mualaf, santri khatam Qur\'an, dan dokumentasi foto nyata dari lapangan.',
    deliverables: [
      'Kompilasi foto asli kegiatan dakwah dari 76 posko',
      'Laporan audit penggunaan dana zakat/infaq',
      'Distribusi buletin perkembangan dakwah ke donatur',
    ],
    protocolStatus: 'Standar Operasi Aktif',
  },
];

export const CoordinationMethods: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<MethodItem>(COORDINATION_METHODS[0]);

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">
            <Radio className="w-4 h-4 text-blue-700" />
            <span>STANDAR OPERASIONAL PROSEDUR (SOP)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Metode Koordinasi &amp; Komunikasi Harian
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Enam pilar jalur komunikasi terpadu koordinator nasional menjamin seluruh posko 3T terpantau, aman, dan berdaya.
          </p>
        </div>

        {/* 24/7 Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900 text-blue-100 text-xs font-semibold shrink-0 shadow-sm">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Kesiapan Komando 24 Jam</span>
        </div>
      </div>

      {/* Grid of 6 Communication Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {COORDINATION_METHODS.map((method) => {
          const isSelected = selectedMethod.id === method.id;

          return (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={`rounded-2xl border p-6 space-y-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-blue-600 ring-2 ring-blue-500/30 shadow-xl'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                isSelected ? 'bg-blue-500' : 'bg-transparent'
              }`}></div>

              <div className="space-y-3">
                {/* Icon & Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-3 rounded-xl border ${
                    isSelected 
                      ? 'bg-blue-950/80 border-blue-800' 
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}>
                    {method.icon}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    isSelected
                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {method.tag}
                  </span>
                </div>

                {/* Title & Frequency */}
                <div>
                  <h3 className={`text-base font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {method.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-blue-700'}`} />
                    <span className={isSelected ? 'text-slate-300 font-medium' : 'text-slate-600 font-medium'}>
                      {method.frequency}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-xs leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                  {method.description}
                </p>

                {/* Deliverables checklist */}
                <div className={`pt-3 border-t text-xs space-y-1.5 ${
                  isSelected ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <span className={`block text-[11px] font-semibold uppercase tracking-wider ${
                    isSelected ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Capaian Tiap Sesi:
                  </span>
                  {method.deliverables.slice(0, 2).map((del, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isSelected ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                      <span className={`text-[11px] leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-700'}`}>
                        {del}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Channel Strip */}
              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] ${
                isSelected ? 'border-slate-800 text-blue-300' : 'border-slate-100 text-blue-800 font-medium'
              }`}>
                <span className="truncate max-w-[220px]">
                  Kanal: {method.channel.split(',')[0]}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Inspector Box of Selected Method */}
      <div className="bg-slate-950 text-white rounded-2xl border border-blue-900/60 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider">
              DETAIL PROTOKOL OPERASI TERPILIH
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {selectedMethod.title}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{selectedMethod.protocolStatus}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-mono">WAKTU EKSEKUSI</span>
            <strong className="text-white text-sm block">{selectedMethod.timeSlot}</strong>
            <span className="text-slate-400 text-[11px]">{selectedMethod.frequency}</span>
          </div>

          <div className="space-y-1 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-mono">KANAL PERANGKAT</span>
            <strong className="text-white text-sm block">{selectedMethod.channel}</strong>
            <span className="text-slate-400 text-[11px]">Terenkripsi &amp; Terarsip Otomatis</span>
          </div>

          <div className="space-y-1 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-mono">PENANGGUNG JAWAB</span>
            <strong className="text-white text-sm block">Koordinator Nasional &amp; Komandan Posko</strong>
            <span className="text-slate-400 text-[11px]">Komando Berjenjang 3T</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            Seluruh Capaian &amp; SOP Wajib Protokol Ini:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedMethod.deliverables.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
