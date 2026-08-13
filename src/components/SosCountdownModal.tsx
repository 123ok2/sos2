import React, { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle, Send, Volume2, Mail, Phone, MapPin } from "lucide-react";
import { playCountdownBeep, playEmergencySiren } from "../utils/audioSynth";
import { UserProfile } from "../types";

interface SosCountdownModalProps {
  isOpen: boolean;
  reason: string;
  userProfile?: UserProfile;
  onCancel: () => void;
  onConfirmSos: () => void;
}

export const SosCountdownModal: React.FC<SosCountdownModalProps> = ({
  isOpen,
  reason,
  userProfile,
  onCancel,
  onConfirmSos,
}) => {
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(15);
      return;
    }

    // Play initial warning beep
    playCountdownBeep(true);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playEmergencySiren();
          onConfirmSos();
          return 0;
        }
        playCountdownBeep(prev <= 5);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const percentage = (timeLeft / 15) * 100;
  const recipientName = userProfile?.primaryRecipientName || userProfile?.emergencyContacts[0]?.name || "Chưa thiết lập liên hệ";
  const recipientPhone = userProfile?.primaryRecipientPhone || userProfile?.emergencyContacts[0]?.phone || "Chưa nhập SĐT";
  const recipientEmail = userProfile?.primaryRecipientEmail || "Chưa nhập email";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-red-600/40 text-center space-y-5 relative overflow-hidden">
        {/* Top Warning Glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
          <span>CẢNH BÁO CẢM BIẾN VA CHẠM THIẾT BỊ</span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-white">Phát Hiện Va Chạm / Bất Thường</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Nguyên nhân: <strong className="text-amber-400">{reason}</strong>.
          </p>
        </div>

        {/* Circular Countdown Gauge */}
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="54"
              className="text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="54"
              className="text-red-500 transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray={339}
              strokeDashoffset={339 - (339 * percentage) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">{timeLeft}</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">GIÂY</span>
          </div>
        </div>

        {/* Target Recipient Notification Details Box */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 text-xs text-left space-y-1.5">
          <div className="flex items-center justify-between font-bold text-amber-400 border-b border-slate-800 pb-1.5">
            <span>ĐỊA CHỈ & LIÊN HỆ TỰ ĐỘNG PHÁT TÍN HIỆU:</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded">ĐÃ THIẾT LẬP</span>
          </div>
          <p className="text-white font-bold flex items-center gap-1.5 pt-1">
            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{recipientName} — {recipientPhone}</span>
          </p>
          <p className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Email: {recipientEmail}</span>
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Hệ thống sẽ tự động gửi thông điệp vị trí GPS và gọi điện khẩn cấp khi hết thời gian đếm ngược.
          </p>
        </div>

        {/* Modal Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-600/30"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>TÔI ỔN (HỦY LỆNH)</span>
          </button>

          <button
            onClick={() => {
              playEmergencySiren();
              onConfirmSos();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-red-600/40 animate-pulse"
          >
            <Send className="w-4 h-4" />
            <span>GỬI CẢNH BÁO NGAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
