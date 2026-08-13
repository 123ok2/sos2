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
  RefreshCw,
  Edit3,
  ExternalLink,
  CheckCircle2,
  UserPlus,
  MessageSquare,
  Users,
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
  onRefreshGps?: () => void;
  onUpdateLocation?: (newLoc: Partial<GeoLocationState>) => void;
}

export const SosDashboard: React.FC<SosDashboardProps> = ({
  userProfile,
  location,
  isSirenPlaying,
  onToggleSiren,
  onTriggerSosCountdown,
  isStrobeActive,
  onToggleStrobe,
  onRefreshGps,
  onUpdateLocation,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);
  const [isEditingCustomAddress, setIsEditingCustomAddress] = useState(false);
  const [customAddressInput, setCustomAddressInput] = useState("");
  const [customIncidentNote, setCustomIncidentNote] = useState("");

  // Generate Google Maps URL
  const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;

  const defaultSosMessageText = `[CẢNH BÁO SOS KHẨN CẤP - AI SafetyNet]
Nạn nhân: ${userProfile.name || "Người dùng thiết bị"} ${userProfile.phone ? `(${userProfile.phone})` : ""}
Thời gian: ${new Date().toLocaleTimeString("vi-VN")} ${new Date().toLocaleDateString("vi-VN")}
Vị trí GPS: ${location.address}
Tọa độ Google Maps: ${mapsUrl}
Sự cố: ${customIncidentNote || "Cần cứu trợ khẩn cấp 1-chạm"}
Tình trạng y tế: Nhóm máu ${userProfile.bloodType || "O+"}, Dị ứng: ${userProfile.allergies || "Không"}.
Vui lòng liên hệ và hỗ trợ cấp cứu ngay lập tức!`;

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

  const handleManualRefreshGps = () => {
    setIsRefreshingGps(true);
    if (onRefreshGps) {
      onRefreshGps();
    }
    setTimeout(() => {
      setIsRefreshingGps(false);
    }, 1500);
  };

  const handleSaveCustomAddress = () => {
    if (customAddressInput.trim() && onUpdateLocation) {
      onUpdateLocation({
        address: customAddressInput.trim(),
      });
    }
    setIsEditingCustomAddress(false);
  };

  return (
    <div className="space-y-5">
      {/* Visual Strobe Overlay if Active */}
      {isStrobeActive && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-red-600/30 animate-pulse mix-blend-overlay border-8 border-red-500" />
      )}

      {/* 1. TOP EMERGENCY HOTLINES (Direct 1-Touch Dialing) */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-red-500/30 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-red-400">
          <span className="flex items-center gap-1.5 uppercase tracking-wide">
            <PhoneCall className="w-4 h-4 text-red-500 animate-pulse" />
            TỔNG ĐÀI CẤP CỨU KHẨN CẤP (GỌI TRỰC TIẾP 1-CHẠM)
          </span>
          <span className="text-slate-400 font-normal">Miễn phí 24/7</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <a
            href="tel:115"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-600/30 border border-red-400/40 text-center active:scale-95 transition"
          >
            <span className="text-xl sm:text-2xl font-black">115</span>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase mt-0.5">CẤP CỨU Y TẾ</span>
          </a>

          <a
            href="tel:113"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40 text-center active:scale-95 transition"
          >
            <span className="text-xl sm:text-2xl font-black">113</span>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase mt-0.5">CẢNH SÁT</span>
          </a>

          <a
            href="tel:114"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/40 text-center active:scale-95 transition"
          >
            <span className="text-xl sm:text-2xl font-black">114</span>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase mt-0.5">CỨU HỎA</span>
          </a>
        </div>
      </div>

      {/* 2. MAIN GIANT SOS BUTTON & CONTROLS */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-6 rounded-2xl border border-red-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>NÚT BÁO ĐỘNG SOS 1-CHẠM TỰ ĐỘNG</span>
          </div>

          <div className="relative group my-2">
            <div className="absolute -inset-4 bg-red-600/30 rounded-full blur-xl group-hover:bg-red-600/50 transition duration-500 animate-pulse" />
            <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping" />

            <button
              onClick={() => onTriggerSosCountdown("Kích hoạt nút bấm SOS khẩn cấp")}
              className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 hover:from-red-600 hover:to-red-900 border-4 border-red-300 text-white shadow-2xl shadow-red-600/60 flex flex-col items-center justify-center gap-2 transform active:scale-95 transition cursor-pointer select-none"
            >
              <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-md animate-pulse" />
              <span className="text-3xl sm:text-4xl font-black tracking-widest drop-shadow">SOS</span>
              <span className="text-[10px] sm:text-xs font-extrabold text-red-100 uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full border border-white/20">
                BẤM CỨU HỘ NGAY
              </span>
            </button>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm max-w-md">
            Nhấn nút để kích hoạt còi báo động khẩn cấp, phát tín hiệu đếm ngược và tự động gửi tọa độ GPS đến người thân/cơ quan cứu hộ.
          </p>

          {/* Quick Siren & Strobe Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={onToggleSiren}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
                isSirenPlaying
                  ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 animate-pulse"
                  : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
              <span>{isSirenPlaying ? "Tắt Còi Báo Động" : "Phát Còi Báo Động Lớn"}</span>
            </button>

            <button
              onClick={onToggleStrobe}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
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
      </div>

      {/* 3. ENHANCED HIGH-PRECISION GPS LOCATION CARD */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="font-extrabold text-white text-sm">Vị Trí Cứu Hộ GPS Hiện Tại</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
              location.accuracy <= 15 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}>
              Chính xác: ±{location.accuracy}m
            </span>

            <button
              onClick={handleManualRefreshGps}
              disabled={isRefreshingGps}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition border border-emerald-500/30 font-bold text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingGps ? "animate-spin" : ""}`} />
              <span>{isRefreshingGps ? "Đang định vị..." : "Lấy Lại GPS"}</span>
            </button>
          </div>
        </div>

        {/* Address Display / Inline Edit */}
        {isEditingCustomAddress ? (
          <div className="space-y-2 pt-1">
            <label className="text-xs text-slate-300 font-semibold block">Nhập chi tiết địa chỉ hiện tại (Số nhà, Tầng, Điểm mốc):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAddressInput}
                onChange={(e) => setCustomAddressInput(e.target.value)}
                placeholder="Ví dụ: Tầng 2, Phòng 204, Trường THPT Nguyễn Trãi..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <button
                onClick={handleSaveCustomAddress}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
              >
                Lưu Vị Trí
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-slate-100 font-bold text-sm sm:text-base leading-snug bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              {location.address}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono pt-1">
              <span>Tọa độ: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCustomAddressInput(location.address);
                    setIsEditingCustomAddress(true);
                  }}
                  className="flex items-center gap-1 text-amber-400 hover:underline text-[11px] font-sans"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa/Nhập địa chỉ chi tiết</span>
                </button>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:underline text-[11px] font-sans font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. ONE-TAP EMERGENCY SMS BROADCAST */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-500" />
            <h3 className="font-extrabold text-white text-sm">Gửi Bản Tin SOS / Tọa Độ Khẩn Cấp</h3>
          </div>

          <span className="text-xs text-slate-400">1-Touch SMS Payload</span>
        </div>

        {/* Input Incident Note */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 block font-semibold">Tình trạng / Mô tả sự cố (nếu có):</label>
          <input
            type="text"
            value={customIncidentNote}
            onChange={(e) => setCustomIncidentNote(e.target.value)}
            placeholder="Ví dụ: Bị ngã xe máy gần gầm cầu, cần hỗ trợ..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
          />
        </div>

        {/* Live Message Preview Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
          {defaultSosMessageText}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href={`sms:?body=${encodeURIComponent(defaultSosMessageText)}`}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 text-center"
          >
            <Send className="w-4 h-4" />
            <span>MỞ ỨNG DỤNG SMS GỬI NGAY</span>
          </a>

          <button
            onClick={() => handleCopyText(defaultSosMessageText, true)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition border border-slate-700"
          >
            {copiedMsg ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedMsg ? "Đã Sao Chép Tọa Độ!" : "Sao Chép Tin Nhắn Cứu Hộ"}</span>
          </button>
        </div>
      </div>

      {/* 5. DIRECT NATIVE CALL & SMS EMERGENCY CONTACTS */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            GỌI ĐIỆN & GỬI TIN NHẮN CẦU CỨU BẰNG APP GỐC TRÊN ĐIỆN THOẠI
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {userProfile.emergencyContacts.length + (userProfile.primaryRecipientPhone ? 1 : 0)} Liên hệ
          </span>
        </div>

        {/* Primary Recipient Card if present */}
        {userProfile.primaryRecipientPhone && (
          <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-white text-sm">
                  {userProfile.primaryRecipientName || "Người Nhận Cảnh Báo Chính"}
                </span>
                <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                  Liên hệ chính
                </span>
              </div>
              <span className="text-slate-300 font-mono font-bold">{userProfile.primaryRecipientPhone}</span>
            </div>

            {userProfile.primaryRecipientAddress && (
              <p className="text-[11px] text-slate-400 truncate">
                Địa chỉ nhận: {userProfile.primaryRecipientAddress}
              </p>
            )}

            {/* Native App Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${userProfile.primaryRecipientPhone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-emerald-600/30 active:scale-95 text-center"
              >
                <PhoneCall className="w-4 h-4" />
                <span>GỌI ĐIỆN CẦU CỨU</span>
              </a>

              <a
                href={`sms:${userProfile.primaryRecipientPhone}?body=${encodeURIComponent(defaultSosMessageText)}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-blue-600/30 active:scale-95 text-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>GỬI SMS CẦU CỨU</span>
              </a>
            </div>
          </div>
        )}

        {/* Additional Emergency Contacts List */}
        {userProfile.emergencyContacts.map((cnt) => (
          <div key={cnt.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-white text-sm">{cnt.name}</span>
                <span className="ml-2 text-[11px] text-slate-400">({cnt.relationship})</span>
              </div>
              <span className="text-slate-300 font-mono font-bold">{cnt.phone}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${cnt.phone}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition active:scale-95 text-center"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Gọi Cầu Cứu</span>
              </a>

              <a
                href={`sms:${cnt.phone}?body=${encodeURIComponent(defaultSosMessageText)}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-700/80 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition active:scale-95 text-center"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Gửi SMS Cầu Cứu</span>
              </a>
            </div>
          </div>
        ))}

        {/* Fallback when no contact is saved yet */}
        {!userProfile.primaryRecipientPhone && userProfile.emergencyContacts.length === 0 && (
          <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Chưa có liên hệ người thân nào trong danh bạ khẩn cấp!</span>
            </div>

            <p className="text-[11px] text-slate-300">
              Bạn có thể gọi điện hoặc gửi SMS tọa độ GPS trực tiếp tới <strong>115 Cấp Cứu Y Tế</strong> bằng app gốc điện thoại:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:115"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl transition text-center shadow-md shadow-red-600/30"
              >
                <PhoneCall className="w-4 h-4" />
                <span>GỌI 115 NGAY</span>
              </a>

              <a
                href={`sms:115?body=${encodeURIComponent(defaultSosMessageText)}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition text-center shadow-md shadow-blue-600/30"
              >
                <MessageSquare className="w-4 h-4" />
                <span>GỬI SMS TỚI 115</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

