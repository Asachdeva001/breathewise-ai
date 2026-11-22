import React, { useState } from 'react';
import { Users, Copy, Check, Megaphone, Flame, Shield, School, ArrowRight, PhoneCall } from 'lucide-react';
import { CommunityAction } from '../../../shared/types.js';

interface CommunityActionViewProps {
  communityActions: CommunityAction[];
  onLogAction: (payload: { actionType: string; title: string }) => void;
}

export const CommunityActionView: React.FC<CommunityActionViewProps> = ({
  communityActions,
  onLogAction,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTemplate = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'anti_burning':
        return <Flame className="w-5 h-5 text-rose-500" aria-hidden="true" />;
      case 'school_commute':
        return <School className="w-5 h-5 text-amber-500" aria-hidden="true" />;
      case 'clean_air_sanctuary':
        return <Shield className="w-5 h-5 text-emerald-500" aria-hidden="true" />;
      default:
        return <Megaphone className="w-5 h-5 text-blue-500" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" aria-hidden="true" /> Neighborhood Collective Action
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Community Smog Defense & Neighborhood Action Hub
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Individual families cannot solve winter smog alone. Collective neighborhood actions—such as stopping local waste and leaf burning, organizing school carpools, and setting up community clean air rooms in apartment clubhouses—multiply environmental defense and protect vulnerable neighbors.
          </p>
        </div>
      </div>

      {/* Emergency Helpline Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <PhoneCall className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">Municipal Smog & Open Burning Helplines</h4>
            <p className="text-[11px] text-slate-500">
              Report active leaf burning, construction dust violations, and industrial emissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-800 border border-slate-200">
            Sameer App / Delhi Green: 311
          </span>
          <span className="text-xs font-mono font-bold bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200">
            Pollution Control Helpline: 1800-180-1817
          </span>
        </div>
      </div>

      {/* Community Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communityActions.map((action) => (
          <div
            key={action.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                    {getCategoryIcon(action.category)}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Target: {action.targetAudience}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900">{action.title}</h3>
                  </div>
                </div>
              </div>

              {/* Impact Statement */}
              <div className="bg-indigo-50/70 border border-indigo-100 p-2.5 rounded-xl text-xs text-indigo-950 font-medium">
                <strong>Why it matters:</strong> {action.impactStatement}
              </div>

              {/* Action Steps */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Action Steps for Communities:
                </span>
                <ul className="space-y-1.5">
                  {action.actionSteps.map((step, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" aria-hidden="true" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pre-Drafted Notice / WhatsApp Broadcast */}
              {action.broadcastTemplate && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      RWA / WhatsApp Notice Template
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(action.id, action.broadcastTemplate)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      aria-label="Copy Notice Template to Clipboard"
                    >
                      {copiedId === action.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copy Notice</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                    {action.broadcastTemplate}
                  </pre>
                </div>
              )}

              {/* Estimated Community Benefit */}
              <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 font-medium">
                <strong>Quantified Community Impact:</strong> {action.estimatedCommunityBenefit}
              </div>
            </div>

            {/* Action Log Button */}
            <button
              onClick={() =>
                onLogAction({
                  actionType: 'community_action',
                  title: `Initiated Community Protocol: ${action.title}`,
                })
              }
              className="w-full py-2 px-3 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <span>I Organized / Shared This In My Community</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
