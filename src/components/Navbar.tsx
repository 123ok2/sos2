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
    { id: "guardian", label: "AI Cảm Biến & Âm Thanh", icon: Mic, badge: "AI Live" },
    { id: "map", label: "Bản Đồ Cảnh Báo", icon: MapPin },
    { id: "firstaid", label: "Trợ Lý Sơ Cứu AI", icon: Sparkles },
    { id: "profile", label: "Hồ Sơ Y Tế", icon: Users, count: contactsCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-xl">
      {/* Contest Banner Top Strip */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-xs py-1 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-red-500/30">
        <div className="flex items-center gap-2 font-medium">
          <Award className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Dự án Cuộc thi AI: <strong>AI SafetyNet</strong> - Hệ thống SOS & Cảnh báo Sự cố Khẩn cấp Thông minh</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDemoPanel}
            className="bg-slate-900/80 hover:bg-slate-900 text-amber-300 border border-amber-400/40 text-xs px-2.5 py-0.5 rounded-full font-semibold transition flex items-center gap-1 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mô Phỏng Trình Diễn (Demo)</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("sos")}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight text-slate-100">
                  AI Safety<span className="text-red-500">Net</span>
                </h1>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/30 uppercase">
                  v2.5 AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Cảnh báo sự cố, phát hiện té ngã & cứu hộ thông minh
              </p>
            </div>
          </div>

          {/* Right Status Indicators & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Live GPS & Battery indicators */}
            <div className="hidden md:flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
              <div className="flex items-center gap-1.5" title="Trạng thái định vị GPS">
                <Radio className={`w-3.5 h-3.5 ${gpsActive ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
                <span>GPS: {gpsActive ? "Đang bật" : "Tắt"}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5" title="Mức pin thiết bị">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                <span>{batteryLevel}%</span>
              </div>
            </div>

            {/* Siren Quick Button */}
            <button
              onClick={onToggleSiren}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition border ${
                isSirenPlaying
                  ? "bg-red-600 text-white border-red-400 animate-bounce shadow-lg shadow-red-600/50"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
              <span>{isSirenPlaying ? "TẮT CÒI SOS" : "Bật Còi SOS"}</span>
            </button>
          </div>
        </div>

        {/* Tab Items */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? "bg-white/20 text-white" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && (
                  <span className="ml-1 bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
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
