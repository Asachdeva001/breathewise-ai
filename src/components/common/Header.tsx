import React, { useState } from 'react';
import { Wind, MapPin, Sliders, Sparkles, RefreshCw, AlertCircle, Navigation } from 'lucide-react';
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
  'Pune',
  'Ahmedabad',
  'Lucknow',
  'Patna',
  'Lahore',
  'Beijing',
  'London',
  'New York',
];

// Approximate coordinates for nearest-city detection
const CITY_GEO_LOOKUP: Record<string, { lat: number; lon: number }> = {
  'New Delhi': { lat: 28.6139, lon: 77.209 },
  'Mumbai': { lat: 19.076, lon: 72.8777 },
  'Bengaluru': { lat: 12.9716, lon: 77.5946 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Hyderabad': { lat: 17.385, lon: 78.4867 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Lucknow': { lat: 26.8467, lon: 80.9462 },
  'Patna': { lat: 25.5941, lon: 85.1376 },
};

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onCityChange,
  isDemo,
  onToggleDemo,
  onOpenSettings,
  onRefresh,
  loading,
}) => {
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Find closest supported city by Euclidean distance
        let closestCity = 'New Delhi';
        let minDistance = Infinity;

        for (const [cityName, coords] of Object.entries(CITY_GEO_LOOKUP)) {
          const d = Math.hypot(coords.lat - latitude, coords.lon - longitude);
          if (d < minDistance) {
            minDistance = d;
            closestCity = cityName;
          }
        }

        onCityChange(closestCity);
        setDetectingLocation(false);
      },
      () => {
        setDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs" role="banner">
      {/* Skip to Content for Screen Readers & Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-hidden"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20"
                aria-hidden="true"
              >
                <Wind className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                    BreatheWise <span className="text-brand-600">AI</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    <Sparkles className="w-3 h-3" aria-hidden="true" /> GenAI Decision Support
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Breathe Smarter. Live Better.</p>
              </div>
            </div>

            {/* Mobile Settings Button */}
            <button
              onClick={onOpenSettings}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              aria-label="Household Context & Settings"
            >
              <Sliders className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Controls: Location, Demo Mode & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="toolbar" aria-label="Dashboard controls">
            {/* City Selector */}
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" aria-hidden="true" />
              <select
                value={currentCity}
                onChange={(e) => onCityChange(e.target.value)}
                aria-label="Select Target City"
                className="pl-8 pr-8 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                {SUPPORTED_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Geolocation Detect Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              title="Detect my location"
              aria-label="Detect my location"
            >
              <Navigation className={`w-4 h-4 ${detectingLocation ? 'animate-spin text-brand-600' : ''}`} aria-hidden="true" />
            </button>

            {/* Live / Demo Mode Toggle */}
            <div
              className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200"
              role="radiogroup"
              aria-label="Data Source Mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={!isDemo}
                onClick={() => onToggleDemo(false)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
                  !isDemo
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live Telemetry
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={isDemo}
                onClick={() => onToggleDemo(true)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                  isDemo
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertCircle className="w-3 h-3" aria-hidden="true" /> Demo Mode
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              title="Refresh telemetry"
              aria-label="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>

            {/* Desktop Settings / Preferences */}
            <button
              onClick={onOpenSettings}
              aria-label="Open Family Profile and Household Context Settings"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-colors focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <Sliders className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>Family Profile</span>
            </button>
          </div>
        </div>

        {/* Demo Mode Banner Indicator */}
        {isDemo && (
          <div
            className="mt-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-md flex items-center justify-between"
            role="status"
            aria-live="polite"
          >
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
