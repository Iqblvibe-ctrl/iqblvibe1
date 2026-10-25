import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'tren' | 'database' | 'dana' | 'panduan';
  setActiveTab: (tab: 'tren' | 'database' | 'dana' | 'panduan') => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single line, single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
              SD
            </div>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('tren');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors"
            >
              SIM-DAI Nusantara
            </a>
          </div>

          {/* Zone 2: Navigation Links (Single-line, 4 concise items) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('tren')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 text-sm font-medium ${
                activeTab === 'tren'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Ringkasan & Tren
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 text-sm font-medium ${
                activeTab === 'database'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Database Da'i
            </button>
            <button
              onClick={() => setActiveTab('dana')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 text-sm font-medium ${
                activeTab === 'dana'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Penataan Dana
            </button>
            <button
              onClick={() => setActiveTab('panduan')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 text-sm font-medium ${
                activeTab === 'panduan'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Panduan Tombol
            </button>
          </nav>

          {/* Zone 3: Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Da'i Baru</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('tren')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'tren' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Ringkasan & Tren
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'database' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Database Da'i
          </button>
          <button
            onClick={() => setActiveTab('dana')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'dana' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Penataan Dana
          </button>
          <button
            onClick={() => setActiveTab('panduan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'panduan' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Panduan Tombol
          </button>
        </div>
      </div>
    </header>
  );
};
