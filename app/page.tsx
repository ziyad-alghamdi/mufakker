"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TopNavbar from "./components/Sidebar"; 
import Footer from "./components/FooterBar";


export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-container">
      {/* Background Elements */}
      <div className="bg-gradient-sphere sphere-1"></div>
      <div className="bg-gradient-sphere sphere-2"></div>
      <div className="bg-gradient-sphere sphere-3"></div>
      <div className="grid-overlay"></div>
<TopNavbar/>
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? "nav-scrolled" : ""}`}>
        <div className="nav-content">
          <div className="logo-container">
            <span className="logo-text">مُفكِّر</span>
            <div className="logo-dot"></div>
          </div>
          <div className="nav-links">
            <Link href="/login" className="nav-link">تسجيل الدخول</Link>
            <Link href="/signup" className="nav-btn">حساب جديد</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-content">
          <div className="badge-wrapper">
            <span className="badge">
              <span className="badge-dot"></span>
             مسـاحتك للإبـتكـار وصـنع المـستقبـل
            </span>
          </div>
          
          <h1 className="hero-title">
            نصنع <span>المستقبل</span> عبر تطوير الإبداع وحل المشكلات
          </h1>
          
          <p className="hero-subtitle">
            مجتمع تفاعلي يجمع العقول النيرة لتبادل الأفكار، صقل المهارات، والمشاركة في مسارات تطبيقية وورش عمل مصممة خصيصاً لتنمية تفكيرك.
          </p>

          {/* الزر الجديد المضاف */}
          <div className="main-join-action">
             <Link href="/signup" className="btn-join-community">
                سجل معنا وانضم إلى مجتمع المفكِّـرين
             </Link>
          </div>

          <div className="hero-actions">
            <Link href="/login" className="btn-primary">
              ابدأ رحلتك الآن
              <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Link>
            <Link href="/about" className="btn-secondary">
              تعرف علينا أكثر
            </Link>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">+100</span>
              <span className="stat-label">عضو نشط</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">+5</span>
              <span className="stat-label">مسار تدريبي</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">4/5</span>
              <span className="stat-label">تقييم المتدربين</span>
            </div>
          </div>
        </div>
        
      </main>
      <h1>.</h1>
<Footer/>
      <style jsx global>{`
        /* ... الأكواد السابقة كما هي ... */
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

        :root {
          --primary: #47D6AD;
          --primary-hover: #36b893;
          --bg-dark: #020b12;
          --bg-card: rgba(18, 34, 48, 0.4);
          --text-main: #ffffff;
          --text-muted: #94a3b8;
          --border-color: rgba(255, 255, 255, 0.08);
        }

        body {
          margin: 0;
          padding: 0;
          background-color: var(--bg-dark);
          color: var(--text-main);
          font-family: 'Cairo', sans-serif;
          overflow-x: hidden;
        }

        .landing-container {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          direction: rtl;
        }

        /* --- Background Effects --- */
        .bg-gradient-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 0;
          opacity: 0.6;
          animation: float 20s ease-in-out infinite alternate;
        }

        .sphere-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(71, 214, 173, 0.15) 0%, transparent 70%);
          top: -200px;
          right: -100px;
          animation-delay: 0s;
        }

        .sphere-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(55, 136, 205, 0.15) 0%, transparent 70%);
          bottom: 10%;
          left: -150px;
          animation-delay: -5s;
        }

        .sphere-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(138, 71, 214, 0.1) 0%, transparent 70%);
          top: 40%;
          left: 30%;
          animation-delay: -10s;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
          mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
        }

        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
          100% { transform: translateY(20px) scale(0.95); }
        }

        /* --- Navbar --- */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 50;
          display: flex;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border-bottom: 1px solid transparent;
        }

        .nav-scrolled {
          background: rgba(2, 11, 18, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          height: 70px;
        }

        .nav-content {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-text {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .logo-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          box-shadow: 0 0 15px var(--primary);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          color: var(--text-main);
          text-decoration: none;
          font-weight: 500;
          font-size: 16px;
          transition: color 0.3s ease;
          position: relative;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }

        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .nav-btn {
          padding: 10px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: #fff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .nav-btn:hover {
          background: rgba(71, 214, 173, 0.1);
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
        }

        /* --- Hero Section --- */
        .hero {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 120px 24px 60px;
        }

        .hero-content {
          max-width: 800px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* تنسيق الزر الجديد */
        .main-join-action {
          margin-bottom: 32px;
          animation: fadeUp 0.8s ease-out 0.5s both;
        }

        .btn-join-community {
          display: inline-block;
          padding: 12px 32px;
          background: rgba(71, 214, 173, 0.1);
          border: 2px solid var(--primary);
          color: var(--primary);
          text-decoration: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 18px;
          transition: all 0.4s ease;
        }

        .btn-join-community:hover {
          background: var(--primary);
          color: var(--bg-dark);
          box-shadow: 0 0 30px rgba(71, 214, 173, 0.4);
          transform: scale(1.05);
        }

        .badge-wrapper {
          margin-bottom: 32px;
          animation: fadeDown 0.8s ease-out;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(71, 214, 173, 0.08);
          border: 1px solid rgba(71, 214, 173, 0.2);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--primary);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(71, 214, 173, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(71, 214, 173, 0); }
          100% { box-shadow: 0 0 0 0 rgba(71, 214, 173, 0); }
        }

        .hero-title {
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 900;
          line-height: 1.2;
          margin: 0 0 24px;
          letter-spacing: -1px;
          animation: fadeUp 0.8s ease-out 0.2s both;
        }

        .hero-title span {
          background: linear-gradient(135deg, #47D6AD 0%, #3788cd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }

        .hero-subtitle {
          font-size: clamp(16px, 2vw, 20px);
          color: var(--text-muted);
          line-height: 1.7;
          margin: 0 0 48px;
          max-width: 600px;
          animation: fadeUp 0.8s ease-out 0.4s both;
        }

        .hero-actions {
          display: flex;
          gap: 20px;
          margin-bottom: 60px;
          animation: fadeUp 0.8s ease-out 0.6s both;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 36px;
          background: linear-gradient(135deg, var(--primary) 0%, #36b893 100%);
          color: #020b12;
          font-weight: 700;
          font-size: 18px;
          text-decoration: none;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(71, 214, 173, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 35px rgba(71, 214, 173, 0.4);
        }

        .btn-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .btn-primary:hover .btn-icon {
          transform: translateX(-4px);
        }

        .btn-secondary {
          padding: 16px 36px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: #fff;
          font-weight: 600;
          font-size: 18px;
          text-decoration: none;
          border-radius: 16px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px);
        }

        .stats-row {
          display: flex;
          align-items: center;
          gap: 40px;
          padding: 30px 50px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          animation: fadeUp 0.8s ease-out 0.8s both;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border-color);
        }

        /* Animations */
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-content { padding: 0 16px; }
          .nav-links { gap: 16px; }
          .nav-btn { display: none; }
          
          .hero { padding: 100px 16px 40px; }
          .hero-actions { 
            flex-direction: column;
            width: 100%;
            max-width: 320px;
          }
          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
            text-align: center;
          }

          .stats-row {
            flex-direction: column;
            gap: 24px;
            padding: 24px;
            width: 100%;
            max-width: 320px;
          }
          .stat-divider {
            width: 80%;
            height: 1px;
          }
        }
      `}</style>
    </div>
  );
}