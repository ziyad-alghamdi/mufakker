"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import Footer from "../components/FooterBar";


type Course = {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string | null;
  image_url?: string | null;
  featured?: boolean | null;
  registrants_count?: number;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [registeredCourseIds, setRegisteredCourseIds] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // بيانات المستخدم للتسجيل
  const [userData, setUserData] = useState({
    nameAr: "",
    nameEn: "",
    phone: "",
    email: "",
    university: ""
  });

  const revealRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function init() {
      await Promise.all([loadUser(), loadCourses()]);
      setLoading(false);
    }
    init();
  }, []);

  // أنيميشن الظهور عند السكرول
  useEffect(() => {
    if (loading || !revealRootRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealRootRef.current.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [loading, courses]);

  async function loadUser() {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    setUser(currentUser);

    if (currentUser) {
      const { data: profile } = await supabase
        .from("users")
        .select("full_name_ar, full_name_en, phone, email, university")
        .eq("id", currentUser.id)
        .single();

      if (profile) {
        setUserData({
          nameAr: profile.full_name_ar || "",
          nameEn: profile.full_name_en || "",
          phone: profile.phone || "",
          email: profile.email || "",
          university: profile.university || ""
        });
      }

      const { data: regs } = await supabase
        .from("course_registrations")
        .select("course_id")
        .eq("user_id", currentUser.id);
      
      if (regs) setRegisteredCourseIds(regs.map(r => r.course_id));
    }
  }

  async function loadCourses() {
    const { data, error } = await supabase.from("courses").select("*");
    if (!error) setCourses(data || []);
  }

  const stats = useMemo(() => ({
    total: courses.length,
    userRegistered: registeredCourseIds.length,
    totalRegistrants: courses.reduce((acc, c) => acc + (c.registrants_count || 0), 50)
  }), [courses, registeredCourseIds]);

  const featuredCourse = useMemo(() => {
    const flagged = courses.find(c => c.featured);
    if (flagged) return flagged;
    return [...courses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [courses]);

  const otherCourses = useMemo(() => {
    return featuredCourse ? courses.filter(c => c.id !== featuredCourse.id) : courses;
  }, [courses, featuredCourse]);

  async function handleRegister(courseId: number) {
    if (!user) return alert("يرجى تسجيل الدخول أولاً!");

    const { error } = await supabase.from("course_registrations").insert([{
      user_id: user.id,
      course_id: courseId,
      status: "pending",
      name_ar: userData.nameAr,
      name_en: userData.nameEn,
      phone: userData.phone,
      email: userData.email,
      university: userData.university,
    }]);

    if (!error) {
      setRegisteredCourseIds(prev => [...prev, courseId]);
      setToast("✅ تم إرسال طلب التسجيل بنجاح!");
      setTimeout(() => setToast(""), 3000);
    }
  }

  const openModal = (course: Course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedCourse(null), 200);
  };

  const isExpired = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(dateStr) < today;
  };

  if (loading) return <div className="loading-state"><div className="loader"></div></div>;

  return (
    <div className="workshops-magazine">
      {/* Background FX */}
      <div className="bg-elements">
        <div className="glow g1"></div>
        <div className="glow g2"></div>
        <div className="grain"></div>
      </div>

      <Sidebar />
      <BackButton />
      {toast && <div className="toast-msg">{toast}</div>}

      <div className="page-container" ref={revealRootRef}>
        {/* HERO */}
        <section className="hero-block" data-reveal>
          <div className="hero-inner">
            <span className="kicker">برامجنا التدريبية</span>
            <h1 className="hero-title">البرامج القادمة</h1>
            <p className="hero-sub">استكشف كل الورش والبرامج والمعسكرات المقدمة لك وطوّر مهاراتك</p>

            <div className="stats-row">
              <div className="stat-item">
                <span className="s-val">{stats.total}</span>
                <span className="s-label">البرامج المتاحة</span>
              </div>
              <div className="stat-item">
                <span className="s-val">{stats.userRegistered}</span>
                <span className="s-label">برامج سجلت فيها</span>
              </div>
              <div className="stat-item highlight">
                <span className="s-val"> 0</span>
                <span className="s-label">إجمالي المتدربين</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        {featuredCourse && (
          <section className="featured-section" data-reveal>
            <h2 className="section-title">البرنامج القادم</h2>
            <div className="featured-card" onClick={() => openModal(featuredCourse)}>
              <div className="f-media">
                <img src={featuredCourse.image_url || "/placeholder.jpg"} alt="" />
                <div className="f-badge">{isExpired(featuredCourse.date) ? "منتهية" : "قادمة"}</div>
              </div>
              <div className="f-content">
                <h3>{featuredCourse.title}</h3>
                <p>مسـاحتك للإبتكـار ... وصنـع المستقبـل</p>
                <div className="f-meta">
                  <span>📅 {featuredCourse.date}</span>
                  <span>📍 {featuredCourse.location || "أونلاين"}</span>
                </div>
                <button className="f-btn">عــرض الـتفــاصيـل</button>
              </div>
            </div>
          </section>
        )}

        {/* GRID */}
        <section className="grid-section" data-reveal>
          <div className="grid-head">
            <h2 className="section-title">كل البرامج</h2>
            <p className="hint">اضغط على أي بطاقة لعرض التفاصيل</p>
          </div>
          <div className="masonry-grid">
            {otherCourses.map((c) => (
              <div className="tile" key={c.id} onClick={() => openModal(c)}>
                <div className="tile-media">
                  <img src={c.image_url || "/placeholder.jpg"} alt="" />
                </div>
                <div className="tile-body">
                  <h3>{c.title}</h3>
                  <div className="tile-meta">
                    <span>📅 {c.date}</span>
                    <span>📍 {c.location || "أونلاين"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL */}
      {selectedCourse && (
        <div className={`modal-backdrop ${modalOpen ? "active" : ""}`} onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-x" onClick={closeModal}>✕</button>
            <div className="modal-grid">
              <div className="m-img-side">
                <img src={selectedCourse.image_url || "/placeholder.jpg"} alt="" />
              </div>
              <div className="m-text-side">
                <span className="m-kicker">تفاصيل البرنامج</span>
                <h2>{selectedCourse.title}</h2>
                <p>{selectedCourse.description}</p>
                <div className="m-info-box">
                  <div className="m-row"><span>التاريخ:</span> <strong>{selectedCourse.date}</strong></div>
                  <div className="m-row"><span>المكان:</span> <strong>{selectedCourse.location || "أونلاين"}</strong></div>
                </div>
                
                <div className="m-actions">
                  {registeredCourseIds.includes(selectedCourse.id) ? (
                    <div className="reg-status success">أنت مسجل بالفعل في هذه الدورة</div>
                  ) : isExpired(selectedCourse.date) ? (
                    <div className="reg-status expired">انتهى وقت التسجيل</div>
                  ) : (
                    <button className="reg-btn" onClick={() => handleRegister(selectedCourse.id)}>سجل الآن</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
            <Footer />
      

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        
        .workshops-magazine {
          background: #031c26; color: #fff; font-family: 'Cairo', sans-serif;
          min-height: 100vh; direction: rtl; position: relative; overflow-x: hidden;
        }

        /* BG Effects */
        .bg-elements { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; filter: blur(120px); opacity: 0.1; }
        .g1 { background: #47d6ad; top: -100px; right: -100px; }
        .g2 { background: #004e64; bottom: -100px; left: -100px; }
        .grain { position: absolute; inset: 0; opacity: 0.03; background-image: url("data:image/svg+xml,..."); }

        .page-container {
  position: relative;
  z-index: 1;
  max-width: 100%; /* تعديل من 1200px إلى 100% */
  width: 100%; /* إضافة هذه الخاصية لتوسيع العرض بالكامل */
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
}


        /* Reveal Animation */
        [data-reveal] { opacity: 0; transform: translateY(20px); transition: all 0.8s ease; }
        .is-revealed { opacity: 1 !important; transform: translateY(0) !important; }

        /* Hero */
        .hero-block { margin-bottom: 60px; }
        .hero-inner { 
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 40px; padding: 50px; backdrop-filter: blur(20px);
        }
        .hero-title { font-size: 3.5rem; font-weight: 900; margin: 10px 0; }
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-top: 40px; }
        .stat-item { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .stat-item.highlight { border-color: #47d6ad; background: rgba(71, 214, 173, 0.05); }
        .s-val { display: block; font-size: 2rem; font-weight: 800; color: #47d6ad; }
        .s-label { font-size: 0.9rem; opacity: 0.6; }

        /* Featured */
        .section-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 25px; }
        .featured-card { 
          display: grid; grid-template-columns: 1fr 1.2fr; background: rgba(255,255,255,0.02);
          border-radius: 30px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; transition: 0.3s;
        }
        .featured-card:hover { transform: translateY(-5px); border-color: #47d6ad; }
        .f-media { height: 350px; position: relative; }
        .f-media img { width: 100%; height: 100%; object-fit: cover; }
        .f-badge { position: absolute; top: 20px; right: 20px; background: #47d6ad; color: #031c26; padding: 5px 15px; border-radius: 10px; font-weight: 800; }
        .f-content { padding: 40px; display: flex; flex-direction: column; justify-content: center; }
        .f-meta { display: flex; gap: 20px; margin: 20px 0; color: #47d6ad; font-weight: 700; }
        .f-btn { width: fit-content; background: none; border: 1px solid #47d6ad; color: #47d6ad; padding: 10px 25px; border-radius: 12px; cursor: pointer; }

        /* Grid */
        .masonry-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; margin-top: 30px; }
        .tile { 
          background: rgba(255,255,255,0.03); border-radius: 25px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s;
        }
        .tile:hover { transform: translateY(-10px); border-color: #47d6ad; }
        .tile-media { height: 200px; }
        .tile-media img { width: 100%; height: 100%; object-fit: cover; }
        .tile-body { padding: 20px; }
        .tile-meta { display: flex; justify-content: space-between; font-size: 0.8rem; margin-top: 15px; color: rgba(99, 30, 30, 0.5); }

        /* Modal */
        .modal-backdrop { 
          position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.8); 
          backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none; transition: 0.3s; padding: 20px;
        }
        .modal-backdrop.active { opacity: 1; pointer-events: auto; }
        .modal-content { 
          background: #042533; width: 60%; max-width: 900px; border-radius: 35px;
          border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden;
        }
        .modal-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .m-img-side img { width: 100%; height: 100%; object-fit: cover; }
        .m-text-side { padding: 40px; }
        .m-info-box { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; margin: 25px 0; }
        .m-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .reg-btn { 
          width: 100%; background: #47d6ad; color: #031c26; border: none; 
          padding: 15px; border-radius: 15px; font-weight: 800; cursor: pointer; 
        }
        .reg-status { text-align: center; padding: 15px; border-radius: 15px; font-weight: 700; }
        .reg-status.success { background: rgba(71, 214, 173, 0.1); color: #47d6ad; }
        .close-x { position: absolute; top: 20px; left: 20px; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; z-index: 10; }

        /* Toast */
        .toast-msg { 
          position: fixed; bottom: 30px; left: 30px; background: #47d6ad; color: #031c26;
          padding: 15px 30px; border-radius: 20px; font-weight: 900; z-index: 2000;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5); animation: slideUp 0.4s ease;
        }

        .loading-state { height: 100vh; display: flex; align-items: center; justify-content: center; background: #031c26; }
        .loader { width: 50px; height: 50px; border: 3px solid #47d6ad; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 850px) {
          .featured-card, .modal-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 2.2rem; }
          .f-media { height: 200px; }
        }
          .featured-section {
  display: flex;
  justify-content: center; /* لتوسيط المستطيل في الصفحة */
  margin: 20px auto;
}

.featured-card {
  width: 550px; /* الحجم المناسب */
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15px; /* تقليص الزوايا */
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); /* تأثير الظل */
  margin: 20px auto;
  display: flex;
  flex-direction: column;
}

.f-media {
  height: 50%; /* جعل الصورة تأخذ نصف الكرت */
  width: 100%;
  position: relative;
}

.f-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1); /* إضافة فاصل بين الصورة والنص */
}

.f-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.f-meta {
  display: flex;
  gap: 20px;
  margin: 10px 0;
  color: #47d6ad;
  font-weight: 700;
}

.f-btn {
  width: 100%;
  background: #47d6ad;
  color: #031c26;
  padding: 12px;
  border-radius: 15px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  margin-top: 10px;
}

.f-btn:hover {
  background: #25a18e;
}

.modal-content {
  width: 5000px; /* عرض مناسب */
  max-width: 80%;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px; /* إضافة تقليص الزوايا */
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
  padding: 30px;
   max-height: 80vh; /* تعيين أقصى ارتفاع (80% من ارتفاع الشاشة) */
 overflow-y: scroll; /* تمكين التمرير عموديًا */
  scrollbar-width: thin; /* عرض شريط التمرير في المتصفحات الحديثة */
  scrollbar-color: transparent transparent; /* جعل شريط التمرير شفاف */
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.m-img-side img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
}

.m-text-side {
  padding: 20px;
}

.m-info-box {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
}

.m-info-box .m-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.reg-status {
  padding: 12px;
  border-radius: 15px;
  font-weight: 700;
  text-align: center;
}

.reg-status.success {
  background: rgba(71, 214, 173, 0.1);
  color: #47d6ad;
}

.reg-status.expired {
  background: rgba(255, 0, 0, 0.1);
  color: red;
}

.close-x {
  position: absolute;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
}

/* تغيير اللون إلى الأبيض في كل النصوص */
* {
  color: white !important;
}

.workshops-magazine {
  background: #031c26;
  color: #fff; /* النصوص تكون باللون الأبيض */
  font-family: 'Cairo', sans-serif;
  min-height: 100vh;
  direction: rtl;
  position: relative;
  overflow-x: hidden;
}

.header-text, .title, .subtitle, .hero-title, .hero-sub, .stat-item .s-val, .stat-item .s-label, .f-meta,  .tile-title, .tile-desc,   .reg-status, .modal-content, .modal-grid, .m-text-side, .m-info-box .m-row, .btn-confirm, .btn-cancel {
  color: white !important; /* جعل كل النصوص بالأبيض */
}

.toast-msg {
  background: #47d6ad;
  color: #031c26;
}

.modal-content {
  background: rgba(255, 255, 255, 0.02); /* يبقى الظلام في الخلفية */
  color: white !important;
}

.f-meta {
  display: flex;
  gap: 20px;
  margin: 10px 0;
  color: #47d6ad; /* هذا يبقى أخضر */
}

.reg-status.success {
  background: rgba(71, 214, 173, 0.1);
  color: #47d6ad;
}

.reg-status.expired {
  background: rgba(255, 0, 0, 0.1);
  color: red;
}

.hero-inner {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white !important;
}

.f-btn {
  background: #47d6ad;
  color: #031c26; /* هذه تبقى بنفس اللون */
}

.m-row span, .modal-content h2 {
  color: white;
}

.m-info-box .m-row {
  color: white;
}

/* أي مكان يتم فيه النصوص */
input, textarea, select {
  color: white; /* النصوص تكون باللون الأبيض داخل الحقول */
}

/* أساسي */
.courses-magazine {
  font-family: "Cairo", sans-serif;
  background-color: #031c26;
  color: white;
}

.hero-block {
  padding: 20px;
}

.hero-title {
  font-size: 36px;
}

.grid-section {
  margin-top: 50px;
}

.tile {
   background: rgba(255,255,255,0.03);
  border-radius: 25px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: transform 420ms ease, border-color 420ms ease, box-shadow 420ms ease;
  position: relative;
  transition-delay: var(--d, 0ms);
  width: 100%; /* يمكنك تعديل هذا من أجل زيادة الحجم */
  max-width: 400px; /* تعديل الحجم الأقصى هنا */
  margin: 20px auto; /* زيادة المسافة بين الكروت */
}

.f-btn {
  background-color: #08b886;
  color: #031c26;
  border-radius: 10px;
  padding: 10px;
}

/* المودال */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #042533;
  border-radius: 10px;
}

.m-row {
  display: flex;
  justify-content: space-between;
}

.m-info-box {
  padding: 10px;
}

.reg-btn {
  background-color: #47d6ad;
  color: #031c26;
  padding: 12px;
  border-radius: 10px;
}
/* خاصية media queries لضبط التنسيق مع الأجهزة الصغيرة */
@media (max-width: 850px) {
  /* تعديل النصوص والعناصر لتتناسب مع الهواتف */
  .hero-title {
    font-size: 28px; /* تقليل حجم العنوان */
  }

  .tile {
    max-width: 100%; /* جعل الكروت تتناسب مع كامل عرض الشاشة */
    width: 100%; /* تعديل الكروت لتأخذ العرض الكامل */
    margin: 10px auto; /* تقليل المسافة بين الكروت */
  }

  .f-media {
    height: 200px; /* تقليل ارتفاع الصورة داخل الكرت */
  }

  .modal-content {
    width: 90%; /* عرض المودال 90% من عرض الشاشة */
    max-width: 500px; /* تحديد أقصى عرض للمودال */
    padding: 20px; /* تقليل الحشو داخل المودال */
  }

  .page-container {
    padding: 10px; /* تقليل الحشو داخل الصفحة */
  }

  .f-btn {
    font-size: 14px; /* تقليل حجم الخط في الأزرار */
    padding: 10px 18px; /* تقليل المسافة في الأزرار */
  }

  .grid-section {
    margin-top: 30px; /* تقليل المسافة بين الأقسام */
  }

  .stats-row {
    grid-template-columns: 1fr 1fr; /* تغيير تخطيط الإحصائيات ليتناسب مع الجوال */
    gap: 10px; /* تقليل المسافة بين العناصر */
  }

  .stat-item {
    padding: 15px;
    font-size: 14px; /* تقليل حجم الخط في الإحصائيات */
  }

  .f-content {
    padding: 15px; /* تقليل الحشو داخل محتوى الكرت */
  }

  .tile-meta {
    font-size: 14px; /* تقليل حجم الخط في تفاصيل الكرت */
  }

  .m-info-box {
    padding: 15px; /* تقليل الحشو داخل المودال */
  }

  .reg-btn {
    padding: 10px; /* تقليل المسافة داخل الأزرار في المودال */
  }

  .m-img-side img {
    height: 100%; /* جعل الصورة تأخذ كامل المساحة المتاحة */
    object-fit: cover; /* لضمان ملائمة الصورة */
  }

  .m-text-side {
    padding: 20px; /* تعديل الحشو في المودال */
  }

  /* إخفاء بعض العناصر أو تعديل عرضها إذا كانت الشاشة صغيرة */
  .modal-grid {
    grid-template-columns: 1fr; /* استخدام عمود واحد على الجوال */
  }
}

/* إعدادات الشاشات الأصغر من 600px */
@media (max-width: 600px) {
  .hero-title {
    font-size: 22px; /* تقليل حجم الخط أكثر على الشاشات الصغيرة */
  }

  .f-media {
    height: 150px; /* تقليل حجم الصورة داخل الكرت */
  }

  .modal-content {
    width: 95%; /* زيادة العرض ليشمل نسبة أكبر من الشاشة */
    padding: 15px; /* تقليل الحشو بشكل أكبر */
  }

  .m-img-side img {
    height: auto; /* تعديل حجم الصورة ليتناسب مع الشاشة */
    object-fit: contain; /* الحفاظ على أبعاد الصورة الصحيحة */
  }

  .tile {
    max-width: 100%; /* التأكد من أن الكرت يأخذ عرض الشاشة بالكامل */
  }

  .tile-media {
    height: 150px; /* تقليل ارتفاع الصورة داخل الكرت */
  }

  .f-btn {
    padding: 8px 16px; /* تقليل حجم الأزرار */
  }
}


      `}</style>
    </div>
  );
}
