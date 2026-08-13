import React, { useState } from "react";
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
  HelpCircle,
} from "lucide-react";
import { FirstAidGuide, ThreatLevel } from "../types";
import { OFFLINE_FIRST_AID_GUIDES } from "../data/mockData";
import { speakText, stopSpeech } from "../utils/audioSynth";

export const AiFirstAidAssistant: React.FC = () => {
  const [guides, setGuides] = useState<FirstAidGuide[]>(OFFLINE_FIRST_AID_GUIDES);
  const [selectedGuide, setSelectedGuide] = useState<FirstAidGuide>(OFFLINE_FIRST_AID_GUIDES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customSymptom, setCustomSymptom] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
      {/* Title & AI Ask Bar */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white">Trợ Lý Sơ Cứu Bằng AI (Gemini)</h2>
        </div>
        <p className="text-slate-400 text-xs">
          Tra cứu nhanh quy trình sơ cứu y tế chuẩn quốc tế. Hỗ trợ đọc giọng nói tiếng Việt hands-free khi đang cấp cứu!
        </p>

        {/* AI Query Box */}
        <form onSubmit={handleAskAiFirstAid} className="flex flex-col sm:flex-row gap-2 pt-1">
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
      </div>

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
  );
};
