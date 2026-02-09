"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";

export default function Sidebar() {
  const path = usePathname();
  const [role, setRole] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchUserRole() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", auth.user.id)
        .single();

      if (data) setRole(data.role);
    }

    fetchUserRole();
  }, []);

  // وظيفة لتبديل حالة السايد بار (فتح/إغلاق) عند الضغط على نفس الزر
  const toggleSidebar = () => {
    setOpen(!open);
  };

  const links = [
    { name: "حسابي الشخصي", href: "/dashboard" },
    { name: "من نحن", href: "/about" },
    { name: "الورش والدورات", href: "/workshops" },
    { name: "المشاركة والهاكاثونات", href: "/events" },
  ];

  return (
    <>
      {/* تم تغيير onClick لتنفيذ وظيفة التبديل toggleSidebar */}
      <button className={`sidebar-toggle ${open ? "is-open" : ""}`} onClick={toggleSidebar}>
        <span className="burger-icon">{open ? "✕" : "☰"}</span>
      </button>

      {/* الإغلاق عند الضغط خارج السايد بار (Overlay) */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-scrollable-content">
          <div className="logo-box">
            <div className="logo-glow"></div>
            <Image
              src="/q1.png"
              alt="Mufakker Logo"
              width={160}
              height={160}
              priority
              className="main-logo"
            />
          </div>

          <nav className="nav-container">
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={path === link.href ? "active" : ""}
                    onClick={() => setOpen(false)}
                  >
                    <span className="link-text">{link.name}</span>
                    {path === link.href && <span className="active-dot"></span>}
                  </Link>
                </li>
              ))}

              {role === "admin" && (
                <li>
                  <Link
                    href="/admin"
                    className={`admin-link ${path === "/admin" ? "active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    لوحة تحكم المسؤولين
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <Link href="/login" className="logout-link" onClick={() => setOpen(false)}>
              <span>تسجيل الخروج</span>
            </Link>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .sidebar-toggle {
          position: fixed;
          top: calc(25px + env(safe-area-inset-top, 0px));
          right: calc(25px + env(safe-area-inset-right, 0px));
          z-index: 9999; 
          background: rgba(37, 161, 142, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          -webkit-tap-highlight-color: transparent;
        }

        /* تغيير شكل الزر عند الفتح ليبرز أكثر أو يتغير لونه */
        .sidebar-toggle.is-open {
          background: #ef4444; /* لون أحمر خفيف عند الإغلاق أو يمكن تركه كما هو */
          transform: rotate(90deg);
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 28, 38, 0.7);
          backdrop-filter: blur(6px);
          z-index: 1100;
        }

        .sidebar {
          width: 300px;
          height: 100vh;
          background: linear-gradient(180deg, #0b2a41 0%, #031c26 100%);
          position: fixed;
          top: 0;
          right: 0;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1150;
          display: flex;
          flex-direction: column;
          font-family: "Cairo", sans-serif;
          border-left: 2px solid rgba(71, 214, 173, 0.5); 
          box-shadow: -5px 0 15px rgba(71, 214, 173, 0.1);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-scrollable-content {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
        }

        /* ... باقي التنسيقات (Scrollbar, Logo, Nav, الخ) تبقى كما هي ... */
        .sidebar-scrollable-content::-webkit-scrollbar { width: 5px; }
        .sidebar-scrollable-content::-webkit-scrollbar-thumb { background: rgba(71, 214, 173, 0.2); border-radius: 10px; }

        .logo-box {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 50px;
          padding: 20px 0;
          flex-shrink: 0;
        }

        .logo-glow {
          position: absolute;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(71, 214, 173, 0.15) 0%, transparent 70%);
        }

        .nav-container { flex: 1; }
        .sidebar ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }

        .sidebar a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          font-size: 17px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 14px;
          color: rgba(234, 255, 249, 0.6);
          transition: 0.3s all ease;
        }

        .sidebar a:hover { background: rgba(255, 255, 255, 0.03); color: #47d6ad; }
        .sidebar a.active { background: linear-gradient(90deg, rgba(37, 161, 142, 0.2) 0%, transparent 100%); color: #47d6ad; border-right: 4px solid #47d6ad; }
        .active-dot { width: 6px; height: 6px; background: #47d6ad; border-radius: 50%; box-shadow: 0 0 10px #47d6ad; }

        .sidebar-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }

        .logout-link {
          background: rgba(239, 68, 68, 0.05) !important;
          color: #ef4444 !important;
          justify-content: center !important;
          border: 1px solid rgba(239, 68, 68, 0.1) !important;
        }

        @media (max-width: 480px) {
          .sidebar-toggle { top: 15px; right: 15px; width: 45px; height: 45px; }
        }
      `}</style>
    </>
  );
}