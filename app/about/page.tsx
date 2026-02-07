"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import Footer from "../components/FooterBar";


export default function AboutPage() {
  const [loading, setLoading] = useState(true);

  // محاكاة تحميل البيانات لظهور اللودر
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // سيظهر اللودر لمدة ثانية ونصف تقريباً
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p className="loading-text">جاري جلب المعلومات...</p>

      <style jsx>{`
        .loading-screen {
          height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #031c26;
          font-family: 'Cairo', sans-serif;
        }
        .loader {
          position: relative;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(45deg, transparent, transparent 40%, #47D6AD);
          animation: animate 2s linear infinite;
        }
        @keyframes animate {
          0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
          100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
        }
        .loader:before {
          content: '';
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          bottom: 6px;
          background: #031c26;
          border-radius: 50%;
          z-index: 1000;
        }
        .loader:after {
          content: '';
          position: absolute;
          inset: 0px;
          background: linear-gradient(45deg, transparent, transparent 40%, #47D6AD);
          border-radius: 50%;
          z-index: 1;
          filter: blur(30px);
        }
        .loading-text {
          margin-top: 30px;
          color: #47D6AD;
          font-weight: 700;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );

  return (
    <div className="about-page">
      {/* طبقات الخلفية الديناميكية */}
      <div className="animated-bg">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <Sidebar />
      <BackButton />

      <div className="content">
        <header className="header-section">
          <span className="subtitle">تعرف على عالمنا</span>
          <h1 className="title">من نحن</h1>
          <div className="title-underline"></div>
        </header>

        <p className="desc">
          مفكِّر هو <span className="highlight">مجتمع شبابي رائد</span> يهدف إلى إعادة صياغة مهارات التفكير، الإبداع، وحل المشكلات بطرق غير تقليدية. نؤمن أن كل فكرة عظيمة تبدأ بشرارة، ونحن هنا لنصنع المسار الذي يحوّل تلك الشرارات إلى واقع ملموس يغير المستقبل.
        </p>

        <div className="cards-container">
          <div className="card glass-card">
            <div className="card-icon">🚀</div>
            <h3>رسالتنا</h3>
            <p>
              تمكين الأفراد من تنمية مهارات التفكير والابتكار من خلال ورش عملية وتجارب تطبيقية في بيئة محفزة تجمع بين المتعة والفائدة.
            </p>
          </div>

          <div className="card glass-card">
            <div className="card-icon">👁️</div>
            <h3>رؤيتنا</h3>
            <p>
              أن نكون المنصة الأولى عالمياً لاحتضان العقول الشابة المبدعة، ومساعدتها على اكتشاف إمكانياتها القصوى لصناعة غدٍ أفضل.
            </p>
          </div>

          <div className="card glass-card accent-card">
            <div className="card-icon">💎</div>
            <h3>قيمنا</h3>
            <ul className="values-list">
              <li><span>✦</span> الإبداع المستمر</li>
              <li><span>✦</span> التفكير النقدي العميق</li>
              <li><span>✦</span> التجربة والتعلم بالعمل</li>
              <li><span>✦</span> روح الفريق والتعاون</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .about-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow-x: hidden;
          background: #031c26;
          color: #eafff9;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
        }

        .animated-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: radial-gradient(circle at center, #0b2a41 0%, #031c26 100%);
        }

        .particle {
          position: absolute;
          background: rgba(71, 214, 173, 0.4);
          border-radius: 50%;
          filter: blur(5px);
          animation: moveParticles 20s infinite linear;
        }

        .p1 { width: 150px; height: 150px; top: 10%; left: 20%; animation-duration: 25s; }
        .p2 { width: 250px; height: 250px; bottom: 15%; right: 10%; animation-duration: 35s; opacity: 0.2; }
        .p3 { width: 100px; height: 100px; top: 50%; left: 50%; animation-duration: 20s; opacity: 0.3; }

        @keyframes moveParticles {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(100px, -50px) rotate(180deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }

        .bg-glow-1, .bg-glow-2 {
          position: absolute;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.2;
        }

        .bg-glow-1 { background: #47d6ad; top: -200px; right: -200px; animation: pulseGlow 10s infinite alternate; }
        .bg-glow-2 { background: #004e64; bottom: -200px; left: -200px; animation: pulseGlow 12s infinite alternate-reverse; }

        @keyframes pulseGlow {
          0% { opacity: 0.1; transform: scale(1); }
          100% { opacity: 0.3; transform: scale(1.2); }
        }

        .content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto 0 280px;
          padding: 80px 40px;
        }

        .header-section { margin-bottom: 50px; }
        .subtitle { color: rgba(71, 214, 173, 1); font-weight: 700; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 10px; }
        .title { font-size: 56px; font-weight: 900; margin: 0; background: linear-gradient(90deg, #fff, #e4e4e4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .title-underline { width: 80px; height: 6px; background: #47d6ad; border-radius: 10px; margin-top: 15px; }
        .desc { font-size: 22px; line-height: 1.8; max-width: 850px; color: rgba(234, 255, 249, 0.85); margin-bottom: 60px; }
        .highlight { color: #d2d8d6ff; font-weight: 700; }

        .cards-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 28px;
          padding: 40px;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .glass-card:hover { transform: translateY(-12px); border-color: rgba(71, 214, 173, 0.3); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4); }
        .card-icon { font-size: 45px; margin-bottom: 20px; display: block; }
        .glass-card h3 { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 15px; }
        .glass-card p { color: rgba(234, 255, 249, 0.65); font-size: 17px; line-height: 1.7; }

        .values-list { list-style: none; padding: 0; }
        .values-list li { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-weight: 600; color: #95d6c4ff; }

        @media (max-width: 1200px) { .content { margin-left: 0; padding-top: 120px; } }
        @media (max-width: 768px) { .title { font-size: 42px; } .desc { font-size: 19px; } }
      `}</style>
    </div>
  );
}