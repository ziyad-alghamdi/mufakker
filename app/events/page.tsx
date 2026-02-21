"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/FooterBar";

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string | null;
  image_url?: string | null;
  featured?: boolean | null;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIdeaStep, setShowIdeaStep] = useState(false);
  const [hasIdea, setHasIdea] = useState<"yes" | "no" | null>(null);
  const [ideaText, setIdeaText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [regStep, setRegStep] = useState('confirm'); // 'confirm' or 'idea'
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  const [useProfileSkills, setUseProfileSkills] = useState<"yes" | "no" | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [profileSkills, setProfileSkills] = useState("");


  
  // ✅ مودال التفاصيل
  const [selected, setSelected] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Toast بسيط
  const [toast, setToast] = useState<string>("");

  // ✅ للأنيميشن عند ظهور العناصر بالسكرول
  const revealRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function initPage() {
      await Promise.all([loadUser(), loadEvents(), loadRegistrations()]);
      setLoading(false);
    }
    initPage();
  }, []);

  useEffect(() => {
    // Escape لإغلاق المودال
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (modalOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    // قفل سكرول الخلفية عند فتح المودال
    if (modalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [modalOpen]);

  useEffect(() => {
    // Scroll reveal بدون مكتبات
    if (!revealRootRef.current) return;

    const els = Array.from(
      revealRootRef.current.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading, events]);

  async function loadUser() {
  const { data } = await supabase.auth.getUser();
  setUser(data.user);

  if (!data.user) return;

  // ✅ جلب مهارات المستخدم من جدول users
  const { data: userRow, error } = await supabase
    .from("users")
    .select("skills")
    .eq("id", data.user.id)
    .single();

  if (!error && userRow?.skills) {
    setProfileSkills(userRow.skills);
  }

  const { data: regs } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("user_id", data.user.id);

  setUserRegistrations(regs?.map((r: any) => r.event_id) || []);
}


  async function loadEvents() {
    const { data } = await supabase.from("events").select("*");
    setEvents((data as any[]) || []);
  }

  async function loadRegistrations() {
    const { data } = await supabase.from("event_registrations").select("*");
    setRegistrations(data || []);
  }

  async function register(event_id: number) {
    if (!user) {
      alert("يجب تسجيل الدخول أولاً");
      return;
    }

    const { data: existing } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", event_id)
      .single();

    if (existing) {
      alert("تم التسجيل مسبقًا، نشكرك على حماسك ❤️");
      return;
    }

    await supabase.from("event_registrations").insert([
      { user_id: user.id, event_id, status: "pending" },
    ]);

    setUserRegistrations((prev) => [...prev, event_id]);
    await loadRegistrations();

    // Toast لطيف
    setToast("تم إرسال طلب التسجيل بنجاح!");
    setTimeout(() => setToast(""), 2400);
  }
async function submitRegistration(eventId: number) {
  if (!user || submitting) return;

  setSubmitting(true);

  const { error } = await supabase.from("event_registrations").insert([
    {
      user_id: user.id,
      event_id: eventId,
      status: "pending",
      idea: hasIdea === "yes" ? ideaText : null,
      skills: skillsText,
    },
  ]);

  setSubmitting(false);

  if (error) {
    alert("حدث خطأ أثناء التسجيل");
    return;
  }

  setUserRegistrations((prev) => [...prev, eventId]);
  await loadRegistrations();

  setToast("تم تسجيلك بنجاح 🎉");
  setTimeout(() => setToast(""), 2500);

  closeModal();
}


  function isExpired(dateString: string) {
    const today = new Date();
    const eventDate = new Date(dateString);
    return eventDate < today;
  }

  const registrationsCountByEvent = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of registrations) {
      map.set(r.event_id, (map.get(r.event_id) || 0) + 1);
    }
    return map;
  }, [registrations]);

  const featuredEvent = useMemo(() => {
    if (!events?.length) return null;

    const flagged = events.find((e) => (e as any).featured);
    if (flagged) return flagged;

    const upcoming = events
      .filter((e) => !isExpired(e.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcoming.length) return upcoming[0];

    return events[0];
  }, [events]);

  const otherEvents = useMemo(() => {
    if (!featuredEvent) return events;
    return events.filter((e) => e.id !== featuredEvent.id);
  }, [events, featuredEvent]);

  function openModal(e: Event) {
    setSelected(e);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setTimeout(() => setSelected(null), 180);
  }

  // --- شاشة التحميل ---
  
if (loading)
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="spinner-border"></div>
          <img src="/m10.png" alt="Mufakker Logo Loader" className="logo-loader" />
        </div>
        <p className="loading-text">جاري عرض الهاكاثونات و المشاركات ...</p>

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
            position: relative;
  top: 60px; /* ينزلها 30px */
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
    <div className="events-magazine">
      <div className="bg" aria-hidden="true">
        <div className="glow g1"></div>
        <div className="glow g2"></div>
        <div className="grain"></div>
        <div className="orbs o1"></div>
        <div className="orbs o2"></div>
      </div>

      <Sidebar />
      <BackButton />

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      <div className="page" ref={revealRootRef}>
        {/* HERO — Magazine Header */}
        <section className="hero" data-reveal>
          <div className="hero-inner">
            <div className="hero-badge">مشاركاتنا المجتمعية</div>
            <h1 className="hero-title">الفعاليات القادمة</h1>
            <p className="hero-desc">استكشف كل الفعاليات والمشاركات المقدمة لك</p>

            <div className="hero-stats">
              <div className="stat">
                <div className="stat-num">{events.length}</div>
                <div className="stat-label">الفعاليات الحالية</div>
              </div>
              <div className="stat">
                <div className="stat-num">{user ? userRegistrations.length : "0"}</div>
                <div className="stat-label">فعاليات سجلت فيها</div>
              </div>
              <div className="stat accent">
                <div className="stat-num">{registrations.length}</div>
                <div className="stat-label">إجمالي الحضور</div>
              </div>
            </div>

            <div className="scroll-hint" aria-hidden="true">
              <span className="dot"></span>
              <span className="line"></span>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        {featuredEvent && (
          <section className="featured" data-reveal>
            <div className="section-head">
              <h2 className="section-title">الفعالية القادمة</h2>
            </div>
            <div
              className="featured-card"
              role="button"
              tabIndex={0}
              onClick={() => openModal(featuredEvent)}
              onKeyDown={(e) => e.key === "Enter" && openModal(featuredEvent)}
            >
              <div className="featured-media">
                {featuredEvent.image_url ? (
                  <img
                    src={featuredEvent.image_url}
                    alt={featuredEvent.title}
                    className="featured-img"
                  />
                ) : (
                  <div className="featured-placeholder">📅</div>
                )}
                <div className="featured-overlay"></div>

                <div className="featured-top">
                  {isExpired(featuredEvent.date) ? (
                    <span className="pill danger">انتهت</span>
                  ) : (
                    <span className="pill ok">قادمـة</span>
                  )}
                </div>
              </div>

              <div className="featured-content">
                <h2 className="featured-title">{featuredEvent.title}</h2>
                <p className="featured-desc">
                  {featuredEvent.description || "—"}
                </p>

                <div className="featured-meta">
                  <div className="meta">
                    <span className="ico">📅</span>
                    <span>{featuredEvent.date}</span>
                  </div>
                  <div className="meta">
                    <span className="ico">📍</span>
                    <span>{featuredEvent.location || "أونلاين"}</span>
                  </div>
                  <div className="meta">
                    <span className="ico">👥</span>
                    <span>
                      {registrationsCountByEvent.get(featuredEvent.id) || 0}{" "}
                      مسجل
                    </span>
                  </div>
                </div>

                <div className="featured-cta">
                  <button className="cta-primary" type="button">
                    عرض التفاصيل
                  </button>
                  <span className="cta-note">
                    (تفتح التفاصيل في المنتصف)
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* GRID — Magazine Tiles */}
        <section className="grid-wrap" data-reveal>
          <div className="section-head">
            <h2 className="section-title">كل الفعاليات</h2>
            <p className="section-sub">
              اضغط على أي بطاقة لفتح التفاصيل في المنتصف.
            </p>
          </div>

          {events.length === 0 ? (
            <p className="empty">لا توجد فعاليات متاحة حالياً.</p>
          ) : (
            <div className="masonry">
              {otherEvents.map((e, idx) => {
                const count = registrationsCountByEvent.get(e.id) || 0;
                const expired = isExpired(e.date);
                const registered = userRegistrations.includes(e.id);

                return (
                  <article
                    key={e.id}
                    className="tile"
                    data-reveal
                    style={{ ["--d" as any]: `${idx * 60}ms` }}
                    onClick={() => openModal(e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(ev) => ev.key === "Enter" && openModal(e)}
                  >
                    <div className="tile-media">
                      {e.image_url ? (
                        <img src={e.image_url} alt={e.title} className="tile-img" />
                      ) : (
                        <div className="tile-ph">📅</div>
                      )}
                      <div className="tile-overlay"></div>

                      <div className="tile-badges">
                        {expired && <span className="badge danger">انتهى</span>}
                        {registered && !expired && (
                          <span className="badge ok">✓ مسجل</span>
                        )}
                      </div>
                    </div>

                    <div className="tile-body">
                      <h3 className="tile-title">{e.title}</h3>
                      <p className="tile-desc">{e.description}</p>

                      <div className="tile-meta">
                        <span className="chip">
                          <span className="ico">📅</span> {e.date}
                        </span>
                        <span className="chip">
                          <span className="ico">👥</span> {count}
                        </span>
                        <span className="chip">
                          <span className="ico">📍</span> {e.location || "أونلاين"}
                        </span>
                      </div>
                    </div>

                    <div className="tile-cta">
                      <span>عرض التفاصيل</span>
                      <span className="arrow">←</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* MODAL — تفاصيل في المنتصف */}
      {selected && (
        <div
          className={`modal-backdrop ${modalOpen ? "open" : ""}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={`modal ${modalOpen ? "open" : ""}`} role="dialog" aria-modal="true">
            <button className="modal-close" onClick={closeModal} aria-label="إغلاق">
              ✕
            </button>

            <div className="modal-grid">
              <div className="modal-media">
                {selected.image_url ? (
                  <img src={selected.image_url} alt={selected.title} className="modal-img" />
                ) : (
                  <div className="modal-ph">📅</div>
                )}
                <div className="modal-overlay"></div>

                <div className="modal-pills">
                  {isExpired(selected.date) ? (
                    <span className="pill danger">انتهت</span>
                  ) : (
                    <span className="pill ok">متاحة</span>
                  )}
                  {userRegistrations.includes(selected.id) && !isExpired(selected.date) && (
                    <span className="pill ok2">✓ أنت مسجل</span>
                  )}
                </div>
              </div>

              <div className="modal-body">
                <div className="modal-head">
                  <div className="modal-kicker">تفاصيل الفعالية</div>
                  <h2 className="modal-title">{selected.title}</h2>
                  <p className="modal-desc">{selected.description}</p>
                </div>

                <div className="modal-info">
                  <div className="info-row">
                    <span className="info-ico">📅</span>
                    <span className="info-label">التاريخ</span>
                    <span className="info-val">{selected.date}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-ico">📍</span>
                    <span className="info-label">المكان</span>
                    <span className="info-val">{selected.location || "أونلاين"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-ico">👥</span>
                    <span className="info-label">مسجلين مفكًِــر</span>
                    <span className="info-val">
                      {registrationsCountByEvent.get(selected.id) || 0}
                    </span>
                  </div>
                </div>
                  {showIdeaStep && (
                  <div className="idea-step">
                    <h4 className="idea-title">هل لديك فكرة أو مقترح؟</h4>

                    <div className="idea-options">
                      <button
                        className={`idea-btn ${hasIdea === "yes" ? "active" : ""}`}
                        onClick={() => setHasIdea("yes")}
                      >
                        نعم
                      </button>
                      <button
                        className={`idea-btn ${hasIdea === "no" ? "active" : ""}`}
                        onClick={() => setHasIdea("no")}
                      >
                        لا
                      </button>
                    </div>

                    {hasIdea === "yes" && (
                      <textarea
                        className="idea-textarea"
                        placeholder="اكتب فكرتك هنا..."
                        value={ideaText}
                        onChange={(e) => setIdeaText(e.target.value)}
                      />
                    )}

                    {/* ===== المهارات ===== */}
                    <h4 className="idea-title" style={{ marginTop: "20px" }}>
                      هل تريد استخدام المهارات الموجودة في ملفك الشخصي؟
                    </h4>

                    <div className="idea-options">
                      <button
                        className={`idea-btn ${useProfileSkills === "yes" ? "active" : ""}`}
                        onClick={() => {
                          setUseProfileSkills("yes");
                          setSkillsText(profileSkills || "");

                        }}
                      >
                        نعم
                      </button>
                      <button
                        className={`idea-btn ${useProfileSkills === "no" ? "active" : ""}`}
                        onClick={() => {
                          setUseProfileSkills("no");
                          setSkillsText("");
                        }}
                      >
                        لا
                      </button>
                    </div>

                    {useProfileSkills && (
                      <textarea
                        className="idea-textarea"
                        placeholder="اكتب مهاراتك..."
                        value={skillsText}
                        onChange={(e) => setSkillsText(e.target.value)}
                      />
                    )}

                    <button
                      className="btn-primary"
                      disabled={
                        submitting ||
                        (hasIdea === "yes" && !ideaText.trim()) ||
                        !skillsText.trim()
                      }
                      onClick={() => submitRegistration(selected!.id)}
                    >
                      {submitting ? "جاري الإرسال..." : "تأكيد التسجيل"}
                    </button>
                  </div>

                  )}

                <div className="modal-actions">
                  {isExpired(selected.date) ? (
                    <div className="status danger">
                      عذراً، انتهت فترة التسجيل
                    </div>
                  ) : userRegistrations.includes(selected.id) ? (
                    <div className="status ok">
                      أنت مسجل بالفعل في هذه الفعالية
                    </div>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setShowIdeaStep(true);
                        setTimeout(() => {
                          const el = document.querySelector(".idea-step");
                          el?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                        setHasIdea(null);
                        setIdeaText("");
                        setUseProfileSkills(null);
                        setSkillsText("");
                      }}
                    >
                      سجل الآن
                    </button>


                  )}

                  <button className="btn-ghost" onClick={closeModal}>
                    رجوع
                  </button>
                </div>

                <div className="modal-footnote">
                  يمكنك إغلاق النافذة بـ <span>ESC</span> أو الضغط خارجها.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap");

        :root {
          --bg: #031c26;
          --bg2: #0b2a41;
          --teal: #47d6ad;
          --teal2: #25a18e;
          --cyan: #004e64;
          --text: #eafff9;
          --muted: rgba(234, 255, 249, 0.78);
          --stroke: rgba(255, 255, 255, 0.08);
          --stroke2: rgba(255, 255, 255, 0.12);
          --shadow: rgba(0, 0, 0, 0.45);
        }

        .events-magazine {
          min-height: 100vh;
          width: 100%;
          position: relative;
          background: var(--bg);
          color: var(--text);
          direction: rtl;
          font-family: "Cairo", sans-serif;
          overflow-x: hidden;
        }

        .bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: radial-gradient(circle at 20% 20%, var(--bg2), var(--bg));
          overflow: hidden;
        }
        .glow {
          position: absolute;
          width: 900px;
          height: 900px;
          border-radius: 50%;
          filter: blur(160px);
          opacity: 0.12;
          animation: pulse 10s ease-in-out infinite alternate;
        }
        .g1 {
          background: var(--teal);
          top: -260px;
          right: -240px;
        }
        .g2 {
          background: var(--cyan);
          bottom: -300px;
          left: -260px;
          animation-duration: 13s;
          opacity: 0.1;
        }
        @keyframes pulse {
          from { transform: scale(1); opacity: 0.08; }
          to { transform: scale(1.08); opacity: 0.14; }
        }
        .orbs {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.18;
          background: rgba(71, 214, 173, 0.35);
          animation: drift 18s ease-in-out infinite alternate;
        }
        .o1 {
          width: 260px;
          height: 260px;
          top: 35%;
          left: 10%;
        }
        .o2 {
          width: 340px;
          height: 340px;
          top: 20%;
          right: 15%;
          opacity: 0.12;
          animation-duration: 24s;
        }
        @keyframes drift {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(90px, -60px,0); }
        }

        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          pointer-events: none;
        }

        .page {
          position: relative;
          z-index: 1;
          max-width: 1300px;
          margin: 0 auto 0 280px;
          padding: 56px 40px 120px;
        }

        .toast {
          position: fixed;
          top: 18px;
          left: 18px;
          z-index: 50;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(71,214,173,0.22);
          backdrop-filter: blur(14px);
          color: var(--text);
          padding: 10px 14px;
          border-radius: 14px;
          box-shadow: 0 18px 40px var(--shadow);
          font-weight: 800;
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 800ms ease, transform 800ms ease;
        }
        .is-revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .hero {
          padding: 38px 0 18px;
        }
        .hero-inner {
          position: relative;
          border-radius: 34px;
          padding: 44px 42px 34px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
          box-shadow: 0 26px 90px rgba(0,0,0,0.25);
          overflow: hidden;
        }
        .hero-inner:before {
          content: "";
          position: absolute;
          inset: -1px;
          background: radial-gradient(circle at 20% 0%, rgba(71,214,173,0.18), transparent 45%),
                      radial-gradient(circle at 80% 100%, rgba(0,78,100,0.18), transparent 50%);
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(71,214,173,0.10);
          border: 1px solid rgba(71,214,173,0.18);
          color: var(--teal);
          font-weight: 900;
          letter-spacing: 0.6px;
          font-size: 13px;
        }

        .hero-title {
          margin: 14px 0 10px;
          font-size: 62px;
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          text-shadow: 0 18px 70px rgba(0,0,0,0.45);
        }

        .hero-desc {
          margin: 0;
          max-width: 820px;
          font-size: 18px;
          color: var(--muted);
          line-height: 1.9;
        }

        .hero-stats {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .stat {
          padding: 16px 16px 14px;
          border-radius: 22px;
          background: rgba(0,0,0,0.14);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .stat.accent {
          border-color: rgba(71,214,173,0.22);
          background: rgba(71,214,173,0.06);
        }
        .stat-num {
          font-size: 28px;
          font-weight: 900;
          color: #fff;
        }
        .stat-label {
          margin-top: 6px;
          color: rgba(234,255,249,0.78);
          font-weight: 700;
          font-size: 13px;
        }

        .scroll-hint {
          position: absolute;
          left: 22px;
          bottom: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0.9;
        }
        .scroll-hint .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(71,214,173,0.9);
          box-shadow: 0 0 0 8px rgba(71,214,173,0.08);
          animation: bounce 1.3s ease-in-out infinite;
        }
        .scroll-hint .line {
          width: 2px;
          height: 44px;
          background: rgba(71,214,173,0.35);
          border-radius: 999px;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        /* FEATURED */
        .featured {
          margin-top: 26px;
        }
        .featured-card {
          max-width: 440px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          border-radius: 32px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.02);
          box-shadow: 0 30px 110px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: transform 450ms ease, border-color 450ms ease, box-shadow 450ms ease;
        }
        .featured-card:hover {
          transform: translateY(-10px);
          border-color: rgba(71,214,173,0.22);
          box-shadow: 0 42px 140px rgba(0,0,0,0.45);
        }

        .featured-media {
          position: relative;
          height: 260px;
          overflow: hidden;
          background: rgba(0,0,0,0.18);
        }
        .featured-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.02);
          transition: transform 650ms ease, filter 650ms ease;
          filter: saturate(1.05) contrast(1.02);
        }
        .featured-card:hover .featured-img {
          transform: scale(1.08);
          filter: saturate(1.12) contrast(1.06);
        }
        .featured-placeholder {
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 72px;
        }
        .featured-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(3, 28, 38, 0.85),
            rgba(3, 28, 38, 0.10) 55%,
            rgba(3, 28, 38, 0.0)
          );
          pointer-events: none;
        }
        .featured-top {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 10px;
          z-index: 2;
        }

        .pill {
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          color: #fff;
        }
        .pill.ok {
          color: var(--teal);
          border-color: rgba(71,214,173,0.24);
        }
        .pill.danger {
          color: rgba(255, 170, 170, 0.95);
          border-color: rgba(255, 170, 170, 0.22);
        }
        .pill.ok2 {
          color: #fff;
          border-color: rgba(71,214,173,0.20);
          background: rgba(71,214,173,0.08);
        }

        .featured-content {
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .featured-title {
          margin: 0;
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          line-height: 1.3;
        }
        .featured-desc {
          margin: 0;
          color: rgba(234,255,249,0.78);
          line-height: 1.7;
          font-size: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .featured-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .meta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 14px;
          background: rgba(0,0,0,0.16);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(234,255,249,0.92);
          font-weight: 800;
          font-size: 12px;
        }
        .meta .ico {
          width: 18px;
          display: inline-flex;
          justify-content: center;
          opacity: 0.95;
        }

        .featured-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }
        .cta-primary {
          border: none;
          cursor: pointer;
          font-weight: 900;
          font-size: 14px;
          padding: 10px 14px;
          border-radius: 14px;
          color: var(--bg);
          background: linear-gradient(135deg, var(--teal) 0%, var(--teal2) 100%);
          box-shadow: 0 14px 32px rgba(37,161,142,0.25);
          transition: transform 220ms ease, box-shadow 220ms ease, filter 220ms ease;
        }
        .featured-card:hover .cta-primary {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow: 0 22px 60px rgba(37,161,142,0.32);
        }
        .cta-note {
          color: rgba(234,255,249,0.72);
          font-weight: 700;
          font-size: 13px;
        }

        /* GRID */
        .grid-wrap {
          margin-top: 46px;
        }
        .section-head {
          margin-bottom: 18px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
        }
        .section-title {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          color: #fff;
        }
        .section-sub {
          margin: 0;
          color: rgba(234,255,249,0.72);
          font-weight: 700;
          font-size: 13px;
        }

        .masonry {
          columns: 3 320px;
          column-gap: 18px;
        }
        .tile {
          break-inside: avoid;
          margin: 0 0 18px;
          border-radius: 26px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.02);
          box-shadow: 0 24px 90px rgba(0,0,0,0.28);
          cursor: pointer;
          transition: transform 420ms ease, border-color 420ms ease, box-shadow 420ms ease;
          position: relative;
          transition-delay: var(--d, 0ms);
        }
        .tile:hover {
          transform: translateY(-10px);
          border-color: rgba(71,214,173,0.22);
          box-shadow: 0 34px 120px rgba(0,0,0,0.42);
        }

        .tile-media {
          position: relative;
          height: 200px;
          background: rgba(0,0,0,0.16);
          overflow: hidden;
        }
        .tile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.02);
          transition: transform 650ms ease, filter 650ms ease;
          filter: saturate(1.04) contrast(1.02);
        }
        .tile:hover .tile-img {
          transform: scale(1.09);
          filter: saturate(1.12) contrast(1.06);
        }
        .tile-ph {
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 56px;
        }
        .tile-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(3,28,38,0.78),
            rgba(3,28,38,0.10) 55%,
            rgba(3,28,38,0.0)
          );
          pointer-events: none;
        }

        .tile-badges {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          gap: 10px;
          z-index: 2;
        }

        .badge {
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          color: #fff;
        }
        .badge.ok {
          color: var(--teal);
          border-color: rgba(71,214,173,0.24);
        }
        .badge.danger {
          color: rgba(255,170,170,0.95);
          border-color: rgba(255,170,170,0.22);
        }

        .tile-body {
          padding: 18px 18px 12px;
        }
        .tile-title {
          margin: 0 0 10px;
          font-size: 18px;
          font-weight: 900;
          color: #fff;
          line-height: 1.4;
        }
        .tile-desc {
          margin: 0 0 12px;
          color: rgba(234,255,249,0.72);
          line-height: 1.8;
          font-size: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tile-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 14px;
          background: rgba(0,0,0,0.16);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(234,255,249,0.9);
          font-weight: 800;
          font-size: 12px;
        }
        .chip .ico {
          width: 16px;
          display: inline-flex;
          justify-content: center;
          opacity: 0.95;
        }

        .tile-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px 16px;
          color: rgba(71,214,173,0.95);
          font-weight: 900;
          letter-spacing: 0.2px;
        }
        .arrow {
          transition: transform 260ms ease;
        }
        .tile:hover .arrow {
          transform: translateX(-6px);
        }

        .empty {
          color: rgba(234,255,249,0.76);
          font-weight: 800;
        }

        /* MODAL */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(10px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 220ms ease;
        }
        .modal-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .modal {
          width: min(1100px, 96vw);
          border-radius: 30px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(18px);
          box-shadow: 0 40px 140px rgba(0,0,0,0.55);
          transform: translateY(16px) scale(0.98);
          opacity: 0;
          transition: transform 240ms ease, opacity 240ms ease;
          position: relative;
        }
        .modal.open {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .modal-close {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 3;
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.18);
          color: #fff;
          cursor: pointer;
          font-weight: 900;
          transition: transform 200ms ease, background 200ms ease;
        }
        .modal-close:hover {
          transform: translateY(-2px);
          background: rgba(0,0,0,0.28);
        }

        .modal-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          min-height: 540px;
        }

        .modal-media {
          position: relative;
          background: rgba(0,0,0,0.18);
          overflow: hidden;
        }
        .modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.02);
          filter: saturate(1.06) contrast(1.03);
        }
        .modal-ph {
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 72px;
        }
        .modal-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(3,28,38,0.85),
            rgba(3,28,38,0.18) 55%,
            rgba(3,28,38,0.08)
          );
          pointer-events: none;
        }

        .modal-pills {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 10px;
          z-index: 2;
        }

        .modal-body {
  padding: 26px 26px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  max-height: 80vh;        /* يمنع التمدد خارج الشاشة */
  overflow-y: auto;        /* يفعّل التمرير */
  scroll-behavior: smooth; 
}

/* إخفاء السكروول في كروم + سفاري */
.modal-body::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

/* إخفاء السكروول في فايرفوكس */
.modal-body {
  scrollbar-width: none;
}

/* إخفاء السكروول في Edge */
.modal-body {
  -ms-overflow-style: none;
}

        .modal-kicker {
          color: rgba(71,214,173,0.92);
          font-weight: 900;
          font-size: 13px;
          letter-spacing: 0.5px;
        }
        .modal-title {
          margin: 6px 0 10px;
          font-size: 28px;
          font-weight: 900;
          color: #fff;
          line-height: 1.25;
        }
        .modal-desc {
          margin: 0;
          color: rgba(234,255,249,0.78);
          line-height: 1.9;
          font-size: 15px;
          max-height: 160px;
          overflow: auto;
          padding-left: 6px;
        }

        .modal-info {
          margin-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.10);
          padding-top: 14px;
          display: grid;
          gap: 10px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 26px 90px 1fr;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 18px;
          background: rgba(0,0,0,0.16);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .info-ico { width: 26px; display: inline-flex; justify-content: center; }
        .info-label { color: rgba(234,255,249,0.78); font-weight: 900; font-size: 13px; }
        .info-val { color: #fff; font-weight: 900; font-size: 13px; }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 8px;
        }

        .btn-primary {
          width: 100%;
          border: none;
          cursor: pointer;
          font-weight: 900;
          font-size: 15px;
          padding: 14px 16px;
          border-radius: 18px;
          color: var(--bg);
          background: linear-gradient(135deg, var(--teal) 0%, var(--teal2) 100%);
          box-shadow: 0 22px 60px rgba(37,161,142,0.30);
          transition: transform 220ms ease, filter 220ms ease, box-shadow 220ms ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow: 0 26px 70px rgba(37,161,142,0.36);
        }

        .btn-ghost {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          font-weight: 900;
          font-size: 14px;
          padding: 12px 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.03);
          color: rgba(234,255,249,0.90);
          transition: transform 220ms ease, background 220ms ease;
        }
        .btn-ghost:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.05);
        }

        .status {
          text-align: center;
          padding: 12px 14px;
          border-radius: 18px;
          font-weight: 900;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.03);
        }
        .status.ok {
          color: var(--teal);
          border-color: rgba(71,214,173,0.18);
          background: rgba(71,214,173,0.06);
        }
        .status.danger {
          color: rgba(255,170,170,0.95);
          border-color: rgba(255,170,170,0.18);
          background: rgba(255,170,170,0.06);
        }

        .modal-footnote {
          color: rgba(234,255,249,0.62);
          font-weight: 800;
          font-size: 12px;
        }
        .modal-footnote span {
          color: rgba(234,255,249,0.92);
          background: rgba(0,0,0,0.18);
          border: 1px solid rgba(255,255,255,0.10);
          padding: 2px 8px;
          border-radius: 10px;
          margin: 0 6px;
          display: inline-block;
        }

        @media (max-width: 1100px) {
          .page {
            margin-left: 0;
            padding-top: 120px;
          }
          .featured-card {
            max-width: 100%;
          }
          .featured-media {
            height: 320px;
          }
          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 860px) {
          .hero-title { font-size: 44px; }
          .hero-stats { grid-template-columns: 1fr; }
          .modal-grid { grid-template-columns: 1fr; }
          .modal { border-radius: 24px; }
          .modal-media { height: 260px; }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal] {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .glow, .orbs, .scroll-hint .dot {
            animation: none !important;
          }
          .featured-card, .tile, .cta-primary, .btn-primary, .btn-ghost {
            transition: none !important;
          }
        }
          .idea-step {
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255,255,255,0.04);
}

.idea-title {
  margin-bottom: 10px;
  font-weight: 900;
}

.idea-options {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.idea-btn {
  flex: 1;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.2);
  background: transparent;
  color: #fff;
  font-weight: 800;
}

.idea-btn.active {
  background: #47d6ad;
  color: #031c26;
}

.idea-textarea {
  width: 100%;
  min-height: 90px;
  border-radius: 14px;
  padding: 10px;
  background: rgba(0,0,0,0.3);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  margin-bottom: 10px;
}

      `}</style>
    </div>
  );
}