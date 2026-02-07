"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminSidebar from "../../components/Sidebar";

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // إضافة ورشة
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [certificateTemplate, setCertificateTemplate] = useState<File | null>(null);

  // 🔥 جديد
  const [certificateType, setCertificateType] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  // تعديل ورشة
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editCertificateTemplate, setEditCertificateTemplate] = useState<File | null>(null);

  // 🔥 جديد
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
    setLoading(false);
  }

  // ---------------------- إضافة ورشة ----------------------
  async function addWorkshop() {
    if (!title.trim() || !desc.trim() || !date.trim()) return;

    let imageUrl = null;
    let certificateUrl = null;

    if (file) {
      const fileName = `workshop-${Date.now()}`;
      const { data: uploadData, error } = await supabase.storage
        .from("workshops")
        .upload(fileName, file);

      if (error) {
        alert("حدث خطأ أثناء رفع الصورة");
        return;
      }

      imageUrl =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workshops/${uploadData.path}`;
    }

    if (certificateTemplate) {
      const fileName = `certificate-${Date.now()}.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, certificateTemplate);

      if (uploadError) {
        alert("خطأ أثناء رفع قالب الشهادة");
        return;
      }

      certificateUrl =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${uploadData.path}`;
    }

    await supabase.from("workshops").insert([
      {
        title,
        description: desc,
        date,
        image_url: imageUrl,
        certificate_template_url: certificateUrl,
        certificate_type: certificateType, // 🔥 تمت الإضافة هنا
      }
    ]);

    setShowAddModal(false);
    setTitle("");
    setDesc("");
    setDate("");
    setFile(null);
    setCertificateTemplate(null);
    setCertificateType("");

    loadWorkshops();
  }

  // ---------------------- فتح مودال التعديل ----------------------
  function openEditModal(w: any) {
    setEditId(w.id);
    setEditTitle(w.title);
    setEditDesc(w.description);
    setEditDate(w.date);
    setEditImageUrl(w.image_url);

    // 🔥 جديد
    setEditCertificateType(w.certificate_type || "");

    setEditFile(null);
    setEditCertificateTemplate(null);
    setShowEditModal(true);
  }

  // ---------------------- حفظ التعديل ----------------------
  async function saveEdit() {
    if (!editId) return;

    let newImageUrl = editImageUrl;
    let newCertUrl = null;

    if (editFile) {
      const fileName = `workshop-${editId}-${Date.now()}`;
      const { data: uploadData, error } = await supabase.storage
        .from("workshops")
        .upload(fileName, editFile);

      if (error) {
        alert("خطأ أثناء رفع الصورة الجديدة");
        return;
      }

      newImageUrl =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workshops/${uploadData.path}`;
    }

    if (editCertificateTemplate) {
      const fileName = `certificate-${editId}-${Date.now()}.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, editCertificateTemplate);

      if (uploadError) {
        alert("خطأ أثناء رفع قالب الشهادة");
        return;
      }

      newCertUrl =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${uploadData.path}`;
    }

    await supabase
      .from("workshops")
      .update({
        title: editTitle,
        description: editDesc,
        date: editDate,
        image_url: newImageUrl,
        certificate_template_url: newCertUrl ?? undefined,

        certificate_type: editCertificateType, // 🔥 تمت الإضافة هنا
      })
      .eq("id", editId);

    setShowEditModal(false);
    loadWorkshops();
  }

  // ---------------------- حذف ورشة ----------------------
  async function deleteWorkshop(id: number) {
    if (!confirm("هل تريد حذف الورشة؟")) return;
    await supabase.from("workshops").delete().eq("id", id);
    loadWorkshops();
  }

  return (
    <div className="page">
      <AdminSidebar />

      <div className="content">
        <h1 className="title">إدارة الورش والدورات</h1>

        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + إضافة ورشة جديدة
        </button>

        {/* عرض الورش */}
        <div className="list">
          {loading ? (
            <p>جاري التحميل...</p>
          ) : workshops.length === 0 ? (
            <p style={{ marginTop: 20 }}>لا توجد ورش حتى الآن.</p>
          ) : (
            workshops.map((w) => (
              <div className="card" key={w.id}>
                {w.image_url && (
                  <img src={w.image_url} className="thumb" alt="workshop" />
                )}

                <h3>{w.title}</h3>
                <p>{w.description}</p>
                <span className="date">📅 {w.date}</span>

                {/* 🔥 عرض نوع الشهادة */}
                {w.certificate_type && (
                  <p style={{ marginTop: 10, fontWeight: "bold" }}>
                    🎖 نوع الشهادة: {w.certificate_type}
                  </p>
                )}

                <div className="card-actions">
                  <button className="edit" onClick={() => openEditModal(w)}>تعديل</button>
                  <button className="delete" onClick={() => deleteWorkshop(w.id)}>حذف</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ------------------ مودال إضافة ------------------ */}
        {showAddModal && (
          <div className="modal-bg">
            <div className="modal">
              <h2>إضافة ورشة جديدة</h2>

              <input type="text" placeholder="عنوان الورشة"
                value={title} onChange={(e) => setTitle(e.target.value)} />

              <textarea placeholder="وصف الورشة"
                value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>

              <input type="date" value={date}
                onChange={(e) => setDate(e.target.value)} />

              <label>صورة الورشة:</label>
              <input type="file" accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)} />

              {/* 🔥 إضافة نوع الشهادة */}
              <label>نوع الشهادة:</label>
              <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
                <option value="">اختر نوع الشهادة</option>
                <option value="دورة">دورة</option>
                <option value="ورشة عمل">ورشة عمل</option>
                <option value="مشاركة وإنجاز">مشاركة وإنجاز</option>
                <option value="فعالية">فعالية</option>
                <option value="تنظيم">تنظيم</option>
              </select>

              <label>قالب الشهادة (PDF):</label>
              <input type="file" accept="application/pdf"
                onChange={(e) => setCertificateTemplate(e.target.files?.[0] || null)} />

              <div className="modal-actions">
                <button onClick={addWorkshop}>إضافة</button>
                <button className="cancel" onClick={() => setShowAddModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------ مودال التعديل ------------------ */}
        {showEditModal && (
          <div className="modal-bg">
            <div className="modal">
              <h2>تعديل ورشة</h2>

              <input type="text" value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)} />

              <textarea value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}></textarea>

              <input type="date" value={editDate}
                onChange={(e) => setEditDate(e.target.value)} />

              {editImageUrl && (
                <img src={editImageUrl} className="thumb" alt="current"
                  style={{ marginBottom: 10 }} />
              )}

              <label>تغيير الصورة:</label>
              <input type="file" accept="image/*"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)} />

              {/* 🔥 اختيار نوع الشهادة أثناء التعديل */}
              <label>نوع الشهادة:</label>
              <select value={editCertificateType}
                onChange={(e) => setEditCertificateType(e.target.value)}>
                <option value="">اختر نوع الشهادة</option>
                <option value="دورة">دورة</option>
                <option value="ورشة عمل">ورشة عمل</option>
                <option value="مشاركة وإنجاز">مشاركة وإنجاز</option>
                <option value="فعالية">فعالية</option>
                <option value="تنظيم">تنظيم</option>
              </select>

              <label>قالب الشهادة الجديد (PDF):</label>
              <input type="file" accept="application/pdf"
                onChange={(e) => setEditCertificateTemplate(e.target.files?.[0] || null)} />

              <div className="modal-actions">
                <button onClick={saveEdit}>حفظ</button>
                <button className="cancel" onClick={() => setShowEditModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

      </div>
   
      <style jsx>{`
  .page {
    display: flex;
    direction: rtl;
    background: #004E64;
    min-height: 100vh;
  }

  .content {
    margin-right: 270px;
    padding: 50px;
    width: 100%;
    font-family: "Cairo";
    color: #E8FFFA;
  }

  .title {
    font-size: 34px;
    font-weight: 900;
    margin-bottom: 25px;
    color: #9FFFCB;
    text-shadow: 0 0 10px #25A18E77;
  }

  /* زر إضافة ورشة */
  .add-btn {
    background: #7AE582;
    padding: 14px 26px;
    border-radius: 12px;
    font-weight: 800;
    color: #003B29;
    transition: .25s;
    box-shadow: 0 0 10px #7AE58277;
  }

  .add-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 18px #7AE582;
  }

  .list {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  /* بطاقة الورشة */
  .card {
    background: #003B49aa;
    padding: 22px;
    border-radius: 16px;
    border: 1px solid #25A18E55;
    backdrop-filter: blur(14px);
    transition: .25s ease;
    box-shadow: 0 0 15px #25A18E33;
  }

  .card:hover {
    transform: translateY(-5px);
    background: #003B49dd;
    box-shadow: 0 0 22px #25A18E66;
  }

  .thumb {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 12px;
    border: 2px solid #00A5CF55;
    box-shadow: 0 0 12px #00A5CF44;
  }

  h3 {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 6px;
    color: #9FFFCB;
  }

  p {
    font-size: 15px;
    opacity: 0.9;
    color: #E8FFFA;
  }

  /* تاريخ الورشة */
  .date {
    margin-top: 12px;
    display: inline-block;
    padding: 6px 14px;
    background: #25A18Eaa;
    border-radius: 10px;
    color: #FFFFFF;
    font-weight: 700;
  }

  /* أزرار التعديل والحذف */
  .card-actions {
    margin-top: 15px;
    display: flex;
    gap: 12px;
  }

  .edit {
    background: #00A5CF;
    padding: 10px 16px;
    border-radius: 10px;
    font-weight: 700;
    color: white;
    box-shadow: 0 0 10px #00A5CF55;
    transition: .25s;
  }

  .edit:hover {
    background: #008EB2;
    transform: translateY(-3px);
    box-shadow: 0 0 15px #00A5CFaa;
  }

  .delete {
    background: #E63946;
    padding: 10px 16px;
    border-radius: 10px;
    font-weight: 700;
    color: white;
    transition: .25s;
    box-shadow: 0 0 10px #E6394666;
  }

  .delete:hover {
    background: #C12735;
    transform: translateY(-3px);
    box-shadow: 0 0 15px #E63946aa;
  }

  /* خلفية المودال */
  .modal-bg {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(8px);
  }

  /* نافذة المودال */
  .modal {
    background: #003B49;
    width: 420px;
    padding: 35px;
    border-radius: 20px;
    border: 1px solid #25A18E55;
    box-shadow: 0 0 30px #25A18E44;
    animation: pop .3s ease;
  }

  @keyframes pop {
    0% { transform: scale(.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  .modal h2 {
    text-align: center;
    color: #9FFFCB;
    font-size: 24px;
    font-weight: 900;
    margin-bottom: 20px;
  }

  input, textarea, select {
    width: 100%;
    padding: 12px;
    background: #002F3D;
    border: 1px solid #25A18E55;
    color: #E9FFFA;
    border-radius: 10px;
    margin-bottom: 12px;
    transition: .25s;
  }

  input:focus, textarea:focus, select:focus {
    border-color: #7AE582;
    box-shadow: 0 0 10px #7AE58266;
  }

  textarea { min-height: 90px; }

  /* أزرار المودال */
  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }

  .modal-actions button {
    flex: 1;
    margin: 0 4px;
    padding: 12px;
    border-radius: 10px;
    font-weight: 800;
    transition: .25s;
  }

  .modal-actions button:first-child {
    background: #7AE582;
    color: #003B29;
    box-shadow: 0 0 10px #7AE58266;
  }

  .modal-actions button:first-child:hover {
    background: #5FD96B;
    transform: translateY(-3px);
  }

  .modal-actions .cancel {
    background: #002F3D;
    color: #9FFFCB;
    border: 1px solid #25A18E55;
  }

  .modal-actions .cancel:hover {
    background: #003B49;
    transform: translateY(-3px);
  }
`}</style>


    </div>
  );
}
