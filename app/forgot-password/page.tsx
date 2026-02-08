"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://mufakker-ivory.vercel.app/reset-password",
    });

    if (error) {
      setMessage("❌ حصل خطأ، تأكد من صحة البريد الإلكتروني");
    } else {
      setMessage("✔️ تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* طبقات الخلفية والوهج */}
      <div className="bg-overlay"></div>
      <div className="glow-accent"></div>

      <div className="glass-card">
        <h1 className="title">استعادة كلمة المرور</h1>
        <p className="subtitle">أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين</p>

        {message && (
          <div className={`alert ${message.startsWith("✔️") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="form">
          <div className="input-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "جاري الإرسال..." : "إرسال الرابط"}
          </button>
        </form>

        <div className="footer-link">
          تذكرت كلمة المرور؟ <Link href="/login">تسجيل الدخول</Link>
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

        .title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 900;
          text-align: center;
          margin-bottom: 8px;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          font-size: 15px;
          margin-bottom: 35px;
          line-height: 1.6;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 600;
          margin-right: 8px;
        }

        input {
          padding: 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          color: #ffffff;
          font-size: 16px;
          outline: none;
          transition: 0.3s;
        }

        input:focus {
          border-color: #47d6ad;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 15px rgba(71, 214, 173, 0.2);
        }

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

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .btn-submit:disabled {
          opacity: 0.5;
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

        .alert.error { background: rgba(255, 82, 82, 0.1); color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.2); }
        .alert.success { background: rgba(71, 214, 173, 0.1); color: #47D6AD; border: 1px solid rgba(71, 214, 173, 0.2); }

        .footer-link {
          margin-top: 35px;
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 15px;
        }

        .footer-link a {
          color: #47d6ad;
          text-decoration: none;
          font-weight: 700;
          margin-right: 5px;
        }

        .footer-link a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}