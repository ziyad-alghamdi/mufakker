"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="home-page">
      {/* طبقات الخلفية العميقة */}
      <div className="bg-overlay"></div>
      <div className="glow-top-left"></div>
      <div className="glow-bottom-right"></div>
      
      {/* المحتوى الزجاجي */}
      <div className="glass-card">
        <h1 className="title">مرحباً بك في مجتمع <span>Mufakker</span></h1>

        <p className="subtitle">
          مجتمع يطوّر مهارات التفكير، الإبداع، وحل المشكلات
          من خلال ورش، دورات، ومسارات تطبيقية للشباب.
        </p>

        <div className="action-area">
          <Link href="/signup" className="btn-main">إنشاء حساب</Link>
          <Link href="/login" className="btn-outline">تسجيل دخول</Link>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .home-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          background-color: #031c26; /* لون خلفية عميق */
          font-family: 'Cairo', sans-serif;
          direction: rtl;
        }

        /* توزيع الإضاءة الخلفية (Ambient Light) */
        .bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(11, 42, 65, 0.4), #03151d);
          z-index: 1;
        }

        .glow-top-left {
          position: absolute;
          width: 600px;
          height: 600px;
          top: -150px;
          left: -150px;
          background: radial-gradient(circle, rgba(71, 214, 173, 0.15) 0%, transparent 70%);
          z-index: 2;
          filter: blur(60px);
        }

        .glow-bottom-right {
          position: absolute;
          width: 500px;
          height: 500px;
          bottom: -100px;
          right: -100px;
          background: radial-gradient(circle, rgba(37, 161, 142, 0.1) 0%, transparent 70%);
          z-index: 2;
          filter: blur(60px);
        }

        /* البطاقة الزجاجية - Glassmorphism */
        .glass-card {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 700px;
          width: 90%;
          padding: 60px 40px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
        }

        /* العناوين */
        .title {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .title span {
          color: #47D6AD;
          display: inline-block;
          position: relative;
        }

        .subtitle {
          font-size: clamp(16px, 3vw, 19px);
          color: rgba(233, 247, 244, 0.8);
          line-height: 1.8;
          margin-bottom: 45px;
          max-width: 550px;
          margin-left: auto;
          margin-right: auto;
        }

        /* الأزرار */
        .action-area {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
        }

        .btn-main {
          padding: 14px 45px;
          background: #47D6AD;
          color: #031c26;
          border-radius: 16px;
          font-weight: 700;
          font-size: 17px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(71, 214, 173, 0.3);
        }

        .btn-main:hover {
          transform: translateY(-3px);
          background: #5ef3c8;
          box-shadow: 0 15px 30px rgba(71, 214, 173, 0.4);
        }

        .btn-outline {
          padding: 14px 45px;
          background: transparent;
          color: #ffffff;
          border-radius: 16px;
          font-weight: 600;
          font-size: 17px;
          text-decoration: none;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.6);
          transform: translateY(-3px);
        }

        /* تحسين الاستجابة للموبايل */
        @media (max-width: 600px) {
          .action-area {
            flex-direction: column;
            width: 100%;
          }
          .btn-main, .btn-outline {
            width: 100%;
          }
          .glass-card {
            padding: 40px 20px;
          }
        }
      `}</style>
    </div>
  );
}