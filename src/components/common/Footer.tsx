import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">BreatheWise AI Architecture</h3>
            <p className="text-slate-400 leading-relaxed">
              Powered by Google Cloud Vertex AI (Gemini Flash), Cloud Run, and Cloud Firestore.
              Features a deterministic environmental decision engine with piecewise CPCB Indian NAQI calibration.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Environmental Data Standards</h3>
            <p className="text-slate-400 leading-relaxed">
              Pollutant sub-indices are mathematically calculated using official Central Pollution Control Board (CPCB) NAQI breakpoint formulas. Telemetry ingested via Open-Meteo Air Quality API with in-memory TTL caching.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Public Health Disclaimer
            </h3>
            <p className="text-slate-400 leading-relaxed">
              BreatheWise AI is an environmental lifestyle and decision-support system. It does not provide certified medical diagnoses or clinical prescription advice. For acute respiratory distress, consult a certified physician.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BreatheWise AI. Built for the Urban Air Quality Challenge.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> WCAG 2.1 AA Accessible
            </span>
            <span>•</span>
            <span>Zero PII Collected</span>
            <span>•</span>
            <span>Single Branch Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
