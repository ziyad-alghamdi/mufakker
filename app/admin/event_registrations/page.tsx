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

  // ✅ تحميل البيانات مباشرة من جدول event_registrations
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
    setLoading(false);
  }

async function approve(id: number) {
  // 1) جلب بيانات التسجيل
  const { data: regData, error: regError } = await supabase
    .from("event_registrations")
    .select("id, full_name_ar, event_id")
    .eq("id", id)
    .single();

  if (regError || !regData) {
    alert("خطأ في جلب بيانات التسجيل");
    return;
  }

  // 2) تحديث الحالة إلى approved
  await supabase
    .from("event_registrations")
    .update({ status: "approved" })
    .eq("id", id);

  // 3) طلب إنشاء الشهادة
  const res = await fetch("/api/generate-certificate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      registration_id: regData.id,
      event_id: regData.event_id,
      user_name: regData.full_name_ar, // ← الاسم الصحيح
    }),
  });

  const response = await res.json();

  if (response.error) {
    alert("تم قبول الطلب لكن حدث خطأ أثناء إنشاء الشهادة");
    console.log(response.error);
  }

  loadRegistrations(); // تحميل البيانات بعد التعديل
}


  async function reject(id: number) {
    await supabase.from("event_registrations").update({ status: "rejected" }).eq("id", id);
    loadRegistrations();
  }

  return (
    <div className="page">
      <AdminSidebar />

      <div className="content">
        <h1 className="title">طلبات التسجيل في الفعاليات</h1>

        {loading ? (
          <p>جاري التحميل...</p>
        ) : registrations.length === 0 ? (
          <p>لا يوجد طلبات.</p>
        ) : (
          <div className="list">
            {registrations.map((r) => (
              <div className="card" key={r.id}>
                {/* 🟦 بيانات الفعالية */}
                <h3>📌 الفعالية: {r.events?.title || "—"}</h3>
                <p>📅 التاريخ: {r.events?.date || "—"}</p>

                <hr />

                {/* 🟩 بيانات الشخص */}
                <p>👤 الاسم: {r.full_name_ar || "—"}</p>
                <p>📧 الإيميل: {r.email || "—"}</p>
                <p>📱 الجوال: {r.phone || "—"}</p>
                <p>🏫 الجامعة: {r.university || "—"}</p>

                <hr />

                <p>
                  🕒 تاريخ الطلب:{" "}
                  {new Date(r.created_at).toLocaleString("ar-SA")}
                </p>

                {/* 🟧 أزرار التحكم */}
                {r.status === "pending" ? (
                  <div className="actions">
                    <button className="approve" onClick={() => approve(r.id)}>
                      ✔ قبول
                    </button>
                    <button className="reject" onClick={() => reject(r.id)}>
                      ✖ رفض
                    </button>
                  </div>
                ) : r.status === "approved" ? (
                  <p className="approved">✔ تم القبول</p>
                ) : (
                  <p className="rejected">✖ تم الرفض</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page {
          display: flex;
          direction: rtl;
        }
        .content {
          margin-right: 270px;
          padding: 40px;
          width: 100%;
          font-family: "Cairo";
        }
        .title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 20px;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .card {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 14px;
          backdrop-filter: blur(12px);
        }
        .actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }
        .approve {
          background: #00ff88;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 700;
        }
        .reject {
          background: #ff4d4d;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 700;
          color: white;
        }
        .approved {
          color: #00ff88;
          font-weight: 800;
        }
        .rejected {
          color: #ff4d4d;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
