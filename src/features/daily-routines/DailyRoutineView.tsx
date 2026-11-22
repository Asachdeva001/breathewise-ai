import React, { useState } from 'react';
import { Sun, Sunset, Moon, Sunrise, CheckCircle, Award, ArrowRight, HelpCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { RecommendationResponse, RoutineSlot } from '../../../shared/types.js';

interface DailyRoutineViewProps {
  recommendations: RecommendationResponse | null;
  loading: boolean;
  onLogAction: (payload: { actionType: string; title: string }) => void;
}

export const DailyRoutineView: React.FC<DailyRoutineViewProps> = ({
  recommendations,
  loading,
  onLogAction,
}) => {
  // Track activity swaps per slot index
  const [swappedSlots, setSwappedSlots] = useState<Record<number, boolean>>({});

  if (loading || !recommendations) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4" role="status" aria-live="polite">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Generating tailored diurnal routine plan based on your family profile...</p>
      </div>
    );
  }

  const { summary, vulnerabilityFactor, routineSlots } = recommendations;

  const toggleSwap = (index: number) => {
    setSwappedSlots((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getSlotIcon = (slot: string) => {
    if (slot.includes('Morning')) return <Sunrise className="w-5 h-5 text-amber-500" aria-hidden="true" />;
    if (slot.includes('Midday')) return <Sun className="w-5 h-5 text-yellow-500" aria-hidden="true" />;
    if (slot.includes('Evening')) return <Sunset className="w-5 h-5 text-orange-500" aria-hidden="true" />;
    return <Moon className="w-5 h-5 text-indigo-400" aria-hidden="true" />;
  };

  const getStatusBadge = (status: RoutineSlot['outdoorStatus'], isSwapped: boolean) => {
    if (isSwapped) {
      return (
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Indoor Safe Swap
        </span>
      );
    }
    switch (status) {
      case 'Safe':
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Outdoor Safe</span>;
      case 'Caution':
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">Caution Window</span>;
      case 'Avoid':
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">Avoid Outdoors</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" aria-hidden="true" /> Context-Calibrated Daily Schedule
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{summary}</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong>Vulnerability Context:</strong> {vulnerabilityFactor}
          </p>
        </div>
      </div>

      {/* 4 Diurnal Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routineSlots.map((slot, index) => {
          const isSwapped = !!swappedSlots[index];

          return (
            <div
              key={index}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                isSwapped
                  ? 'border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                      {getSlotIcon(slot.timeSlot)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">{slot.timeSlot}</span>
                      <h3 className="text-sm font-extrabold text-slate-900">{slot.title}</h3>
                    </div>
                  </div>
                  {getStatusBadge(slot.outdoorStatus, isSwapped)}
                </div>

                {/* Recommended Actions / Swapped Protocol */}
                <div className="mt-4 space-y-3">
                  {isSwapped ? (
                    <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                          Safer Activity Protocol Active
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                          +115 µg PM2.5 Inhalation Avoided
                        </span>
                      </div>
                      <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                        Swapped outdoor high-inhalation activity for indoor aerobic exercise in a sealed room with active HEPA filtration (indoor PM2.5 &lt;15 µg/m³ vs ambient &gt;250 µg/m³).
                      </p>
                      <div className="text-[11px] text-emerald-800 font-mono pt-1">
                        Basis: 45 min light exercise @ 1.2 m³/h ventilation rate × 90% filtration efficiency.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" /> Recommended Actions
                      </h4>
                      <ul className="space-y-1.5">
                        {slot.recommendedActions.map((action, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" aria-hidden="true" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Safe Indoor Alternatives */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Indoor Activity Alternatives
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {slot.indoorActivities.join(' • ')}
                    </p>
                  </div>

                  {/* Commute Advice */}
                  <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-xs text-blue-900">
                    <strong>Commute Note:</strong> {slot.commuteAdvice}
                  </div>

                  {/* Scientific Reason */}
                  <div className="text-[11px] text-slate-500 flex items-start gap-1.5 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>Why this matters:</strong> {slot.scientificReason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Swap Activity + Log */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleSwap(index)}
                  className={`w-full py-1.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    isSwapped
                      ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                  aria-pressed={isSwapped}
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  <span>{isSwapped ? 'Revert to Standard Schedule' : 'Swap to Safer Indoor Activity'}</span>
                </button>

                <button
                  onClick={() =>
                    onLogAction({
                      actionType: 'routine_shift',
                      title: isSwapped
                        ? `Completed Safe Indoor Swap for ${slot.timeSlot}`
                        : `Followed ${slot.timeSlot} Protocol (${slot.title})`,
                    })
                  }
                  className={`w-full py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    isSwapped
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-300 border border-slate-200'
                  }`}
                >
                  <span>{isSwapped ? 'Log Swapped Safe Activity (+115 µg avoided)' : 'I Followed This Routine Slot'}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
