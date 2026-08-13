import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini Client initialization
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured in process.env");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API 1: AI First-Aid Emergency Assistant
app.post("/api/ai/first-aid", async (req, res) => {
  try {
    const { query, ageGroup, medicalHistory } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing query symptom" });
    }

    const ai = getGeminiClient();
    const prompt = `Bạn là Chuyên gia Trợ lý Sơ cứu Khẩn cấp Y tế cho dự án AI SafetyNet.
Người dùng đang gặp tình huống khẩn cấp hoặc cần hướng dẫn sơ cứu về: "${query}".
Độ tuổi người bị nạn: ${ageGroup || "Mọi độ tuổi"}.
Lưu ý tiền sử bệnh: ${medicalHistory || "Không rõ"}.

Hãy phân tích và trả về định dạng JSON cấu trúc chính xác như sau:
{
  "title": "Tên tình huống sơ cứu (tiếng Việt ngắn gọn, rõ ràng)",
  "urgencyLevel": "HIGH" | "CRITICAL" | "MEDIUM" | "LOW",
  "summary": "1 câu tóm tắt hành động khẩn cấp nhất cần làm trong 10 giây đầu",
  "steps": [
    "Bước 1: ...",
    "Bước 2: ...",
    "Bước 3: ..."
  ],
  "doList": [
    "Nên làm 1...",
    "Nên làm 2..."
  ],
  "dontList": [
    "TẬP TRUNG KHÔNG ĐƯỢC LÀM 1...",
    "KHÔNG ĐƯỢC LÀM 2..."
  ],
  "callEmergency115Reason": "Lý do khẩn cấp cần gọi 115 ngay (nếu có)",
  "speechScript": "Đoạn văn ngắn 2-3 câu bằng tiếng Việt để phát âm thanh đọc cho người xung quanh nghe và thực hiện."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "Bạn là bác sĩ cấp cứu y tế chuyên sâu, phản hồi chính xác, ngắn gọn, dễ hiểu trong tình huống khẩn cấp. Luôn tuân thủ các chuẩn mực sơ cứu quốc tế.",
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in /api/ai/first-aid:", error);
    return res.status(500).json({
      error: "Không thể gọi AI Sơ cứu lúc này",
      details: error.message,
    });
  }
});

// API 2: AI Emergency Audio Analysis (Phân tích ngữ cảnh âm thanh khẩn cấp)
app.post("/api/ai/audio-analyze", async (req, res) => {
  try {
    const { transcript, audioType, backgroundNoise } = req.body;

    const ai = getGeminiClient();
    const prompt = `Phân tích ngữ cảnh âm thanh / lời nói khẩn cấp thu nhận được từ điện thoại người dùng:
- Lời nói / Âm thanh ghi nhận: "${transcript || "Không có lời nói"}"
- Loại âm thanh va đập / tiếng động: "${audioType || "Không rõ"}"
- Tiếng ồn xung quanh: "${backgroundNoise || "Môi trường bình thường"}"

Hãy đánh giá mức độ nguy hiểm SOS và trích xuất thông tin. Trả về JSON:
{
  "threatLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE",
  "distressScore": 85, // Từ 0 đến 100
  "detectedDistressKeywords": ["Cứu tôi với", "Té ngã", "SOS"],
  "soundClassification": "Tiếng kêu cứu / Tiếng va chạm mạnh / Tiếng kính vỡ / Tiếng khóc / Âm thanh bình thường",
  "locationHintExtracted": "Nếu trong lời nói có nhắc tên đường/địa điểm, trích xuất ra đây (hoặc null)",
  "aiAnalysisSummary": "Phân tích ngắn 1-2 câu về tình trạng người dùng",
  "recommendedAction": "Tự động gửi SOS cho người thân ngay lập tức / Bật còi báo động / Tiếp tục theo dõi"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in /api/ai/audio-analyze:", error);
    return res.status(500).json({
      error: "Không thể phân tích âm thanh khẩn cấp",
      details: error.message,
    });
  }
});

// API 3: AI Smart Danger Zone Risk Assessment (Dự đoán & Cảnh báo vùng nguy hiểm)
app.post("/api/ai/danger-assess", async (req, res) => {
  try {
    const { lat, lng, timeOfDay, surroundingType, speedKmH, historyIncidents } = req.body;

    const ai = getGeminiClient();
    const prompt = `Dự đoán mức độ rủi ro an toàn cá nhân dựa trên tọa độ và bối cảnh di chuyển:
- Tọa độ GPS: Lat ${lat}, Lng ${lng}
- Thời gian: ${timeOfDay || "22:30 Đêm muộn"}
- Bối cảnh khu vực: ${surroundingType || "Đoạn đường vắng, ít đèn đường, gần sông nước"}
- Tốc độ di chuyển: ${speedKmH || 0} km/h
- Lịch sử sự cố xung quanh: ${historyIncidents || "Có 3 vụ trộm cắp và 1 điểm đen tai nạn"}

Hãy phân tích và trả về JSON:
{
  "riskScore": 75, // từ 0 đến 100
  "riskLevel": "HIGH" | "CRITICAL" | "MEDIUM" | "SAFE",
  "zoneCategory": "Đoạn đường vắng đêm muộn / Điểm đen tai nạn / Bờ sông trơn trượt / Vùng an toàn",
  "primaryThreats": [
    "Đường tối thiếu đèn chiếu sáng",
    "Nguy cơ cướp giật đêm muộn",
    "Khu vực sóng điện thoại chập chờn"
  ],
  "voiceWarningText": "Cảnh báo AI: Bạn đang đi vào khu vực vắng vẻ lúc đêm muộn. Hãy chú ý quan sát và bật chia sẻ vị trí khẩn cấp.",
  "recommendedSafetyTips": [
    "Bật tính năng phát hiện té ngã ngầm",
    "Chuẩn bị sẵn nút SOS 1 chạm",
    "Di chuyển nhanh đến khu vực đông dân cư"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in /api/ai/danger-assess:", error);
    return res.status(500).json({
      error: "Không thể đánh giá vùng nguy hiểm",
      details: error.message,
    });
  }
});

// API 4: AI SOS Message Generator
app.post("/api/ai/sos-message", async (req, res) => {
  try {
    const { userName, incidentType, location, medicalNotes, batteryLevel } = req.body;

    const ai = getGeminiClient();
    const prompt = `Soạn tin nhắn cảnh báo SOS khẩn cấp bằng AI để gửi cho Người thân / Cơ quan Cứu hộ:
- Tên nạn nhân: ${userName || "Nguyễn Văn A"}
- Loại sự cố: ${incidentType || "Phát hiện Té ngã / Va chạm xe"}
- Tọa độ GPS & Địa chỉ: ${location?.address || "Đang cập nhật GPS"} (${location?.lat}, ${location?.lng})
- Link Google Maps: https://maps.google.com/?q=${location?.lat},${location?.lng}
- Pin điện thoại còn: ${batteryLevel || 45}%
- Thông tin y tế: ${medicalNotes || "Nhóm máu O, Dị ứng Penicillin"}

Trả về JSON:
{
  "smsShortText": "CẢNH BÁO SOS! Nguyễn Văn A gặp sự cố Té ngã tại Lat 10.7626, Lng 106.682. Vị trí: https://maps.google.com/?q=10.7626,106.682. Pin: 45%. Hãy cứu trợ ngay!",
  "detailedMessage": "Chi tiết bản tin SOS cứu hộ...",
  "zaloTemplate": "Nội dung gửi mạng xã hội...",
  "callScript": "Kịch bản cuộc gọi khẩn cấp tự động..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in /api/ai/sos-message:", error);
    return res.status(500).json({
      error: "Không thể tạo tin nhắn SOS",
      details: error.message,
    });
  }
});

// API 5: AI Vision Medical & Incident Scanner (Chẩn Đoán Hình Ảnh Y Tế & Sự Cố)
app.post("/api/ai/vision-first-aid", async (req, res) => {
  try {
    const { imageBase64, mimeType, userNotes } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 parameter" });
    }

    // Clean base64 string if data URL scheme is present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageMime = mimeType || "image/jpeg";

    const ai = getGeminiClient();
    const promptText = `Bạn là Bác sĩ Trợ lý Y tế & Cứu hộ Khẩn cấp bằng Thị giác AI (Gemini Vision) cho dự án AI SafetyNet.
Hãy phân tích cẩn thận hình ảnh vết thương, sự cố y tế, vết cắn/bỏng hoặc hiện trường do người dùng tải lên.
${userNotes ? `Ghi chú kèm theo: "${userNotes}"` : ""}

Hãy phân tích chuyên môn và trả về định dạng JSON cấu trúc chính xác sau:
{
  "identifiedCondition": "Tên vết thương hoặc sự cố nhận diện (Tiếng Việt)",
  "urgencyLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "confidenceScore": 95,
  "visualObservations": [
    "Quan sát 1...",
    "Quan sát 2..."
  ],
  "immediateActions": [
    "Hành động sơ cứu khẩn cấp 1...",
    "Hành động sơ cứu khẩn cấp 2...",
    "Hành động sơ cứu khẩn cấp 3..."
  ],
  "criticalWarnings": [
    "KHÔNG ĐƯỢC LÀM 1...",
    "KHÔNG ĐƯỢC LÀM 2..."
  ],
  "call115Required": true,
  "emergency115Message": "Thông điệp gửi 115 hoặc 114 nếu nguy hiểm",
  "voiceScript": "Lời dặn ngắn gọn 2-3 câu bằng tiếng Việt để máy đọc hướng dẫn sơ cứu lập tức."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageMime,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "Bạn là bác sĩ cấp cứu y tế chuyên sâu với khả năng chẩn đoán thị giác AI. Đưa ra tư vấn sơ cứu khẩn cấp chính xác, an toàn, tuân thủ tiêu chuẩn y tế quốc tế.",
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in /api/ai/vision-first-aid:", error);
    return res.status(500).json({
      error: "Không thể phân tích hình ảnh lúc này",
      details: error.message,
    });
  }
});

// Vite Middleware for dev & static serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server AI SafetyNet running on http://localhost:${PORT}`);
  });
}

startServer();
