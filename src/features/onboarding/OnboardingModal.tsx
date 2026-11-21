import React, { useState } from 'react';
import { X, Users, Home, Shield, Car, Heart, Check, Sparkles } from 'lucide-react';
import { CommuteMode, HomeType, HouseholdVulnerability, UserProfile } from '../../../shared/types.js';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (updated: Partial<UserProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  if (!isOpen) return null;

  const [householdSize, setHouseholdSize] = useState<number>(profile?.householdSize || 4);
  const [vulnerabilities, setVulnerabilities] = useState<HouseholdVulnerability[]>(
    profile?.vulnerabilities || []
  );
  const [homeType, setHomeType] = useState<HomeType>(profile?.homeType || 'apartment');
  const [hasPurifier, setHasPurifier] = useState<boolean>(profile?.hasAirPurifier || false);
  const [hasKitchenExhaust, setHasKitchenExhaust] = useState<boolean>(
    profile?.hasKitchenExhaust ?? true
  );
  const [primaryCommute, setPrimaryCommute] = useState<CommuteMode>(
    profile?.primaryCommute || 'personal_car'
  );
  const [distanceKm, setDistanceKm] = useState<number>(profile?.averageCommuteDistanceKm || 15);
  const [exercisePref, setExercisePref] = useState<'morning' | 'afternoon' | 'evening' | 'indoor_only'>(
    profile?.exercisePreference || 'morning'
  );

  const toggleVulnerability = (v: HouseholdVulnerability) => {
    setVulnerabilities((prev) =>
      prev.includes(v) ? prev.filter((item) => item !== v) : [...prev, v]
    );
  };

  const handleSave = () => {
    onSave({
      householdSize,
      vulnerabilities,
      homeType,
      hasAirPurifier: hasPurifier,
      hasKitchenExhaust,
      primaryCommute,
      averageCommuteDistanceKm: distanceKm,
      exercisePreference: exercisePref,
      onboardingCompleted: true,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 to-emerald-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 id="onboarding-title" className="text-lg font-bold">
                Personalize Your Air Quality Advice
              </h2>
              <p className="text-xs text-emerald-100">
                Tailor daily routines and indoor hacks to your family's lifestyle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Privacy Note */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Guarantee:</strong> We collect zero personally identifiable information (no names, no phone numbers, no exact street addresses). This context is used purely to calibrate health sensitivity thresholds.
            </p>
          </div>

          {/* Household Vulnerabilities */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Sensitive Family Members
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Select all that apply. Smog exertion warnings will automatically shift to protect vulnerable lung alveoli.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'infants_children' as const, label: 'Children or Infants (<14 yrs)' },
                { id: 'elderly' as const, label: 'Elderly Family Members (60+ yrs)' },
                { id: 'asthma_respiratory' as const, label: 'Asthma or Respiratory Condition' },
                { id: 'cardiovascular' as const, label: 'Heart or Cardiovascular History' },
                { id: 'pregnancy' as const, label: 'Pregnancy' },
              ].map((item) => {
                const checked = vulnerabilities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleVulnerability(item.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      checked
                        ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        checked ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Home Setup */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-brand-600" /> Home & Indoor Environment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-600 block mb-1">Residence Type</span>
                <select
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value as HomeType)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                >
                  <option value="apartment">Multi-Story Apartment</option>
                  <option value="independent_house">Independent House / Villa</option>
                  <option value="other">Other / Shared Living</option>
                </select>
              </div>

              <div>
                <span className="text-xs text-slate-600 block mb-1">Household Size</span>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => setHasPurifier(!hasPurifier)}
                className={`p-2.5 rounded-xl border text-xs text-left font-medium flex items-center justify-between ${
                  hasPurifier ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-slate-200 text-slate-700'
                }`}
              >
                <span>Own an Electric Air Purifier?</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${hasPurifier ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {hasPurifier ? 'Yes' : 'No'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHasKitchenExhaust(!hasKitchenExhaust)}
                className={`p-2.5 rounded-xl border text-xs text-left font-medium flex items-center justify-between ${
                  hasKitchenExhaust ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-slate-200 text-slate-700'
                }`}
              >
                <span>Kitchen Exhaust / Chimney?</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${hasKitchenExhaust ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {hasKitchenExhaust ? 'Yes' : 'No'}
                </span>
              </button>
            </div>
          </div>

          {/* Commute Habits */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" /> Commuting Habits & Routine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-600 block mb-1">Primary Commute Mode</span>
                <select
                  value={primaryCommute}
                  onChange={(e) => setPrimaryCommute(e.target.value as CommuteMode)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                >
                  <option value="personal_car">Personal Car (Petrol/Diesel)</option>
                  <option value="two_wheeler">Two-Wheeler (Motorcycle/Scooter)</option>
                  <option value="carpool">Carpool / Shared Cab</option>
                  <option value="metro_train">Metro / Electric Rail</option>
                  <option value="bus">City Bus (CNG / Electric)</option>
                  <option value="walking_cycling">Walking or Bicycle</option>
                </select>
              </div>

              <div>
                <span className="text-xs text-slate-600 block mb-1">One-Way Distance (km)</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Skip for now (use defaults)
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-colors"
          >
            Save Profile & Apply Guidance
          </button>
        </div>
      </div>
    </div>
  );
};
