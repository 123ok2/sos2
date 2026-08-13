import React, { useState, useEffect } from "react";
import {
  Mic,
  Activity,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Zap,
  Volume2,
  Sliders,
  CheckCircle2,
  Loader2,
  Radio,
  FileAudio,
} from "lucide-react";
import { ThreatLevel, AudioDistressResult } from "../types";

interface AiAudioGuardianProps {
  onTriggerSosCountdown: (reason: string) => void;
}

export const AiAudioGuardian: React.FC<AiAudioGuardianProps> = ({ onTriggerSosCountdown }) => {
  // Sensor State
  const [fallSensitivity, setFallSensitivity] = useState(4.0); // G-force threshold
  const [currentGForce, setCurrentGForce] = useState(1.0);
  const [sensorActive, setSensorActive] = useState(true);
  const [lastAccXYZ, setLastAccXYZ] = useState({ x: 0, y: 0, z: 9.8 });

  // Audio State
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedNoiseType, setSelectedNoiseType] = useState("Xe va chạm / Té ngã");
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AudioDistressResult | null>(null);

  // Device Motion listener
  useEffect(() => {
    if (!sensorActive || !window.DeviceMotionEvent) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      setLastAccXYZ({ x, y, z });

      const totalAcc = Math.sqrt(x * x + y * y + z * z) / 9.8; // G-force
      setCurrentGForce(Number(totalAcc.toFixed(2)));

      if (totalAcc >= fallSensitivity) {
        onTriggerSosCountdown(`Cảm biến điện thoại phát hiện lực va chạm bất thường (${totalAcc.toFixed(1)}G)`);
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [sensorActive, fallSensitivity]);

  // Simulate Fall / Collision Event
  const handleSimulateImpact = (gValue: number, label: string) => {
    setCurrentGForce(gValue);
    setLastAccXYZ({ x: gValue * 6, y: gValue * 5, z: gValue * 4 });
    setTimeout(() => {
      onTriggerSosCountdown(`Cảm biến phát hiện va chạm bất thường: ${label} (${gValue}G)`);
    }, 300);
  };

  // Run Gemini Audio AI Analysis
  const handleRunAudioAnalysis = async (inputTranscript?: string) => {
    const textToAnalyze = inputTranscript || transcript || "Cứu tôi với! Bị ngã xe đau quá!";
    setIsAnalyzingAi(true);

    try {
      const res = await fetch("/api/ai/audio-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: textToAnalyze,
          audioType: selectedNoiseType,
          backgroundNoise: "Đường phố đêm muộn, có tiếng ồn xe chạy",
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysisResult(data.data);
        if (data.data.threatLevel === "CRITICAL" || data.data.threatLevel === "HIGH") {
          // If high distress detected, prompt SOS
          setTimeout(() => {
            onTriggerSosCountdown(`AI Phân tích Âm thanh nhận diện nguy hiểm: "${data.data.soundClassification}"`);
          }, 800);
        }
      }
    } catch (err) {
      console.error("Error analyzing audio:", err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const getThreatBadge = (level: ThreatLevel) => {
    switch (level) {
      case "CRITICAL":
        return <span className="bg-red-600 text-white font-extrabold px-2.5 py-1 rounded-md text-xs">NGUY CẤP (CRITICAL)</span>;
      case "HIGH":
        return <span className="bg-amber-600 text-white font-bold px-2.5 py-1 rounded-md text-xs">NGUY HIỂM CAO (HIGH)</span>;
      case "MEDIUM":
        return <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-md text-xs border border-amber-500/30">TRUNG BÌNH</span>;
      default:
        return <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-md text-xs border border-emerald-500/30">AN TOÀN</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI GUARDIAN SENSOR & AUDIO ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Phát Hiện Té Ngã & Phân Tích Âm Thanh Bằng AI
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Kết hợp cảm biến gia tốc phần cứng và mô hình AI Gemini phân tích âm thanh khẩn cấp thời gian thực.
          </p>
        </div>

        <button
          onClick={() => setSensorActive(!sensorActive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            sensorActive
              ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Cảm biến: {sensorActive ? "ĐANG BẬT" : "ĐÃ TẮT"}</span>
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Fall & Crash Detection Sensor */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-base">Cảm Biến Té Ngã & Va Chạm (Fall/Crash)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">DeviceMotion API</span>
          </div>

          {/* G-Force Gauge Visualizer */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Gia tốc lực tổng hợp (G-Force):</span>
              <span className={`font-mono font-extrabold ${currentGForce > fallSensitivity ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
                {currentGForce.toFixed(2)} G
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 ${
                  currentGForce > fallSensitivity ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-amber-500"
                }`}
                style={{ width: `${Math.min((currentGForce / 6) * 100, 100)}%` }}
              />
              {/* Threshold Marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-amber-300 z-10"
                style={{ left: `${(fallSensitivity / 6) * 100}%` }}
                title={`Ngưỡng kích hoạt: ${fallSensitivity}G`}
              />
            </div>

            {/* XYZ Live Axes */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center pt-1 border-t border-slate-800/80">
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400 block">Trục X:</span>
                <span className="text-amber-300 font-bold">{lastAccXYZ.x.toFixed(1)} m/s²</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400 block">Trục Y:</span>
                <span className="text-amber-300 font-bold">{lastAccXYZ.y.toFixed(1)} m/s²</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400 block">Trục Z:</span>
                <span className="text-amber-300 font-bold">{lastAccXYZ.z.toFixed(1)} m/s²</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              Ngưỡng kích hoạt cảnh báo: <strong className="text-amber-300">{fallSensitivity}G</strong>. Khi vượt quá, hệ thống tự động xuất hiện đếm ngược & gửi bản tin SOS tới liên hệ / địa chỉ đã thiết lập.
            </p>
          </div>

          {/* Sensitivity Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Độ nhạy phát hiện va chạm:
              </span>
              <span className="text-amber-400 font-mono font-bold">{fallSensitivity.toFixed(1)} G</span>
            </div>
            <input
              type="range"
              min="2.5"
              max="5.5"
              step="0.1"
              value={fallSensitivity}
              onChange={(e) => setFallSensitivity(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Rất Nhạy (2.5G)</span>
              <span>Mặc Định (4.0G)</span>
              <span>Lực Cực Mạnh (5.5G)</span>
            </div>
          </div>

          {/* Simulation Action Buttons for Collision Testing */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 block">Mô Phỏng Va Chạm Khẩn Cấp Để Kiểm Thử:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSimulateImpact(4.8, "Té Ngã Xe Máy Đột Ngột")}
                className="py-2.5 px-3 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Ngã Xe (4.8G)</span>
              </button>

              <button
                onClick={() => handleSimulateImpact(6.5, "Va Chạm Xe Mạnh Trên Đường")}
                className="py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Va Chạm Ôtô (6.5G)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Module 2: AI Emergency Audio Analysis */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Phân Tích Âm Thanh Khẩn Cấp (Gemini AI)</h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              AI Live
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">Âm thanh / Lời nói thu âm được:</label>
            <input
              type="text"
              placeholder="Nhập lời nói kêu cứu hoặc chọn mẫu..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "Cứu tôi với! Có tai nạn xe!",
                "SOS! Bị ngã xe gãy chân rồi!",
                "Xin chào, tôi đang đi học về.",
                "Cứu với! Có cướp giật!",
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(sample);
                    handleRunAudioAnalysis(sample);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleRunAudioAnalysis()}
            disabled={isAnalyzingAi}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            {isAnalyzingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>PHÂN TÍCH ÂM THANH BẰNG GEMINI AI</span>
          </button>

          {/* AI Analysis Output Card */}
          {aiAnalysisResult && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Kết quả Phân tích Gemini AI:</span>
                {getThreatBadge(aiAnalysisResult.threatLevel)}
              </div>

              <div className="space-y-1.5 text-slate-300">
                <p>
                  <strong>Loại âm thanh:</strong> {aiAnalysisResult.soundClassification}
                </p>
                <p>
                  <strong>Điểm số nguy hiểm:</strong>{" "}
                  <span className="text-amber-400 font-bold">{aiAnalysisResult.distressScore}/100</span>
                </p>
                {aiAnalysisResult.detectedDistressKeywords?.length > 0 && (
                  <p>
                    <strong>Từ khóa phát hiện:</strong>{" "}
                    <span className="text-red-400 font-semibold">
                      {aiAnalysisResult.detectedDistressKeywords.join(", ")}
                    </span>
                  </p>
                )}
                <p className="text-slate-400 italic mt-2 border-t border-slate-800 pt-2">
                  "{aiAnalysisResult.aiAnalysisSummary}"
                </p>
              </div>

              <div className="bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 text-red-300 font-semibold text-[11px]">
                Đề xuất AI: {aiAnalysisResult.recommendedAction}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
