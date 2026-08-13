import React, { useState } from "react";
import {
  ShieldAlert,
  PhoneCall,
  Share2,
  Copy,
  Check,
  Zap,
  MapPin,
  Volume2,
  VolumeX,
  AlertTriangle,
  Send,
  Loader2,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { UserProfile, GeoLocationState } from "../types";
import { VIETNAM_HOTLINES } from "../data/mockData";

interface SosDashboardProps {
  userProfile: UserProfile;
  location: GeoLocationState;
  isSirenPlaying: boolean;
  onToggleSiren: () => void;
  onTriggerSosCountdown: (reason: string) => void;
  isStrobeActive: boolean;
  onToggleStrobe: () => void;
}

export const SosDashboard: React.FC<SosDashboardProps> = ({
  userProfile,
  location,
  isSirenPlaying,
  onToggleSiren,
  onTriggerSosCountdown,
  isStrobeActive,
  onToggleStrobe,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [customIncidentNote, setCustomIncidentNote] = useState("");
  const [isGeneratingAiMsg, setIsGeneratingAiMsg] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

  // Generate Google Maps URL
  const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;

  const defaultSosMessageText = `[CẢNH BÁO SOS KHẨN CẤP - AI SafetyNet]
Nạn nhân: ${userProfile.name || "Người dùng thiết bị"} ${userProfile.phone ? `(${userProfile.phone})` : ""}
Thời gian: ${new Date().toLocaleTimeString("vi-VN")} ${new Date().toLocaleDateString("vi-VN")}
Vị trí GPS: ${location.address}
Tọa độ: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
Bản đồ vị trí: ${mapsUrl}
Pin còn: ${location.batteryLevel}%
Tình trạng y tế: Nhóm máu ${userProfile.bloodType || "Chưa cập nhật"}, Dị ứng: ${userProfile.allergies || "Không"}.
Vui lòng hỗ trợ cứu trợ ngay lập tức!`;

  const handleCopyText = (text: string, isMessage = false, index?: number) => {
    navigator.clipboard.writeText(text);
    if (isMessage) {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } else if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleGenerateAiMessage = async () => {
    setIsGeneratingAiMsg(true);
    try {
      const res = await fetch("/api/ai/sos-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userProfile.name,
          incidentType: customIncidentNote || "Cứu hộ khẩn cấp 1 chạm",
          location: location,
          medicalNotes: `Nhóm máu ${userProfile.bloodType}, ${userProfile.allergies}`,
          batteryLevel: location.batteryLevel,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.smsShortText) {
        setGeneratedMessage(data.data.smsShortText);
      } else {
        setGeneratedMessage(defaultSosMessageText);
      }
    } catch (err) {
      console.error("Error generating AI SOS msg:", err);
      setGeneratedMessage(defaultSosMessageText);
    } finally {
      setIsGeneratingAiMsg(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Strobe Overlay if Active */}
      {isStrobeActive && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-red-600/30 animate-pulse mix-blend-overlay border-8 border-red-500" />
      )}

      {/* Main SOS Trigger Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-6 rounded-2xl border border-red-900/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Hero Content */}
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>NÚT PHÁT TÍN HIỆU CỨU HỘ 1 CHẠM</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bật Cảnh Báo <span className="text-red-500">SOS Khẩn Cấp</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Nhấn nút để kích hoạt còi báo động khẩn cấp, tự động gửi tọa độ GPS hiện tại kèm bản tin y tế cứu hộ tới người thân và lực lượng chức năng.
            </p>

            {/* Current GPS Card */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80 text-xs space-y-1.5 text-slate-300">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <MapPin className="w-4 h-4" />
                  Vị trí GPS Hiện tại:
                </span>
                <span className="text-slate-400 text-[11px]">Cập nhật live</span>
              </div>
              <p className="text-slate-100 font-medium text-xs truncate" title={location.address}>
                {location.address}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                <span>Lat: {location.lat.toFixed(5)}</span>
                <span>Lng: {location.lng.toFixed(5)}</span>
                <span>Chính xác: ±{location.accuracy}m</span>
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onToggleSiren}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  isSirenPlaying
                    ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 animate-pulse"
                    : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
                <span>{isSirenPlaying ? "Dừng Còi Báo Động" : "Phát Còi Báo Động Lớn"}</span>
              </button>

              <button
                onClick={onToggleStrobe}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  isStrobeActive
                    ? "bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-lg shadow-amber-500/40 animate-pulse"
                    : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{isStrobeActive ? "Tắt Đèn Nhấp Nháy" : "Bật Đèn Cảnh Báo Sáng"}</span>
              </button>
            </div>
          </div>

          {/* Right Giant Emergency SOS Button */}
          <div className="md:col-span-5 flex flex-col items-center justify-center py-4">
            <div className="relative group">
              {/* Outer Pulsing Rings */}
              <div className="absolute -inset-4 bg-red-600/30 rounded-full blur-xl group-hover:bg-red-600/50 transition duration-500 animate-pulse" />
              <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping" />

              <button
                onClick={() => onTriggerSosCountdown("Nút bấm SOS khẩn cấp 1 chạm")}
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 hover:from-red-600 hover:to-red-900 border-4 border-red-300 text-white shadow-2xl shadow-red-600/60 flex flex-col items-center justify-center gap-2 transform active:scale-95 transition cursor-pointer select-none"
              >
                <ShieldAlert className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-md animate-pulse" />
                <span className="text-2xl sm:text-3xl font-black tracking-widest drop-shadow">SOS</span>
                <span className="text-[10px] sm:text-xs font-bold text-red-100 uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full border border-white/20">
                  NHẤN ĐỂ PHÁT TÍN HIỆU
                </span>
              </button>
            </div>
            <p className="text-slate-400 text-xs mt-3 text-center">
              Kích hoạt đếm ngược 15s trước khi tự động phát lệnh cứu hộ
            </p>
          </div>
        </div>
      </div>

      {/* Vietnam Emergency Hotlines Section */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">Tổng Đài Cứu Hộ Khẩn Cấp (Việt Nam)</h3>
          </div>
          <span className="text-xs text-slate-400">Gọi trực tiếp 24/7</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {VIETNAM_HOTLINES.map((hotline, idx) => (
            <div
              key={hotline.number}
              className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 hover:border-slate-600 transition flex flex-col justify-between space-y-2 group"
            >
              <div>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded text-white ${hotline.color}`}>
                  {hotline.number}
                </span>
                <h4 className="font-bold text-slate-100 text-sm mt-1.5">{hotline.name}</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-1">{hotline.desc}</p>
              </div>

              <div className="pt-2 flex items-center gap-1.5">
                <a
                  href={`tel:${hotline.number}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Gọi {hotline.number}</span>
                </a>
                <button
                  onClick={() => handleCopyText(hotline.number, false, idx)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                  title="Sao chép số"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Emergency Contacts & AI Broadcast Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Primary Guardians */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-white">Người Thân Nhận Tín Hiệu</h3>
            </div>
            <span className="text-xs text-slate-400">{userProfile.emergencyContacts.length} Liên hệ</span>
          </div>

          <div className="space-y-2.5">
            {userProfile.emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                        Chính
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{contact.relationship} • {contact.phone}</p>
                </div>

                <a
                  href={`tel:${contact.phone}`}
                  className="p-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition border border-red-500/30"
                  title={`Gọi cho ${contact.name}`}
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Mã theo dõi vị trí live của người thân: <strong className="text-amber-300 font-mono">{userProfile.guardianCode}</strong>.
            </p>
          </div>
        </div>

        {/* Right: AI SOS Message Generator & Dispatch */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-white">Soạn Thông Điệp Cứu Hộ SOS (Bản tin SMS/GPS)</h3>
            </div>
            <button
              onClick={handleGenerateAiMessage}
              disabled={isGeneratingAiMsg}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50"
            >
              {isGeneratingAiMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>Tạo lại bằng AI</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Ghi chú bổ sung sự cố (nếu có):</label>
            <input
              type="text"
              placeholder="Ví dụ: Bị ngã xe máy gần gầm cầu, chảy máu ở chân..."
              value={customIncidentNote}
              onChange={(e) => setCustomIncidentNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Message Preview Box */}
          <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {generatedMessage || defaultSosMessageText}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              onClick={() => handleCopyText(generatedMessage || defaultSosMessageText, true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700"
            >
              {copiedMsg ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMsg ? "Đã sao chép tin nhắn!" : "Sao chép Bản tin SOS"}</span>
            </button>

            <div className="flex items-center gap-2">
              <a
                href={`sms:?body=${encodeURIComponent(generatedMessage || defaultSosMessageText)}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Gửi qua SMS</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
