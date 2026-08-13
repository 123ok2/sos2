import React, { useState, useRef } from "react";
import {
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  HeartPulse,
  Waves,
  Flame,
  Biohazard,
  Bone,
  Camera,
  Upload,
  Eye,
  ShieldAlert,
  FileImage,
  RefreshCw,
  Zap,
} from "lucide-react";
import { FirstAidGuide } from "../types";
import { OFFLINE_FIRST_AID_GUIDES } from "../data/mockData";
import { speakText, stopSpeech } from "../utils/audioSynth";

interface VisionResult {
  identifiedCondition: string;
  urgencyLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
  visualObservations: string[];
  immediateActions: string[];
  criticalWarnings: string[];
  call115Required: boolean;
  emergency115Message: string;
  voiceScript: string;
}

export const AiFirstAidAssistant: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"TEXT" | "VISION">("VISION");

  const [guides, setGuides] = useState<FirstAidGuide[]>(OFFLINE_FIRST_AID_GUIDES);
  const [selectedGuide, setSelectedGuide] = useState<FirstAidGuide>(OFFLINE_FIRST_AID_GUIDES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customSymptom, setCustomSymptom] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Vision State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [userNotes, setUserNotes] = useState("");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getGuideIcon = (category: string) => {
    switch (category) {
      case "drowning":
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case "cpr":
        return <HeartPulse className="w-5 h-5 text-red-500" />;
      case "fracture":
        return <Bone className="w-5 h-5 text-amber-400" />;
      case "snakebite":
        return <Biohazard className="w-5 h-5 text-emerald-400" />;
      case "burn":
        return <Flame className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleSpeechToggle = (text: string) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text);
    }
  };

  // Handle File Selection for AI Vision
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setVisionResult(null);
      setVisionError(null);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Vision Medical Analysis
  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzingImage(true);
    setVisionError(null);

    try {
      const res = await fetch("/api/ai/vision-first-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: imageMime,
          userNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setVisionResult(data.data);
        if (data.data.voiceScript) {
          speakText(data.data.voiceScript);
          setIsSpeaking(true);
        }
      } else {
        setVisionError(data.error || "Không thể phân tích ảnh lúc này. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("Error analyzing image:", err);
      setVisionError("Lỗi kết nối máy chủ AI Vision.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Search Gemini AI First-Aid Assistant
  const handleAskAiFirstAid = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const symptomToQuery = customSymptom || searchQuery || "Xử lý hóc dị vật hoặc ngất xỉu";
    setIsAskingAi(true);

    try {
      const res = await fetch("/api/ai/first-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: symptomToQuery,
          ageGroup: "Học sinh THCS / THPT / Mọi độ tuổi",
          medicalHistory: "Bình thường",
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const aiData = data.data;
        const newGuide: FirstAidGuide = {
          id: `ai-fa-${Date.now()}`,
          title: aiData.title || `Sơ cứu AI: ${symptomToQuery}`,
          category: "cpr",
          urgencyLevel: aiData.urgencyLevel || "HIGH",
          summary: aiData.summary || "Hướng dẫn cấp cứu do AI biên soạn",
          steps: aiData.steps || [],
          doList: aiData.doList || [],
          dontList: aiData.dontList || [],
          speechScript: aiData.speechScript || aiData.summary,
          iconName: "Sparkles",
        };

        setGuides([newGuide, ...guides]);
        setSelectedGuide(newGuide);
        setCustomSymptom("");
      }
    } catch (err) {
      console.error("Error asking AI first aid:", err);
    } finally {
      setIsAskingAi(false);
    }
  };

  const filteredGuides = guides.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Bác Sĩ Cấp Cứu Y Tế AI (Gemini)</h2>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMode("VISION")}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition ${
                activeMode === "VISION"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Chẩn Đoán Hình Ảnh AI Vision</span>
            </button>

            <button
              onClick={() => setActiveMode("TEXT")}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition ${
                activeMode === "TEXT"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Triệu Chứng Văn Bản</span>
            </button>
          </div>
        </div>

        {/* AI Vision Feature Description */}
        {activeMode === "VISION" ? (
          <p className="text-slate-300 text-xs leading-relaxed">
            📸 <strong>Tính năng AI Mới:</strong> Chụp ảnh vết thương (bỏng, vết cắn, trầy xước, sưng tấy, chấn thương) hoặc hiện trường tai nạn. Gemini Vision sẽ lập tức quét thị giác, phân tích mức độ nguy hiểm và đưa ra hướng dẫn sơ cứu tức thời kèm đọc giọng nói!
          </p>
        ) : (
          <p className="text-slate-300 text-xs leading-relaxed">
            💬 Tra cứu nhanh quy trình sơ cứu y tế chuẩn quốc tế. Nhập bất kỳ triệu chứng hay tình huống khẩn cấp nào để AI giải đáp ngay lập tức.
          </p>
        )}
      </div>

      {/* MODE 1: AI VISION MEDICAL SCANNER */}
      {activeMode === "VISION" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Picker & Upload */}
          <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              Tải Ảnh Vết Thương / Sự Cố
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Dropzone Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                selectedImage
                  ? "border-amber-500/60 bg-slate-950/80"
                  : "border-slate-700 bg-slate-950 hover:border-amber-500/50 hover:bg-slate-800/40"
              }`}
            >
              {selectedImage ? (
                <div className="space-y-3 w-full">
                  <img
                    src={selectedImage}
                    alt="Preview vết thương"
                    className="max-h-48 mx-auto rounded-xl object-contain border border-slate-800 shadow-md"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold">
                    <FileImage className="w-4 h-4" />
                    <span>Đã chọn ảnh. Bấm để đổi ảnh khác</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Bấm để tải ảnh hoặc chụp ảnh trực tiếp</p>
                    <p className="text-xs text-slate-500 mt-1">Hỗ trợ JPG, PNG, WEBP (Vết thương, vết cắn, hiện trường...)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Ghi chú thêm bối cảnh (Không bắt buộc):
              </label>
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Ví dụ: Bị ong đốt 15 phút trước, Bị bỏng nước sôi, Té ngã trầy gối..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleAnalyzeImage}
              disabled={!selectedImage || isAnalyzingImage}
              className={`w-full py-3.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-xl ${
                selectedImage && !isAnalyzingImage
                  ? "bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 hover:brightness-110 text-white cursor-pointer shadow-red-600/30"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isAnalyzingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>GEMINI VISION ĐANG PHÂN TÍCH HÌNH ẢNH...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-bounce" />
                  <span>PHÂN TÍCH HÌNH ẢNH & CHẨN ĐOÁN AI</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: AI Vision Result Display */}
          <div className="lg:col-span-7 space-y-4">
            {visionError && (
              <div className="bg-red-950/40 p-4 rounded-2xl border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{visionError}</span>
              </div>
            )}

            {visionResult ? (
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl">
                {/* Result Top Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                        ĐỘ TỰ TIN AI: {visionResult.confidenceScore}%
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded text-white ${
                          visionResult.urgencyLevel === "CRITICAL"
                            ? "bg-red-600 animate-pulse"
                            : visionResult.urgencyLevel === "HIGH"
                            ? "bg-amber-600"
                            : "bg-emerald-600"
                        }`}
                      >
                        MỨC ĐỘ: {visionResult.urgencyLevel}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white">{visionResult.identifiedCondition}</h3>
                  </div>

                  <button
                    onClick={() => handleSpeechToggle(visionResult.voiceScript)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                      isSpeaking
                        ? "bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 animate-pulse"
                        : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                    <span>{isSpeaking ? "Dừng Đọc" : "Phát Giọng Nói AI"}</span>
                  </button>
                </div>

                {/* Visual Observations */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    KẾT QUẢ QUAN SÁT THỊ GIÁC AI:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {visionResult.visualObservations.map((obs, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Immediate First Aid Actions */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-white text-xs">CÁC BƯỚC SƠ CỨU KHẨN CẤP CẦN LÀM NGAY:</h4>
                  <div className="space-y-2">
                    {visionResult.immediateActions.map((act, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0 border border-emerald-500/30">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Warnings */}
                <div className="bg-red-950/30 p-4 rounded-xl border border-red-500/40 space-y-2 text-xs">
                  <h4 className="font-extrabold text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-400" />
                    TUYỆT ĐỐI KHÔNG NÊN LÀM:
                  </h4>
                  <ul className="space-y-1 text-slate-300">
                    {visionResult.criticalWarnings.map((warn, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call 115 Emergency Dispatch Banner */}
                {visionResult.call115Required && (
                  <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 rounded-xl text-white space-y-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                    <div className="space-y-0.5">
                      <p className="font-black text-xs flex items-center gap-1.5 text-yellow-300">
                        <ShieldAlert className="w-4 h-4 animate-bounce" />
                        CẦN GỌI CỨU THƯƠNG 115 NGAY LẬP TỨC!
                      </p>
                      <p className="text-[11px] text-red-100">{visionResult.emergency115Message}</p>
                    </div>

                    <a
                      href="tel:115"
                      className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow shrink-0 flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>GỌI 115 NGAY</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 text-center space-y-3 text-slate-400 text-xs min-h-[300px] flex flex-col items-center justify-center">
                <Camera className="w-12 h-12 text-slate-700" />
                <p className="font-bold text-slate-300">Chưa có ảnh nào được phân tích</p>
                <p className="max-w-sm text-slate-500">
                  Tải ảnh vết thương hoặc sự cố lên ô bên trái và bấm "Phân Tích Hình Ảnh & Chẩn Đoán AI" để Gemini Vision đưa ra kết quả.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: TEXT SYMPTOM SEARCH */}
      {activeMode === "TEXT" && (
        <div className="space-y-6">
          {/* AI Query Box */}
          <form onSubmit={handleAskAiFirstAid} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nhập triệu chứng / sự cố (Ví dụ: Hóc xương cá, Điện giật, Say nắng, Chó cắn...)"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={isAskingAi}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
            >
              {isAskingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>HỎI BÁC SĨ AI</span>
            </button>
          </form>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Guide List Catalog */}
            <div className="lg:col-span-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Danh Mục Sơ Cứu</h3>
                <span className="text-xs text-slate-400">{filteredGuides.length} Bài hướng dẫn</span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredGuides.map((guide) => {
                  const isSelected = selectedGuide.id === guide.id;
                  return (
                    <div
                      key={guide.id}
                      onClick={() => {
                        setSelectedGuide(guide);
                        stopSpeech();
                        setIsSpeaking(false);
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-slate-800 border-amber-500/80 shadow-md"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="p-2 bg-slate-900 rounded-lg shrink-0 mt-0.5">
                        {getGuideIcon(guide.category)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className={`font-bold text-xs truncate ${isSelected ? "text-amber-400" : "text-slate-200"}`}>
                          {guide.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{guide.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Guide Detail Display */}
            <div className="lg:col-span-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Header & Speech Controls */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded">
                      {selectedGuide.urgencyLevel}
                    </span>
                    <span className="text-xs text-slate-400">Quy trình cấp cứu y tế</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{selectedGuide.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeechToggle(selectedGuide.speechScript || selectedGuide.summary)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                      isSpeaking
                        ? "bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 animate-pulse"
                        : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                    <span>{isSpeaking ? "Dừng Đọc" : "Đọc Hướng Dẫn Âm Thanh"}</span>
                  </button>

                  <a
                    href="tel:115"
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Gọi 115</span>
                  </a>
                </div>
              </div>

              {/* Quick Summary Banner */}
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 text-amber-200 text-xs leading-relaxed font-medium">
                💡 <strong>Hành động 10s đầu tiên:</strong> {selectedGuide.summary}
              </div>

              {/* Step-by-Step Procedure */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">Các Bước Thực Hiện Sơ Cứu:</h4>
                <div className="space-y-2.5">
                  {selectedGuide.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do's & Don'ts Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Should Do */}
                <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/50 space-y-2 text-xs">
                  <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    NÊN LÀM:
                  </h5>
                  <ul className="space-y-1.5 text-slate-300">
                    {selectedGuide.doList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Should NOT Do */}
                <div className="bg-red-950/40 p-4 rounded-xl border border-red-800/50 space-y-2 text-xs">
                  <h5 className="font-bold text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-400" />
                    TUYỆT ĐỐI KHÔNG NÊN LÀM:
                  </h5>
                  <ul className="space-y-1.5 text-slate-300">
                    {selectedGuide.dontList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

