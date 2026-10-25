import React from 'react';
import { Shield, Award, CheckCircle2, BookOpen, Compass, Briefcase, Mail, Phone, ExternalLink } from 'lucide-react';

export const CoordinatorProfile: React.FC = () => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>PROFIL KEPEMIMPINAN &amp; AMANAH NASIONAL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Rekam Jejak Koordinator Nasional
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dedikasi kepemimpinan operasional dakwah kepulauan dan pedalaman Nusantara
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            Cetak Portofolio Resmi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Core Competencies */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Manajemen Teritori 3T</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Pengalaman lebih dari 12 tahun mengelola ekspedisi dakwah ke pedalaman suku terpencil (Mentawai, Meratus, Dayak Krayan, Suku Bajo, dan Lembah Baliem Papua).
          </p>
          <div className="pt-2 text-slate-300 space-y-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mitigasi Jalur Darurat Sungai &amp; Laut</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jaringan Sinergi TNI / Polri Perbatasan</span>
            </div>
          </div>
        </div>

        {/* Financial Transparency */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Award className="w-4 h-4 text-sky-400" />
            <span>Integritas &amp; Tata Kelola Donasi</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Mengawal tata kelola dana kafalah, pengadaan Al-Qur'an, dan operasional perahu dakwah dengan standar pelaporan audit akuntabel dan transparan ke donatur.
          </p>
          <div className="pt-2 text-slate-300 space-y-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Leakage Policy (Bebas Potongan)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Distribusi Kafalah Tepat Tanggal 25</span>
            </div>
          </div>
        </div>

        {/* Holistic Support */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Konseling &amp; Kesejahteraan Da'i</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Menyelenggarakan sistem pendampingan moril, asuransi darurat, penyediaan logistik nutrisi balita bagi keluarga da'i, dan program purna-tugas berkelanjutan.
          </p>
          <div className="pt-2 text-slate-300 space-y-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pemeriksaan Kesehatan Rutin Lapangan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Beasiswa Anak Da'i Pedalaman</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Quote / Commitment */}
      <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-900/60 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="text-white block font-semibold">
            Komitmen Amanah Koordinator Nasional:
          </strong>
          <p className="text-blue-200 leading-relaxed">
            "Tidak boleh ada satu pun da'i utusan yang merasa sendirian di belantara hutan atau pulau terluar Nusantara. Setiap jengkal langkah dakwah mereka dikawal dengan komando yang siaga, dana yang amanah, dan doa yang bersambung setiap fajar."
          </p>
        </div>
      </div>
    </section>
  );
};
