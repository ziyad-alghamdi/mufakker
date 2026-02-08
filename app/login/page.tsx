"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // حالة إظهار كلمة المرور
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
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  /* أيقونة العين المشطوبة */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  /* أيقونة العين المفتوحة */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.245 7.248 5.5 12 5.5s8.587 2.745 9.964 6.178c.07.245.07.492 0 .737C20.587 15.755 16.752 18.5 12 18.5s-8.587-2.745-9.964-6.177z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <div className="forgot-password">
          <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
        </div>

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
          background-color: #020d12;
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
          background: radial-gradient(circle, rgba(71, 214, 173, 0.1) 0%, transparent 70%);
          z-index: 2;
          filter: blur(50px);
        }

        .glass-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          background: rgba(15, 34, 43, 0.65);
          backdrop-filter: blur(25px);
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 60px 45px;
          box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .title { color: #ffffff; font-size: 32px; font-weight: 900; text-align: center; margin-bottom: 8px; }
        .subtitle { color: rgba(255, 255, 255, 0.4); text-align: center; font-size: 15px; margin-bottom: 35px; }

        .form { display: flex; flex-direction: column; gap: 25px; }
        .input-group { display: flex; flex-direction: column; gap: 10px; }
        label { color: rgba(255, 255, 255, 0.7); font-size: 14px; font-weight: 600; margin-right: 8px; }

        .password-wrapper { position: relative; display: flex; align-items: center; }
        .password-wrapper input { width: 100%; padding: 18px 50px 18px 18px; }

        input {
          padding: 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          color: #ffffff;
          font-size: 16px;
          outline: none;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #47d6ad;
          box-shadow: 0 0 15px rgba(71, 214, 173, 0.2);
        }

        .toggle-password {
          position: absolute;
          left: 15px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          transition: 0.3s;
        }

        .toggle-password:hover { color: #47d6ad; }
        .icon { width: 22px; height: 22px; }

        .btn-submit {
          padding: 18px;
          background: #47d6ad;
          color: #031c26;
          border: none;
          border-radius: 20px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 10px 20px rgba(71, 214, 173, 0.2);
        }

        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .alert { padding: 14px; border-radius: 12px; text-align: center; margin-bottom: 20px; font-size: 14px; font-weight: 700; }
        .alert.error { background: rgba(255, 82, 82, 0.1); color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.2); }
        .alert.success { background: rgba(71, 214, 173, 0.1); color: #47D6AD; border: 1px solid rgba(71, 214, 173, 0.2); }

        .forgot-password { margin-top: 15px; text-align: center; }
        .forgot-password a { color: rgba(255, 255, 255, 0.5); font-size: 14px; text-decoration: none; transition: 0.3s; }
        .forgot-password a:hover { color: #47d6ad; }

        .footer-link { margin-top: 30px; text-align: center; color: rgba(255, 255, 255, 0.4); font-size: 15px; }
        .footer-link a { color: #47d6ad; text-decoration: none; font-weight: 700; }
        .footer-link a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}