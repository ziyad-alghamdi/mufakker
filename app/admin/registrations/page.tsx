"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminSidebar from "../../components/Sidebar";

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        *,
        workshops:workshops (
          title,
          date
        )
      `)
      .order("created_at", { ascending: false });

    if (error) console.log(error);

    setRegistrations(data || []);
    setTimeout(() => setLoading(false), 800);
  }

  async function approve(id: number) {
    const { data: regData, error: regError } = await supabase
      .from("registrations")
      .select("id, full_name_ar, workshop_id")
      .eq("id", id)
      .single();

    if (regError || !regData) {
      alert("خطأ في جلب بيانات التسجيل");
      return;
    }

    // تحديث الحالة
    await supabase
      .from("registrations")
      .update({ status: "approved" })
      .eq("id", id);

    // مناداة API الإيميل
    await fetch("/API/send-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registration_id: id }),
    });

    loadRegistrations();
  }

  async function reject(id: number) {
    await supabase.from("registrations").update({ status: "rejected" }).eq("id", id);
    loadRegistrations();
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <style jsx>{`
        .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; background: #031c26; }
        .loader { width: 50px; height: 50px; border: 3px solid rgba(71, 214, 173, 0.1); border-top-color: #47D6AD; border-radius: 50%; animation: spin 1s ease-in-out infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="animated-bg">
        <div className="bg-glow"></div>
      </div>

      <AdminSidebar />

      <div className="content">
        <header className="header-section">
          <span className="subtitle">إدارة الحضور</span>
          <h1 className="title">طلبات ورش العمل</h1>
          <div className="title-underline"></div>
        </header>

        <div className="registrations-list">
          {registrations.length === 0 ? (
            <div className="glass-card empty-msg">لا توجد طلبات تسجيل حالياً.</div>
          ) : (
            registrations.map((r) => (
              <div className="glass-card reg-card" key={r.id}>
                <div className="reg-header">
                  <div className="workshop-info">
                    <span className="label">📋 ورشة العمل</span>
                    <h3>{r.workshops?.title || "—"}</h3>
                    <span className="date-tag">📅 {r.workshops?.date || "—"}</span>
                  </div>
                  <div className={`status-badge ${r.status}`}>
                    {r.status === "pending" ? "قيد المراجعة" : r.status === "approved" ? "تم القبول" : "تم الرفض"}
                  </div>
                </div>

                <div className="divider"></div>

                <div className="user-grid">
                  <div className="info-box">
                    <label>الاسم الكامل</label>
                    <p>{r.full_name_ar || "—"}</p>
                  </div>
                  <div className="info-box">
                    <label>البريد الإلكتروني</label>
                    <p>{r.email || "—"}</p>
                  </div>
                  <div className="info-box">
                    <label>رقم الجوال</label>
                    <p className="en">{r.phone || "—"}</p>
                  </div>
                  <div className="info-box">
                    <label>الجامعة / الجهة</label>
                    <p>{r.university || "—"}</p>
                  </div>
                </div>

                <div className="reg-footer">
                  <span className="timestamp">
                    سُجل في: {new Date(r.created_at).toLocaleString("ar-SA")}
                  </span>
                  
                  {r.status === "pending" ? (
                    <div className="action-btns">
                      <button className="btn-approve" onClick={() => approve(r.id)}>✔ قبول واعتماد</button>
                      <button className="btn-reject" onClick={() => reject(r.id)}>✖ رفض</button>
                    </div>
                  ) : (
                    <span className="final-status">تمت معالجة الطلب بنجاح</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-page { min-height: 100vh; background: #031c26; color: #fff; font-family: 'Cairo', sans-serif; direction: rtl; }
        .animated-bg { position: fixed; inset: 0; z-index: 0; }
        .bg-glow { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 5% 5%, rgba(71, 214, 173, 0.05) 0%, transparent 50%); }
        
        .content { position: relative; z-index: 1; margin-right: 280px; padding: 60px 40px; }
        
        .header-section { margin-bottom: 50px; }
        .subtitle { color: #47d6ad; font-size: 14px; font-weight: 700; letter-spacing: 1px; }
        .title { font-size: 42px; font-weight: 900; margin: 10px 0; background: linear-gradient(to left, #fff, #47d6ad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .title-underline { width: 50px; height: 4px; background: #47d6ad; border-radius: 2px; }

        .registrations-list { display: flex; flex-direction: column; gap: 20px; }
        
        .glass-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.07); backdrop-filter: blur(15px); border-radius: 24px; padding: 25px; transition: 0.3s; }
        .reg-card:hover { border-color: rgba(71, 214, 173, 0.2); transform: scale(1.005); }

        .reg-header { display: flex; justify-content: space-between; align-items: center; }
        .workshop-info h3 { font-size: 22px; margin: 5px 0; color: #47d6ad; }
        .label { font-size: 11px; opacity: 0.6; font-weight: 700; }
        .date-tag { font-size: 13px; opacity: 0.5; }

        .status-badge { padding: 5px 15px; border-radius: 10px; font-size: 12px; font-weight: 700; }
        .status-badge.pending { background: rgba(255, 184, 0, 0.1); color: #ffb800; }
        .status-badge.approved { background: rgba(71, 214, 173, 0.1); color: #47d6ad; }
        .status-badge.rejected { background: rgba(255, 71, 71, 0.1); color: #ff4747; }

        .divider { height: 1px; background: linear-gradient(to left, rgba(255,255,255,0.1), transparent); margin: 20px 0; }

        .user-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .info-box label { display: block; font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px; }
        .info-box p { font-size: 15px; font-weight: 600; margin: 0; }
        .en { font-family: 'Inter', sans-serif; }

        .reg-footer { margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .timestamp { font-size: 12px; color: rgba(255,255,255,0.3); }

        .action-btns { display: flex; gap: 10px; }
        .btn-approve { background: #47d6ad; color: #031c26; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-approve:hover { background: #61ffcf; box-shadow: 0 4px 15px rgba(71, 214, 173, 0.2); }
        .btn-reject { background: transparent; color: #ff4747; border: 1px solid rgba(255, 71, 71, 0.2); padding: 10px 15px; border-radius: 12px; cursor: pointer; }
        .btn-reject:hover { background: rgba(255, 71, 71, 0.05); border-color: #ff4747; }
        
        .final-status { font-size: 13px; color: rgba(255,255,255,0.2); font-style: italic; }

        @media (max-width: 1100px) {
          .user-grid { grid-template-columns: 1fr 1fr; }
          .content { margin-right: 0; padding: 40px 20px; }
        }
      `}</style>
    </div>
  );
}