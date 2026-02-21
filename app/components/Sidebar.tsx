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
    <header className={`top-nav ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-wrapper">
        <div className="logo-section">
          <Image src="/q1.png" alt="Logo" width={120} height={120} priority className="nav-logo" />
        </div>

        <nav className="nav-links-container">
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
          </ul>
        </nav>

        <div className="auth-section">
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

        /* التعديل المهم هنا: دفع محتوى الصفحة للأسفل لتبدأ بعد الناف بار */
        body {
          margin-top: 100px; 
        }

        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 100px;
          z-index: 2000;
          display: flex;
          align-items: center;
          padding: 0 40px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          direction: rtl;
        }

        .top-nav.scrolled {
          height: 85px;
        }

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
          margin: 0;
          padding: 0;
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
          transition: 0.3s ease;
          position: relative;
        }

        .nav-item:hover {
          color: #47d6ad;
          background: rgba(71, 214, 173, 0.1);
        }

        .nav-item.active {
          color: #47d6ad !important;
          background: rgba(71, 214, 173, 0.15);
        }

        .nav-dot {
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #47d6ad;
          border-radius: 50%;
          box-shadow: 0 0 10px #47d6ad;
        }

        .auth-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-link {
          text-decoration: none;
          color: #47d6ad;
          font-family: "Cairo", sans-serif;
          font-weight: 700;
          font-size: 14px;
          padding: 10px 20px;
          transition: 0.3s;
        }

        .signup-btn {
          background: #47d6ad;
          color: #031c26;
          text-decoration: none;
          padding: 10px 25px;
          border-radius: 50px;
          font-family: "Cairo", sans-serif;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 4px 15px rgba(71, 214, 173, 0.3);
          transition: 0.3s ease;
        }

        .signup-btn:hover {
          background: #3bc29c;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(71, 214, 173, 0.5);
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          cursor: pointer;
          padding: 8px 18px;
          border-radius: 50px;
          font-family: "Cairo", sans-serif;
          font-weight: 700;
          transition: 0.3s;
        }

        .nav-logo {
          height: 40px;
          width: auto;
        }

        @media (max-width: 992px) {
          .nav-links-container { display: none; }
          body { margin-top: 80px; } /* تصغير المسافة في الجوال */
        }
      `}</style>
    </header>
  );
}