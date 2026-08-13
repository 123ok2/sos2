import {
  EmergencyContact,
  UserProfile,
  DangerZone,
  FirstAidGuide,
  GeoLocationState,
} from "../types";

export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "",
  phone: "",
  email: "",
  age: 20,
  gender: "Khác",
  bloodType: "Chưa chọn",
  allergies: "",
  medicalConditions: "",
  guardianCode: `SAFE-${Math.floor(1000 + Math.random() * 9000)}`,
  emergencyContacts: [],
  primaryRecipientName: "",
  primaryRecipientPhone: "",
  primaryRecipientEmail: "",
  primaryRecipientAddress: "",
};

export const INITIAL_LOCATION: GeoLocationState = {
  lat: 10.762622,
  lng: 106.682022,
  address: "Đang xác định vị trí GPS thiết bị...",
  accuracy: 10,
  speed: 0,
  heading: 0,
  timestamp: Date.now(),
  isSimulated: false,
  batteryLevel: 90,
};

export const VIETNAM_HOTLINES = [
  { name: "Cấp cứu Y tế", number: "115", color: "bg-red-600", desc: "Sơ cứu & Xe cấp cứu bệnh viện" },
  { name: "Cảnh sát / Công an", number: "113", color: "bg-blue-600", desc: "An ninh, cướp giật & Sự cố khẩn" },
  { name: "PCCC & Cứu nạn", number: "114", color: "bg-amber-600", desc: "Hỏa hoạn, mắc kẹt, đuối nước" },
  { name: "Cứu nạn Quốc gia", number: "112", color: "bg-purple-600", desc: "Tìm kiếm cứu nạn thiên tai" },
  { name: "Bảo vệ Trẻ em", number: "111", color: "bg-emerald-600", desc: "Tổng đài Quốc gia bảo vệ trẻ em" },
];

export const MOCK_DANGER_ZONES: DangerZone[] = [
  {
    id: "dz-1",
    name: "Khu vực Bờ sông Nguyễn Văn Cừ (Tối vắng đêm)",
    type: "isolated",
    riskLevel: "HIGH",
    lat: 10.7601,
    lng: 106.6855,
    radiusMeters: 300,
    description: "Đoạn đường ven sông ít đèn đường sau 22h, ghi nhận một số vụ cướp giật và trượt chân xuống sông.",
    incidentCount: 5,
    safetyAdvice: "Tránh đi một mình sau 21h. Bật chế độ Còi SOS và phát hiện té ngã.",
  },
  {
    id: "dz-2",
    name: "Nút giao Đen Tai Nạn Vòng xoay Cây Gõ",
    type: "accident",
    riskLevel: "CRITICAL",
    lat: 10.7588,
    lng: 106.6542,
    radiusMeters: 250,
    description: "Điểm đen giao thông góc khuất nhiều xe tải lớn chạy giờ cao điểm.",
    incidentCount: 12,
    safetyAdvice: "Giảm tốc độ dưới 20km/h, quan sát điểm mù xe container.",
  },
  {
    id: "dz-3",
    name: "Khu vực Ngập nước Trơn trượt Đường Trần Hưng Đạo",
    type: "flood",
    riskLevel: "MEDIUM",
    lat: 10.7551,
    lng: 106.6712,
    radiusMeters: 400,
    description: "Đoạn đường hay ngập sâu 0.4m khi mưa lớn kèm triều cường, gây té ngã xe máy.",
    incidentCount: 8,
    safetyAdvice: "Tránh đi sát mép vỉa hè có hố ga mở nắp.",
  },
  {
    id: "dz-4",
    name: "Hẻm vắng Đêm muộn Quận 8",
    type: "crime",
    riskLevel: "HIGH",
    lat: 10.7422,
    lng: 106.6789,
    radiusMeters: 200,
    description: "Khu vực hẻm sâu nhiều ngõ ngách, tín hiệu mạng chập chờn.",
    incidentCount: 4,
    safetyAdvice: "Bật tính năng chia sẻ vị trí trực tiếp cho Phụ huynh.",
  },
];

export const OFFLINE_FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: "fa-1",
    title: "Sơ cứu Đuối nước",
    category: "drowning",
    urgencyLevel: "CRITICAL",
    summary: "Nhanh chóng đưa nạn nhân lên bờ, kiểm tra hô hấp và hà hơi thổi nạt ép tim ngay lập tức.",
    steps: [
      "1. Gọi 115 hoặc hô hoán người xung quanh hỗ trợ.",
      "2. Đưa nạn nhân lên chỗ khô ráo, thoáng khí.",
      "3. Kiểm tra xem nạn nhân còn thở không bằng cách áp tai vào mũi/miệng.",
      "4. Nếu ngừng thở: Tiến hành hô hấp nhân tạo (Hà hơi thổi nạt 2 lần) kết hợp Ép tim ngoài lồng ngực (30 lần ép - 2 lần thổi).",
      "5. Giữ ấm cơ thể nạn nhân bằng chăn khô trong lúc chờ xe cấp cứu."
    ],
    doList: [
      "Hà hơi thổi nạt và ép tim liên tục không gián đoạn",
      "Đặt nạn nhân nằm nghiêng an toàn nếu nôn mửa",
      "Giữ ấm cơ thể"
    ],
    dontList: [
      "KHÔNG vác nạn nhân chạy dốc ngược (làm trễ thời gian vàng cấp cứu)",
      "KHÔNG ép bụng móc nước ra",
      "KHÔNG cởi hết quần áo để nạn nhân bị nhiễm lạnh"
    ],
    speechScript: "Sơ cứu đuối nước khẩn cấp: Đặt nạn nhân nằm ngửa chỗ khô ráo. Kiểm tra nhịp thở. Nếu ngừng thở, thực hiện ép tim 30 lần và hà hơi thổi nạt 2 lần liên tục. Gọi 115 ngay!",
    iconName: "Waves"
  },
  {
    id: "fa-2",
    title: "Sơ cứu Hồi sức Tim Phổi (CPR)",
    category: "cpr",
    urgencyLevel: "CRITICAL",
    summary: "Kỹ thuật ép tim liên tục 100-120 lần/phút ở chính giữa lồng ngực để duy trì sự sống.",
    steps: [
      "1. Đặt nạn nhân nằm ngửa trên bề mặt cứng.",
      "2. Quỳ bên cạnh ngực nạn nhân, đặt gót một bàn tay vào chính giữa nửa dưới xương ức, bàn tay kia đan vào trên.",
      "3. Duỗi thẳng tay, dùng trọng lượng thân trên ép xuống sâu 5-6cm.",
      "4. Tốc độ ép: 100 - 120 lần / phút (theo nhịp bài hát Stayin' Alive).",
      "5. Cứ 30 lần ép tim thì thổi nạt 2 lần nếu đã được huấn luyện."
    ],
    doList: [
      "Ép nhanh, mạnh và dứt khoát",
      "Cho lồng ngực nở lại hoàn toàn sau mỗi lần ép",
      "Gọi 115 mở loa ngoài"
    ],
    dontList: [
      "KHÔNG ngừng ép tim quá 10 giây",
      "KHÔNG ép lệch sang vùng mỏm tim hoặc xương sườn"
    ],
    speechScript: "Thực hiện CPR khẩn cấp: Đặt gót bàn tay vào chính giữa ngực. Ép sâu 5 cm với tốc độ 100 đến 120 lần một phút. Mở loa ngoài gọi 115!",
    iconName: "HeartPulse"
  },
  {
    id: "fa-3",
    title: "Sơ cứu Té ngã & Nghi Gãy Xương",
    category: "fracture",
    urgencyLevel: "HIGH",
    summary: "Cố định vị trí gãy bằng nẹp/vật cứng, tuyệt đối không nắn chỉnh xương bị cong gập.",
    steps: [
      "1. Giữ nạn nhân nằm yên, tránh di chuyển vùng nghi gãy xương.",
      "2. Dùng nẹp cứng (thước gỗ, bìa carton dày) đặt dọc theo vùng chi gãy.",
      "3. Dùng dải vải buộc cố định trên và dưới vị trí gãy.",
      "4. Chườm lạnh nhẹ bọc qua khăn (không đặt đá trực tiếp lên da) để giảm sưng.",
      "5. Đưa nạn nhân đến cơ sở y tế gần nhất."
    ],
    doList: [
      "Cố định cả 2 khớp trên và dưới vị trí gãy",
      "Chườm đá qua lớp khăn dầy",
      "Giữ nguyên tư thế gãy"
    ],
    dontList: [
      "KHÔNG cố gắng nắn bẻ xương thẳng lại",
      "KHÔNG xoa dầu nóng vào vùng nghi gãy xương",
      "KHÔNG bắt nạn nhân tự đứng dậy bước đi"
    ],
    speechScript: "Sơ cứu gãy xương: Tuyệt đối không nắn chỉnh xương. Dùng thước hoặc vật cứng chèn cố định 2 đầu vị trí gãy và gọi người hỗ trợ.",
    iconName: "Bone"
  },
  {
    id: "fa-4",
    title: "Sơ cứu Rắn Cắn & Côn Trùng Độc",
    category: "snakebite",
    urgencyLevel: "CRITICAL",
    summary: "Băng ép bất động vết cắn, giữ vùng bị cắn thấp hơn tim, không rạch hút độc.",
    steps: [
      "1. Trấn an nạn nhân, giữ nạn nhân nằm yên tuyệt đối (vận động làm độc tố lan nhanh).",
      "2. Tháo bỏ trang sức, đồng hồ ở chân/tay bị cắn trước khi bị sưng nề.",
      "3. Băng ép nhẹ nhàng từ phía dưới vết cắn lên trên bằng băng vải.",
      "4. Bất động chi bị cắn bằng nẹp như gãy xương.",
      "5. Chụp lại hình ảnh con rắn (nếu an toàn) để bác sĩ dùng huyết thanh kháng độc phù hợp."
    ],
    doList: [
      "Bất động hoàn toàn chi bị cắn",
      "Rửa vết thương bằng nước sạch",
      "Đưa đến bệnh viện cấp cứu gấp"
    ],
    dontList: [
      "KHÔNG rạch vết thương hút nọc độc",
      "KHÔNG garo quá chặt gây hoại tử",
      "KHÔNG đắp lá cây vô căn cứ lên vết cắn"
    ],
    speechScript: "Sơ cứu rắn cắn: Cho nạn nhân nằm yên, không di chuyển. Băng ép nhẹ từ dưới vết cắn lên trên, giữ vết cắn thấp hơn tim và gọi 115 ngay lập tức.",
    iconName: "Biohazard"
  },
  {
    id: "fa-5",
    title: "Sơ cứu Bỏng Lửa / Hóa Chất / Nước Sôi",
    category: "burn",
    urgencyLevel: "HIGH",
    summary: "Xả nước mát sạch chảy nhẹ lên vết bỏng 15-20 phút, không bôi kem đánh răng.",
    steps: [
      "1. Cách ly nạn nhân khỏi nguồn nhiệt hoặc hóa chất.",
      "2. Xả trực tiếp nước sạch mát (15-25°C) chảy nhẹ lên vùng bỏng liên tục trong 15 - 20 phút.",
      "3. Nhẹ nhàng cởi bỏ quần áo dính nhiệt nếu không bị dính chặt vào vết thương.",
      "4. Che phủ vết bỏng bằng gạc vô trùng hoặc khăn sạch ẩm.",
      "5. Cho nạn nhân uống nhiều nước ấm."
    ],
    doList: [
      "Ngâm/xả nước mát sạch càng sớm càng tốt",
      "Che vết bỏng bằng gạc sạch mát",
      "Đến bệnh viện nếu bỏng rộng"
    ],
    dontList: [
      "KHÔNG bôi kem đánh răng, mỡ trăn, nước mắm lên vết bỏng",
      "KHÔNG chọc vỡ các bọng nước",
      "KHÔNG chườm đá lạnh trực tiếp (gây bỏng lạnh)"
    ],
    speechScript: "Sơ cứu bỏng: Xả nước mát sạch liên tục trong 20 phút lên vùng bỏng. Che vết bỏng bằng gạc sạch. Không bôi kem đánh răng hay dầu mỡ.",
    iconName: "Flame"
  },
  {
    id: "fa-6",
    title: "Sơ cứu Hóc Dị Vật (Thủ thuật Heimlich)",
    category: "choking",
    urgencyLevel: "CRITICAL",
    summary: "Thực hiện vỗ lưng 5 lần và ấn bụng (Heimlich) 5 lần để tống xuất dị vật.",
    steps: [
      "1. Đứng sau lưng nạn nhân, vòng 2 tay qua bụng nạn nhân.",
      "2. Nắm một bàn tay lại, đặt ngón cái ngay phía trên rốn, dưới xương ức.",
      "3. Bàn tay kia ôm lấy nắm tay, giật mạnh theo hướng từ trước ra sau và từ dưới lên trên.",
      "4. Lặp lại 5 lần ấn bụng đến khi dị vật văng ra.",
      "5. Với trẻ nhỏ dưới 1 tuổi: Đặt trẻ nằm sấp trên cánh tay, vỗ lưng 5 lần giữa 2 bả vai."
    ],
    doList: [
      "Hỏi 'Bạn có bị hóc không?' - nếu nạn nhân gật đầu không nói được thì làm Heimlich ngay",
      "Ấn dứt khoát hướng lên trên"
    ],
    dontList: [
      "KHÔNG dùng tay mò mẫm móc dị vật nếu không thấy rõ (sẽ đẩy dị vật sâu hơn)",
      "KHÔNG cho nạn nhân uống nước hay nuốt cơm"
    ],
    speechScript: "Thực hiện thủ thuật Heimlich: Đứng sau lưng, vòng tay qua bụng nạn nhân, đặt nắm tay trên rốn và ấn mạnh theo hướng vào trong và lên trên 5 lần liên tiếp.",
    iconName: "AlertTriangle"
  }
];

export const DEMO_CONTEST_SCENARIOS = [
  {
    id: "demo-fall",
    name: "Tình huống 1: Học sinh bị ngã xe / Té ngã bất tỉnh",
    description: "Mô phỏng gia tốc kế nhận diện lực va đập 4.2G -> Kích hoạt đếm ngược 15s -> Phát âm thanh cảnh báo -> Tự động gửi tọa độ SOS khẩn cấp.",
    actionType: "FALL",
    gForce: 4.5,
  },
  {
    id: "demo-scream",
    name: "Tình huống 2: Phát hiện tiếng kêu cứu 'Cứu tôi với / SOS'",
    description: "Mô phỏng mic thu âm thanh nồng độ dB cao kèm lời nói nguy kịch -> AI Gemini phân tích mức độ nguy cơ 92% -> Bật Còi báo động & Đưa ra kịch bản ứng phó.",
    actionType: "SCREAM",
    transcript: "Cứu tôi với! Có người bị tai nạn té xuống sông gần cầu Nguyễn Văn Cừ!",
  },
  {
    id: "demo-danger-zone",
    name: "Tình huống 3: Đi vào Vùng Nguy Hiểm Đêm Muộn",
    description: "Mô phỏng GPS di chuyển vào tọa độ Vùng Nguy Hiểm lúc 22h30 -> AI phát giọng nói cảnh báo chủ động -> Tự động đề xuất bật Guardian Mode.",
    actionType: "DANGER_ZONE",
    zoneName: "Khu vực Bờ sông Nguyễn Văn Cừ (Tối vắng đêm)",
  },
];
