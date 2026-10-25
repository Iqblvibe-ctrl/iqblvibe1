import React, { useState } from 'react';
import { MapPin, Navigation, Radio, Compass, Shield, Users } from 'lucide-react';

interface DeploymentNode {
  id: string;
  name: string;
  region: string;
  coords: { x: number; y: number }; // Percentage in SVG viewBox
  status: 'Aktif Terhubung' | 'Siaga Cuaca' | 'Relay Satelit';
  daiCount: number;
  fokus: string;
  frekuensiKontak: string;
}

const DEPLOYMENT_NODES: DeploymentNode[] = [
  {
    id: 'sumatera-mentawai',
    name: 'Posko Siberut - Mentawai',
    region: 'Sumatera Barat (3T Kepulauan)',
    coords: { x: 18, y: 55 },
    status: 'Aktif Terhubung',
    daiCount: 14,
    fokus: 'Pembinaan Mualaf Suku Pedalaman & TPQ Maritim',
    frekuensiKontak: 'Pagi 07:30 WIB (Radio SSB & WhatsApp)',
  },
  {
    id: 'sumatera-enggano',
    name: 'Posko Pulau Enggano',
    region: 'Bengkulu (Pulau Terluar Samudra Hindia)',
    coords: { x: 23, y: 68 },
    status: 'Aktif Terhubung',
    daiCount: 6,
    fokus: 'Dakwah Komunitas Pesisir & Pembinaan Muallaf',
    frekuensiKontak: 'Harian 19:00 WIB',
  },
  {
    id: 'jawa-pantura',
    name: 'Pusat Komando Nasional (HQ)',
    region: 'DKI Jakarta & Jawa Barat',
    coords: { x: 32, y: 78 },
    status: 'Aktif Terhubung',
    daiCount: 22,
    fokus: 'Pusat Koordinasi Nasional & Distribusi Logistik',
    frekuensiKontak: 'Real-Time 24/7 Command Desk',
  },
  {
    id: 'kalbar-nunukan',
    name: 'Posko Long Layu - Krayan',
    region: 'Kalimantan Utara (Garis Batas Sabah-Sarawak)',
    coords: { x: 48, y: 32 },
    status: 'Relay Satelit',
    daiCount: 18,
    fokus: 'Dakwah Perbatasan Negara & Pendidikan Qur\'an',
    frekuensiKontak: 'Dua kali sehari (Telepon Satelit Thuraya)',
  },
  {
    id: 'kalsel-meratus',
    name: 'Posko Pegunungan Meratus',
    region: 'Kalimantan Selatan (Suku Dayak Pedalaman)',
    coords: { x: 52, y: 56 },
    status: 'Aktif Terhubung',
    daiCount: 12,
    fokus: 'Keluarga Binaan & Pemberdayaan Ekonomi Aren',
    frekuensiKontak: 'Pagi 08:00 WITA',
  },
  {
    id: 'sulsel-banggai',
    name: 'Posko Kepulauan Bokan',
    region: 'Sulawesi Tengah (Suku Bajo Laut)',
    coords: { x: 67, y: 50 },
    status: 'Siaga Cuaca',
    daiCount: 16,
    fokus: 'Musholla Terapung & Kajian Nelayan Tradisional',
    frekuensiKontak: 'Pagi 07:00 WITA (Radio VHF Kelautan)',
  },
  {
    id: 'ntt-lembata',
    name: 'Posko Lereng Ile Ape - Lembata',
    region: 'Nusa Tenggara Timur (Wilayah 3T)',
    coords: { x: 63, y: 82 },
    status: 'Aktif Terhubung',
    daiCount: 15,
    fokus: 'Sanitasi Air Bersih Dakwah & Bimbingan Fiqih',
    frekuensiKontak: 'Harian 18:30 WITA',
  },
  {
    id: 'malut-morotai',
    name: 'Posko Pulau Morotai',
    region: 'Maluku Utara (Gerbang Pasifik Utara)',
    coords: { x: 74, y: 35 },
    status: 'Aktif Terhubung',
    daiCount: 19,
    fokus: 'TPQ Kepulauan Terluar & Pelatihan Khatib Pesisir',
    frekuensiKontak: 'Pagi 08:30 WIT',
  },
  {
    id: 'papua-baliem',
    name: 'Posko Lembah Baliem - Kurulu',
    region: 'Papua Pegunungan (Suku Lembah & Pegunungan)',
    coords: { x: 90, y: 62 },
    status: 'Relay Satelit',
    daiCount: 26,
    fokus: 'Rumah Belajar Qur\'an & Nutrisi Sehat Anak',
    frekuensiKontak: 'Pagi 07:00 WIT (Solar-Powered Inmarsat)',
  },
];

export const NationalMap: React.FC = () => {
  const [activeNode, setActiveNode] = useState<DeploymentNode>(DEPLOYMENT_NODES[0]);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Decorative Top Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600"></div>

      {/* Header Info */}
      <div className="p-6 sm:p-8 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>JARINGAN KOORDINASI NASIONAL SABANG - MERAUKE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Peta Sebaran Titik Tugas Da'i Utusan Indonesia
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Visualisasi pemantauan komando koordinator nasional meliputi 34 provinsi dengan fokus titik 3T (Terdepan, Terluar, Tertinggal), perbatasan negara, dan pedalaman terpencil.
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs shrink-0 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
            <span>Aktif Terhubung</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-[0_0_8px_rgba(56,189,248,0.7)]"></span>
            <span>Relay Satelit</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_rgba(251,191,36,0.7)]"></span>
            <span>Siaga Cuaca</span>
          </div>
        </div>
      </div>

      {/* Map Display & Node Card Area */}
      <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Archipelago Cartography (8 cols on lg) */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 sm:p-6 relative overflow-hidden">
          {/* Subtle Grid Watermark / Radar Coordinates */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2">
            <span>GRID: 6°00'N - 11°00'S / 95°00'E - 141°00'E</span>
            <span>STATUS: ALL CODES ONLINE</span>
          </div>

          {/* Interactive Nusantara SVG Map */}
          <div className="relative w-full aspect-[16/9] flex items-center justify-center">
            <svg
              viewBox="0 0 1000 520"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4))' }}
            >
              {/* Regional connection lines across archipelago */}
              <g stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
                <path d="M 180 286 L 320 405 L 520 291 L 670 260 L 740 182 L 900 322" />
                <path d="M 180 286 L 480 166 L 670 260 L 630 426 L 900 322" />
                <path d="M 320 405 L 630 426 L 900 322" />
              </g>

              {/* Island Stylized Geometric Contours (Indonesia Archipelago) */}
              {/* SUMATERA */}
              <path
                d="M 130 180 L 175 140 L 210 180 L 250 250 L 285 340 L 270 365 L 240 375 L 180 295 L 140 230 Z"
                className="fill-slate-800/90 stroke-blue-700/60 hover:fill-blue-900/40 transition-colors"
                strokeWidth="1.5"
              />
              {/* JAWA & MADURA */}
              <path
                d="M 270 395 L 340 395 L 420 405 L 450 410 L 440 425 L 360 420 L 280 415 Z"
                className="fill-slate-800/90 stroke-blue-700/60 hover:fill-blue-900/40 transition-colors"
                strokeWidth="1.5"
              />
              {/* KALIMANTAN */}
              <path
                d="M 430 190 L 490 145 L 530 170 L 550 250 L 535 310 L 470 325 L 420 280 L 420 220 Z"
                className="fill-slate-800/90 stroke-blue-700/60 hover:fill-blue-900/40 transition-colors"
                strokeWidth="1.5"
              />
              {/* SULAWESI (K-shaped archipelago) */}
              <path
                d="M 640 195 L 675 180 L 690 230 L 670 260 L 705 285 L 685 340 L 660 300 L 650 350 L 630 330 L 640 260 L 620 230 Z"
                className="fill-slate-800/90 stroke-blue-700/60 hover:fill-blue-900/40 transition-colors"
                strokeWidth="1.5"
              />
              {/* BALI & NUSA TENGGARA */}
              <path
                d="M 465 422 L 495 420 L 540 422 L 590 428 L 645 425 L 655 435 L 570 435 L 470 430 Z"
                className="fill-slate-800/90 stroke-blue-700/60 hover:fill-blue-900/40 transition-colors"
                strokeWidth="1.5"
              />
              {/* MALUKU UTARA & SELATAN */}
              <path
                d="M 725 170 L 755 160 L 760 210 L 730 220 Z M 720 290 L 760 275 L 775 310 L 735 320 Z"
                className="fill-slate-800/90 stroke-blue-700/60 hover:fill-blue-900/40 transition-colors"
                strokeWidth="1.5"
              />
              {/* PAPUA */}
              <path
                d="M 800 230 L 840 200 L 890 235 L 945 235 L 960 360 L 870 370 L 840 310 L 805 270 Z"
                className="fill-slate-800/90 stroke-blue-700/60 hover:fill-blue-900/40 transition-colors"
                strokeWidth="1.5"
              />

              {/* Coordinates Node Markers */}
              {DEPLOYMENT_NODES.map((node) => {
                const isSelected = activeNode.id === node.id;
                const nodeColor = 
                  node.status === 'Aktif Terhubung' 
                    ? '#10b981' 
                    : node.status === 'Relay Satelit' 
                    ? '#38bdf8' 
                    : '#fbbf24';

                return (
                  <g
                    key={node.id}
                    onClick={() => setActiveNode(node)}
                    className="cursor-pointer group"
                    transform={`translate(${node.coords.x * 10}, ${node.coords.y * 5.2})`}
                  >
                    {/* Pulsing ring for active selection */}
                    {isSelected && (
                      <circle
                        r="20"
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth="2"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Outer glow ring */}
                    <circle
                      r={isSelected ? '12' : '8'}
                      fill={nodeColor}
                      fillOpacity={isSelected ? '0.35' : '0.15'}
                      stroke={nodeColor}
                      strokeWidth={isSelected ? '2' : '1'}
                      className="group-hover:scale-125 transition-transform"
                    />

                    {/* Inner solid core */}
                    <circle
                      r={isSelected ? '5' : '3.5'}
                      fill={nodeColor}
                      className="transition-all"
                    />

                    {/* Text Label on map */}
                    <text
                      y="-14"
                      textAnchor="middle"
                      className={`text-[10px] font-mono font-bold tracking-wider select-none pointer-events-none transition-colors ${
                        isSelected ? 'fill-white' : 'fill-slate-400 group-hover:fill-slate-200'
                      }`}
                    >
                      {node.name.replace('Posko ', '')}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Pilih salah satu titik radar pada peta untuk memuat data komando lokal</span>
            </span>
            <span className="font-mono text-slate-500">9 POSKO UTAMA NUSANTARA</span>
          </div>
        </div>

        {/* Selected Node Details Card (4 cols on lg) */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-blue-900/60 p-6 space-y-5 text-white shadow-xl relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 block mb-1">
                POSKO TERPILIH
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {activeNode.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeNode.region}
              </p>
            </div>

            <span className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
              activeNode.status === 'Aktif Terhubung'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : activeNode.status === 'Relay Satelit'
                ? 'bg-sky-950/80 text-sky-300 border-sky-800'
                : 'bg-amber-950/80 text-amber-300 border-amber-800'
            }`}>
              {activeNode.status}
            </span>
          </div>

          <div className="space-y-3 text-xs border-y border-slate-800/80 py-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Jumlah Da'i Bertugas:
              </span>
              <strong className="text-white font-mono text-sm">{activeNode.daiCount} Da'i</strong>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Fokus Penugasan:
              </span>
              <span className="text-right text-slate-200 font-medium">{activeNode.fokus}</span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                Jadwal Komunikasi:
              </span>
              <span className="text-right text-blue-300 font-mono text-[11px]">{activeNode.frekuensiKontak}</span>
            </div>
          </div>

          {/* Quick interactive action buttons */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] text-slate-400 font-medium">Aksi Cepat Koordinator:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="w-full text-center py-2 px-3 bg-blue-600/90 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
              >
                Panggil Posko
              </button>
              <button
                type="button"
                className="w-full text-center py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors border border-slate-700"
              >
                Cek Log Harian
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
