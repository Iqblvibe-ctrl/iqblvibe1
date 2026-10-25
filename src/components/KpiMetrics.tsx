import React from 'react';
import { 
  Users, 
  MapPin, 
  Activity, 
  Radio, 
  ShieldCheck, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';

export const KpiMetrics: React.FC = () => {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>INDIKATOR KINERJA UTAMA (KEY PERFORMANCE INDICATORS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            3 Pilar Metrik Kinerja Koordinator Nasional
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          PERIODE EVALUASI: TAHUN ANGGARAN 2026
        </div>
      </div>

      {/* 3 Metric KPI Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI BOX 1: Deployment & Reach */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl relative overflow-hidden group hover:border-blue-700 transition-colors">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider text-blue-400 uppercase font-semibold">
              KPI 01 // SEBARAN FORMASI
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Total Da'i Utusan Nasional</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                148
              </span>
              <span className="text-sm font-semibold text-emerald-400 flex items-center">
                <ArrowUpRight className="w-4 h-4" />
                +18 Da'i Baru
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Tersebar aktif di <strong className="text-white font-semibold">34 Provinsi</strong> dan <strong className="text-white font-semibold">76 Titik 3T &amp; Perbatasan</strong>
            </p>
          </div>

          {/* Progress Bar & Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Target Formasi Nasional (150 Da'i):</span>
              <span className="font-mono text-white font-bold tabular-nums">98.6%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-sky-400 h-2 rounded-full w-[98.6%]"></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Pedalaman: 68 Da'i</span>
              <span>Pesisir: 42 Da'i</span>
              <span>Perbatasan: 38 Da'i</span>
            </div>
          </div>
        </div>

        {/* KPI BOX 2: Coordination Response & Reliability */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl relative overflow-hidden group hover:border-blue-700 transition-colors">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500"></div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider text-sky-400 uppercase font-semibold">
              KPI 02 // RESPON KOMANDO
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Tingkat Keberhasilan Koordinasi Harian</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                99.4%
              </span>
              <span className="text-xs font-semibold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                SLA &lt; 45 Menit
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Total <strong className="text-white font-semibold">2.840 sesi kontak</strong> radio &amp; pesan suara terlaksana tanpa putus
            </p>
          </div>

          {/* Progress Bar & Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Keandalan Relay Komunikasi 3T:</span>
              <span className="font-mono text-white font-bold tabular-nums">24/7 Siaga</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-emerald-400 h-2 rounded-full w-[99.4%]"></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Zero Blackout &gt;24 Jam
              </span>
              <span>Radio SSB + Satelit</span>
            </div>
          </div>
        </div>

        {/* KPI BOX 3: Budget Accountability & Timeliness */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl relative overflow-hidden group hover:border-blue-700 transition-colors">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider text-indigo-400 uppercase font-semibold">
              KPI 03 // AKUNTABILITAS DANA
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Realisasi Dana Operasional Dakwah</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                Rp 4.85 M
              </span>
              <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                100% Terserap
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Kafalah, bahan bakar perahu sungai, serta logistik darurat disalurkan tiap <strong className="text-white font-semibold">Tgl 25</strong>
            </p>
          </div>

          {/* Progress Bar & Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Opini Audit Laporan Keuangan:</span>
              <span className="font-mono text-emerald-400 font-bold">WTP (Wajar Tanpa Pengecualian)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-400 h-2 rounded-full w-[100%]"></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>148 Rekening Da'i Aktif</span>
              <span className="text-slate-300 font-mono">0 Defisit Tertunggak</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
