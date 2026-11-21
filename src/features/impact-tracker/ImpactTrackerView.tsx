import React, { useState } from 'react';
import { Award, Leaf, Wind, ShieldCheck, TreePine, Clock, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { ImpactSummary } from '../../../shared/types.js';

interface ImpactTrackerViewProps {
  impact: ImpactSummary | null;
  loading: boolean;
  successMessage: string | null;
}

export const ImpactTrackerView: React.FC<ImpactTrackerViewProps> = ({
  impact,
  loading,
  successMessage,
}) => {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  if (loading && !impact) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Calculating cumulative environmental & personal health savings...</p>
      </div>
    );
  }

  const {
    totalAvoidedCo2Kg = 0,
    totalAvoidedPm25Ug = 0,
    actionsCompletedCount = 0,
    weeklyStreakDays = 0,
    recentActions = [],
    equivalentTreesPlanted = 0,
    equivalentCleanAirHours = 0,
  } = impact || {};

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-md flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> Environmental & Health Accounting
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Your Cumulative Impact & Avoided Lung Exposure
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every daily routine adjustment, transit modal substitution, and indoor filtration hack produces measurable health and atmospheric benefits. Here is your verified avoided pollution ledger.
          </p>
        </div>
      </div>

      {/* 4 Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PM2.5 Inhalation Avoided */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
              <Wind className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalAvoidedPm25Ug.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-500">µg</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">
              PM2.5 Lung Dose Avoided
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
            Alveolar toxic particles filtered via N95, HEPA & routine shifts
          </p>
        </div>

        {/* Card 2: CO2e Avoided */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalAvoidedCo2Kg.toFixed(2)} <span className="text-sm font-sans font-normal text-slate-500">kg</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">
              Tailpipe CO₂e Prevented
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
            Green transit shifts vs solo internal combustion driving
          </p>
        </div>

        {/* Card 3: Equivalent Clean Air Hours */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-200">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {equivalentCleanAirHours} <span className="text-sm font-sans font-normal text-slate-500">hrs</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">
              Clean Air Hours Gained
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
            Equivalent duration breathing clean room-standard air
          </p>
        </div>

        {/* Card 4: Tree Absorption Equivalent */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border border-teal-200">
              <TreePine className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {equivalentTreesPlanted} <span className="text-sm font-sans font-normal text-slate-500">trees</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">
              Tree Absorption Equiv.
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
            Annual carbon sequestering equivalent (21.77 kg/year)
          </p>
        </div>
      </div>

      {/* Methodology Explainer Callout */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Transparent Mathematical Methodology</h4>
            <p className="text-xs text-slate-500">
              We never fabricate impact numbers. Review the exact CPCB and EPA formulas behind your statistics.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFormulaModal(true)}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shrink-0"
        >
          View Scientific Formulas
        </button>
      </div>

      {/* Recent Action Log History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Completed Actions History ({actionsCompletedCount} Total)
          </h3>
          <span className="text-xs text-slate-500">Streak: {weeklyStreakDays} Days</span>
        </div>

        {recentActions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No actions logged yet. Follow a daily routine slot or log an indoor hack to track your impact!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActions.map((act) => (
              <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">{act.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {act.calculationBasis}
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-xs font-bold text-emerald-700">
                    +{act.avoidedPm25Ug.toLocaleString()} µg PM2.5 • +{act.avoidedCo2Kg} kg CO₂e
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleDateString()} at{' '}
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formula Modal */}
      {showFormulaModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Impact Mathematical Formulas</h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <strong className="text-slate-900 block mb-1">1. Inhaled Lung Dose Avoided:</strong>
                <code className="block bg-slate-100 p-2.5 rounded-xl font-mono text-[11px] text-slate-800 mb-1">
                  Dose (µg) = C_ambient (µg/m³) × η_filtration × V_E (m³/h) × T (hours)
                </code>
                <p className="text-slate-500 text-[11px]">
                  Where η = 95% (N95 mask), 90% (HEPA), 80% (DIY Corsi-Rosenthal fan). V_E = minute ventilation rate (0.6 m³/h resting, 1.2 m³/h walking, 2.8 m³/h exercise).
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block mb-1">2. Transit Emission Shift:</strong>
                <code className="block bg-slate-100 p-2.5 rounded-xl font-mono text-[11px] text-slate-800 mb-1">
                  Avoided CO₂e (kg) = Distance (km) × (EF_baseline - EF_alternative)
                </code>
                <p className="text-slate-500 text-[11px]">
                  Emission Factors: Personal Car = 0.170 kg CO₂e/km; Two-Wheeler = 0.075; Bus = 0.045; Metro Rail = 0.022 kg CO₂e/km (ARAI & CPCB standards).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Close Explainer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
