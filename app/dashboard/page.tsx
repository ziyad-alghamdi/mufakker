"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import Footer from "../components/FooterBar";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: row } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setUser(row);
      setSkillsInput(row?.skills || "");
      setLoading(false);
    }

    loadUser();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveSkills = async () => {
    setSaving(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) return;

      const { error } = await supabase
        .from("users")
        .update({ skills: skillsInput })
        .eq("id", authData.user.id);

      if (error) throw error;

      setUser({ ...user, skills: skillsInput });
      setIsEditingSkills(false);
      showNotification("success", "تم تحديث مهاراتك بنجاح ✨");
    } catch {
      showNotification("error", "حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p className="loading-text">جاري تحضير ملفك الشخصي...</p>
        <style jsx>{`
          .loading-screen { height: 100vh; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #031c26; font-family: 'Cairo', sans-serif; }
          .loader { position: relative; width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(45deg, transparent, transparent 40%, #47D6AD); animation: animate 2s linear infinite; }
          @keyframes animate { 0% { transform: rotate(0deg); filter: hue-rotate(0deg); } 100% { transform: rotate(360deg); filter: hue-rotate(360deg); } }
          .loader:before { content: ''; position: absolute; top: 6px; left: 6px; right: 6px; bottom: 6px; background: #031c26; border-radius: 50%; z-index: 1000; }
          .loader:after { content: ''; position: absolute; inset: 0px; background: linear-gradient(45deg, transparent, transparent 40%, #47D6AD); border-radius: 50%; z-index: 1; filter: blur(30px); }
          .loading-text { margin-top: 30px; color: #47D6AD; font-weight: 700; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* طبقات الخلفية الديناميكية - نفس صفحة من نحن */}
      <div className="animated-bg">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <Sidebar />
      <BackButton />

      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="content">
        <header className="header-section">
          <span className="subtitle">لوحة التحكم</span>
          <h1 className="title">
             أهلاً، {user.full_name_ar ? user.full_name_ar.split(" ")[0] : "عضو مفكر"}
          </h1>
          <div className="title-underline"></div>
        </header>

        <p className="desc">إليك نظرة عامة على ملفك الشخصي الأكاديمي والمهني داخل مجتمع مفكر.</p>

        <div className="cards-container">
          {/* بطاقة المعلومات الأساسية */}
          <div className="card glass-card">
            <div className="card-icon">👤</div>
            <h3>المعلومات الأساسية</h3>
            <div className="info-group">
              <div className="data-box">
                <label>الاسم بالعربية</label>
                <p className="highlight-text">{user.full_name_ar}</p>
              </div>
              <div className="data-box">
                <label>Name in English</label>
                <p className="highlight-text">{user.full_name_en}</p>
              </div>
            </div>
          </div>

          {/* بطاقة التواصل */}
          <div className="card glass-card">
            <div className="card-icon">📞</div>
            <h3>قنوات التواصل</h3>
            <div className="info-group">
               <div className="contact-row"><span>📱</span> {user.phone || "—"}</div>
               <div className="contact-row"><span>✉️</span> {user.email}</div>
            </div>
          </div>

          {/* بطاقة المسار الأكاديمي */}
          <div className="card glass-card">
            <div className="card-icon">🎓</div>
            <h3>المسار الأكاديمي</h3>
            <p className="univ-name">{user.university}</p>
            <div className={`role-tag ${user.role}`}>
                {user.role === "admin" ? "مسؤول النظام" : "عضو مجتمع مفكر"}
            </div>
          </div>

          {/* بطاقة المهارات - عريضة */}
          <div className="card glass-card wide-card">
            <div className="card-header-flex">
              <div className="title-with-icon">
                <span className="card-icon-small">💎</span>
                <h3>المهارات والخبرات</h3>
              </div>
              {!isEditingSkills && (
                <button className="btn-edit" onClick={() => setIsEditingSkills(true)}>تعديل</button>
              )}
            </div>

            {isEditingSkills ? (
              <div className="edit-mode">
                <textarea
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="اكتب مهاراتك هنا..."
                />
                <div className="actions">
                  <button className="btn-save" onClick={handleSaveSkills} disabled={saving}>
                    {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                  <button className="btn-cancel" onClick={() => setIsEditingSkills(false)}>إلغاء</button>
                </div>
              </div>
            ) : (
              <p className="skills-display">
                {user.skills || "لا توجد مهارات مضافة حالياً. اضغط على تعديل لإضافة مهاراتك."}
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .dashboard-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow-x: hidden;
          background: #031c26;
          color: #eafff9;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
        }

        /* --- الخلفية المتحركة (نفس صفحة من نحن) --- */
        .animated-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; background: radial-gradient(circle at center, #0b2a41 0%, #031c26 100%); }
        .particle { position: absolute; background: rgba(71, 214, 173, 0.4); border-radius: 50%; filter: blur(5px); animation: moveParticles 20s infinite linear; }
        .p1 { width: 150px; height: 150px; top: 10%; left: 20%; animation-duration: 25s; }
        .p2 { width: 250px; height: 250px; bottom: 15%; right: 10%; animation-duration: 35s; opacity: 0.2; }
        .p3 { width: 100px; height: 100px; top: 50%; left: 50%; animation-duration: 20s; opacity: 0.3; }
        @keyframes moveParticles { 0% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(100px, -50px) rotate(180deg); } 100% { transform: translate(0, 0) rotate(360deg); } }
        .bg-glow-1, .bg-glow-2 { position: absolute; width: 800px; height: 800px; border-radius: 50%; filter: blur(140px); opacity: 0.2; }
        .bg-glow-1 { background: #47d6ad; top: -200px; right: -200px; animation: pulseGlow 10s infinite alternate; }
        .bg-glow-2 { background: #004e64; bottom: -200px; left: -200px; animation: pulseGlow 12s infinite alternate-reverse; }
        @keyframes pulseGlow { 0% { opacity: 0.1; transform: scale(1); } 100% { opacity: 0.3; transform: scale(1.2); } }

        /* --- محتوى الصفحة --- */
        .content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto 0 280px; /* مساحة للسايدبار */
          padding: 80px 40px;
        }

        .header-section { margin-bottom: 50px; }
        .subtitle { color: #47d6ad; font-weight: 700; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 10px; }
        .title { font-size: 50px; font-weight: 900; margin: 0; background: linear-gradient(90deg, #fff, #e4e4e4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .title-underline { width: 80px; height: 6px; background: #47d6ad; border-radius: 10px; margin-top: 15px; }
        .desc { font-size: 20px; color: rgba(234, 255, 249, 0.7); margin-bottom: 60px; }

        /* --- البطاقات --- */
        .cards-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 40px;
          transition: all 0.4s ease;
        }
        .glass-card:hover { transform: translateY(-10px); border-color: rgba(71, 214, 173, 0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .wide-card { grid-column: 1 / -1; }
        
        .card-icon { font-size: 40px; margin-bottom: 20px; display: block; }
        .glass-card h3 { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 20px; }

        .info-group label { display: block; font-size: 12px; color: #47d6ad; margin-bottom: 5px; font-weight: 700; }
        .highlight-text { font-size: 18px; font-weight: 600; color: #eafff9; margin-bottom: 15px; }
        
        .contact-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: rgba(234, 255, 249, 0.8); }
        .univ-name { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
        
        .role-tag {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          background: rgba(71, 214, 173, 0.1);
          color: #47d6ad;
          border: 1px solid rgba(71, 214, 173, 0.2);
        }

        /* --- قسم المهارات والتعديل --- */
        .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .btn-edit { background: transparent; border: 1px solid #47d6ad; color: #47d6ad; padding: 6px 20px; border-radius: 10px; cursor: pointer; transition: 0.3s; font-weight: 600; }
        .btn-edit:hover { background: #47d6ad; color: #031c26; }

        textarea {
          width: 100%;
          min-height: 120px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 15px;
          color: #fff;
          font-family: 'Cairo', sans-serif;
          margin-bottom: 15px;
        }

        .actions { display: flex; gap: 15px; }
        .btn-save { background: #47d6ad; color: #031c26; border: none; padding: 10px 25px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .btn-cancel { background: transparent; color: #ff6b6b; border: none; cursor: pointer; }

        .skills-display { line-height: 1.8; color: rgba(234, 255, 249, 0.7); }

        .toast-notification {
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          padding: 15px 30px;
          border-radius: 15px;
          font-weight: 700;
          backdrop-filter: blur(10px);
          animation: slideIn 0.3s ease;
        }
        .toast-notification.success { background: rgba(71, 214, 173, 0.9); color: #031c26; }
        @keyframes slideIn { from { top: -50px; opacity: 0; } to { top: 30px; opacity: 1; } }

        /* --- التجاوب مع الجوال --- */
        @media (max-width: 1200px) {
          .content { margin-left: 0; padding-top: 120px; }
        }
        @media (max-width: 768px) {
          .title { font-size: 32px; }
          .content { padding: 80px 20px; }
          .glass-card { padding: 25px; }
        }
      `}</style>
    </div>
  );
}