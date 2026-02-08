"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // حالة إظهار كلمة المرور
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("❌ فشل تحديث كلمة المرور: " + error.message);
    } else {
      setMessage("✔️ تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="bg-overlay"></div>
      <div className="glow-accent"></div>

      <div className="glass-card">
        <h1 className="title">تحديث كلمة المرور</h1>
        <p className="subtitle">أدخل كلمة المرور الجديدة الخاصة بك أدناه</p>

        {message && (
          <div className={`alert ${message.startsWith("✔️") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="form">
          <div className="input-group">
            <label>كلمة المرور الجديدة</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
          </button>
        </form>

        <div className="footer-link">
          <Link href="/login">العودة لتسجيل الدخول</Link>
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
          box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5);
        }

        .title { color: #fff; font-size: 32px; font-weight: 900; text-align: center; margin-bottom: 8px; }
        .subtitle { color: rgba(255, 255, 255, 0.4); text-align: center; font-size: 15px; margin-bottom: 35px; }

        .form { display: flex; flex-direction: column; gap: 25px; }

        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-wrapper input {
          width: 100%;
          padding: 18px 50px 18px 18px; /* مساحة للأيقونة من جهة اليسار (أو اليمين حسب التنسيق) */
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          color: #ffffff;
          font-size: 16px;
          outline: none;
        }

        .toggle-password {
          position: absolute;
          left: 15px; /* وضع الأيقونة يساراً لأن الحقل RTL */
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.3);
          padding: 0;
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
        }

        .alert { padding: 14px; border-radius: 12px; text-align: center; margin-bottom: 20px; font-weight: 700; }
        .alert.error { background: rgba(255, 82, 82, 0.1); color: #ff5252; }
        .alert.success { background: rgba(71, 214, 173, 0.1); color: #47D6AD; }

        .footer-link { margin-top: 30px; text-align: center; }
        .footer-link a { color: #47d6ad; text-decoration: none; font-weight: 700; }
      `}</style>
    </div>
  );
}