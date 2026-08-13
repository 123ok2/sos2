import React from "react";
import { Sliders, X, Award, AlertOctagon, Mic, MapPin, RefreshCw } from "lucide-react";
import { DEMO_CONTEST_SCENARIOS } from "../data/mockData";

interface ContestDemoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerFallDemo: () => void;
  onTriggerScreamDemo: () => void;
  onTriggerDangerZoneDemo: () => void;
  onResetDemo: () => void;
}

export const ContestDemoPanel: React.FC<ContestDemoPanelProps> = ({
  isOpen,
  onClose,
  onTriggerFallDemo,
  onTriggerScreamDemo,
  onTriggerDangerZoneDemo,
  onResetDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl shadow-amber-500/20 space-y-5 relative">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-base">Bảng Mô Phỏng Trình Diễn Cuộc Thi AI</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Sử dụng các nút kịch bản dưới đây để trực tiếp trình diễn các tính năng Trí tuệ Nhân tạo (AI) của ứng dụng <strong>AI SafetyNet</strong> trước Ban Giám Khảo cuộc thi!
        </p>

        {/* Scenarios Grid */}
        <div className="space-y-3 text-xs">
          {/* Scenario 1: Fall */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 hover:border-red-500/50 transition">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5 text-red-400">
                <AlertOctagon className="w-4 h-4" />
                {DEMO_CONTEST_SCENARIOS[0].name}
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                Lực 4.5G
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">{DEMO_CONTEST_SCENARIOS[0].description}</p>
            <button
              onClick={() => {
                onTriggerFallDemo();
                onClose();
              }}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition shadow"
            >
              Chạy Kịch Bản Té Ngã (4.5G)
            </button>
          </div>

          {/* Scenario 2: Scream */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Mic className="w-4 h-4" />
                {DEMO_CONTEST_SCENARIOS[1].name}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                Gemini AI Audio
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">{DEMO_CONTEST_SCENARIOS[1].description}</p>
            <button
              onClick={() => {
                onTriggerScreamDemo();
                onClose();
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow"
            >
              Chạy Kịch Bản Kêu Cứu Âm Thanh
            </button>
          </div>

          {/* Scenario 3: Danger Zone */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5 text-amber-400">
                <MapPin className="w-4 h-4" />
                {DEMO_CONTEST_SCENARIOS[2].name}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                Cảnh Báo Vùng Nguy Hiểm
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">{DEMO_CONTEST_SCENARIOS[2].description}</p>
            <button
              onClick={() => {
                onTriggerDangerZoneDemo();
                onClose();
              }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition shadow"
            >
              Chạy Kịch Bản Vùng Nguy Hiểm GPS
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => {
              onResetDemo();
              onClose();
            }}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại trạng thái ban đầu</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
          >
            Đóng Bảng Mô Phỏng
          </button>
        </div>
      </div>
    </div>
  );
};
