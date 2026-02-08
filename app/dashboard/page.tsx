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
      </div>
    );
  }

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
            <h1>
              أهلاً،{" "}
              {user.full_name_ar
                ? user.full_name_ar.split(" ")[0]
                : "عضو مفكر"}{" "}
              👋
            </h1>
            <p>إليك نظرة عامة على ملفك الشخصي</p>
          </div>
        </header>

        <div className="grid-layout">
          <section className="glass-card">
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

          <section className="glass-card">
            <h3 className="section-title">قنوات التواصل</h3>
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
          </section>

          <section className="glass-card">
            <h3 className="section-title">المسار الأكاديمي</h3>
            <div className="academic-info">
              <div className="univ-box">
                <span className="icon">🎓</span>
                <p>{user.university}</p>
              </div>
              <div className={`role-tag ${user.role}`}>
                {user.role === "admin"
                  ? "مسؤول النظام"
                  : "عضو مجتمع مفكر"}
              </div>
            </div>
          </section>

          <section className="glass-card wide">
            <div className="card-header-flex">
              <h3 className="section-title">المهارات والخبرات</h3>
              {!isEditingSkills && (
                <button
                  className="btn-edit-icon"
                  onClick={() => setIsEditingSkills(true)}
                >
                  تعديل
                </button>
              )}
            </div>

            {isEditingSkills ? (
              <>
                <textarea
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="اكتب مهاراتك"
                />
                <div className="actions">
                  <button
                    className="btn-save"
                    onClick={handleSaveSkills}
                    disabled={saving}
                  >
                    {saving ? "جاري الحفظ..." : "حفظ"}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setIsEditingSkills(false)}
                  >
                    إلغاء
                  </button>
                </div>
              </>
            ) : (
              <p className="skills-text">
                {user.skills || "لا توجد مهارات مضافة حالياً"}
              </p>
            )}
          </section>
        </div>

        <Footer />
      </main>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap");

        body {
          margin: 0;
        }

        .dashboard-container {
          min-height: 100vh;
          background: #031c26;
          color: #fff;
          font-family: "Cairo", sans-serif;
          display: flex;
          direction: rtl;
        }

        .main-content {
          flex: 1;
          margin-right: 260px;
          padding: 40px;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-welcome h1 {
          font-size: 32px;
          margin: 0;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 32px;
        }

        .wide {
          grid-column: span 2;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(18px);
          border-radius: 22px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-badge {
          color: #47d6ad;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .info-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .highlight {
          font-size: 18px;
          color: #47d6ad;
          font-weight: 700;
        }

        .contact-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .academic-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .role-tag {
          align-self: flex-start;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
        }

        .role-tag.admin {
          background: #47d6ad;
          color: #031c26;
        }

        textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.25);
          border-radius: 14px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
        }

        .btn-save {
          background: #47d6ad;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
        }

        .btn-cancel {
          background: transparent;
          color: #ff6b6b;
          border: none;
        }

        .skills-text {
          font-size: 14px;
          line-height: 1.7;
          opacity: 0.9;
        }

        .toast-notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 700;
          z-index: 999;
        }

        .toast-notification.success {
          background: #47d6ad;
          color: #031c26;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-right: 0;
            padding: 14px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .user-welcome h1 {
            font-size: 20px;
          }

          .grid-layout {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .glass-card {
            padding: 16px;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}
