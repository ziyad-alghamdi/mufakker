"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";

export default function TopNavbar() {
  const path = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // حالة القائمة في الجوال

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (data) setRole(data.role);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) setRole(null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // إغلاق القائمة عند تغيير المسار (عند الضغط على رابط)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [path]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const links = [
    { name: "الرئيسية", href: "/" },
    { name: "من نحن", href: "/about" },
    { name: "الورش والدورات", href: "/courses" },
    { name: "المشاركة والهاكاثونات", href: "/events" },
  ];

  return (
    <header className={`top-nav ${isScrolled ? "scrolled" : ""} ${isMenuOpen ? "menu-open" : ""}`}>
      <div className="nav-wrapper">
        <div className="logo-section">
          <Image src="/q1.png" alt="Logo" width={120} height={120} priority className="nav-logo" />
        </div>

        {/* زر الهامبرغر للجوال */}
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
          <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
          <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
        </button>

        <nav className={`nav-links-container ${isMenuOpen ? "show" : ""}`}>
          <ul className="nav-list">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-item ${path === link.href ? "active" : ""}`}
                >
                  {link.name}
                  {path === link.href && <span className="nav-dot"></span>}
                </Link>
              </li>
            ))}

            {role === "admin" && (
              <li>
                <Link href="/admin" className={`nav-item admin-link ${path === "/admin" ? "active" : ""}`}>
                  الإدارة
                </Link>
              </li>
            )}
            
            {/* في الجوال: أزرار الدخول تظهر داخل القائمة */}
            <li className="mobile-auth-only">
               {user ? (
                <div className="mobile-user-actions">
                  <Link href="/dashboard" className="nav-item">الملف الشخصي</Link>
                  <button onClick={handleLogout} className="logout-btn">خروج</button>
                </div>
              ) : (
                <div className="mobile-guest-actions">
                  <Link href="/login" className="login-link">تسجيل دخول</Link>
                  <Link href="/signup" className="signup-btn">حساب جديد</Link>
                </div>
              )}
            </li>
          </ul>
        </nav>

        <div className="auth-section desktop-only">
          {user ? (
            <div className="user-actions">
              <Link href="/dashboard" className="nav-item profile-link">الملف الشخصي</Link>
              <button onClick={handleLogout} className="logout-btn">خروج</button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link href="/login" className="login-link">تسجيل دخول</Link>
              <Link href="/signup" className="signup-btn">حساب جديد</Link>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        body { margin-top: 100px; }

        .top-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 100px;
          z-index: 2000;
          display: flex;
          align-items: center;
          padding: 0 40px;
          transition: all 0.4s ease;
          direction: rtl;
        }

        .top-nav.scrolled { height: 85px; }

        .nav-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(3, 28, 38, 0.85);
          backdrop-filter: blur(15px);
          padding: 10px 25px;
          border-radius: 100px;
          border: 1px solid rgba(71, 214, 173, 0.2);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .nav-list {
          display: flex;
          list-style: none;
          gap: 10px;
          align-items: center;
        }

        .nav-item {
          text-decoration: none;
          color: rgba(234, 255, 249, 0.7);
          font-family: "Cairo", sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 10px 20px;
          border-radius: 50px;
          transition: 0.3s;
        }

        .nav-item:hover, .nav-item.active {
          color: #47d6ad;
          background: rgba(71, 214, 173, 0.1);
        }

        /* تنسيق زر الجوال */
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px;
        }

        .bar {
          width: 25px;
          height: 3px;
          background: #47d6ad;
          border-radius: 10px;
          transition: 0.3s;
        }

        .bar.open:nth-child(1) { transform: translateY(9px) rotate(45deg); }
        .bar.open:nth-child(2) { opacity: 0; }
        .bar.open:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }

        .mobile-auth-only { display: none; }

        /* Media Queries للشاشات الصغيرة */
        @media (max-width: 992px) {
          .top-nav { padding: 0 20px; }
          .desktop-only { display: none; }
          .mobile-menu-btn { display: flex; }

          .nav-links-container {
            position: absolute;
            top: 100%;
            left: 20px;
            right: 20px;
            background: rgba(3, 28, 38, 0.98);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 20px;
            border: 1px solid rgba(71, 214, 173, 0.2);
            display: none; /* مخفي افتراضياً */
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }

          .nav-links-container.show {
            display: block;
            animation: slideDown 0.3s ease-out;
          }

          .nav-list {
            flex-direction: column;
            width: 100%;
            gap: 15px;
          }

          .nav-item {
            display: block;
            text-align: center;
            width: 100%;
          }

          .mobile-auth-only {
            display: block;
            width: 100%;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 15px;
            margin-top: 5px;
          }

          .mobile-guest-actions, .mobile-user-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        }

        /* التنسيقات العامة المتبقية */
        .login-link { color: #47d6ad; text-decoration: none; font-weight: 700; }
        .signup-btn { background: #47d6ad; color: #031c26; padding: 10px 25px; border-radius: 50px; font-weight: 800; text-decoration: none; }
        .logout-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px 18px; border-radius: 50px; cursor: pointer; }
        .nav-logo { height: 40px; width: auto; }
      `}</style>
    </header>
  );
}