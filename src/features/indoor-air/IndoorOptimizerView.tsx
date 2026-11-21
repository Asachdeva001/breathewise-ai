import React from 'react';
import { Home, Sparkles, Fan, Droplets, Flame, CheckCircle } from 'lucide-react';
import { IndoorHack } from '../../../shared/types.js';

interface IndoorOptimizerViewProps {
  indoorHacks: IndoorHack[];
  onLogAction: (payload: { actionType: string; title: string }) => void;
}

export const IndoorOptimizerView: React.FC<IndoorOptimizerViewProps> = ({
  indoorHacks,
  onLogAction,
}) => {

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'purification':
        return <Fan className="w-4 h-4 text-emerald-600" />;
      case 'cleaning':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'cooking':
        return <Flame className="w-4 h-4 text-amber-600" />;
      default:
        return <Home className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> High-Efficiency Indoor Sanctuary Hacks
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Indoor Air Quality Optimization & Low-Cost Hacks
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Most families spend 85% of winter days indoors. Fine particulate matter (PM2.5) effortlessly penetrates window seals and builds up through indoor cooking and sweeping. These practical, low-cost engineering interventions can cut your indoor PM exposure by up to 85%.
          </p>
        </div>
      </div>

      {/* Featured Deep Dive: Corsi-Rosenthal Box Fan Filter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                ⭐ Community Standard
              </span>
              <span className="text-xs font-semibold text-slate-500">Corsi-Rosenthal Box Filter</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Build a Medical-Grade Air Cleaner for Under One-Third the Cost of Commercial Units
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Designed by environmental engineers Dr. Richard Corsi and Jim Rosenthal, this open-source purifier achieves Clean Air Delivery Rates (CADR) exceeding <strong>350 CFM</strong>, matching commercial $400 HEPA purifiers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-1">Required Materials:</span>
                <ul className="text-slate-600 space-y-1 list-disc list-inside">
                  <li>One 20-inch box fan</li>
                  <li>Four MERV-13 pleated air filters (20"×20")</li>
                  <li>One roll of heavy duct tape</li>
                  <li>Cardboard bottom shroud</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                <span className="font-bold block mb-1">Why It Outperforms Single Filters:</span>
                <p className="leading-relaxed">
                  Four filters quadruple the surface area, decreasing air velocity across the filter media. This allows maximum particulate capture (&gt;85% PM2.5) while ensuring the fan motor does not overheat.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 bg-gradient-to-b from-slate-50 to-emerald-50/50 p-5 rounded-2xl border border-slate-200 text-center flex flex-col justify-between shrink-0">
            <div>
              <div className="text-3xl font-black text-emerald-700 font-mono mb-1">~85%</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                PM2.5 Removal Efficiency
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Tested clean air delivery: 350-400 CFM for large living spaces
              </p>
            </div>
            <button
              onClick={() =>
                onLogAction({
                  actionType: 'indoor_hack',
                  title: 'Built / Ran Corsi-Rosenthal DIY Box Fan Purifier',
                })
              }
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Log DIY Purifier Usage
            </button>
          </div>
        </div>
      </div>

      {/* Practical Hacks Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Room-by-Room Evidence-Based Hacks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {indoorHacks.map((hack) => (
            <div
              key={hack.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                      {getCategoryIcon(hack.category)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        {hack.room} • {hack.category}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">{hack.title}</h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {hack.costTier}
                  </span>
                </div>

                {/* Main Action */}
                <p className="text-xs font-semibold text-brand-900 bg-brand-50 p-2.5 rounded-xl border border-brand-200">
                  {hack.action}
                </p>

                {/* Step by step */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    How to implement:
                  </span>
                  <ul className="space-y-1">
                    {hack.instructions.map((step, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scientific mechanism */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                  <strong>Scientific Mechanism:</strong> {hack.scientificMechanism}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  onLogAction({
                    actionType: 'indoor_hack',
                    title: `Completed Hack: ${hack.title}`,
                  })
                }
                className="w-full py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>I Did This Hack Today</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
