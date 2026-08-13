import React from "react";
import {
  ShieldAlert,
  Radio,
  Volume2,
  VolumeX,
  BatteryCharging,
  Sliders,
  Sparkles,
  MapPin,
  Mic,
  Users,
  Award,
  Share2,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSirenPlaying: boolean;
  onToggleSiren: () => void;
  onOpenDemoPanel: () => void;
  batteryLevel: number;
  gpsActive: boolean;
  contactsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isSirenPlaying,
  onToggleSiren,
  onOpenDemoPanel,
  batteryLevel,
  gpsActive,
  contactsCount,
}) => {
  const tabs = [
    { id: "sos", label: "SOS Khẩn Cấp", icon: ShieldAlert, badge: "Ưu tiên" },
    { id: "relative_tracker", label: "Theo Dõi Người Thân", icon: Users, badge: "Firebase Live" },
    { id: "share_code", label: "Mã Chia Sẻ & Firebase", icon: Share2 },
    { id: "guardian", label: "AI Cảm Biến & Âm Thanh", icon: Mic, badge: "AI Live" },
    { id: "map", label: "Bản Đồ Cảnh Báo", icon: MapPin },
    { id: "firstaid", label: "Trợ Lý Sơ Cứu AI", icon: Sparkles },
    { id: "profile", label: "Hồ Sơ Y Tế", icon: Users, count: contactsCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 text-slate-800 shadow-sm">
      {/* Contest Banner Top Strip */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-xs py-1 px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <Award className="w-4 h-4 text-amber-200 animate-pulse" />
          <span>Dự án AI: <strong>AI SafetyNet</strong> - Cảnh báo khẩn cấp & Giám sát thông minh</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDemoPanel}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/40 text-xs px-2.5 py-0.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Trình Diễn Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("sos")}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-md shadow-red-600/20">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight text-slate-900">
                  AI Safety<span className="text-red-600">Net</span>
                </h1>
                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 uppercase">
                  v2.5 AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Tự động cảnh báo khi có nghi ngờ sự cố & Kết nối người thân
              </p>
            </div>
          </div>

          {/* Right Status Indicators & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Live GPS & Battery indicators */}
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5" title="Trạng thái định vị GPS">
                <Radio className={`w-3.5 h-3.5 ${gpsActive ? "text-emerald-600 animate-pulse" : "text-slate-400"}`} />
                <span>GPS: {gpsActive ? "Đang định vị" : "Tắt"}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5" title="Mức pin thiết bị">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-600" />
                <span>{batteryLevel}%</span>
              </div>
            </div>

            {/* Siren Quick Button */}
            <button
              onClick={onToggleSiren}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition border ${
                isSirenPlaying
                  ? "bg-red-600 text-white border-red-500 animate-bounce shadow-md shadow-red-600/40"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-600" />}
              <span>{isSirenPlaying ? "TẮT CÒI" : "Bật Còi SOS"}</span>
            </button>
          </div>
        </div>

        {/* Tab Items */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && (
                  <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
