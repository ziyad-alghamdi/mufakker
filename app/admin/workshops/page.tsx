"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";

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
    setLoading(true);
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
      <Sidebar />
      <BackButton />

      <div className="content">
        <header className="header-flex">
          <div className="header-text">
            <h1 className="title">إدارة الورش والدورات</h1>
            <p className="subtitle">تحكم في قائمة الورش والشهادات المتاحة</p>
          </div>
          <button className="add-main-btn" onClick={() => setShowAddModal(true)}>
            <span className="plus">+</span> إضافة ورشة جديدة
          </button>
        </header>

        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="workshops-grid">
            {workshops.length === 0 ? (
              <div className="empty-state">
                <p>لا توجد ورش عمل مضافة حالياً.</p>
              </div>
            ) : (
              workshops.map((w) => (
                <div className="workshop-card" key={w.id}>
                  <div className="card-image">
                    {w.image_url ? (
                      <img src={w.image_url} alt={w.title} />
                    ) : (
                      <div className="no-img">لا توجد صورة</div>
                    )}
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

        {/* --- مودال الإضافة والتعديل --- */}
        {(showAddModal || showEditModal) && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{showAddModal ? "إضافة ورشة جديدة" : "تعديل بيانات الورشة"}</h2>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="عنوان الورشة" 
                  value={showAddModal ? title : editTitle} 
                  onChange={(e) => showAddModal ? setTitle(e.target.value) : setEditTitle(e.target.value)} 
                />
                <textarea 
                  placeholder="وصف الورشة..." 
                  value={showAddModal ? desc : editDesc} 
                  onChange={(e) => showAddModal ? setDesc(e.target.value) : setEditDesc(e.target.value)}
                ></textarea>
                
                <div className="row-inputs">
                  <input 
                    type="date" 
                    value={showAddModal ? date : editDate} 
                    onChange={(e) => showAddModal ? setDate(e.target.value) : setEditDate(e.target.value)} 
                  />
                  <select 
                    value={showAddModal ? certificateType : editCertificateType} 
                    onChange={(e) => showAddModal ? setCertificateType(e.target.value) : setEditCertificateType(e.target.value)}
                  >
                    <option value="">نوع الشهادة</option>
                    <option value="دورة">دورة</option>
                    <option value="ورشة عمل">ورشة عمل</option>
                    <option value="فعالية">فعالية</option>
                  </select>
                </div>

                <div className="file-section">
                  <div className="file-field">
                    <label>الصورة التعريفية</label>
                    <input type="file" onChange={(e) => showAddModal ? setFile(e.target.files?.[0] || null) : setEditFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="file-field">
                    <label>قالب الشهادة (PDF)</label>
                    <input type="file" onChange={(e) => showAddModal ? setCertificateTemplate(e.target.files?.[0] || null) : setEditCertificateTemplate(e.target.files?.[0] || null)} />
                  </div>
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
        .admin-page {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #0b2a41 0%, #004e64 100%);
          color: #eafff9;
          font-family: "Cairo", sans-serif;
          direction: rtl;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 30px;
          margin-right: 280px;
        }

        /* Header */
        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 50px;
          gap: 20px;
        }

        .title {
          font-size: 36px;
          font-weight: 900;
          color: #47d6ad;
          margin: 0;
        }

        .subtitle {
          font-size: 18px;
          opacity: 0.8;
          margin-top: 5px;
        }

        .add-main-btn {
          background: #47d6ad;
          color: #0b2a41;
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }

        .add-main-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(71, 214, 173, 0.3);
        }

        /* Workshops Grid */
        .workshops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
        }

        .workshop-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(71, 214, 173, 0.2);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .workshop-card:hover {
          transform: translateY(-10px);
          border-color: #47d6ad;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .card-image {
          position: relative;
          height: 180px;
          background: #081d2d;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-img {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.3;
        }

        .card-date {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(11, 42, 65, 0.8);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .card-body {
          padding: 20px;
        }

        .type-tag {
          font-size: 11px;
          background: rgba(71, 214, 173, 0.1);
          color: #47d6ad;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 700;
        }

        .card-body h3 {
          margin: 15px 0 10px;
          font-size: 20px;
          color: #fff;
        }

        .card-body p {
          font-size: 14px;
          color: rgba(234, 255, 249, 0.7);
          line-height: 1.6;
          height: 44px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .card-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }

        .edit-btn {
          flex: 2;
          background: rgba(71, 214, 173, 0.1);
          border: 1px solid rgba(71, 214, 173, 0.3);
          color: #47d6ad;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }

        .edit-btn:hover {
          background: #47d6ad;
          color: #0b2a41;
        }

        .delete-btn {
          flex: 1;
          background: rgba(255, 71, 71, 0.1);
          color: #ff4747;
          border: 1px solid rgba(255, 71, 71, 0.2);
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
        }

        .delete-btn:hover {
          background: #ff4747;
          color: #fff;
        }

        /* Modal Design */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .modal-content {
          background: #0b2a41;
          border: 2px solid #47d6ad;
          width: 100%;
          max-width: 550px;
          border-radius: 25px;
          padding: 35px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .modal-content h2 {
          color: #47d6ad;
          text-align: center;
          margin-bottom: 25px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .row-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        input, textarea, select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(71, 214, 173, 0.2);
          padding: 12px;
          border-radius: 12px;
          color: #fff;
          font-family: inherit;
        }

        input:focus {
          outline: none;
          border-color: #47d6ad;
        }

        .file-section {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 15px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .file-field label {
          display: block;
          font-size: 13px;
          margin-bottom: 5px;
          color: #47d6ad;
        }

        .modal-btns {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-confirm {
          background: #47d6ad;
          color: #0b2a41;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          font-size: 16px;
        }

        .btn-cancel {
          background: transparent;
          color: #ff4747;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }

        /* Loader */
        .loader-container {
          text-align: center;
          padding: 100px 0;
        }

        .loader {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(71, 214, 173, 0.1);
          border-top-color: #47d6ad;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 992px) {
          .content { margin-right: 0; padding: 40px 20px; }
          .header-flex { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}