import React from 'react';
import { AlertTriangle, Clock, Activity, ShieldAlert, Sparkles, ChevronRight, Layers } from 'lucide-react';
import { AqiTelemetry } from '../../../shared/types.js';
import { AqiBadge } from '../../components/common/AqiBadge.js';

interface AqiDashboardProps {
  telemetry: AqiTelemetry | null;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  scenario: string;
  onSelectScenario: (scenario: string) => void;
  onNavigateToRoutine: () => void;
  onOpenAssistant: () => void;
}

export const AqiDashboard: React.FC<AqiDashboardProps> = ({
  telemetry,
  loading,
  error,
  isDemo,
  scenario,
  onSelectScenario,
  onNavigateToRoutine,
  onOpenAssistant,
}) => {
  if (loading && !telemetry) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Retrieving atmospheric telemetry and computing CPCB indices...</p>
      </div>
    );
  }

  if (error || !telemetry) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-rose-900">Failed to Load Air Quality Telemetry</h3>
        <p className="text-xs text-rose-700">{error || 'Data is unavailable'}</p>
      </div>
    );
  }

  const { aqi, category, dominantPollutant, pollutants, subIndices, healthAdvisory, sensitiveGroupWarning, source, timestamp } = telemetry;

  return (
    <div className="space-y-6">
      {/* Demo Scenario Switcher (Visible when Demo Mode is On) */}
      {isDemo && (
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-amber-600" /> Winter Smog Simulation Scenarios
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'severe_winter_smog', label: 'Severe Winter Inversion Smog', city: 'Delhi NCR' },
              { id: 'very_poor_industrial', label: 'Very Poor Industrial Corridor', city: 'Patna' },
              { id: 'moderate_urban', label: 'Moderate Autumn Day', city: 'Bengaluru' },
              { id: 'clean_monsoon', label: 'Good Post-Rain Clean Air', city: 'Shimla' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`p-2 rounded-xl text-left text-xs transition-all border ${
                  scenario === sc.id
                    ? 'bg-amber-500 text-white border-amber-600 font-semibold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="font-bold truncate">{sc.label}</div>
                <div className={`text-[10px] ${scenario === sc.id ? 'text-amber-100' : 'text-slate-500'}`}>
                  {sc.city}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Hero Card: AQI Gauge & Critical Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Score & Dominant Pollutant */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                  Real-Time Environmental Assessment
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {telemetry.city}
              </h2>
            </div>
            <AqiBadge category={category} aqi={aqi} size="lg" />
          </div>

          {/* Big Metric Display */}
          <div className="my-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-y border-slate-800/80 py-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                CPCB National Air Quality Index
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white">
                  {aqi}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  / 500 Max Scale
                </span>
              </div>
            </div>

            <div className="sm:text-right bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
              <div className="text-xs font-semibold text-slate-400 mb-1">Critical Dominant Driver</div>
              <div className="text-xl font-bold text-amber-400 flex items-center sm:justify-end gap-1.5">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>{dominantPollutant}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Sub-Index determines overall health severity
              </p>
            </div>
          </div>

          {/* Health Advisory Highlight */}
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                <strong>Public Health Advisory:</strong> {healthAdvisory}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
              <span>Source: {source}</span>
              <button
                onClick={onOpenAssistant}
                className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ask Assistant About Today's Smog
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Sensitive Group Card & Action CTA */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-brand-600" /> Vulnerable Group Protocol
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-4">
              <h4 className="text-sm font-bold text-slate-900 mb-1">Sensitive Demographics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {sensitiveGroupWarning}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Children & Infants</span>
                <span className="font-semibold text-rose-600">Strict Outdoor Cap</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Asthma / Respiratory</span>
                <span className="font-semibold text-rose-600">Inhaler Standby</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Elderly (60+)</span>
                <span className="font-semibold text-rose-600">Indoor Sanctuary</span>
              </div>
            </div>
          </div>

          {/* Quick CTA to Routine View */}
          <button
            onClick={onNavigateToRoutine}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all hover:gap-3"
          >
            <span>View Today's 4-Slot Action Plan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pollutant Sub-Indices Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Monitored Atmospheric Pollutants
          </h3>
          <span className="text-xs text-slate-500">Piecewise CPCB sub-index breakdown</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'pm25', label: 'PM 2.5', value: pollutants.pm25, unit: 'µg/m³', limit: '60' },
            { key: 'pm10', label: 'PM 10', value: pollutants.pm10, unit: 'µg/m³', limit: '100' },
            { key: 'no2', label: 'NO₂', value: pollutants.no2, unit: 'µg/m³', limit: '80' },
            { key: 'so2', label: 'SO₂', value: pollutants.so2, unit: 'µg/m³', limit: '80' },
            { key: 'co', label: 'CO', value: pollutants.co, unit: 'mg/m³', limit: '2.0' },
            { key: 'o3', label: 'Ozone (O₃)', value: pollutants.o3, unit: 'µg/m³', limit: '100' },
          ].map((item) => {
            const sub = subIndices.find((s) => s.pollutant.toLowerCase() === item.key.toLowerCase());
            const isDominant = dominantPollutant.toLowerCase() === item.key.toLowerCase();
            const valText = typeof item.value === 'number' ? item.value : '—';

            return (
              <div
                key={item.key}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  isDominant
                    ? 'border-amber-400 bg-amber-50/30 shadow-sm ring-1 ring-amber-400/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  {isDominant && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-xl font-extrabold font-mono text-slate-900 my-1">
                  {valText} <span className="text-[11px] font-sans font-normal text-slate-500">{item.unit}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Sub-Index:</span>
                  <span className="font-bold font-mono text-slate-800">{sub ? sub.subIndex : '—'}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Safe standard: &lt;{item.limit}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
