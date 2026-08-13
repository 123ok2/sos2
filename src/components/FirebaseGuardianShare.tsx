import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Radio,
  Share2,
  Copy,
  Check,
  RefreshCw,
  MapPin,
  PhoneCall,
  MessageSquare,
  Volume2,
  ExternalLink,
  Users,
  Bell,
  CheckCircle2,
  Send,
  Zap,
  Power,
  Edit3,
  QrCode,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { UserProfile, GeoLocationState } from "../types";
import {
  publishLiveStateToFirebase,
  subscribeToGuardianSession,
  sendRemotePingToUser,
  clearFirebaseAlertStatus,
  SharedSessionData,
} from "../lib/firebase";

interface FirebaseGuardianShareProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  location: GeoLocationState;
  isSosActive: boolean;
}

export const FirebaseGuardianShare: React.FC<FirebaseGuardianShareProps> = ({
  userProfile,
  onUpdateProfile,
  location,
  isSosActive,
}) => {
  const [activeTab, setActiveTab] = useState<"my_code" | "monitor">("my_code");

  // Local state for My Code settings
  const [isSharingActive, setIsSharingActive] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState(userProfile.guardianCode || "");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Chưa đồng bộ");

  // Local state for Monitor tab
  const [targetCodeInput, setTargetCodeInput] = useState("");
  const [monitoredCode, setMonitoredCode] = useState("");
  const [monitoredData, setMonitoredData] = useState<SharedSessionData | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [monitorError, setMonitorError] = useState<string | null>(null);

  // Ping back to relative state
  const [pingMessage, setPingMessage] = useState("");
  const [pingSuccess, setPingSuccess] = useState<string | null>(null);

  // 1. Sync live location & alert state to Firebase whenever location or alert state changes
  useEffect(() => {
    if (!userProfile.guardianCode) return;

    publishLiveStateToFirebase(
      userProfile,
      location,
      {
        isAlertActive: isSosActive,
        alertType: isSosActive ? "SOS_EMERGENCY" : "NONE",
        alertReason: isSosActive ? "Người dùng kích hoạt tín hiệu SOS khẩn cấp!" : "An toàn",
      },
      isSharingActive
    );

    setLastSyncTime(new Date().toLocaleTimeString("vi-VN"));
  }, [userProfile, location, isSosActive, isSharingActive]);

  // 2. Handle Subscribe to target relative's code
  useEffect(() => {
    if (!monitoredCode) {
      setMonitoredData(null);
      return;
    }

    setIsSubscribing(true);
    setMonitorError(null);

    const unsubscribe = subscribeToGuardianSession(
      monitoredCode,
      (data) => {
        setIsSubscribing(false);
        if (data) {
          setMonitoredData(data);
          setMonitorError(null);
        } else {
          setMonitoredData(null);
          setMonitorError(`Không tìm thấy mã chia sẻ "${monitoredCode}". Vui lòng kiểm tra lại mã trên thiết bị người thân.`);
        }
      },
      (err) => {
        setIsSubscribing(false);
        setMonitorError("Lỗi kết nối Firebase. Vui lòng thử lại.");
      }
    );

    return () => unsubscribe();
  }, [monitoredCode]);

  // Handle Generate New Code
  const handleGenerateNewCode = () => {
    const randomCode = `SAFE-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = { ...userProfile, guardianCode: randomCode };
    onUpdateProfile(updated);
    setCustomCodeInput(randomCode);
  };

  // Handle Save Custom Code
  const handleSaveCustomCode = () => {
    if (!customCodeInput.trim()) return;
    const clean = customCodeInput.trim().toUpperCase().replace(/\s+/g, "-");
    onUpdateProfile({ ...userProfile, guardianCode: clean });
    setIsEditingCode(false);
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(userProfile.guardianCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle Clear Firebase Alert
  const handleClearAlert = async () => {
    await clearFirebaseAlertStatus(userProfile.guardianCode);
    alert("Đã gửi lệnh cập nhật trạng thái An Toàn lên hệ thống Firebase!");
  };

  // Handle Send Remote Ping/Chime to Relative
  const handleSendPing = async (type: "CHECK_IN" | "RING_BELL" | "MESSAGE") => {
    if (!monitoredCode) return;
    const msg = pingMessage.trim() || (type === "RING_BELL" ? "Yêu cầu phát còi định vị kiểm tra an toàn!" : "Yêu cầu người thân xác nhận an toàn.");
    await sendRemotePingToUser(monitoredCode, userProfile.name || "Người thân", type, msg);

    setPingSuccess(type === "RING_BELL" ? "Đã phát tín hiệu chuông báo sang thiết bị người thân!" : "Đã gửi thông báo kiểm tra sang thiết bị người thân!");
    setPingMessage("");
    setTimeout(() => setPingSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Firebase Status Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-md shadow-emerald-500/50" />
          <div>
            <span className="font-extrabold text-white text-sm">Hệ Thống Giám Sát Firebase Realtime</span>
            <p className="text-slate-400 text-[11px]">Cơ sở dữ liệu Firestore tự động đồng bộ mã chia sẻ & tín hiệu SOS 2 chiều</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
          <span>Lần đồng bộ gần nhất: <strong className="text-emerald-400">{lastSyncTime}</strong></span>
        </div>
      </div>

      {/* Tabs Selection Header */}
      <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab("my_code")}
          className={`flex-1 py-3 px-4 rounded-lg font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === "my_code"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Mã Chia Sẻ Của Tôi</span>
        </button>

        <button
          onClick={() => setActiveTab("monitor")}
          className={`flex-1 py-3 px-4 rounded-lg font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === "monitor"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Theo Dõi & Nhận Báo Động Người Thân</span>
          {monitoredData?.activeAlert?.isAlertActive && (
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
          )}
        </button>
      </div>

      {/* TAB 1: MY GUARDIAN CODE & CONTROL */}
      {activeTab === "my_code" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Mã Cứu Hộ & Chia Sẻ Vị Trí Firebase Của Bạn
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cung cấp mã này cho người thân để họ có thể nhận cảnh báo SOS và vị trí live trên điện thoại của họ.
                </p>
              </div>

              {/* Location Sharing Toggle */}
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">Chia sẻ Vị trí Realtime:</span>
                <button
                  onClick={() => setIsSharingActive(!isSharingActive)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                    isSharingActive
                      ? "bg-emerald-600 text-white border border-emerald-400 shadow-md"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isSharingActive ? "BẬT" : "TẮT"}</span>
                </button>
              </div>
            </div>

            {/* Giant Code Display Box */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Radio className="w-4 h-4 animate-pulse" />
                MÃ GIÁM SÁT REALTIME (FIREBASE CODE)
              </div>

              {isEditingCode ? (
                <div className="flex items-center gap-2 max-w-xs w-full">
                  <input
                    type="text"
                    value={customCodeInput}
                    onChange={(e) => setCustomCodeInput(e.target.value)}
                    placeholder="Mã tùy chọn, ví dụ: ANTOAN-88"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-center text-lg font-mono font-black text-amber-300 uppercase"
                  />
                  <button
                    onClick={handleSaveCustomCode}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-300 bg-slate-900/90 px-8 py-3 rounded-2xl border border-amber-500/40 shadow-inner">
                  {userProfile.guardianCode}
                </div>
              )}

              <p className="text-slate-400 text-xs max-w-md">
                Tất cả thay đổi vị trí GPS, mức pin ({location.batteryLevel}%) và cảnh báo SOS khẩn cấp của bạn sẽ được tự động gửi trực tiếp tới những ai sở hữu mã này.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-amber-500/30"
                >
                  {isCopied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? "Đã Sao Chép Mã!" : "Sao Chép Mã Chia Sẻ"}</span>
                </button>

                <button
                  onClick={() => setIsEditingCode(!isEditingCode)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>{isEditingCode ? "Hủy Đổi Mã" : "Tự Đặt Mã Riêng"}</span>
                </button>

                <button
                  onClick={handleGenerateNewCode}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>Tạo Mã Ngẫu Nhiên Mới</span>
                </button>
              </div>
            </div>

            {/* Current Broadcast Status Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-300 block">Vị trí GPS đang phát sóng:</span>
                <p className="text-white font-medium text-xs truncate bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {location.address}
                </p>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Tọa độ: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                  <span>Độ chính xác: ±{location.accuracy}m</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-300 block">Trạng Thái Báo Động SOS Trên Firebase:</span>
                <div className="flex items-center justify-between">
                  {isSosActive ? (
                    <span className="px-3 py-1 bg-red-600/30 text-red-400 border border-red-500/40 rounded-lg font-black animate-pulse flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      ĐANG CÓ CẢNH BÁO KHẨN CẤP
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      TRẠNG THÁI: AN TOÀN
                    </span>
                  )}

                  {isSosActive && (
                    <button
                      onClick={handleClearAlert}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
                    >
                      Báo An Toàn
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONITOR RELATIVE REALTIME */}
      {activeTab === "monitor" && (
        <div className="space-y-6">
          {/* Input Relative Code Card */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm">
              <Users className="w-5 h-5 text-amber-400" />
              <h3>Nhập Mã Chia Sẻ Của Người Thân Để Theo Dõi Vị Trí & Cảnh Báo Realtime</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={targetCodeInput}
                onChange={(e) => setTargetCodeInput(e.target.value)}
                placeholder="Ví dụ: SAFE-8921 hoặc ANTOAN-88"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold uppercase text-sm placeholder-slate-500"
              />
              <button
                onClick={() => setMonitoredCode(targetCodeInput.trim().toUpperCase())}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>KẾT NỐI GIÁM SÁT REALTIME</span>
              </button>
            </div>

            {/* Quick Demo Code Selection */}
            {userProfile.guardianCode && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Mã của bạn để thử nghiệm:</span>
                <button
                  onClick={() => {
                    setTargetCodeInput(userProfile.guardianCode);
                    setMonitoredCode(userProfile.guardianCode);
                  }}
                  className="font-mono text-amber-400 hover:underline font-bold"
                >
                  {userProfile.guardianCode} (Thử kết nối thiết bị của bạn)
                </button>
              </div>
            )}
          </div>

          {/* Connection Error Message */}
          {monitorError && (
            <div className="bg-red-950/40 p-4 rounded-xl border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{monitorError}</span>
            </div>
          )}

          {/* Subscribing Loading Indicator */}
          {isSubscribing && (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-white font-bold text-sm">Đang kết nối đến Firebase cho mã "{monitoredCode}"...</p>
            </div>
          )}

          {/* MONITORED RELATIVE REALTIME CARD */}
          {monitoredData && !isSubscribing && (
            <div className="space-y-5 animate-fade-in">
              {/* EMERGENCY HIGH PRIORITY ALERT BANNER IF ACTIVE */}
              {monitoredData.activeAlert?.isAlertActive ? (
                <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-900 p-6 rounded-2xl border-2 border-red-400 shadow-2xl space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-black text-base sm:text-lg">
                      <ShieldAlert className="w-7 h-7 text-yellow-300 animate-bounce" />
                      <span>CẢNH BÁO BÁO ĐỘNG SOS KHẨN CẤP TỪ NGƯỜI THÂN!</span>
                    </div>
                    <span className="bg-black/40 text-white font-mono text-xs px-2.5 py-1 rounded-full border border-white/20">
                      LIVE FIREBASE
                    </span>
                  </div>

                  <div className="bg-black/40 p-4 rounded-xl border border-white/20 text-white space-y-2">
                    <p className="text-sm font-bold">
                      Nạn nhân: <strong className="text-yellow-300 text-base">{monitoredData.userName}</strong> ({monitoredData.userPhone})
                    </p>
                    <p className="text-xs text-red-100">
                      Lý do cảnh báo: <strong>{monitoredData.activeAlert.alertReason}</strong>
                    </p>
                    <p className="text-xs font-mono text-amber-200">
                      Vị trí cứu hộ: {monitoredData.location.address}
                    </p>
                  </div>

                  {/* Immediate 1-Touch Action Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href={`tel:${monitoredData.userPhone}`}
                      className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl text-center shadow-lg flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>GỌI ĐIỆN NGAY</span>
                    </a>

                    <a
                      href={`sms:${monitoredData.userPhone}?body=${encodeURIComponent(
                        `[AI SafetyNet] Tôi đã nhận tín hiệu SOS từ bạn tại vị trí: ${monitoredData.location.address}. Đang hỗ trợ khẩn cấp!`
                      )}`}
                      className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl text-center shadow-lg flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>GỬI SMS NGAY</span>
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${monitoredData.location.lat},${monitoredData.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl text-center shadow-lg flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>MỞ BẢN ĐỒ CHỈ ĐƯỜNG</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Trạng thái người thân ({monitoredData.userName}): <strong>AN TOÀN</strong>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">Firebase Realtime Live</span>
                </div>
              )}

              {/* Monitored User Details Card */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">{monitoredData.userName}</h3>
                    <p className="text-xs text-slate-400">
                      SĐT: <strong className="text-slate-200">{monitoredData.userPhone}</strong> • Nhóm máu: <strong className="text-amber-400">{monitoredData.bloodType}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-xl border border-slate-700 font-mono">
                      Mức Pin: <strong className="text-amber-400">{monitoredData.location.batteryLevel}%</strong>
                    </span>

                    <span className="bg-slate-800 text-emerald-400 px-3 py-1 rounded-xl border border-slate-700 font-mono font-bold">
                      Độ chính xác: ±{monitoredData.location.accuracy}m
                    </span>
                  </div>
                </div>

                {/* Location Box */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Vị Trí Cụ Thể Thời Gian Thực:
                  </span>
                  <p className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-white font-bold text-xs sm:text-sm">
                    {monitoredData.location.address}
                  </p>

                  <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Tọa độ GPS: {monitoredData.location.lat.toFixed(6)}, {monitoredData.location.lng.toFixed(6)}</span>
                    <a
                      href={`https://maps.google.com/?q=${monitoredData.location.lat},${monitoredData.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 font-sans font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem Google Maps</span>
                    </a>
                  </div>
                </div>

                {/* Remote Actions to Send to Monitored User */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-extrabold text-amber-400 block flex items-center gap-1.5">
                    <Bell className="w-4 h-4" />
                    GỬI LỆNH ĐỒNG BỘ THÔNG BÁO TỚI THIẾT BỊ NGƯỜI THÂN VIA FIREBASE
                  </span>

                  {pingSuccess && (
                    <div className="bg-emerald-950 p-2.5 rounded-lg border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      {pingSuccess}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={pingMessage}
                      onChange={(e) => setPingMessage(e.target.value)}
                      placeholder="Nhập lời nhắn yêu cầu phản hồi..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    />

                    <button
                      onClick={() => handleSendPing("MESSAGE")}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Lời Nhắn</span>
                    </button>

                    <button
                      onClick={() => handleSendPing("RING_BELL")}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Reng Chuông Định Vị</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
