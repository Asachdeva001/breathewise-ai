import React from 'react';
import { Wind, MapPin, Sliders, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { AqiTelemetry } from '../../../shared/types.js';

interface HeaderProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  telemetry: AqiTelemetry | null;
  isDemo: boolean;
  onToggleDemo: (demo: boolean) => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  loading: boolean;
}

const SUPPORTED_CITIES = [
  'New Delhi',
  'Mumbai',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Lucknow',
  'Patna',
  'Lahore',
  'Beijing',
  'London',
  'New York',
];

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onCityChange,
  telemetry,
  isDemo,
  onToggleDemo,
  onOpenSettings,
  onRefresh,
  loading,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Wind className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                    BreatheWise <span className="text-brand-600">AI</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    <Sparkles className="w-3 h-3" /> GenAI Decision Support
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Breathe Smarter. Live Better.</p>
              </div>
            </div>

            {/* Mobile Settings Button */}
            <button
              onClick={onOpenSettings}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Household Context & Settings"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>

          {/* Controls: Location, Demo Mode & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* City Selector */}
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={currentCity}
                onChange={(e) => onCityChange(e.target.value)}
                aria-label="Select City"
                className="pl-8 pr-8 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                {SUPPORTED_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Live / Demo Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onToggleDemo(false)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  !isDemo
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live Telemetry
              </button>
              <button
                type="button"
                onClick={() => onToggleDemo(true)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  isDemo
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertCircle className="w-3 h-3" /> Demo Mode
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh telemetry"
              aria-label="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Desktop Settings / Preferences */}
            <button
              onClick={onOpenSettings}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-colors"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Family Profile</span>
            </button>
          </div>
        </div>

        {/* Demo Mode Banner Indicator */}
        {isDemo && (
          <div className="mt-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-md flex items-center justify-between">
            <span className="font-medium">
              ⚡ <strong>Demonstration Mode Active:</strong> Simulating real-world severe winter smog scenarios for evaluation.
            </span>
            <span className="text-[11px] font-mono text-amber-700">CPCB piecewise calibrated</span>
          </div>
        )}
      </div>
    </header>
  );
};
