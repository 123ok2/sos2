import React, { useState } from "react";
import {
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Navigation,
  Sparkles,
  Volume2,
  PlusCircle,
  Loader2,
  Info,
  Radio,
  Clock,
  Compass,
} from "lucide-react";
import { GeoLocationState, DangerZone, DangerRiskAssessment, ThreatLevel } from "../types";
import { MOCK_DANGER_ZONES } from "../data/mockData";
import { speakText } from "../utils/audioSynth";

interface SmartDangerMapProps {
  location: GeoLocationState;
  onUpdateLocation: (newLoc: Partial<GeoLocationState>) => void;
  onTriggerSosCountdown: (reason: string) => void;
}

export const SmartDangerMap: React.FC<SmartDangerMapProps> = ({
  location,
  onUpdateLocation,
  onTriggerSosCountdown,
}) => {
  const [dangerZones, setDangerZones] = useState<DangerZone[]>(MOCK_DANGER_ZONES);
  const [selectedZone, setSelectedZone] = useState<DangerZone | null>(MOCK_DANGER_ZONES[0]);
  const [isAssessingAi, setIsAssessingAi] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<DangerRiskAssessment | null>(null);

  // New Zone Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneType, setNewZoneType] = useState<DangerZone["type"]>("isolated");
  const [newZoneDesc, setNewZoneDesc] = useState("");

  // Calculate distance between 2 GPS coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  // Find nearest danger zone
  const nearestZone = dangerZones.reduce(
    (acc, zone) => {
      const dist = calculateDistance(location.lat, location.lng, zone.lat, zone.lng);
      if (!acc.zone || dist < acc.dist) {
        return { zone, dist };
      }
      return acc;
    },
    { zone: null as DangerZone | null, dist: Infinity }
  );

  const isInDangerRadius = nearestZone.zone && nearestZone.dist <= nearestZone.zone.radiusMeters;

  // Run AI Danger Risk Evaluation
  const handleAssessRiskWithAi = async () => {
    setIsAssessingAi(true);
    try {
      const res = await fetch("/api/ai/danger-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          timeOfDay: "22:30 Đêm muộn",
          surroundingType: nearestZone.zone?.description || "Khu vực ven sông vắng người, thiếu đèn chiếu sáng",
          speedKmH: location.speed,
          historyIncidents: `Gần ${nearestZone.zone?.name || "điểm đen rủi ro"}: có ${nearestZone.zone?.incidentCount || 3} sự cố ghi nhận.`,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiAssessment(data.data);
        if (data.data.voiceWarningText) {
          speakText(data.data.voiceWarningText);
        }
      }
    } catch (err) {
      console.error("Error assessing risk:", err);
    } finally {
      setIsAssessingAi(false);
    }
  };

  const handleSimulateMoveToZone = (zone: DangerZone) => {
    onUpdateLocation({
      lat: zone.lat,
      lng: zone.lng,
      address: `Gần ${zone.name}`,
      isSimulated: true,
    });
    setSelectedZone(zone);
    onTriggerSosCountdown(`Di chuyển vào ${zone.name}`);
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;

    const newZone: DangerZone = {
      id: `dz-custom-${Date.now()}`,
      name: newZoneName,
      type: newZoneType,
      riskLevel: "HIGH",
      lat: location.lat + (Math.random() - 0.5) * 0.005,
      lng: location.lng + (Math.random() - 0.5) * 0.005,
      radiusMeters: 250,
      description: newZoneDesc || "Sự cố cộng đồng đóng góp",
      incidentCount: 1,
      safetyAdvice: "Chú ý quan sát xung quanh khi đi qua đoạn đường này.",
    };

    setDangerZones([newZone, ...dangerZones]);
    setShowAddModal(false);
    setNewZoneName("");
    setNewZoneDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Top Proximity Warning Banner if Inside Zone */}
      {isInDangerRadius && nearestZone.zone && (
        <div className="bg-gradient-to-r from-red-600 to-amber-600 p-4 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-pulse border border-red-400">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/30 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-black text-sm">CẢNH BÁO AI: ĐANG TRONG VÙNG NGUY HIỂM!</h4>
              <p className="text-xs text-red-100">
                Bạn nằm trong bán kính {nearestZone.zone.radiusMeters}m của: <strong>{nearestZone.zone.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handleAssessRiskWithAi}
            className="px-3.5 py-1.5 bg-white text-red-700 font-extrabold text-xs rounded-xl shadow hover:bg-red-50 transition"
          >
            Bật Đánh Giá Rủi Ro AI
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Visual Map Simulator */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-white text-base">Bản Đồ Định Vị & Vùng Cảnh Báo</h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Báo điểm rủi ro mới</span>
            </button>
          </div>

          {/* Map Graphic Canvas Simulation */}
          <div className="relative w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Grid Lines Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#ef4444 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 12px 12px",
              }}
            />

            {/* Simulated River / Road Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <path d="M 0 150 Q 150 80, 300 180 T 600 120" stroke="#0284c7" strokeWidth="12" fill="none" />
              <path d="M 120 0 L 120 320" stroke="#475569" strokeWidth="8" strokeDasharray="6,6" fill="none" />
              <path d="M 0 220 L 500 220" stroke="#475569" strokeWidth="8" strokeDasharray="6,6" fill="none" />
            </svg>

            {/* Danger Zones Pins on Map */}
            {dangerZones.map((zone, idx) => {
              // Calculate relative offset on graphic
              const offsetX = ((zone.lng - 106.65) / 0.05) * 100;
              const offsetY = ((10.77 - zone.lat) / 0.04) * 100;

              const isSelected = selectedZone?.id === zone.id;

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition hover:scale-110"
                  style={{
                    left: `${Math.max(15, Math.min(85, 30 + idx * 18))}%`,
                    top: `${Math.max(15, Math.min(85, 25 + (idx % 3) * 25))}%`,
                  }}
                >
                  {/* Danger Circle Radius */}
                  <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/50 animate-pulse flex items-center justify-center -m-4">
                    <div className="w-8 h-8 rounded-full bg-red-600/40 border border-red-400 flex items-center justify-center shadow-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-300" />
                    </div>
                  </div>

                  {/* Tooltip Label */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap opacity-90 group-hover:opacity-100 z-10 shadow">
                    {zone.name.split("(")[0]}
                  </div>
                </div>
              );
            })}

            {/* Current User Location GPS Pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500/30 border-2 border-emerald-400 animate-ping absolute -inset-1" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-white flex items-center justify-center shadow-xl shadow-emerald-500/50">
                  <Navigation className="w-4 h-4 text-white transform rotate-45" />
                </div>
              </div>
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow mt-1">
                BẠN Ở ĐÂY
              </span>
            </div>

            {/* Bottom Map Info Overlay */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">
                  {location.address}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">Mô phỏng di chuyển GPS tới điểm rủi ro:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dangerZones.slice(0, 2).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleSimulateMoveToZone(zone)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 text-xs font-medium text-left transition flex items-center justify-between"
                >
                  <span className="truncate">{zone.name}</span>
                  <span className="text-red-400 font-bold text-[10px] shrink-0 ml-2">Thử di chuyển</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Danger Assessment & Details */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Đánh Giá Nguy Cơ AI (Gemini)</h3>
            </div>
            <button
              onClick={handleAssessRiskWithAi}
              disabled={isAssessingAi}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg transition flex items-center gap-1 shadow"
            >
              {isAssessingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Đánh Giá AI</span>
            </button>
          </div>

          {/* Proximity Distance Info */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Khoảng cách tới vùng rủi ro gần nhất:</span>
              <span className="text-amber-400 font-mono font-bold text-sm">
                {nearestZone.dist < 1000 ? `${nearestZone.dist}m` : `${(nearestZone.dist / 1000).toFixed(1)}km`}
              </span>
            </div>
            {nearestZone.zone && (
              <p className="text-slate-300 font-medium">
                Khu vực: <strong>{nearestZone.zone.name}</strong>
              </p>
            )}
          </div>

          {/* AI Assessment Results */}
          {aiAssessment ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Điểm số nguy cơ AI:</span>
                <span className="bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded text-sm">
                  {aiAssessment.riskScore}/100 ({aiAssessment.riskLevel})
                </span>
              </div>

              <p className="text-slate-300">
                <strong>Phân loại bối cảnh:</strong> {aiAssessment.zoneCategory}
              </p>

              <div className="space-y-1">
                <strong className="text-slate-200">Các yếu tố nguy cơ chính:</strong>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                  {aiAssessment.primaryThreats?.map((threat, i) => (
                    <li key={i}>{threat}</li>
                  ))}
                </ul>
              </div>

              {/* Voice Warning Script */}
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    Cảnh Báo Giọng Nói AI:
                  </span>
                  <button
                    onClick={() => speakText(aiAssessment.voiceWarningText)}
                    className="text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded transition"
                  >
                    Phát Âm Thanh
                  </button>
                </div>
                <p className="text-slate-200 text-xs italic">"{aiAssessment.voiceWarningText}"</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs space-y-2">
              <Info className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Nhấn nút "Đánh Giá AI" để mô hình Gemini phân tích chi tiết nguy cơ khu vực theo thời gian thực.</p>
            </div>
          )}

          {/* Selected Danger Zone Details */}
          {selectedZone && (
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">{selectedZone.name}</h4>
              <p className="text-slate-300 leading-relaxed">{selectedZone.description}</p>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 text-amber-300 font-medium">
                Lời khuyên an toàn: {selectedZone.safetyAdvice}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Báo Điểm Rủi Ro Khẩn Cấp Cộng Đồng</h3>
            <form onSubmit={handleAddZone} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên địa điểm / sự cố:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nắp hố ga bị hỏng, Cây cối gãy đổ..."
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Loại rủi ro:</label>
                <select
                  value={newZoneType}
                  onChange={(e) => setNewZoneType(e.target.value as DangerZone["type"])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="isolated">Khu vực vắng vẻ đêm muộn</option>
                  <option value="accident">Điểm đen tai nạn va chạm</option>
                  <option value="flood">Khu vực ngập nước / trơn trượt</option>
                  <option value="crime">Nguy cơ cướp giật</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mô tả ngắn:</label>
                <textarea
                  placeholder="Mô tả bối cảnh..."
                  value={newZoneDesc}
                  onChange={(e) => setNewZoneDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
                >
                  Đăng Báo Cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
