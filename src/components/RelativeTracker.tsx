import React, { useState, useEffect } from "react";
import {
  Users,
  Radio,
  MapPin,
  PhoneCall,
  MessageSquare,
  Volume2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  Activity,
  Zap,
} from "lucide-react";
import { UserProfile, GeoLocationState } from "../types";
import {
  subscribeToGuardianSession,
  sendRemotePingToUser,
  SharedSessionData,
} from "../lib/firebase";

interface SavedRelative {
  id: string;
  name: string;
  relationship: string;
  code: string;
}

interface RelativeTrackerProps {
  userProfile: UserProfile;
  location: GeoLocationState;
  isSosActive: boolean;
  nextHeartbeatSeconds: number;
  lastHeartbeatTime: string;
}

export const RelativeTracker: React.FC<RelativeTrackerProps> = ({
  userProfile,
  location,
  isSosActive,
  nextHeartbeatSeconds,
  lastHeartbeatTime,
}) => {
  // Load saved relatives list from localStorage
  const [savedRelatives, setSavedRelatives] = useState<SavedRelative[]>(() => {
    try {
      const saved = localStorage.getItem("ai_safetynet_monitored_relatives");
      if (saved) {
        const parsed: SavedRelative[] = JSON.parse(saved);
        // Clean out any legacy mock objects from initial test runs
        return parsed.filter(
          (r) =>
            r.id !== "rel-1" &&
            r.code !== "SAFE-8888" &&
            r.code !== "NET-SAFE-LIVE"
        );
      }
    } catch (e) {
      console.error("Error reading saved relatives:", e);
    }
    // Default empty array if no saved relatives
    return [];
  });

  const [activeRelativeId, setActiveRelativeId] = useState<string>(
    savedRelatives[0]?.id || ""
  );

  // Modal / Inputs to add relative
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [newRelativeName, setNewRelativeName] = useState("");
  const [newRelativeRelation, setNewRelativeRelation] = useState("Người thân");
  const [newRelativeCode, setNewRelativeCode] = useState("");

  // Monitored Firebase Session state for currently selected relative
  const [activeSessionData, setActiveSessionData] = useState<SharedSessionData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Ping interaction state
  const [pingMessage, setPingMessage] = useState("");
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  // Save relatives list to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem("ai_safetynet_monitored_relatives", JSON.stringify(savedRelatives));
    } catch (e) {
      console.error("Error saving monitored relatives:", e);
    }
  }, [savedRelatives]);

  // Active relative object
  const currentRelative = savedRelatives.find((r) => r.id === activeRelativeId);

  // Subscribe to selected relative's code on Firebase
  useEffect(() => {
    if (!currentRelative || !currentRelative.code) {
      setActiveSessionData(null);
      return;
    }

    setIsLoadingSession(true);
    setSessionError(null);

    const cleanCode = currentRelative.code.trim().toUpperCase();

    const unsubscribe = subscribeToGuardianSession(
      cleanCode,
      (data) => {
        setIsLoadingSession(false);
        if (data) {
          setActiveSessionData(data);
          setSessionError(null);
        } else {
          setActiveSessionData(null);
          setSessionError(
            `Chưa tìm thấy dữ liệu phát sóng cho mã "${cleanCode}". Hãy đảm bảo điện thoại người thân đang mở ứng dụng và phát sóng tín hiệu.`
          );
        }
      },
      (err) => {
        setIsLoadingSession(false);
        setSessionError("Lỗi kết nối dịch vụ Firebase Realtime.");
      }
    );

    return () => unsubscribe();
  }, [activeRelativeId, currentRelative]);

  // Handle Add New Relative
  const handleAddRelative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRelativeCode.trim()) return;

    const newRel: SavedRelative = {
      id: `rel-${Date.now()}`,
      name: newRelativeName.trim() || `Mã ${newRelativeCode.trim().toUpperCase()}`,
      relationship: newRelativeRelation || "Người thân",
      code: newRelativeCode.trim().toUpperCase(),
    };

    setSavedRelatives((prev) => [...prev, newRel]);
    setActiveRelativeId(newRel.id);
    setIsAddingModalOpen(false);

    // Reset form
    setNewRelativeName("");
    setNewRelativeCode("");
    setNewRelativeRelation("Người thân");
  };

  // Handle Remove Relative
  const handleRemoveRelative = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa người thân "${name}" khỏi danh sách theo dõi?`)) {
      setSavedRelatives((prev) => {
        const filtered = prev.filter((r) => r.id !== id);
        if (activeRelativeId === id && filtered.length > 0) {
          setActiveRelativeId(filtered[0].id);
        }
        return filtered;
      });
    }
  };

  // Send Remote Ping to Current Relative
  const handleSendPingToRelative = async (type: "CHECK_IN" | "RING_BELL" | "MESSAGE") => {
    if (!currentRelative || !currentRelative.code) return;

    const msg =
      pingMessage.trim() ||
      (type === "RING_BELL"
        ? "Yêu cầu phát còi định vị kiểm tra an toàn khẩn cấp!"
        : "Yêu cầu người thân bấm xác nhận an toàn!");

    await sendRemotePingToUser(currentRelative.code, userProfile.name || "Người thân", type, msg);

    setPingStatus(
      type === "RING_BELL"
        ? "Đã phát tín hiệu RENG CHUÔNG sang điện thoại người thân!"
        : "Đã gửi thông báo kiểm tra sang thiết bị người thân!"
    );
    setPingMessage("");
    setTimeout(() => setPingStatus(null), 3500);
  };

  // Helper function to format time ago
  const formatSecondsAgo = (timestamp?: number) => {
    if (!timestamp) return "Chưa có tín hiệu";
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 10) return "Vừa cập nhật xong (Realtime)";
    if (diffSec < 60) return `${diffSec} giây trước`;
    const min = Math.floor(diffSec / 60);
    if (min < 60) return `${min} phút trước`;
    return `${Math.floor(min / 60)} giờ trước`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Heartbeat Status Indicator (1 minute interval) */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 p-5 rounded-2xl border border-red-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping border border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                TỰ ĐỘNG CẬP NHẬT TÍN HIỆU CỨU HỘ 1 PHÚT / LẦN
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Khi ứng dụng chạy, hệ thống tự động phát sóng vị trí GPS & cảnh báo lên Firebase mỗi 60 giây.
            </p>
          </div>
        </div>

        {/* Live Timer Countdown Box */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Đồng bộ tiếp theo:</span>
            <span className="font-mono font-black text-amber-400 text-sm">
              {nextHeartbeatSeconds}s
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <span className="text-slate-400 block text-[11px]">Lần cuối phát sóng:</span>
            <span className="font-mono text-slate-200 font-bold">{lastHeartbeatTime}</span>
          </div>
        </div>
      </div>

      {/* Main Monitoring Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Saved Relatives to Monitor */}
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-black text-slate-200 text-sm">
                <Users className="w-4 h-4 text-amber-400" />
                <span>DANH SÁCH NGƯỜI THÂN ({savedRelatives.length})</span>
              </div>

              <button
                onClick={() => setIsAddingModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-red-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Mã Mới</span>
              </button>
            </div>

            {/* List of Saved Relative Items */}
            <div className="space-y-2">
              {savedRelatives.map((rel) => {
                const isSelected = rel.id === activeRelativeId;
                return (
                  <div
                    key={rel.id}
                    onClick={() => setActiveRelativeId(rel.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10"
                        : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 text-slate-400"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold text-xs sm:text-sm truncate ${isSelected ? "text-white" : "text-slate-300"}`}>
                          {rel.name}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          {rel.relationship}
                        </span>
                      </div>

                      <p className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>Mã: {rel.code}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRelative(rel.id, rel.name);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        title="Xóa người thân"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {savedRelatives.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-dashed border-slate-800 space-y-2">
                  <p>Chưa có mã chia sẻ người thân nào.</p>
                  <button
                    onClick={() => setIsAddingModalOpen(true)}
                    className="text-amber-400 font-bold underline"
                  >
                    Bấm vào đây để thêm mã
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Cách Thức Hoạt Động Cứu Hộ Realtime
            </h4>
            <p>
              Chỉ cần người thân mở ứng dụng trên thiết bị của họ, vị trí GPS và mức pin sẽ tự động truyền về Firebase mỗi 1 phút. Nếu có báo động SOS, tín hiệu sẽ phát ngay lập tức không cần chờ đợi.
            </p>
          </div>
        </div>

        {/* Right Column (2 cols wide): Live Detail Monitor for Active Relative */}
        <div className="lg:col-span-2 space-y-5">
          {currentRelative ? (
            <div className="space-y-5">
              {/* EMERGENCY ALERT BANNER IF SOS IS ACTIVE ON FIREBASE */}
              {activeSessionData?.activeAlert?.isAlertActive && (
                <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-900 p-5 rounded-2xl border-2 border-red-400 shadow-2xl space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-black text-base">
                      <ShieldAlert className="w-7 h-7 text-yellow-300 animate-bounce shrink-0" />
                      <span>CẢNH BÁO BÁO ĐỘNG SOS KHẨN CẤP TỪ {currentRelative.name.toUpperCase()}!</span>
                    </div>
                    <span className="bg-black/50 text-yellow-300 font-mono text-xs px-2.5 py-1 rounded-full border border-yellow-400/40">
                      CẤP CỨU REALTIME
                    </span>
                  </div>

                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/20 text-white text-xs space-y-1.5">
                    <p>
                      SĐT: <strong className="text-yellow-300 font-bold">{activeSessionData.userPhone}</strong> • Nhóm máu: <strong className="text-amber-300">{activeSessionData.bloodType}</strong>
                    </p>
                    <p>
                      Lý do SOS: <strong className="text-red-200">{activeSessionData.activeAlert.alertReason}</strong>
                    </p>
                    <p className="font-mono text-amber-200">
                      Vị trí nạn nhân: {activeSessionData.location.address}
                    </p>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <a
                      href={`tel:${activeSessionData.userPhone}`}
                      className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl text-center shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>GỌI ĐIỆN NGAY</span>
                    </a>

                    <a
                      href={`sms:${activeSessionData.userPhone}?body=${encodeURIComponent(
                        `[AI SafetyNet] Tôi đã nhận thông báo SOS khẩn cấp của bạn tại: ${activeSessionData.location.address}. Đang hỗ trợ khẩn cấp!`
                      )}`}
                      className="py-3 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl text-center shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>GỬI SMS CỨU HỘ</span>
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${activeSessionData.location.lat},${activeSessionData.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl text-center shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>CHỈ ĐƯỜNG GOOGLE MAPS</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Main Card Header */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">{currentRelative.name}</h3>
                      <span className="text-xs bg-slate-800 text-amber-400 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                        {currentRelative.relationship}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Mã giám sát Firebase: <strong className="text-amber-300 font-mono">{currentRelative.code}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSessionData ? (
                      <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Trạng Thái: AN TOÀN</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Đang chờ tín hiệu phát...</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Error Warning */}
                {sessionError && (
                  <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{sessionError}</span>
                  </div>
                )}

                {/* Session Data Details */}
                {activeSessionData && (
                  <div className="space-y-4">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">SĐT Người Thân</span>
                        <strong className="text-white text-xs font-mono">{activeSessionData.userPhone}</strong>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Mức Pin Hiện Tại</span>
                        <strong className="text-amber-400 text-xs font-mono font-bold">
                          {activeSessionData.location.batteryLevel}%
                        </strong>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Độ Chính Xác GPS</span>
                        <strong className="text-emerald-400 text-xs font-mono">
                          ±{activeSessionData.location.accuracy}m
                        </strong>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Thời Gian Phát</span>
                        <strong className="text-slate-300 text-[11px] font-mono">
                          {formatSecondsAgo(activeSessionData.location.timestamp)}
                        </strong>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          ĐỊA CHỈ & TỌA ĐỘ LIVE:
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${activeSessionData.location.lat},${activeSessionData.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Mở trên Google Maps</span>
                        </a>
                      </div>

                      <p className="text-white font-bold text-sm bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {activeSessionData.location.address}
                      </p>

                      <p className="text-[11px] font-mono text-slate-400">
                        GPS: {activeSessionData.location.lat.toFixed(6)}, {activeSessionData.location.lng.toFixed(6)}
                      </p>
                    </div>

                    {/* Interactive Remote Ping Box */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <span className="text-xs font-extrabold text-amber-400 block flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        GỬI TÍN HIỆU TƯƠNG TÁC ĐẾN MÀN HÌNH ĐIỆN THOẠI NGƯỜI THÂN
                      </span>

                      {pingStatus && (
                        <div className="bg-emerald-950 p-2.5 rounded-lg border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                          {pingStatus}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={pingMessage}
                          onChange={(e) => setPingMessage(e.target.value)}
                          placeholder="Nhập tin nhắn kiểm tra an toàn..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        />

                        <button
                          onClick={() => handleSendPingToRelative("MESSAGE")}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Tin Nhắn</span>
                        </button>

                        <button
                          onClick={() => handleSendPingToRelative("RING_BELL")}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Reng Chuông Định Vị</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center space-y-3 text-slate-400 text-xs">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p>Chọn một người thân từ danh sách bên trái hoặc bấm "Thêm Mã Mới".</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD NEW RELATIVE CODE */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Thêm Mã Chia Sẻ Người Thân Mới
              </h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRelative} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tên Người Thân:</label>
                <input
                  type="text"
                  value={newRelativeName}
                  onChange={(e) => setNewRelativeName(e.target.value)}
                  placeholder="Ví dụ: Bố, Mẹ, Con gái..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Mối Quan Hệ:</label>
                <select
                  value={newRelativeRelation}
                  onChange={(e) => setNewRelativeRelation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold"
                >
                  <option value="Bố/Mẹ">Bố/Mẹ</option>
                  <option value="Con cái">Con cái</option>
                  <option value="Vợ/Chồng">Vợ/Chồng</option>
                  <option value="Ông/Bà">Ông/Bà</option>
                  <option value="Người thân">Người thân khác</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Mã Cứu Hộ Firebase Của Người Thân:</label>
                <input
                  type="text"
                  value={newRelativeCode}
                  onChange={(e) => setNewRelativeCode(e.target.value)}
                  placeholder="Ví dụ: SAFE-8921 hoặc ANTOAN-88"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-amber-300 font-mono font-black text-sm uppercase placeholder-slate-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nhập mã chia sẻ hiển thị trên ứng dụng điện thoại của người thân.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-600/30"
                >
                  Lưu & Kết Nối Theo Dõi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
