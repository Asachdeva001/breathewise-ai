import React, { useState } from 'react';
import { Leaf, Car, Train, ArrowRight, CheckCircle, ShieldCheck, Flame, Zap, Award } from 'lucide-react';
import { CommuteMode, SustainableAlternative } from '../../../shared/types.js';

interface SustainabilityAdvisorViewProps {
  alternatives: SustainableAlternative[];
  defaultDistanceKm: number;
  defaultCommute: CommuteMode;
  onLogAction: (payload: {
    actionType: string;
    title: string;
    distanceKm: number;
    baselineMode: string;
    alternativeMode: string;
  }) => void;
}

export const SustainabilityAdvisorView: React.FC<SustainabilityAdvisorViewProps> = ({
  alternatives,
  defaultDistanceKm,
  defaultCommute,
  onLogAction,
}) => {
  const [baselineMode, setBaselineMode] = useState<CommuteMode>(defaultCommute || 'personal_car');
  const [alternativeMode, setAlternativeMode] = useState<CommuteMode>('metro_train');
  const [distanceKm, setDistanceKm] = useState<number>(defaultDistanceKm || 15);

  // Client-side quick preview calculation matching the backend engine
  const emissionFactors: Record<CommuteMode, { co2: number; pm: number }> = {
    personal_car: { co2: 0.170, pm: 0.030 },
    two_wheeler: { co2: 0.075, pm: 0.020 },
    carpool: { co2: 0.055, pm: 0.010 },
    bus: { co2: 0.045, pm: 0.008 },
    metro_train: { co2: 0.022, pm: 0.001 },
    walking_cycling: { co2: 0.000, pm: 0.000 },
  };

  const base = emissionFactors[baselineMode] || emissionFactors.personal_car;
  const alt = emissionFactors[alternativeMode] || emissionFactors.metro_train;
  const savedCo2 = Math.max(0, Math.round((base.co2 - alt.co2) * distanceKm * 100) / 100);
  const savedPmGrams = Math.max(0, Math.round((base.pm - alt.pm) * distanceKm * 100) / 100);

  const handleLogCommute = () => {
    onLogAction({
      actionType: 'transit_shift',
      title: `Substituted ${baselineMode.replace('_', ' ')} with ${alternativeMode.replace('_', ' ')} (${distanceKm} km)`,
      distanceKm,
      baselineMode,
      alternativeMode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-green-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5" /> Sustainable Lifestyle & Urban Emission Reductions
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Practical Alternatives That Directly Cut Winter Smog
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Severe winter smog is intensified by vehicular exhaust and open burning. While protecting your family indoors, shifting your daily transit to mass electric rail or CNG buses reduces street-level toxic plumes while lowering your carbon footprint.
          </p>
        </div>
      </div>

      {/* Interactive Commute Modal Substitution Calculator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-500" /> Interactive Modal Shift Emission Calculator
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Baseline Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Regular Commute
            </label>
            <select
              value={baselineMode}
              onChange={(e) => setBaselineMode(e.target.value as CommuteMode)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="personal_car">Personal Car (Petrol/Diesel)</option>
              <option value="two_wheeler">Two-Wheeler (Motorcycle/Scooter)</option>
              <option value="carpool">Carpool / Shared Cab</option>
            </select>
            <div className="mt-2 text-[11px] text-slate-500">
              Factor: {(base.co2 * 1000).toFixed(0)} g CO₂e/km
            </div>
          </div>

          {/* Alternative Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Greener Alternative Mode
            </label>
            <select
              value={alternativeMode}
              onChange={(e) => setAlternativeMode(e.target.value as CommuteMode)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="metro_train">Electric Metro / Rail (Zero street PM)</option>
              <option value="bus">City Bus (Electric / CNG)</option>
              <option value="carpool">3-Person Carpool</option>
              <option value="walking_cycling">Walking / Cycling (Safe AQI hours)</option>
            </select>
            <div className="mt-2 text-[11px] text-slate-500">
              Factor: {(alt.co2 * 1000).toFixed(0)} g CO₂e/km
            </div>
          </div>

          {/* Commute Distance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Trip Distance (km)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
            <div className="mt-2 text-[11px] text-slate-500">Typical urban one-way journey</div>
          </div>
        </div>

        {/* Real-time Calculation Result Bar */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-center sm:text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                {savedCo2} <span className="text-sm font-sans font-semibold">kg CO₂e</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                Emissions Avoided
              </div>
            </div>

            <div className="border-l border-emerald-200 pl-6">
              <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                {savedPmGrams} <span className="text-sm font-sans font-semibold">g PM2.5</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                Tailpipe Particulate Prevented
              </div>
            </div>
          </div>

          <button
            onClick={handleLogCommute}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Log This Green Commute Shift</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sustainable Habits & Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Recommended Lifestyle Shifts & Habits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alternatives.map((alt) => (
            <div
              key={alt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                      {alt.category === 'transit' ? (
                        <Car className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Flame className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        {alt.category}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">{alt.title}</h4>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-rose-900">
                    <strong>Current Habit:</strong> {alt.currentHabit}
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <strong>Sustainable Shift:</strong> {alt.recommendedAlternative}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  <strong>Why it matters:</strong> {alt.rationale}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <span>Avoids ~{alt.estimatedAvoidedCo2Kg} kg CO₂e</span>
                <span>•</span>
                <span>Avoids ~{alt.estimatedAvoidedPmGrams} g PM2.5</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
