"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

export default function UserCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      loadUserCertificates(userData.user.id);
    } else {
      setLoading(false);
    }
  }

  async function loadUserCertificates(userId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("certificate_b")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "مكتمل");

    if (!error) setCertificates(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>جاري استحضار إنجازاتك...</p>
        <style jsx>{`
          .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #031c26; color: #47d6ad; font-family: 'Cairo'; }
          .loader { width: 50px; height: 50px; border: 3px solid rgba(71, 214, 173, 0.1); border-top-color: #47d6ad; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="certificates-page">
      {/* الخلفية المتحركة الموحدة */}
      <div className="animated-bg">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <Sidebar />
      
      <div className="main-wrapper">
        <div className="top-nav-area">
          <BackButton />
        </div>

        <div className="content-container">
          <header className="page-header">
            <div className="header-icon">
              <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#47D6AD" strokeWidth="1.5">
                <path d="M22 10L12 5 2 10l10 5 10-5z" />
                <path d="M6 12v5c3.33 3 6.67 3 10 0v-5" />
              </svg>
            </div>
            <div className="header-text">
              <h1 className="main-title">سجل الشهادات الرقمية</h1>
              <p className="sub-title">جميع وثائقك المعتمدة من مجتمع مفكر في مكان واحد</p>
            </div>
          </header>

          {certificates.length === 0 ? (
            <div className="empty-state glass-card">
              <img src="/empty-cert.svg" alt="No data" className="empty-img" style={{opacity: 0.5, width: '150px'}} />
              <h3>لا توجد شهادات مكتملة بعد</h3>
              <p>بمجرد اعتماد شهادتك من قبل الإدارة، ستظهر هنا تلقائياً.</p>
            </div>
          ) : (
            <div className="grid-layout">
              {certificates.map((cert) => (
                <div key={cert.id} className="cert-card glass-card">
                  <div className="cert-status">
                    <span className="badge">مكتمل</span>
                  </div>
                  <div className="cert-info">
                    <span className="course-label">الدورة التدريبية</span>
                    <h2 className="course-title">{cert.course_name || "دورة تخصصية"}</h2>
                  </div>
                  <div className="cert-footer">
                    <a 
                      href={cert.certificate_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-download"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '10px'}}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      تحميل الشهادة PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .certificates-page {
          min-height: 100vh;
          background: #031c26;
          color: #eafff9;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          overflow-x: hidden;
        }

        /* الخلفية السينمائية */
        .animated-bg { position: fixed; inset: 0; z-index: 0; }
        .bg-glow-1 { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(71, 214, 173, 0.05) 0%, transparent 70%); top: -100px; right: -100px; }
        .bg-glow-2 { position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(0, 78, 100, 0.1) 0%, transparent 70%); bottom: -50px; left: -50px; }

        .main-wrapper {
          position: relative;
          z-index: 1;
          margin-right: 280px; /* مسافة للسايد بار */
          padding: 20px 40px;
        }

        .top-nav-area {
          height: 60px;
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }

        .content-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* الرأس */
        .page-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 50px;
          animation: fadeInDown 0.8s ease;
        }
        .header-icon {
          background: rgba(71, 214, 173, 0.1);
          padding: 15px;
          border-radius: 20px;
          border: 1px solid rgba(71, 214, 173, 0.2);
        }
        .main-title { font-size: 38px; font-weight: 900; margin: 0; background: linear-gradient(90deg, #fff, #47d6ad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sub-title { font-size: 18px; color: rgba(234, 255, 249, 0.6); margin-top: 5px; }

        /* البطاقات الزجاجية */
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 30px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* توزيع الشبكة */
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }

        .cert-card {
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 240px;
          position: relative;
          overflow: hidden;
        }
        .cert-card:hover {
          transform: translateY(-10px);
          border-color: rgba(71, 214, 173, 0.4);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .badge {
          background: rgba(71, 214, 173, 0.15);
          color: #47d6ad;
          padding: 6px 15px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid rgba(71, 214, 173, 0.3);
        }

        .course-label { font-size: 12px; color: #47d6ad; text-transform: uppercase; letter-spacing: 1px; }
        .course-title { font-size: 22px; font-weight: 800; margin-top: 8px; line-height: 1.4; }

        .btn-download {
          width: 100%;
          background: #47d6ad;
          color: #031c26;
          text-decoration: none;
          padding: 14px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          transition: 0.3s;
        }
        .btn-download:hover { background: #fff; transform: scale(1.02); }

        .empty-state {
          padding: 80px;
          text-align: center;
          border: 2px dashed rgba(71, 214, 173, 0.2);
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1200px) {
          .main-wrapper { margin-right: 0; padding-top: 100px; }
        }
        @media (max-width: 768px) {
          .main-title { font-size: 28px; }
          .grid-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}