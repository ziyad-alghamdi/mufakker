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
    } catch (err: any) {
      showNotification("error", "حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p className="loading-text">جاري تحضير ملفك الشخصي...</p>

      <style jsx>{`
        .loading-screen {
          height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #031c26;
          font-family: 'Cairo', sans-serif;
        }
        .loader {
          position: relative;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(45deg, transparent, transparent 40%, #47D6AD);
          animation: animate 2s linear infinite;
        }
        @keyframes animate {
          0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
          100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
        }
        .loader:before {
          content: '';
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          bottom: 6px;
          background: #031c26;
          border-radius: 50%;
          z-index: 1000;
        }
        .loader:after {
          content: '';
          position: absolute;
          inset: 0px;
          background: linear-gradient(45deg, transparent, transparent 40%, #47D6AD);
          border-radius: 50%;
          z-index: 1;
          filter: blur(30px);
        }
        .loading-text {
          margin-top: 30px;
          color: #47D6AD;
          font-weight: 700;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="glow-bg"></div>

      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <main className="main-content">
        <header className="page-header">
          <BackButton />
          <div className="user-welcome">
            <h1>أهلاً، {user.full_name_ar ? user.full_name_ar.split(' ')[0] : 'عضو مفكر'} 👋</h1>
            <p>إليك نظرة عامة على ملفك الشخصي</p>
          </div>
        </header>

        <div className="grid-layout">
          {/* بطاقة المعلومات الأساسية */}
          <section className="glass-card profile-main">
            <div className="card-badge">المعلومات الأساسية</div>
            <div className="info-group">
              <div className="data-box">
                <label>الاسم بالعربية</label>
                <p className="highlight">{user.full_name_ar}</p>
              </div>
              <div className="data-box">
                <label>Name in English</label>
                <p className="highlight">{user.full_name_en}</p>
              </div>
            </div>
          </section>

          {/* بطاقة التواصل */}
          <section className="glass-card">
            <h3 className="section-title">قنوات التواصل</h3>
            <div className="contact-list">
              <div className="contact-item">
                <span className="icon">📱</span>
                <div>
                  <label>رقم الجوال</label>
                  <p>{user.phone || "—"}</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">✉️</span>
                <div>
                  <label>البريد الإلكتروني</label>
                  <p>{user.email}</p>
                </div>
              </div>
            </div>
          </section>

          {/* بطاقة الجامعة */}
          <section className="glass-card">
            <h3 className="section-title">المسار الأكاديمي</h3>
            <div className="academic-info">
              <div className="univ-box">
                <span className="icon">🎓</span>
                <p>{user.university}</p>
              </div>
              <div className={`role-tag ${user.role}`}>
                {user.role === "admin" ? "مسؤول النظام" : "عضو مجتمع مفكر"}
              </div>
            </div>
          </section>

          {/* بطاقة المهارات */}
          <section className="glass-card skills-section wide">
            <div className="card-header-flex">
              <h3 className="section-title">المهارات والخبرات</h3>
              {!isEditingSkills && (
                <button className="btn-edit-icon" onClick={() => setIsEditingSkills(true)}>
                  تعديل
                </button>
              )}
            </div>

            {isEditingSkills ? (
              <div className="edit-area">
                <textarea
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="اكتب مهاراتك (مثلاً: تصميم واجهات، برمجة React...)"
                />
                <div className="actions">
                  <button className="btn-save" onClick={handleSaveSkills} disabled={saving}>
                    {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                  <button className="btn-cancel" onClick={() => setIsEditingSkills(false)}>إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="skills-display">
                {user.skills ? (
                  <p className="skills-text">{user.skills}</p>
                ) : (
                  <p className="empty-state">لا توجد مهارات مضافة حالياً..</p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="footer-wrapper">
          <Footer />
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .dashboard-container {
          min-height: 100vh;
          width: 100%;
          background: #031c26;
          color: #fff;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          position: relative;
          display: flex;
        }

        .glow-bg {
          position: fixed;
          top: 0; right: 0;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(71, 214, 173, 0.08) 0%, transparent 70%);
          z-index: 1;
        }

        .main-content {
          flex: 1;
          margin-right: 260px;
          padding: 40px;
          position: relative;
          z-index: 5;
        }

        .user-welcome h1 { font-size: 32px; font-weight: 800; margin: 15px 0 5px; }
        .user-welcome p { color: rgba(255,255,255,0.5); }

        .grid-layout {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
          margin-top: 40px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 30px;
          transition: 0.3s;
        }

        .glass-card:hover { border-color: rgba(71, 214, 173, 0.3); transform: translateY(-5px); }
        .wide { grid-column: span 2; }

        .card-badge {
          background: rgba(71, 214, 173, 0.1);
          color: #47D6AD;
          display: inline-block;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .info-group { display: flex; gap: 40px; }
        .data-box label { display: block; color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 5px; }
        .highlight { font-size: 22px; font-weight: 700; color: #47D6AD; }

        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #fff; }

        .contact-item { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .contact-item .icon { font-size: 24px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px; }
        .contact-item p { font-weight: 600; color: #e0e0e0; }

        .academic-info { display: flex; justify-content: space-between; align-items: center; }
        .univ-box { display: flex; align-items: center; gap: 10px; font-weight: 600; }
        .role-tag { padding: 6px 15px; border-radius: 10px; font-size: 13px; font-weight: 700; }
        .role-tag.user { background: rgba(255,255,255,0.1); color: #fff; }
        .role-tag.admin { background: #47D6AD; color: #031c26; }

        .card-header-flex { display: flex; justify-content: space-between; align-items: center; }
        .btn-edit-icon { background: rgba(71, 214, 173, 0.1); border: none; color: #47D6AD; padding: 8px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; }

        textarea {
          width: 100%; height: 120px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 15px; color: #fff; font-family: inherit;
          resize: none; outline: none; margin-bottom: 15px;
        }
        textarea:focus { border-color: #47D6AD; }

        .actions { display: flex; gap: 10px; }
        .btn-save { background: #47D6AD; border: none; padding: 10px 25px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .btn-cancel { background: transparent; color: #ff5252; border: none; cursor: pointer; }

        .skills-text { line-height: 1.8; color: rgba(255,255,255,0.8); }

        .toast-notification {
          position: fixed; top: 30px; left: 30px; z-index: 1000;
          padding: 15px 30px; border-radius: 12px; backdrop-filter: blur(10px);
          font-weight: 700; animation: slideIn 0.3s ease;
        }
        .toast-notification.success { background: rgba(71, 214, 173, 0.9); color: #031c26; }

        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        @media (max-width: 1024px) {
          .main-content { margin-right: 0; padding: 20px; }
          .grid-layout { grid-template-columns: 1fr; }
          .wide { grid-column: auto; }
          .info-group { flex-direction: column; gap: 20px; }
        }

        .footer-wrapper {
          margin-top: 120px;
          padding-top: 40px;
        }
      `}</style>
    </div>
  );
}