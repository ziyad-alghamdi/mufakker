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

  // شاشة التحميل الجديدة
  if (loading)
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="spinner-border"></div>
          <img src="/m10.png" alt="Mufakker Logo Loader" className="logo-loader" />
        </div>
        <p className="loading-text">جاري عرض البرامج التدريبية ...</p>

        <style jsx>{`
          .loading-screen {
            height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #031c26;
            font-family: "Cairo", sans-serif;
          }
          .loader-container {
            position: relative;
            width: 300px;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .spinner-border {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 4px solid transparent;
            border-top-color: #47D6AD;
            border-bottom-color: #47D6AD;
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
            z-index: 1;
          }
          .logo-loader {
            width: 200%;
            height: auto;
            position: relative;
            z-index: 10;
            animation: pulseLogo 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
            top: 60px;
            left: 10px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulseLogo {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.05); filter: brightness(1.1); }
          }
          .loading-text {
            margin-top: 40px;
            color: #ebfff9;
            font-weight: 700;
            font-size: 18px;
            letter-spacing: 0.5px;
            animation: textFade 1.5s infinite alternate;
          }
          @keyframes textFade {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );

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
                <div className={`f-badge ${isExpired(featuredCourse.date) ? "expired-badge" : "coming-badge"}`}>
  {isExpired(featuredCourse.date) ? "انتهت" : "قادمة"}
</div>
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

        .page-container {
          position: relative;
          z-index: 1;
          max-width: 100%;
          width: 100%;
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
        
        .featured-section {
          display: flex;
          justify-content: center;
          margin: 20px auto;
        }

        .featured-card {
          width: 550px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 15px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          margin: 20px auto;
          display: flex;
          flex-direction: column;
        }

        .f-media {
          height: 250px;
          width: 100%;
          position: relative;
        }

        .f-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
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

        /* Grid */
        .masonry-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; margin-top: 30px; }
        .tile { 
          background: rgba(255,255,255,0.03); border-radius: 25px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s;
          max-width: 400px; margin: 20px auto; width: 100%;
        }
        .tile:hover { transform: translateY(-10px); border-color: #47d6ad; }
        .tile-media { height: 200px; }
        .tile-media img { width: 100%; height: 100%; object-fit: cover; }
        .tile-body { padding: 20px; }

        /* Modal */
        .modal-backdrop { 
          position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.8); 
          backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none; transition: 0.3s; padding: 20px;
        }
        .modal-backdrop.active { opacity: 1; pointer-events: auto; }
        
        .modal-content {
          width: 80%;
          max-width: 900px;
          background: #042533;
          border-radius: 20px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
          padding: 30px;
          max-height: 80vh;
          overflow-y: scroll;
          scrollbar-width: none;
          position: relative;
        }
        .modal-content::-webkit-scrollbar { display: none; }

        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .m-img-side img { width: 100%; border-radius: 15px; }
        .m-text-side { padding: 10px; }
        .m-info-box { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 15px; margin-top: 20px; }
        .m-row { display: flex; justify-content: space-between; margin-bottom: 10px; }

        .reg-btn { width: 100%; background: #47d6ad; color: #031c26; border: none; padding: 15px; border-radius: 10px; font-weight: 800; cursor: pointer; }
        .reg-status { text-align: center; padding: 12px; border-radius: 15px; font-weight: 700; }
        .reg-status.success { background: rgba(71, 214, 173, 0.1); color: #47d6ad; }
        .reg-status.expired { background: rgba(255, 0, 0, 0.1); color: red; }

        .close-x { position: absolute; top: 10px; left: 10px; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; z-index: 10; }

        /* Global White Text */
        * { color: white !important; }
        .toast-msg, .f-btn, .reg-btn { color: #031c26 !important; }

        @media (max-width: 850px) {
          .featured-card, .modal-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 28px; }
          .featured-card { width: 100%; }
          .stats-row { grid-template-columns: 1fr 1fr; }
        }
          .f-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(71, 214, 173, 0.1); /* خلفية شفافة جداً */
  color: #47d6ad !important; /* لون النص الأساسي */
  padding: 6px 18px;
  border-radius: 50px;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 1px;
  border: 1px solid rgba(71, 214, 173, 0.3);
  
  /* تأثير الإضاءة الخافتة */
  text-shadow: 
    0 0 5px rgba(71, 214, 173, 0.6),
    0 0 15px rgba(71, 214, 173, 0.4);
  
  /* تأثير النبض الخفيف للإضاءة */
  animation: softGlow 3s infinite alternate;
  backdrop-filter: blur(5px);
  z-index: 10;
}

@keyframes softGlow {
  0% {
    box-shadow: 0 0 5px rgba(71, 214, 173, 0.1);
    border-color: rgba(71, 214, 173, 0.2);
  }
  100% {
    box-shadow: 0 0 15px rgba(71, 214, 173, 0.3);
    border-color: rgba(71, 214, 173, 0.6);
  }
}
      `}</style>
    </div>
  );
}