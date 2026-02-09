"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminSidebar from "../../components/Sidebar";

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // الحالات الخاصة بالإضافة
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [certificateTemplate, setCertificateTemplate] = useState<File | null>(null);
  const [certificateType, setCertificateType] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // الحالات الخاصة بالتعديل
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editCertificateTemplate, setEditCertificateTemplate] = useState<File | null>(null);
  const [editCertificateType, setEditCertificateType] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadWorkshops();
  }, []);

  async function loadWorkshops() {
    const { data } = await supabase
      .from("workshops")
      .select("*")
      .order("id", { ascending: false });

    setWorkshops(data || []);
    setTimeout(() => setLoading(false), 800);
  }

  async function addWorkshop() {
    if (!title.trim() || !desc.trim() || !date.trim()) return;
    let imageUrl = null;
    let certificateUrl = null;

    if (file) {
      const fileName = `workshop-${Date.now()}`;
      const { data: uploadData, error } = await supabase.storage.from("workshops").upload(fileName, file);
      if (!error) imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workshops/${uploadData.path}`;
    }

    if (certificateTemplate) {
      const fileName = `certificate-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("certificates").upload(fileName, certificateTemplate);
      if (!uploadError) certificateUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${uploadData.path}`;
    }

    await supabase.from("workshops").insert([{
      title, description: desc, date, image_url: imageUrl,
      certificate_template_url: certificateUrl, certificate_type: certificateType,
    }]);

    setShowAddModal(false);
    resetForm();
    loadWorkshops();
  }

  function resetForm() {
    setTitle(""); setDesc(""); setDate(""); setFile(null);
    setCertificateTemplate(null); setCertificateType("");
  }

  function openEditModal(w: any) {
    setEditId(w.id); setEditTitle(w.title); setEditDesc(w.description);
    setEditDate(w.date); setEditImageUrl(w.image_url); setEditCertificateType(w.certificate_type || "");
    setEditFile(null); setEditCertificateTemplate(null); setShowEditModal(true);
  }

  async function saveEdit() {
    if (!editId) return;
    let newImageUrl = editImageUrl;
    let newCertUrl = null;

    if (editFile) {
      const fileName = `workshop-${editId}-${Date.now()}`;
      const { data: uploadData, error } = await supabase.storage.from("workshops").upload(fileName, editFile);
      if (!error) newImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workshops/${uploadData.path}`;
    }

    if (editCertificateTemplate) {
      const fileName = `certificate-${editId}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("certificates").upload(fileName, editCertificateTemplate);
      if (!uploadError) newCertUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${uploadData.path}`;
    }

    await supabase.from("workshops").update({
      title: editTitle, description: editDesc, date: editDate,
      image_url: newImageUrl, certificate_template_url: newCertUrl ?? undefined,
      certificate_type: editCertificateType,
    }).eq("id", editId);

    setShowEditModal(false);
    loadWorkshops();
  }

  async function deleteWorkshop(id: number) {
    if (!confirm("هل تريد حذف الورشة؟")) return;
    await supabase.from("workshops").delete().eq("id", id);
    loadWorkshops();
  }

  return (
    <div className="admin-page">
      <div className="animated-bg"><div className="bg-glow"></div></div>
      <AdminSidebar />

      <div className="content">
        <header className="header-flex">
          <div className="header-text">
            <span className="subtitle">لوحة التحكم</span>
            <h1 className="title">إدارة الورش والدورات</h1>
            <div className="title-underline"></div>
          </div>
          <button className="add-main-btn" onClick={() => setShowAddModal(true)}>
            <span className="plus">+</span> إضافة ورشة جديدة
          </button>
        </header>

        {loading ? (
          <div className="loader-container"><div className="loader"></div></div>
        ) : (
          <div className="workshops-grid">
            {workshops.length === 0 ? (
              <p className="empty-state">لا توجد ورش عمل مضافة حالياً.</p>
            ) : (
              workshops.map((w) => (
                <div className="workshop-card" key={w.id}>
                  <div className="card-image">
                    {w.image_url ? <img src={w.image_url} alt={w.title} /> : <div className="no-img">لا توجد صورة</div>}
                    <div className="card-date">📅 {w.date}</div>
                  </div>
                  <div className="card-body">
                    <span className="type-tag">{w.certificate_type || "غير محدد"}</span>
                    <h3>{w.title}</h3>
                    <p>{w.description}</p>
                    <div className="card-actions">
                      <button className="edit-btn" onClick={() => openEditModal(w)}>تعديل</button>
                      <button className="delete-btn" onClick={() => deleteWorkshop(w.id)}>حذف</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- مودال الإضافة والتعديل (نفس التصميم) --- */}
        {(showAddModal || showEditModal) && (
          <div className="modal-overlay">
            <div className="modal-content glass-card">
              <h2>{showAddModal ? "إضافة ورشة جديدة" : "تعديل الورشة"}</h2>
              <div className="input-group">
                <input type="text" placeholder="عنوان الورشة" value={showAddModal ? title : editTitle} onChange={(e) => showAddModal ? setTitle(e.target.value) : setEditTitle(e.target.value)} />
                <textarea placeholder="وصف الورشة..." value={showAddModal ? desc : editDesc} onChange={(e) => showAddModal ? setDesc(e.target.value) : setEditDesc(e.target.value)}></textarea>
                <div className="row">
                  <input type="date" value={showAddModal ? date : editDate} onChange={(e) => showAddModal ? setDate(e.target.value) : setEditDate(e.target.value)} />
                  <select value={showAddModal ? certificateType : editCertificateType} onChange={(e) => showAddModal ? setCertificateType(e.target.value) : setEditCertificateType(e.target.value)}>
                    <option value="">نوع الشهادة</option>
                    <option value="دورة">دورة</option>
                    <option value="ورشة عمل">ورشة عمل</option>
                    <option value="فعالية">فعالية</option>
                  </select>
                </div>
                <div className="file-inputs">
                  <label>الصورة التعريفية: <input type="file" onChange={(e) => showAddModal ? setFile(e.target.files?.[0] || null) : setEditFile(e.target.files?.[0] || null)} /></label>
                  <label>قالب الشهادة (PDF): <input type="file" onChange={(e) => showAddModal ? setCertificateTemplate(e.target.files?.[0] || null) : setEditCertificateTemplate(e.target.files?.[0] || null)} /></label>
                </div>
              </div>
              <div className="modal-btns">
                <button className="btn-confirm" onClick={showAddModal ? addWorkshop : saveEdit}>حفظ البيانات</button>
                <button className="btn-cancel" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-page { min-height: 100vh; background: #031c26; color: #fff; direction: rtl; font-family: 'Cairo', sans-serif; }
        .animated-bg { position: fixed; inset: 0; z-index: 0; }
        .bg-glow { position: absolute; top: -10%; right: -10%; width: 50%; height: 50%; background: radial-gradient(circle, rgba(71, 214, 173, 0.08) 0%, transparent 70%); }
        
        .content { position: relative; z-index: 1; margin-right: 280px; padding: 60px 40px; }
        
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 50px; }
        .subtitle { color: #47d6ad; font-size: 14px; font-weight: 700; }
        .title { font-size: 38px; font-weight: 900; margin: 5px 0; background: linear-gradient(to left, #fff, #47d6ad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .title-underline { width: 50px; height: 4px; background: #47d6ad; border-radius: 2px; }

        .add-main-btn { background: #47d6ad; color: #031c26; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 10px; }
        .add-main-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(71, 214, 173, 0.2); }
        .plus { font-size: 20px; }

        .workshops-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        
        .workshop-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; transition: 0.3s; }
        .workshop-card:hover { transform: translateY(-10px); border-color: #47d6ad; }

        .card-image { position: relative; height: 180px; }
        .card-image img { width: 100%; height: 100%; object-fit: cover; }
        .no-img { width: 100%; height: 100%; background: #0b2a41; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.2); }
        .card-date { position: absolute; bottom: 15px; right: 15px; background: rgba(3, 28, 38, 0.8); backdrop-filter: blur(5px); padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }

        .card-body { padding: 20px; }
        .type-tag { font-size: 10px; background: rgba(71, 214, 173, 0.15); color: #47d6ad; padding: 3px 10px; border-radius: 20px; font-weight: 700; text-transform: uppercase; }
        .card-body h3 { margin: 12px 0 8px; font-size: 20px; color: #fff; }
        .card-body p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; height: 45px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

        .card-actions { margin-top: 20px; display: flex; gap: 10px; }
        .edit-btn { flex: 2; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 12px; cursor: pointer; transition: 0.2s; }
        .edit-btn:hover { background: #47d6ad; color: #031c26; }
        .delete-btn { flex: 1; background: rgba(255, 71, 71, 0.1); color: #ff4747; border: none; padding: 10px; border-radius: 12px; cursor: pointer; }
        .delete-btn:hover { background: #ff4747; color: #fff; }

        .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; padding: 20px; }
        .modal-content { width: 100%; max-width: 500px; padding: 40px; background: #0b2a41; border: 1px solid rgba(71, 214, 173, 0.2); border-radius: 30px; }
        .modal-content h2 { margin-bottom: 25px; color: #47d6ad; text-align: center; }
        
        .input-group { display: flex; flex-direction: column; gap: 15px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        input, textarea, select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px 15px; border-radius: 12px; color: #fff; font-family: inherit; }
        input:focus { border-color: #47d6ad; outline: none; }
        .file-inputs { font-size: 12px; color: rgba(255,255,255,0.4); display: flex; flex-direction: column; gap: 10px; }
        
        .modal-btns { margin-top: 30px; display: flex; flex-direction: column; gap: 10px; }
        .btn-confirm { background: #47d6ad; color: #031c26; border: none; padding: 15px; border-radius: 12px; font-weight: 800; cursor: pointer; }
        .btn-cancel { background: transparent; color: rgba(255,255,255,0.5); border: none; cursor: pointer; padding: 10px; }

        .loader-container { height: 300px; display: flex; align-items: center; justify-content: center; }
        .loader { width: 40px; height: 40px; border: 3px solid rgba(71, 214, 173, 0.1); border-top-color: #47d6ad; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}