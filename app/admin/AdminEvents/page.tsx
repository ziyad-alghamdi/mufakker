"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminSidebar from "../../components/Sidebar";

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // بيانات الفعالية الجديدة
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [certificateTemplate, setCertificateTemplate] = useState<File | null>(null);
  const [certificateType, setCertificateType] = useState("");

  // بيانات التعديل
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editCertificateTemplate, setEditCertificateTemplate] = useState<File | null>(null);
  const [editCertificateType, setEditCertificateType] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("id", { ascending: false });

    setEvents(data || []);
    // محاكاة تحميل بسيطة لتجربة اللودر الأنيق
    setTimeout(() => setLoading(false), 800);
  }

  async function addEvent() {
    if (!title.trim() || !desc.trim() || !date.trim()) return;
    let imageUrl = null;
    let certificateUrl = null;

    if (file) {
      const fileName = `event-${Date.now()}`;
      const { data: uploadData, error } = await supabase.storage
        .from("events")
        .upload(fileName, file);
      if (error) { alert("حدث خطأ أثناء رفع الصورة"); return; }
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/events/${uploadData.path}`;
    }

    if (certificateTemplate) {
      const fileName = `certificate-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, certificateTemplate);
      if (uploadError) { alert("خطأ أثناء رفع قالب الشهادة"); return; }
      certificateUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${uploadData.path}`;
    }

    await supabase.from("events").insert([
      { title, description: desc, date, image_url: imageUrl, certificate_template_url: certificateUrl, certificate_type: certificateType }
    ]);

    setShowAddModal(false);
    loadEvents();
  }

  function openEditModal(event: any) {
    setEditId(event.id);
    setEditTitle(event.title);
    setEditDesc(event.description);
    setEditDate(event.date);
    setEditImageUrl(event.image_url);
    setEditCertificateType(event.certificate_type || "");
    setShowEditModal(true);
  }

  async function saveEdit() {
    if (!editId) return;
    let newImageUrl = editImageUrl;
    let newCertUrl = null;

    if (editFile) {
      const fileName = `event-${editId}-${Date.now()}`;
      const { data: uploadData, error } = await supabase.storage
        .from("events")
        .upload(fileName, editFile);
      if (error) { alert("خطأ أثناء رفع الصورة الجديدة"); return; }
      newImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/events/${uploadData.path}`;
    }

    if (editCertificateTemplate) {
      const fileName = `certificate-${editId}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, editCertificateTemplate);
      if (uploadError) { alert("خطأ أثناء رفع قالب الشهادة"); return; }
      newCertUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${uploadData.path}`;
    }

    await supabase.from("events").update({
      title: editTitle, description: editDesc, date: editDate, image_url: newImageUrl,
      certificate_template_url: newCertUrl ?? undefined, certificate_type: editCertificateType,
    }).eq("id", editId);

    setShowEditModal(false);
    loadEvents();
  }

  async function deleteEvent(id: number) {
    if (!confirm("هل تريد حذف الفعالية؟")) return;
    await supabase.from("events").delete().eq("id", id);
    loadEvents();
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p className="loading-text">جاري تحميل لوحة التحكم...</p>
      <style jsx>{`
        .loading-screen { height: 100vh; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #031c26; font-family: 'Cairo', sans-serif; }
        .loader { position: relative; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(45deg, transparent, transparent 40%, #47D6AD); animation: animate 2s linear infinite; }
        @keyframes animate { 0% { transform: rotate(0deg); filter: hue-rotate(0deg); } 100% { transform: rotate(360deg); filter: hue-rotate(360deg); } }
        .loader:before { content: ''; position: absolute; top: 6px; left: 6px; right: 6px; bottom: 6px; background: #031c26; border-radius: 50%; z-index: 1000; }
        .loading-text { margin-top: 30px; color: #47D6AD; font-weight: 700; }
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
          <span className="subtitle">لوحة التحكم</span>
          <h1 className="title">إدارة الفعاليات</h1>
          <div className="title-underline"></div>
        </header>

        <button className="add-btn-main" onClick={() => setShowAddModal(true)}>
          <span className="plus-icon">+</span> إضافة فعالية جديدة
        </button>

        <div className="events-grid">
          {events.length === 0 ? (
            <p className="no-data">لا توجد فعاليات مسجلة حالياً.</p>
          ) : (
            events.map((e) => (
              <div className="event-card glass-card" key={e.id}>
                {e.image_url && <img src={e.image_url} className="event-thumb" alt="event" />}
                <div className="card-info">
                  <h3>{e.title}</h3>
                  <p className="event-desc-text">{e.description}</p>
                  <div className="card-meta">
                    <span className="meta-item">📅 {e.date}</span>
                    {e.certificate_type && <span className="meta-item badge">🎖 {e.certificate_type}</span>}
                  </div>
                </div>
                <div className="card-footer-actions">
                  <button className="btn-edit" onClick={() => openEditModal(e)}>تعديل</button>
                  <button className="btn-delete" onClick={() => deleteEvent(e.id)}>حذف</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* مودال الإضافة / التعديل بنفس ستايل الكروت الزجاجية */}
        {(showAddModal || showEditModal) && (
          <div className="modal-backdrop">
            <div className="modal-glass">
              <h2>{showAddModal ? "إضافة فعالية جديدة" : "تعديل الفعالية"}</h2>
              <div className="form-group">
                <input type="text" placeholder="عنوان الفعالية" value={showAddModal ? title : editTitle} onChange={(e) => showAddModal ? setTitle(e.target.value) : setEditTitle(e.target.value)} />
                <textarea placeholder="وصف الفعالية" value={showAddModal ? desc : editDesc} onChange={(e) => showAddModal ? setDesc(e.target.value) : setEditDesc(e.target.value)}></textarea>
                <input type="date" value={showAddModal ? date : editDate} onChange={(e) => showAddModal ? setDate(e.target.value) : setEditDate(e.target.value)} />
                
                <div className="file-input-wrapper">
                    <label>{showAddModal ? "صورة الفعالية" : "تغيير الصورة"}</label>
                    <input type="file" accept="image/*" onChange={(e) => showAddModal ? setFile(e.target.files?.[0] || null) : setEditFile(e.target.files?.[0] || null)} />
                </div>

                <select value={showAddModal ? certificateType : editCertificateType} onChange={(e) => showAddModal ? setCertificateType(e.target.value) : setEditCertificateType(e.target.value)}>
                  <option value="">اختر نوع الشهادة</option>
                  <option value="دورة">دورة</option>
                  <option value="ورشة عمل">ورشة عمل</option>
                  <option value="مشاركة وإنجاز">مشاركة وإنجاز</option>
                  <option value="فعالية">فعالية</option>
                  <option value="تنظيم">تنظيم</option>
                </select>

                <div className="file-input-wrapper">
                    <label>قالب الشهادة (PDF)</label>
                    <input type="file" accept="application/pdf" onChange={(e) => showAddModal ? setCertificateTemplate(e.target.files?.[0] || null) : setEditCertificateTemplate(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="modal-buttons">
                <button className="btn-confirm" onClick={showAddModal ? addEvent : saveEdit}>
                    {showAddModal ? "إضافة الفعالية" : "حفظ التعديلات"}
                </button>
                <button className="btn-cancel" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
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

        .content { position: relative; z-index: 1; max-width: 1200px; margin: 0 280px 0 0; padding: 60px 40px; }
        
        .header-section { margin-bottom: 40px; }
        .subtitle { color: #47d6ad; font-weight: 700; font-size: 14px; letter-spacing: 2px; display: block; }
        .title { font-size: 48px; font-weight: 900; margin: 10px 0; background: linear-gradient(90deg, #fff, #47d6ad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .title-underline { width: 60px; height: 5px; background: #47d6ad; border-radius: 10px; }

        .add-btn-main { background: #47d6ad; color: #031c26; border: none; padding: 15px 30px; border-radius: 15px; font-weight: 800; cursor: pointer; transition: 0.3s; margin-bottom: 40px; font-size: 16px; box-shadow: 0 10px 20px rgba(71, 214, 173, 0.2); }
        .add-btn-main:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(71, 214, 173, 0.4); }

        .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; transition: 0.4s; }
        .glass-card:hover { transform: translateY(-10px); border-color: rgba(71, 214, 173, 0.4); }

        .event-thumb { width: 100%; height: 180px; object-fit: cover; }
        .card-info { padding: 25px; }
        .card-info h3 { font-size: 22px; color: #fff; margin-bottom: 10px; }
        .event-desc-text { color: rgba(234, 255, 249, 0.7); font-size: 15px; line-height: 1.6; height: 4.8em; overflow: hidden; }
        
        .card-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
        .meta-item { background: rgba(71, 214, 173, 0.1); color: #47d6ad; padding: 5px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; }
        .badge { background: rgba(255, 255, 255, 0.1); color: #fff; }

        .card-footer-actions { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid rgba(255,255,255,0.05); }
        .card-footer-actions button { border: none; padding: 15px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-edit { background: transparent; color: #47d6ad; }
        .btn-edit:hover { background: rgba(71, 214, 173, 0.1); }
        .btn-delete { background: transparent; color: #ff5e5e; }
        .btn-delete:hover { background: rgba(255, 94, 94, 0.1); }

        /* Modal Style */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .modal-glass { background: #0b2a41; border: 1px solid rgba(71, 214, 173, 0.3); border-radius: 30px; width: 100%; max-width: 500px; padding: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        .modal-glass h2 { margin-bottom: 25px; font-weight: 800; color: #47d6ad; text-align: center; }
        
        input, textarea, select { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; color: #fff; margin-bottom: 15px; font-family: 'Cairo'; }
        input:focus { outline: none; border-color: #47d6ad; background: rgba(255,255,255,0.08); }
        
        .file-input-wrapper { margin-bottom: 15px; }
        .file-input-wrapper label { font-size: 13px; color: #47d6ad; display: block; margin-bottom: 5px; font-weight: 600; }
        
        .modal-buttons { display: flex; gap: 15px; margin-top: 10px; }
        .btn-confirm { flex: 2; background: #47d6ad; color: #031c26; border: none; padding: 15px; border-radius: 12px; font-weight: 800; cursor: pointer; }
        .btn-cancel { flex: 1; background: rgba(255,255,255,0.05); color: #fff; border: none; padding: 15px; border-radius: 12px; cursor: pointer; }

        @media (max-width: 1024px) { .content { margin-right: 0; padding-top: 100px; } }
      `}</style>
    </div>
  );
}