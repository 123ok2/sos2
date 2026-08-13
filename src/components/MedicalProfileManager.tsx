import React, { useState } from "react";
import {
  Users,
  User,
  Heart,
  Plus,
  Trash2,
  PhoneCall,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Edit2,
  Save,
  Mail,
  MapPin,
  Send,
  Radio,
  AlertCircle,
} from "lucide-react";
import { UserProfile, EmergencyContact } from "../types";

interface MedicalProfileManagerProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const MedicalProfileManager: React.FC<MedicalProfileManagerProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedGuardianCode, setCopiedGuardianCode] = useState(false);

  // New Contact Form
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactRel, setNewContactRel] = useState("");

  const handleSaveProfile = () => {
    onUpdateProfile(profile);
    setIsEditing(false);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    const newContact: EmergencyContact = {
      id: `cnt-${Date.now()}`,
      name: newContactName,
      phone: newContactPhone,
      email: newContactEmail || undefined,
      relationship: newContactRel || "Người thân",
      isPrimary: profile.emergencyContacts.length === 0,
      notifySMS: true,
      notifyCall: true,
      notifyEmail: !!newContactEmail,
    };

    const updated = {
      ...profile,
      emergencyContacts: [...profile.emergencyContacts, newContact],
    };

    setProfile(updated);
    onUpdateProfile(updated);
    setShowAddContact(false);
    setNewContactName("");
    setNewContactPhone("");
    setNewContactEmail("");
    setNewContactRel("");
  };

  const handleDeleteContact = (id: string) => {
    const updatedContacts = profile.emergencyContacts.filter((c) => c.id !== id);
    const updated = { ...profile, emergencyContacts: updatedContacts };
    setProfile(updated);
    onUpdateProfile(updated);
  };

  const handleCopyGuardianCode = () => {
    navigator.clipboard.writeText(profile.guardianCode);
    setCopiedGuardianCode(true);
    setTimeout(() => setCopiedGuardianCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Hồ Sơ Y Tế & Thiết Lập Cứu Hộ Tự Động</h2>
          <p className="text-slate-400 text-xs mt-1">
            Thông tin y tế khẩn cấp và địa chỉ / liên hệ nhận bản tin tự động khi cảm biến điện thoại phát hiện va chạm.
          </p>
        </div>

        <button
          onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isEditing
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span>{isEditing ? "Lưu Thay Đổi" : "Chỉnh Sửa Hồ Sơ"}</span>
        </button>
      </div>

      {/* Target Recipient Config Banner for Collision Auto Alerts */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 p-6 rounded-2xl border border-red-500/40 space-y-4">
        <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm">
          <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          <span>ĐỊA CHỈ & LIÊN HỆ MẶC ĐỊNH NHẬN CẢNH BÁO VA CHẠM TỰ ĐỘNG</span>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">
          Khi cảm biến gia tốc điện thoại nhận diện lực va chạm bất thường (hoặc té ngã), hệ thống sẽ tự động gửi bản tin tọa độ GPS khẩn cấp đến địa chỉ và liên hệ dưới đây:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Tên người nhận chính:</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.primaryRecipientName || ""}
                onChange={(e) => setProfile({ ...profile, primaryRecipientName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                placeholder="Ví dụ: Bố (Trần Văn Bình)"
              />
            ) : (
              <p className="text-amber-300 font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {profile.primaryRecipientName || "Chưa thiết lập"}
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Số điện thoại nhận tin SMS/Gọi:</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.primaryRecipientPhone || ""}
                onChange={(e) => setProfile({ ...profile, primaryRecipientPhone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                placeholder="0908123456"
              />
            ) : (
              <p className="text-white font-mono font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {profile.primaryRecipientPhone || "Chưa thiết lập"}
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Email nhận cảnh báo cấp cứu:</label>
            {isEditing ? (
              <input
                type="email"
                value={profile.primaryRecipientEmail || ""}
                onChange={(e) => setProfile({ ...profile, primaryRecipientEmail: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                placeholder="parent@gmail.com"
              />
            ) : (
              <p className="text-slate-200 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.primaryRecipientEmail || "Chưa thiết lập email"}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Địa chỉ nhà / Điểm tiếp nhận cứu hộ:</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.primaryRecipientAddress || ""}
                onChange={(e) => setProfile({ ...profile, primaryRecipientAddress: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                placeholder="Địa chỉ nhà phụ huynh..."
              />
            ) : (
              <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{profile.primaryRecipientAddress || "Chưa nhập địa chỉ"}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: User Medical Card */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-white text-base">Thẻ Thông Tin Y Tế Khẩn Cấp</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Họ và tên học sinh / người dùng:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              ) : (
                <p className="text-white font-bold text-sm bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {profile.name || "Chưa nhập tên người dùng (Nhấn Chỉnh sửa để cập nhật)"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Tuổi:</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                ) : (
                  <p className="text-white font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {profile.age} tuổi
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Nhóm máu:</label>
                {isEditing ? (
                  <select
                    value={profile.bloodType}
                    onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                  </select>
                ) : (
                  <p className="text-red-400 font-extrabold bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    Nhóm máu {profile.bloodType}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Dị ứng thuốc / thức ăn:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              ) : (
                <p className="text-amber-300 font-medium bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {profile.allergies || "Không có"}
                </p>
              )}
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Bệnh lý nền / Lưu ý y tế:</label>
              {isEditing ? (
                <textarea
                  value={profile.medicalConditions}
                  onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white h-20"
                />
              ) : (
                <p className="text-slate-300 font-medium bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {profile.medicalConditions || "Không có"}
                </p>
              )}
            </div>
          </div>

          {/* Guardian Code Sharing Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Mã Chia Sẻ Vị Trí Phụ Huynh:</span>
              <button
                onClick={handleCopyGuardianCode}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                {copiedGuardianCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGuardianCode ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>
            <p className="text-xl font-mono font-black text-amber-300 text-center tracking-widest bg-slate-900 py-2 rounded-lg border border-amber-500/30">
              {profile.guardianCode}
            </p>
            <p className="text-[11px] text-slate-400 text-center">
              Phụ huynh nhập mã này trên ứng dụng Guardian để theo dõi vị trí live của học sinh.
            </p>
          </div>
        </div>

        {/* Right: Emergency Contacts List */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-white text-base">Danh Sách Liên Hệ Khẩn Cấp Bổ Sung</h3>
            </div>

            <button
              onClick={() => setShowAddContact(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Liên Hệ</span>
            </button>
          </div>

          <div className="space-y-3">
            {profile.emergencyContacts.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-2 text-xs">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-bold">Chưa có liên hệ khẩn cấp nào trong danh bạ</p>
                <p className="text-slate-500 text-[11px]">
                  Nhấn nút "Thêm Liên Hệ" phía trên để thiết lập số điện thoại người thân nhận tin nhắn cảnh báo SOS.
                </p>
              </div>
            ) : (
              profile.emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{contact.name}</span>
                      {contact.isPrimary && (
                        <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                          Chính
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {contact.relationship} • SĐT: <strong className="text-slate-200">{contact.phone}</strong>
                    </p>
                    {contact.email && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-amber-400" />
                        <span>{contact.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition border border-emerald-500/30"
                      title="Gọi ngay"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2.5 bg-slate-800 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded-lg transition border border-slate-700"
                      title="Xóa liên hệ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Thêm Người Thân / Liên Hệ Khẩn Cấp</h3>
            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên người thân:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bố, Mẹ, Anh trai..."
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  placeholder="0901234567..."
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email nhận cảnh báo (nếu có):</label>
                <input
                  type="email"
                  placeholder="nguoithan@gmail.com..."
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mối quan hệ:</label>
                <input
                  type="text"
                  placeholder="Phụ huynh / Giáo viên chủ nhiệm..."
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold"
                >
                  Lưu Liên Hệ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
