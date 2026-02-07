"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("❌ " + error.message);
      setLoading(false);
      return;
    }

    setMessage("✔️ تم تسجيل الدخول بنجاح!");
    setLoading(false);
    window.location.href = "/dashboard";
  }

  return (
    <div className="auth-page">
      {/* طبقات الخلفية */}
      <div className="bg-overlay"></div>
      <div className="glow-accent"></div>

      <div className="glass-card">
        <h1 className="title">تسجيل الدخول</h1>
        <p className="subtitle">مرحباً بك مجدداً في مجتمع مفكر</p>

        {message && (
          <div className={`alert ${message.startsWith("✔️") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="form">
          <div className="input-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="input-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <div className="footer-link">
          ما عندك حساب؟ <Link href="/signup">إنشاء حساب</Link>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .auth-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #031c26;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(11, 42, 65, 0.4), #03151d);
          z-index: 1;
        }

        .glow-accent {
          position: absolute;
          width: 500px;
          height: 500px;
          top: -150px;
          left: -150px;
          background: radial-gradient(circle, rgba(71, 214, 173, 0.12) 0%, transparent 70%);
          z-index: 2;
          filter: blur(50px);
        }

        .glass-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 450px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(25px);
          border-radius: 35px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 50px 40px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
        }

        .title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 8px;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          font-size: 15px;
          margin-bottom: 35px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 600;
          margin-right: 5px;
        }

        input {
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          outline: none;
          transition: background-color 0.25s ease, font-size 0.25s ease, box-shadow 0.25s ease;

        }

        /* عند الكتابة أو التركيز */
        input:focus,
        input:not(:placeholder-shown) {
          background: #ffffff;
          color: #000000;
          font-size: 18px; /* أكبر فقط بدون بولد */
          font-weight: 400;
          border-color: #47D6AD;
          box-shadow: 0 0 12px rgba(71, 214, 173, 0.25);
        }

          input::placeholder {
            color: rgba(0, 0, 0, 0.4);
            transition: opacity 0.2s ease;
          }

          input:focus::placeholder {
            opacity: 0;
          }


        .btn-submit {
          margin-top: 10px;
          padding: 16px;
          background: linear-gradient(135deg, #47D6AD, #25A18E);
          color: #031c26;
          border: none;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(71, 214, 173, 0.2);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 15px 30px rgba(71, 214, 173, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert {
          padding: 14px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 700;
        }

        .alert.error { 
          background: rgba(255, 82, 82, 0.1); 
          color: #ff5252; 
          border: 1px solid rgba(255, 82, 82, 0.2); 
        }
        
        .alert.success { 
          background: rgba(71, 214, 173, 0.1); 
          color: #47D6AD; 
          border: 1px solid rgba(71, 214, 173, 0.2); 
        }

        .footer-link {
          margin-top: 30px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 15px;
        }

        .footer-link a {
          color: #47D6AD;
          text-decoration: none;
          font-weight: 700;
          transition: 0.3s;
        }

        .footer-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}