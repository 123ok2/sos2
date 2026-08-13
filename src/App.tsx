import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { SosDashboard } from "./components/SosDashboard";
import { AiAudioGuardian } from "./components/AiAudioGuardian";
import { SmartDangerMap } from "./components/SmartDangerMap";
import { AiFirstAidAssistant } from "./components/AiFirstAidAssistant";
import { MedicalProfileManager } from "./components/MedicalProfileManager";
import { FirebaseGuardianShare } from "./components/FirebaseGuardianShare";
import { RelativeTracker } from "./components/RelativeTracker";
import { SosCountdownModal } from "./components/SosCountdownModal";
import { ContestDemoPanel } from "./components/ContestDemoPanel";
import { UserProfile, GeoLocationState } from "./types";
import { INITIAL_USER_PROFILE, INITIAL_LOCATION, MOCK_DANGER_ZONES } from "./data/mockData";
import { playEmergencySiren, stopEmergencySiren } from "./utils/audioSynth";
import { publishLiveStateToFirebase, subscribeToGuardianSession } from "./lib/firebase";
import { ShieldAlert, Award, Heart, CheckCircle2, Bell } from "lucide-react";

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
    // Instantly push updated profile to Firebase Firestore
    if (updated.guardianCode) {
      publishLiveStateToFirebase(
        updated,
        location,
        {
          isAlertActive: isSosActiveSuccess,
          alertType: isSosActiveSuccess ? "SOS_EMERGENCY" : "NONE",
          alertReason: isSosActiveSuccess ? "Người dùng kích hoạt tín hiệu SOS khẩn cấp!" : "Cập nhật hồ sơ cá nhân",
        },
        true
      );
    }
  };

  // Incoming Ping State from Firebase
  const [incomingPing, setIncomingPing] = useState<{ senderName: string; message: string; type: string } | null>(null);

  // Subscribe to own Firebase document for incoming pings/chimes from relatives
  useEffect(() => {
    if (!userProfile.guardianCode) return;

    let lastPingTimestamp = Date.now();

    const unsubscribe = subscribeToGuardianSession(userProfile.guardianCode, (data) => {
      if (data && data.lastPing && data.lastPing.timestamp > lastPingTimestamp) {
        lastPingTimestamp = data.lastPing.timestamp;
        setIncomingPing({
          senderName: data.lastPing.senderName,
          message: data.lastPing.message,
          type: data.lastPing.type,
        });

        if (data.lastPing.type === "RING_BELL") {
          playEmergencySiren();
          setTimeout(() => stopEmergencySiren(), 2000);
        }
      }
    });

    return () => unsubscribe();
  }, [userProfile.guardianCode]);

  // Emergency States
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [isSosCountdownOpen, setIsSosCountdownOpen] = useState(false);
  const [sosCountdownReason, setSosCountdownReason] = useState("");
  const [isDemoPanelOpen, setIsDemoPanelOpen] = useState(false);
  const [isSosActiveSuccess, setIsSosActiveSuccess] = useState(false);

  // 1-Minute Automatic Background Heartbeat Signal Sync
  const [nextHeartbeatSeconds, setNextHeartbeatSeconds] = useState(60);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<string>("Vừa cập nhật");

  useEffect(() => {
    // Perform initial heartbeat broadcast
    if (userProfile.guardianCode) {
      publishLiveStateToFirebase(
        userProfile,
        location,
        {
          isAlertActive: isSosActiveSuccess,
          alertType: isSosActiveSuccess ? "SOS_EMERGENCY" : "NONE",
          alertReason: isSosActiveSuccess ? "Người dùng kích hoạt tín hiệu SOS khẩn cấp!" : "Heartbeat tự động 1 phút/lần",
        },
        true
      );
      setLastHeartbeatTime(new Date().toLocaleTimeString("vi-VN"));
    }

    // Interval every 1 second to update countdown
    const timer = setInterval(() => {
      setNextHeartbeatSeconds((prev) => {
        if (prev <= 1) {
          // Trigger 1-minute heartbeat update to Firebase
          if (userProfile.guardianCode) {
            publishLiveStateToFirebase(
              userProfile,
              location,
              {
                isAlertActive: isSosActiveSuccess,
                alertType: isSosActiveSuccess ? "SOS_EMERGENCY" : "NONE",
                alertReason: isSosActiveSuccess ? "Người dùng kích hoạt tín hiệu SOS khẩn cấp!" : "Heartbeat tự động 1 phút/lần",
              },
              true
            );
            setLastHeartbeatTime(new Date().toLocaleTimeString("vi-VN"));
          }
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userProfile, location, isSosActiveSuccess]);

  // Try real browser HTML5 Geolocation API with reverse geocoding
  const fetchAddressForCoords = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "vi" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
    return `Tọa độ GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const refreshRealLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Trình duyệt không hỗ trợ vị trí GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const resolvedAddress = await fetchAddressForCoords(latitude, longitude);

        setLocation((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          address: resolvedAddress,
          isSimulated: false,
          timestamp: Date.now(),
        }));
      },
      (err) => {
        let msg = "Không thể lấy vị trí GPS.";
        if (err.code === 1) msg = "Vui lòng cho phép ứng dụng truy cập Vị trí (GPS) trên trình duyệt!";
        else if (err.code === 2) msg = "Không tìm thấy tín hiệu GPS. Đang dùng tọa độ ước tính.";
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    refreshRealLocation();

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation((prev) => {
            const needsAddressFetch = prev.address === "Đang xác định vị trí GPS thiết bị..." || Math.abs(prev.lat - lat) > 0.001 || Math.abs(prev.lng - lng) > 0.001;
            if (needsAddressFetch) {
              fetchAddressForCoords(lat, lng).then((addr) => {
                setLocation((current) => ({ ...current, address: addr }));
              });
            }
            return {
              ...prev,
              lat,
              lng,
              accuracy: Math.round(pos.coords.accuracy),
              speed: pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : prev.speed,
              isSimulated: false,
              timestamp: Date.now(),
            };
          });
        },
        (err) => {
          console.log("GPS watch error fallback:", err.message);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
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

        {/* Incoming Ping Toast Alert from Firebase */}
        {incomingPing && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-2xl flex items-center justify-between gap-3 animate-bounce border-2 border-amber-300">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-white shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm">THÔNG BÁO KIỂM TRA TỪ NGƯỜI THÂN ({incomingPing.senderName}):</h3>
                <p className="text-xs text-amber-100 font-medium">{incomingPing.message}</p>
              </div>
            </div>
            <button
              onClick={() => setIncomingPing(null)}
              className="px-3 py-1 bg-slate-900 text-amber-300 font-bold text-xs rounded-xl shadow hover:bg-black transition"
            >
              Tôi An Toàn
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
            onRefreshGps={refreshRealLocation}
            onUpdateLocation={(newLoc) => setLocation((prev) => ({ ...prev, ...newLoc }))}
          />
        )}

        {activeTab === "relative_tracker" && (
          <RelativeTracker
            userProfile={userProfile}
            location={location}
            isSosActive={isSosActiveSuccess}
            nextHeartbeatSeconds={nextHeartbeatSeconds}
            lastHeartbeatTime={lastHeartbeatTime}
          />
        )}

        {activeTab === "share_code" && (
          <FirebaseGuardianShare
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            location={location}
            isSosActive={isSosActiveSuccess}
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
