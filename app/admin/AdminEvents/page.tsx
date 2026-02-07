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

  // بيانات التعديل على الفعالية
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editCertificateTemplate, setEditCertificateTemplate] = useState<File | null>(null);
  const [editCertificateType, setEditCertificateType] = useState("");

  // إدارة النافذة الخاصة بإضافة وتعديل الفعاليات
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
    setLoading(false);
  }

  async function addEvent() {
  if (!title.trim() || !desc.trim() || !date.trim()) return;

  let imageUrl = null;
  let certificateUrl = null;

  if (file) {
    const fileName = `event-${Date.now()}`;
    const { data: uploadData, error } = await supabase.storage
      .from("events") // قم بتحديد bucket "events"
      .upload(fileName, file);

    if (error) {
      alert("حدث خطأ أثناء رفع الصورة");
      return;
    }

    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/events/${uploadData.path}`;
  }

  if (certificateTemplate) {
    const fileName = `certificate-${Date.now()}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("certificates") // قم بتحديد bucket الشهادات
      .upload(fileName, certificateTemplate);

    if (uploadError) {
      alert("خطأ أثناء رفع قالب الشهادة");
      return;
    }

    certificateUrl =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${uploadData.path}`;
  }

  await supabase.from("events").insert([
    {
      title,
      description: desc,
      date,
      image_url: imageUrl,
      certificate_template_url: certificateUrl,
      certificate_type: certificateType,
    }
  ]);

  setShowAddModal(false);
  loadEvents();
}


  // دالة فتح نافذة التعديل وتعبئة الحقول بالقيم الحالية
  function openEditModal(event: any) {
    setEditId(event.id);
    setEditTitle(event.title);
    setEditDesc(event.description);
    setEditDate(event.date);
    setEditImageUrl(event.image_url);
    setEditCertificateType(event.certificate_type || "");
    setShowEditModal(true);
  }

  // دالة لحفظ التعديلات على الفعالية
  async function saveEdit() {
    if (!editId) return;

    let newImageUrl = editImageUrl;
    let newCertUrl = null;

    if (editFile) {
      const fileName = `event-${editId}-${Date.now()}`;
      const { data: uploadData, error } = await supabase.storage
        .from("events")
        .upload(fileName, editFile);

      if (error) {
        alert("خطأ أثناء رفع الصورة الجديدة");
        return;
      }

      newImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/events/${uploadData.path}`;
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

      newCertUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${uploadData.path}`;
    }

    await supabase
      .from("events")
      .update({
        title: editTitle,
        description: editDesc,
        date: editDate,
        image_url: newImageUrl,
        certificate_template_url: newCertUrl ?? undefined,
        certificate_type: editCertificateType,
      })
      .eq("id", editId);

    setShowEditModal(false);
    loadEvents();
  }

  // دالة حذف الفعالية
  async function deleteEvent(id: number) {
    if (!confirm("هل تريد حذف الفعالية؟")) return;
    await supabase.from("events").delete().eq("id", id);
    loadEvents();
  }

  return (
    <div className="page">
      <AdminSidebar />

      <div className="content">
        <h1 className="title">إدارة الفعاليات</h1>

        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + إضافة فعالية جديدة
        </button>

        {/* عرض الفعاليات */}
        <div className="list">
          {loading ? (
            <p>جاري التحميل...</p>
          ) : events.length === 0 ? (
            <p style={{ marginTop: 20 }}>لا توجد فعاليات حتى الآن.</p>
          ) : (
            events.map((e) => (
              <div className="card" key={e.id}>
                {e.image_url && (
                  <img src={e.image_url} className="thumb" alt="event" />
                )}
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <span className="date">📅 {e.date}</span>
                {e.certificate_type && (
                  <p style={{ marginTop: 10, fontWeight: "bold" }}>
                    🎖 نوع الشهادة: {e.certificate_type}
                  </p>
                )}
                <div className="card-actions">
                  <button className="edit" onClick={() => openEditModal(e)}>
                    تعديل
                  </button>
                  <button className="delete" onClick={() => deleteEvent(e.id)}>
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* مودال إضافة فعالية */}
        {showAddModal && (
          <div className="modal-bg">
            <div className="modal">
              <h2>إضافة فعالية جديدة</h2>

              <input
                type="text"
                placeholder="عنوان الفعالية"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="وصف الفعالية"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <label>صورة الفعالية:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label>نوع الشهادة:</label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
              >
                <option value="">اختر نوع الشهادة</option>
                <option value="دورة">دورة</option>
                <option value="ورشة عمل">ورشة عمل</option>
                <option value="مشاركة وإنجاز">مشاركة وإنجاز</option>
                <option value="فعالية">فعالية</option>
                <option value="تنظيم">تنظيم</option>
              </select>
              <label>قالب الشهادة (PDF):</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setCertificateTemplate(e.target.files?.[0] || null)}
              />
              <div className="modal-actions">
                <button onClick={addEvent}>إضافة</button>
                <button className="cancel" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* مودال تعديل فعالية */}
        {showEditModal && (
          <div className="modal-bg">
            <div className="modal">
              <h2>تعديل فعالية</h2>

              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              ></textarea>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
              {editImageUrl && (
                <img
                  src={editImageUrl}
                  className="thumb"
                  alt="current"
                  style={{ marginBottom: 10 }}
                />
              )}
              <label>تغيير الصورة:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
              />
              <label>نوع الشهادة:</label>
              <select
                value={editCertificateType}
                onChange={(e) => setEditCertificateType(e.target.value)}
              >
                <option value="">اختر نوع الشهادة</option>
                <option value="دورة">دورة</option>
                <option value="ورشة عمل">ورشة عمل</option>
                <option value="مشاركة وإنجاز">مشاركة وإنجاز</option>
                <option value="فعالية">فعالية</option>
                <option value="تنظيم">تنظيم</option>
              </select>
              <label>قالب الشهادة الجديد (PDF):</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setEditCertificateTemplate(e.target.files?.[0] || null)}
              />
              <div className="modal-actions">
                <button onClick={saveEdit}>حفظ</button>
                <button className="cancel" onClick={() => setShowEditModal(false)}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page {
          display: flex;
          direction: rtl;
          background: #004e64;
          min-height: 100vh;
        }

        .content {
          margin-right: 270px;
          padding: 50px;
          width: 100%;
          font-family: "Cairo";
          color: #e8fffa;
        }

        .title {
          font-size: 34px;
          font-weight: 900;
          margin-bottom: 25px;
          color: #9fffcb;
          text-shadow: 0 0 10px #25a18e77;
        }

        .add-btn {
          background: #7ae582;
          padding: 14px 26px;
          border-radius: 12px;
          font-weight: 800;
          color: #003b29;
          transition: .25s;
          box-shadow: 0 0 10px #7ae58277;
        }

        .add-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 18px #7ae582;
        }

        .list {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .card {
          background: #003b49aa;
          padding: 22px;
          border-radius: 16px;
          border: 1px solid #25a18e55;
          backdrop-filter: blur(14px);
          transition: .25s ease;
          box-shadow: 0 0 15px #25a18e33;
        }

        .card:hover {
          transform: translateY(-5px);
          background: #003b49dd;
          box-shadow: 0 0 22px #25a18e66;
        }

        .thumb {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 2px solid #00a5cf55;
          box-shadow: 0 0 12px #00a5cf44;
        }

        h3 {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 6px;
          color: #9fffcb;
        }

        p {
          font-size: 15px;
          opacity: 0.9;
          color: #e8fffa;
        }

        .date {
          margin-top: 12px;
          display: inline-block;
          padding: 6px 14px;
          background: #25a18eaa;
          border-radius: 10px;
          color: #ffffff;
          font-weight: 700;
        }

        .card-actions {
          margin-top: 15px;
          display: flex;
          gap: 12px;
        }

        .edit {
          background: #00a5cf;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 700;
          color: white;
          box-shadow: 0 0 10px #00a5cf55;
          transition: .25s;
        }

        .edit:hover {
          background: #008eb2;
          transform: translateY(-3px);
          box-shadow: 0 0 15px #00a5cfaa;
        }

        .delete {
          background: #e63946;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 700;
          color: white;
          transition: .25s;
          box-shadow: 0 0 10px #e6394666;
        }

        .delete:hover {
          background: #c12735;
          transform: translateY(-3px);
          box-shadow: 0 0 15px #e63946aa;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(8px);
        }

        .modal {
          background: #003b49;
          width: 420px;
          padding: 35px;
          border-radius: 20px;
          border: 1px solid #25a18e55;
          box-shadow: 0 0 30px #25a18e44;
          animation: pop .3s ease;
        }

        @keyframes pop {
          0% { transform: scale(.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .modal h2 {
          text-align: center;
          color: #9fffcb;
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 20px;
        }

        input, textarea, select {
          width: 100%;
          padding: 12px;
          background: #002f3d;
          border: 1px solid #25a18e55;
          color: #e9fffa;
          border-radius: 10px;
          margin-bottom: 12px;
          transition: .25s;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #7ae582;
          box-shadow: 0 0 10px #7ae58266;
        }

        textarea { min-height: 90px; }

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
          background: #7ae582;
          color: #003b29;
          box-shadow: 0 0 10px #7ae58266;
        }

        .modal-actions button:first-child:hover {
          background: #5fd96b;
          transform: translateY(-3px);
        }

        .modal-actions .cancel {
          background: #002f3d;
          color: #9fffcb;
          border: 1px solid #25a18e55;
        }

        .modal-actions .cancel:hover {
          background: #003b49;
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  );
}
