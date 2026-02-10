"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminSidebar from "../../components/Sidebar";

export default function AdminEventRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("event_registrations")
      .select(`
        *,
        events:events (
          title,
          date
        )
      `)
      .order("created_at", { ascending: false });

    if (error) console.log(error);

    setRegistrations(data || []);
    // محاكاة لودر أنيق
    setTimeout(() => setLoading(false), 1000);
  }

  async function approve(id: number) {
    const { data: regData, error: regError } = await supabase
      .from("event_registrations")
      .select("id, full_name_ar, event_id")
      .eq("id", id)
      .single();

    if (regError || !regData) {
      alert("خطأ في جلب بيانات التسجيل");
      return;
    }

    await supabase
      .from("event_registrations")
      .update({ status: "approved" })
      .eq("id", id);

    const res = await fetch("/api/generate-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registration_id: regData.id,
        event_id: regData.event_id,
        user_name: regData.full_name_ar,
      }),
    });

    const response = await res.json();
    if (response.error) {
      alert("تم قبول الطلب لكن حدث خطأ أثناء إنشاء الشهادة");
    }

    loadRegistrations();
  }

  async function reject(id: number) {
    await supabase.from("event_registrations").update({ status: "rejected" }).eq("id", id);
    loadRegistrations();
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p className="loading-text">جاري جلب الطلبات...</p>
      <style jsx>{`
        .loading-screen { height: 100vh; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #031c26; font-family: 'Cairo', sans-serif; }
        .loader { position: relative; width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(45deg, transparent, transparent 40%, #47D6AD); animation: animate 2s linear infinite; }
        @keyframes animate { 0% { transform: rotate(0deg); filter: hue-rotate(0deg); } 100% { transform: rotate(360deg); filter: hue-rotate(360deg); } }
        .loader:before { content: ''; position: absolute; top: 6px; left: 6px; right: 6px; bottom: 6px; background: #031c26; border-radius: 50%; z-index: 1000; }
        .loading-text { margin-top: 25px; color: #47D6AD; font-weight: 700; }
      `}</style>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="animated-bg">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="bg-glow-1"></div>
      </div>

      <AdminSidebar />

      <div className="content">
        <header className="header-section">
          <span className="subtitle">إدارة التسجيل</span>
          <h1 className="title">طلبات الفعاليات</h1>
          <div className="title-underline"></div>
        </header>

        <div className="registrations-list">
          {registrations.length === 0 ? (
            <div className="glass-card empty-msg">لا توجد طلبات تسجيل حالياً.</div>
          ) : (
            registrations.map((r) => (
              <div className="glass-card reg-card" key={r.id}>
                <div className="reg-header">
                  <div className="event-info">
                    <span className="label">📌 الفعالية</span>
                    <h3>{r.events?.title || "—"}</h3>
                    <span className="date-tag">📅 {r.events?.date || "—"}</span>
                  </div>
                  <div className={`status-badge ${r.status}`}>
                    {r.status === "pending" ? "قيد الانتظار" : r.status === "approved" ? "تم القبول" : "تم الرفض"}
                  </div>
                </div>

                <div className="divider"></div>

                <div className="user-details">
                  <div className="detail-item">
                    <span className="icon">👤</span>
                    <div>
                      <label>الاسم بالكامل</label>
                      <p>{r.full_name_ar || "—"}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="icon">📧</span>
                    <div>
                      <label>البريد الإلكتروني</label>
                      <p>{r.email || "—"}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="icon">📱</span>
                    <div>
                      <label>رقم الجوال</label>
                      <p className="en-font">{r.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="icon">🏫</span>
                    <div>
                      <label>الجهة / الجامعة</label>
                      <p>{r.university || "—"}</p>
                    </div>
                  </div>
                </div>
                {/* الفكرة والمهارات */}
                <div className="divider"></div>

                <div className="extra-details">
                  <div className="extra-item">
                    <label>💡 الفكرة / المقترح</label>
                    <p>{r.idea?.trim() ? r.idea : "لم يتم إدخال فكرة"}</p>
                  </div>

                  <div className="extra-item">
                    <label>🛠️ المهارات المقدمة</label>
                    <p>{r.skills?.trim() ? r.skills : "لم يتم إدخال مهارات"}</p>
                  </div>
                </div>

                <div className="reg-footer">
                  <span className="request-time">
                    🕒 طُلب في: {new Date(r.created_at).toLocaleString("ar-SA", { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  
                  {r.status === "pending" && (
                    <div className="action-buttons">
                      <button className="btn-approve" onClick={() => approve(r.id)}>✔ قبول الطلب</button>
                      <button className="btn-reject" onClick={() => reject(r.id)}>✖ رفض</button>
                    </div>
                  )}
                </div>
              </div>
              
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .admin-page { min-height: 100vh; width: 100%; position: relative; overflow-x: hidden; background: #031c26; color: #eafff9; direction: rtl; font-family: 'Cairo', sans-serif; }
        
        .animated-bg { position: fixed; inset: 0; z-index: 0; background: radial-gradient(circle at center, #0b2a41 0%, #031c26 100%); }
        .particle { position: absolute; background: rgba(71, 214, 173, 0.4); border-radius: 50%; filter: blur(5px); animation: move 20s infinite linear; }
        .p1 { width: 150px; height: 150px; top: 10%; left: 20%; }
        .p2 { width: 250px; height: 250px; bottom: 15%; right: 10%; opacity: 0.2; }
        .bg-glow-1 { position: absolute; width: 800px; height: 800px; background: #47d6ad; top: -200px; right: -200px; filter: blur(140px); opacity: 0.1; }
        @keyframes move { 0% { transform: translate(0, 0); } 50% { transform: translate(50px, 50px); } 100% { transform: translate(0, 0); } }

        .content { position: relative; z-index: 1; max-width: 1100px; margin: 0 280px 0 0; padding: 60px 40px; }
        
        .header-section { margin-bottom: 40px; }
        .subtitle { color: #47d6ad; font-weight: 700; font-size: 14px; letter-spacing: 2px; display: block; }
        .title { font-size: 48px; font-weight: 900; margin: 10px 0; background: linear-gradient(90deg, #fff, #47d6ad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .title-underline { width: 60px; height: 5px; background: #47d6ad; border-radius: 10px; }

        .registrations-list { display: flex; flex-direction: column; gap: 25px; }
        
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; padding: 30px; transition: 0.3s; }
        .reg-card:hover { border-color: rgba(71, 214, 173, 0.3); transform: translateX(-5px); }

        .reg-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .event-info h3 { font-size: 24px; color: #fff; margin: 5px 0; }
        .label { font-size: 12px; color: #47d6ad; font-weight: 700; text-transform: uppercase; }
        .date-tag { font-size: 14px; color: rgba(255,255,255,0.6); }

        .status-badge { padding: 6px 16px; border-radius: 12px; font-size: 14px; font-weight: 700; }
        .status-badge.pending { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
        .status-badge.approved { background: rgba(71, 214, 173, 0.1); color: #47d6ad; }
        .status-badge.rejected { background: rgba(255, 94, 94, 0.1); color: #ff5e5e; }

        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 25px 0; }

        .user-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .detail-item { display: flex; gap: 15px; align-items: center; }
        .detail-item .icon { font-size: 24px; opacity: 0.8; }
        .detail-item label { display: block; font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
        .detail-item p { font-weight: 600; color: #eafff9; margin: 0; }
        .en-font { font-family: sans-serif; }

        .reg-footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px dashed rgba(255,255,255,0.1); }
        .request-time { font-size: 13px; color: rgba(255,255,255,0.3); }

        .action-buttons { display: flex; gap: 12px; }
        .btn-approve { background: #47d6ad; color: #031c26; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .btn-approve:hover { background: #5fffcb; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(71, 214, 173, 0.3); }
        
        .btn-reject { background: transparent; color: #ff5e5e; border: 1px solid rgba(255, 94, 94, 0.3); padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-reject:hover { background: rgba(255, 94, 94, 0.1); border-color: #ff5e5e; }

        .empty-msg { text-align: center; padding: 50px; color: rgba(255,255,255,0.4); font-size: 18px; }
.extra-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.extra-item {
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 18px 20px;
}

.extra-item label {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #47d6ad;
  margin-bottom: 8px;
}

.extra-item p {
  margin: 0;
  font-size: 15px;
  line-height: 1.9;
  color: rgba(234,255,249,0.9);
  white-space: pre-wrap;
}

        @media (max-width: 1024px) {
          .content { margin-right: 0; padding-top: 100px; }
          .reg-header { flex-direction: column; gap: 15px; }
          .reg-footer { flex-direction: column; gap: 20px; align-items: flex-start; }
          .action-buttons { width: 100%; }
          .action-buttons button { flex: 1; }
        }
      `}</style>
    </div>
  );
}