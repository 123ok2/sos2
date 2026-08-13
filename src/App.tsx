import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { SosDashboard } from "./components/SosDashboard";
import { AiAudioGuardian } from "./components/AiAudioGuardian";
import { SmartDangerMap } from "./components/SmartDangerMap";
import { AiFirstAidAssistant } from "./components/AiFirstAidAssistant";
import { MedicalProfileManager } from "./components/MedicalProfileManager";
import { SosCountdownModal } from "./components/SosCountdownModal";
import { ContestDemoPanel } from "./components/ContestDemoPanel";
import { UserProfile, GeoLocationState } from "./types";
import { INITIAL_USER_PROFILE, INITIAL_LOCATION, MOCK_DANGER_ZONES } from "./data/mockData";
import { playEmergencySiren, stopEmergencySiren } from "./utils/audioSynth";
import { ShieldAlert, Award, Heart, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("sos");
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("ai_safetynet_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading saved profile:", e);
    }
    return INITIAL_USER_PROFILE;
  });
  const [location, setLocation] = useState<GeoLocationState>(INITIAL_LOCATION);

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem("ai_safetynet_profile", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving profile:", e);
    }
  };

  // Emergency States
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [isSosCountdownOpen, setIsSosCountdownOpen] = useState(false);
  const [sosCountdownReason, setSosCountdownReason] = useState("");
  const [isDemoPanelOpen, setIsDemoPanelOpen] = useState(false);
  const [isSosActiveSuccess, setIsSosActiveSuccess] = useState(false);

  // Try real browser HTML5 Geolocation API
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            speed: pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : prev.speed,
            isSimulated: false,
            timestamp: Date.now(),
          }));
        },
        (err) => {
          console.log("Using simulated GPS location fallback:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Toggle Siren
  const handleToggleSiren = () => {
    if (isSirenPlaying) {
      stopEmergencySiren();
      setIsSirenPlaying(false);
    } else {
      playEmergencySiren();
      setIsSirenPlaying(true);
    }
  };

  // Toggle Strobe Light
  const handleToggleStrobe = () => {
    setIsStrobeActive(!isStrobeActive);
  };

  // Trigger SOS Countdown Modal
  const handleTriggerSosCountdown = (reason: string) => {
    setSosCountdownReason(reason);
    setIsSosCountdownOpen(true);
  };

  // Confirm SOS Broadcast from Modal
  const handleConfirmSos = () => {
    setIsSosCountdownOpen(false);
    setIsSirenPlaying(true);
    setIsStrobeActive(true);
    setIsSosActiveSuccess(true);
    setActiveTab("sos");
  };

  // Cancel Countdown
  const handleCancelCountdown = () => {
    setIsSosCountdownOpen(false);
  };

  // Demo Scenario Handlers
  const handleDemoFall = () => {
    setActiveTab("guardian");
    handleTriggerSosCountdown("Mô phỏng ngã xe va chạm mạnh (4.8G)");
  };

  const handleDemoScream = () => {
    setActiveTab("guardian");
    handleTriggerSosCountdown("AI Phát hiện tiếng kêu cứu: 'Cứu tôi với! Có người bị nạn'");
  };

  const handleDemoDangerZone = () => {
    const targetZone = MOCK_DANGER_ZONES[0];
    setLocation({
      ...location,
      lat: targetZone.lat,
      lng: targetZone.lng,
      address: `Vùng nguy hiểm: ${targetZone.name}`,
      isSimulated: true,
    });
    setActiveTab("map");
  };

  const handleResetDemo = () => {
    stopEmergencySiren();
    setIsSirenPlaying(false);
    setIsStrobeActive(false);
    setIsSosActiveSuccess(false);
    setLocation(INITIAL_LOCATION);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-red-500 selection:text-white pb-12">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSirenPlaying={isSirenPlaying}
        onToggleSiren={handleToggleSiren}
        onOpenDemoPanel={() => setIsDemoPanelOpen(true)}
        batteryLevel={location.batteryLevel}
        gpsActive={!location.isSimulated}
        contactsCount={userProfile.emergencyContacts.length}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active SOS Broadcast Success Alert Toast */}
        {isSosActiveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse border-2 border-red-400">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm">ĐÃ PHÁT TÍN HIỆU CỨU HỘ SOS THÀNH CÔNG!</h3>
                <p className="text-xs text-red-100">
                  Tọa độ GPS ({location.lat.toFixed(4)}, {location.lng.toFixed(4)}) đã được tự động phát tới người thân và cơ quan chức năng.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsSosActiveSuccess(false);
                stopEmergencySiren();
                setIsSirenPlaying(false);
              }}
              className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow hover:bg-black transition"
            >
              Tắt Tín Hiệu SOS
            </button>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === "sos" && (
          <SosDashboard
            userProfile={userProfile}
            location={location}
            isSirenPlaying={isSirenPlaying}
            onToggleSiren={handleToggleSiren}
            onTriggerSosCountdown={handleTriggerSosCountdown}
            isStrobeActive={isStrobeActive}
            onToggleStrobe={handleToggleStrobe}
          />
        )}

        {activeTab === "guardian" && (
          <AiAudioGuardian onTriggerSosCountdown={handleTriggerSosCountdown} />
        )}

        {activeTab === "map" && (
          <SmartDangerMap
            location={location}
            onUpdateLocation={(newLoc) => setLocation((prev) => ({ ...prev, ...newLoc }))}
            onTriggerSosCountdown={handleTriggerSosCountdown}
          />
        )}

        {activeTab === "firstaid" && <AiFirstAidAssistant />}

        {activeTab === "profile" && (
          <MedicalProfileManager
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Emergency Countdown Modal */}
      <SosCountdownModal
        isOpen={isSosCountdownOpen}
        reason={sosCountdownReason}
        userProfile={userProfile}
        onCancel={handleCancelCountdown}
        onConfirmSos={handleConfirmSos}
      />

      {/* Contest Demo Simulation Panel */}
      <ContestDemoPanel
        isOpen={isDemoPanelOpen}
        onClose={() => setIsDemoPanelOpen(false)}
        onTriggerFallDemo={handleDemoFall}
        onTriggerScreamDemo={handleDemoScream}
        onTriggerDangerZoneDemo={handleDemoDangerZone}
        onResetDemo={handleResetDemo}
      />

      {/* Footer Credentials */}
      <footer className="mt-12 border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="flex items-center justify-center gap-1 font-semibold text-slate-400">
          <span>AI SafetyNet</span>
          <span className="text-red-500">•</span>
          <span>Dự án Cuộc thi Trí Tuệ Nhân Tạo (AI Contest)</span>
        </p>
        <p>Hệ thống Phát hiện Té ngã, Cảnh báo Nguy hiểm & Cứu hộ Thông minh powered by Google Gemini AI</p>
      </footer>
    </div>
  );
}
