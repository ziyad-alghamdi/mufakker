"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالات المودال والرفع
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // حالة البحث
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCertificates();
    loadCourses();
  }, []);

  async function loadCertificates() {
    setLoading(true);
    const { data, error } = await supabase
      .from("certificate_b")
      .select("*")
      .order("id", { ascending: false });
    if (error) console.error(error.message);
    setCertificates(data || []);
    setLoading(false);
  }

  async function loadCourses() {
    const { data, error } = await supabase.from("courses").select("id, title");
    if (!error) setCourses(data || []);
  }

  const filteredCertificates = searchTerm.trim()
    ? certificates.filter((cert) =>
        (cert.name_ar || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
    : certificates;

  const openUploadModal = (certId: string) => {
    setSelectedCertId(certId);
    setIsModalOpen(true);
  };

  const closeConstraints = () => {
    setIsModalOpen(false);
    setSelectedCertId(null);
    setSelectedCourseName("");
    setSelectedFile(null);
  };

  async function handleSave() {
    if (!selectedCourseName || !selectedFile || !selectedCertId) {
      alert("يرجى اختيار الدورة ورفع الملف أولاً");
      return;
    }

    setIsSaving(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${selectedCertId}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("certificates").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("certificate_b")
        .update({
          certificate_path: publicUrl,
          course_name: selectedCourseName,
          status: "مكتمل",
        })
        .eq("id", selectedCertId);

      if (updateError) throw updateError;

      loadCertificates();
      closeConstraints();
    } catch (error: any) {
      alert("خطأ: " + error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-container">
      {/* الخلفية المتحركة */}
      <div className="bg-blur-effect"></div>

      <Sidebar />

      <main className="main-content">
        {/* الهيدر العلوي المختصر */}
        <header className="top-dashboard-nav">
          <BackButton />
          <div className="admin-profile-pill">
            <span className="online-indicator"></span>
            <span>لوحة التحكم الإدارية</span>
          </div>
        </header>

        <div className="page-body">
          {/* قسم العنوان والإحصائيات */}
          <section className="welcome-section">
            <div className="title-area">
              <h1 className="hero-title">إدارة الشهادات <span>الرقمية</span></h1>
              <p className="hero-subtitle">تحكم بطلبات الاعتماد ورفع الملفات النهائية للأعضاء</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card glass">
                <span className="stat-label">إجمالي الطلبات</span>
                <span className="stat-value">{certificates.length}</span>
              </div>
              <div className="stat-card glass highlight">
                <span className="stat-label">بانتظار الاعتماد</span>
                <span className="stat-value">{certificates.filter(c => c.status !== 'مكتمل').length}</span>
              </div>
            </div>
          </section>

          {/* شريط الأدوات والبحث */}
          <div className="tools-bar glass">
            <div className="search-field">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="ابحث عن اسم العضو أو رقم الطلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && <div className="results-count">تم العثور على {filteredCertificates.length} عضو</div>}
          </div>

          {/* جدول البيانات المطور */}
          <div className="table-wrapper">
            {loading ? (
              <div className="loading-state">
                <div className="custom-loader"></div>
                <p>جاري مزامنة البيانات...</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>الدورة التدريبية</th>
                    <th>حالة الاعتماد</th>
                    <th>الملف المرفق</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="row-item">
                      <td className="user-info">
                        <div className="avatar-circle">{cert.name_ar?.charAt(0)}</div>
                        <div className="name-stack">
                          <span className="full-name">{cert.name_ar}</span>
                          <span className="id-badge">#{cert.id.toString().slice(-4)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="course-box">
                          {cert.course_name || "لم يتم التحديد"}
                        </div>
                      </td>
                      <td>
                        <span className={`badge-status ${cert.status === "مكتمل" ? "success" : "warning"}`}>
                          {cert.status === "مكتمل" ? "تم الاعتماد" : "قيد المراجعة"}
                        </span>
                      </td>
                      <td>
                        {cert.certificate_path ? (
                          <a href={cert.certificate_path} target="_blank" rel="noreferrer" className="file-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            استعراض الشهادة
                          </a>
                        ) : (
                          <span className="empty-file">لا يوجد ملف</span>
                        )}
                      </td>
                      <td>
                        <button className="btn-update" onClick={() => openUploadModal(cert.id)}>
                          إدارة الطلب
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* مودال الرفع الاحترافي */}
      {isModalOpen && (
        <div className="modal-portal">
          <div className="modal-content glass-dark">
            <div className="modal-head">
              <h2>تحديث وثيقة الاعتماد</h2>
              <button className="close-x" onClick={closeConstraints}>&times;</button>
            </div>
            
            <div className="modal-form">
              <div className="form-group">
                <label>اختر الدورة المعتمدة</label>
                <div className="select-wrapper">
                  <select value={selectedCourseName} onChange={(e) => setSelectedCourseName(e.target.value)}>
                    <option value="">-- اختر من قائمة الدورات المتاحة --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.title}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>ملف الشهادة النهائي (PDF)</label>
                <div className={`dropzone ${selectedFile ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept=".pdf"
                    id="pdf-input"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="pdf-input">
                    {selectedFile ? (
                      <span className="file-name-display">{selectedFile.name}</span>
                    ) : (
                      <>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#47D6AD" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <p>انقر هنا لرفع شهادة العضو</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <span className="spinner-mini"></span> : "تأكيد وإرسال الشهادة"}
              </button>
              <button className="btn-cancel" onClick={closeConstraints}>إلغاء العملية</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap");

        :root {
          --primary: #47d6ad;
          --bg-dark: #031c26;
          --card-bg: rgba(255, 255, 255, 0.03);
          --text-main: #eafff9;
          --text-muted: rgba(234, 255, 249, 0.6);
          --sidebar-width: 280px;
        }

        * { box-sizing: border-box; }

        body {
          margin: 0;
          background-color: var(--bg-dark);
          color: var(--text-main);
          font-family: "Cairo", sans-serif;
          direction: rtl;
          overflow-x: hidden;
        }

        .bg-blur-effect {
          position: fixed;
          top: -10%;
          left: -10%;
          width: 40%;
          height: 40%;
          background: radial-gradient(circle, rgba(71, 214, 173, 0.08) 0%, transparent 70%);
          z-index: -1;
          filter: blur(60px);
        }

        .main-content {
          margin-right: var(--sidebar-width);
          min-height: 100vh;
          padding: 0 40px 40px;
          display: flex;
          flex-direction: column;
        }

        /* Top Nav */
        .top-dashboard-nav {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 20px;
        }

        .admin-profile-pill {
          background: var(--card-bg);
          padding: 8px 16px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .online-indicator {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--primary);
        }

        /* Hero Section */
        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          padding-top: 20px;
        }

        .hero-title { font-size: 32px; font-weight: 800; margin: 0; }
        .hero-title span { color: var(--primary); }
        .hero-subtitle { color: var(--text-muted); margin: 5px 0 0 0; font-size: 16px; }

        .stats-grid { display: flex; gap: 20px; }
        .stat-card {
          padding: 15px 30px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          min-width: 160px;
        }
        .stat-card.highlight { border: 1px solid rgba(71, 214, 173, 0.3); background: rgba(71, 214, 173, 0.05); }
        .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
        .stat-value { font-size: 28px; font-weight: 800; color: var(--primary); }

        /* Tools Bar */
        .glass { background: var(--card-bg); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08); }
        .tools-bar {
          padding: 12px 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .search-field {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .search-field input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          font-family: 'Cairo';
          font-size: 15px;
          outline: none;
        }

        .results-count { font-size: 13px; color: var(--primary); font-weight: 600; }

        /* Table Design */
        .table-wrapper { overflow-x: auto; }
        .custom-table { width: 100%; border-spacing: 0 12px; border-collapse: separate; }
        .custom-table th { 
          padding: 10px 20px; 
          text-align: right; 
          font-size: 13px; 
          color: var(--text-muted); 
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .row-item { 
          background: var(--card-bg); 
          transition: transform 0.2s, background 0.2s;
        }

        .row-item:hover { 
          transform: translateY(-3px); 
          background: rgba(255,255,255,0.06); 
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .row-item td { padding: 20px; }
        .row-item td:first-child { border-radius: 0 16px 16px 0; }
        .row-item td:last-child { border-radius: 16px 0 0 16px; }

        .user-info { display: flex; align-items: center; gap: 15px; }
        .avatar-circle {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #004e64, #002a36);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: var(--primary);
          border: 1px solid rgba(71, 214, 173, 0.2);
        }

        .full-name { display: block; font-weight: 700; font-size: 15px; }
        .id-badge { font-size: 11px; color: var(--text-muted); font-family: monospace; }

        .course-box {
          background: rgba(255,255,255,0.05);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          display: inline-block;
        }

        .badge-status {
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        .badge-status.success { background: rgba(71, 214, 173, 0.1); color: var(--primary); }
        .badge-status.warning { background: rgba(255, 165, 0, 0.1); color: #ffa500; }

        .file-link {
          color: var(--primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .empty-file { color: var(--text-muted); font-size: 13px; font-style: italic; }

        .btn-update {
          background: transparent;
          border: 1.5px solid var(--primary);
          color: var(--primary);
          padding: 8px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'Cairo';
          font-weight: 700;
          transition: 0.3s;
        }
        .btn-update:hover { background: var(--primary); color: var(--bg-dark); }

        /* Modal Design */
        .modal-portal {
          position: fixed;
          inset: 0;
          background: rgba(0, 5, 10, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 550px;
          padding: 40px;
          border-radius: 28px;
          position: relative;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }

        .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .modal-head h2 { margin: 0; font-size: 24px; color: var(--primary); }
        .close-x { background: none; border: none; color: white; font-size: 30px; cursor: pointer; }

        .form-group { margin-bottom: 25px; }
        .form-group label { display: block; margin-bottom: 10px; font-weight: 600; font-size: 14px; color: var(--text-muted); }

        .select-wrapper select {
          width: 100%;
          padding: 15px;
          background: #0b2a41;
          border: 1px solid rgba(71, 214, 173, 0.2);
          border-radius: 12px;
          color: white;
          font-family: 'Cairo';
          outline: none;
        }

        .dropzone {
          border: 2px dashed rgba(71, 214, 173, 0.3);
          padding: 40px;
          text-align: center;
          border-radius: 16px;
          transition: 0.3s;
        }
        .dropzone:hover { border-color: var(--primary); background: rgba(71, 214, 173, 0.05); }
        .dropzone input { display: none; }
        .dropzone label { cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .file-name-display { color: var(--primary); font-weight: 700; border: 1px solid var(--primary); padding: 5px 15px; border-radius: 20px; }

        .modal-actions { display: flex; gap: 15px; margin-top: 40px; }
        .btn-save { flex: 2; background: var(--primary); border: none; padding: 16px; border-radius: 14px; color: var(--bg-dark); font-weight: 800; cursor: pointer; font-family: 'Cairo'; font-size: 16px; }
        .btn-cancel { flex: 1; background: transparent; border: 1px solid #ff4b2b; color: #ff4b2b; padding: 16px; border-radius: 14px; cursor: pointer; font-family: 'Cairo'; }

        /* Loader */
        .custom-loader {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(71, 214, 173, 0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1200px) {
          .main-content { margin-right: 0; padding: 0 20px 20px; }
          .welcome-section { flex-direction: column; align-items: flex-start; gap: 20px; }
          .stats-grid { width: 100%; }
          .stat-card { flex: 1; }
        }
      `}</style>
    </div>
  );
}