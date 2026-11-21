import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Home,
  Leaf,
  Bot,
  Award,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { OnboardingModal } from './features/onboarding/OnboardingModal.js';
import { AqiDashboard } from './features/air-quality/AqiDashboard.js';
import { DailyRoutineView } from './features/daily-routines/DailyRoutineView.js';
import { IndoorOptimizerView } from './features/indoor-air/IndoorOptimizerView.js';
import { SustainabilityAdvisorView } from './features/sustainability/SustainabilityAdvisorView.js';
import { ChatAssistantView } from './features/assistant/ChatAssistantView.js';
import { ImpactTrackerView } from './features/impact-tracker/ImpactTrackerView.js';

import { useAirQuality } from './hooks/useAirQuality.js';
import { usePreferences } from './hooks/usePreferences.js';
import { useRecommendations } from './hooks/useRecommendations.js';
import { useImpact } from './hooks/useImpact.js';
import { useChat } from './hooks/useChat.js';

type ActiveTab = 'dashboard' | 'routines' | 'indoor' | 'sustainability' | 'assistant' | 'impact';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core Data Hooks
  const {
    city,
    setCity,
    telemetry,
    isDemo,
    setIsDemo,
    scenario,
    setScenario,
    loading: aqiLoading,
    error: aqiError,
    refresh: refreshAqi,
  } = useAirQuality('New Delhi');

  const { profile, saveProfile, userId } = usePreferences();
  const { recommendations, loading: recsLoading } = useRecommendations(telemetry, profile);
  const { impact, loading: impactLoading, actionSuccessMessage, logAction } = useImpact(userId);
  const { messages, sending: chatSending, error: chatError, sendMessage } = useChat(
    telemetry,
    profile
  );

  const navTabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'AQI Intelligence', icon: LayoutDashboard },
    { id: 'routines', label: 'Daily Routine', icon: CalendarClock },
    { id: 'indoor', label: 'Indoor Optimizer', icon: Home },
    { id: 'sustainability', label: 'Sustainable Living', icon: Leaf },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'impact', label: 'Impact Tracker', icon: Award },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <Header
        currentCity={city}
        onCityChange={(newCity) => {
          setCity(newCity);
          saveProfile({ cityName: newCity });
        }}
        telemetry={telemetry}
        isDemo={isDemo}
        onToggleDemo={setIsDemo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={refreshAqi}
        loading={aqiLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Bar Tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs"
          role="tablist"
          aria-label="Application Sections"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div id={`panel-${activeTab}`} role="tabpanel" tabIndex={0} className="outline-hidden">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <AqiDashboard
                telemetry={telemetry}
                loading={aqiLoading}
                error={aqiError}
                isDemo={isDemo}
                scenario={scenario}
                onSelectScenario={setScenario}
                onNavigateToRoutine={() => setActiveTab('routines')}
                onOpenAssistant={() => setActiveTab('assistant')}
              />

              {/* Inline Routine Preview */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Today's Personalized Routine Preview
                    </h3>
                    <p className="text-xs text-slate-500">
                      Diurnal schedule calibrated to your household vulnerability
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('routines')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    View Full 4-Slot Breakdown →
                  </button>
                </div>
                <DailyRoutineView
                  recommendations={recommendations}
                  loading={recsLoading}
                  onLogAction={(payload) => logAction(payload)}
                />
              </div>
            </div>
          )}

          {activeTab === 'routines' && (
            <DailyRoutineView
              recommendations={recommendations}
              loading={recsLoading}
              onLogAction={(payload) => logAction(payload)}
            />
          )}

          {activeTab === 'indoor' && (
            <IndoorOptimizerView
              indoorHacks={recommendations?.indoorHacks || []}
              onLogAction={(payload) => logAction(payload)}
            />
          )}

          {activeTab === 'sustainability' && (
            <SustainabilityAdvisorView
              alternatives={recommendations?.sustainableAlternatives || []}
              defaultDistanceKm={profile?.averageCommuteDistanceKm || 15}
              defaultCommute={profile?.primaryCommute || 'personal_car'}
              onLogAction={(payload) => logAction(payload)}
            />
          )}

          {activeTab === 'assistant' && (
            <ChatAssistantView
              messages={messages}
              sending={chatSending}
              error={chatError}
              onSendMessage={sendMessage}
              telemetry={telemetry}
            />
          )}

          {activeTab === 'impact' && (
            <ImpactTrackerView
              impact={impact}
              loading={impactLoading}
              successMessage={actionSuccessMessage}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Onboarding & Family Profile Modal */}
      <OnboardingModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSave={saveProfile}
      />
    </div>
  );
};
export default App;
