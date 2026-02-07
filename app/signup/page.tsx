"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function SignupPage() {
  const [fullNameAr, setFullNameAr] = useState("");
  const [fullNameEn, setFullNameEn] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [otherUniversity, setOtherUniversity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const universities = [
    "جامعة الملك عبدالعزيز",
    "جامعة أم القرى",
    "جامعة الملك سعود",
    "جامعة الإمام محمد بن سعود الإسلامية",
    "جامعة الملك فهد للبترول والمعادن",
    "جامعة جدة",
    "جامعة طيبة",
    "جامعة الأمير مقرن",
    "جامعة دار الحكمة",
    "الكلية الصناعية بينبع",
    "الكلية الصناعية بالجبيل",
    "أخرى",
  ];

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // 1. التحقق من صحة رقم الجوال
    if (!phone.startsWith("05") || phone.length !== 10) {
      setMessage("❌ رقم الجوال يجب أن يبدأ بـ 05 ويكون 10 خانات");
      setLoading(false);
      return;
    }

    // 2. التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
      setMessage("❌ كلمة المرور غير متطابقة");
      setLoading(false);
      return;
    }

    const finalUniversity = university === "أخرى" ? otherUniversity : university;

    // 3. عملية التسجيل وإرسال البيانات كـ Metadata ليعالجها الـ Trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name_ar: fullNameAr,
          full_name_en: fullNameEn,
          phone: phone,
          university: finalUniversity,
          // ملاحظة: الـ role والـ progress يتم وضعهم كـ default في قاعدة البيانات
        },
      },
    });

    if (error) {
      setMessage("❌ " + error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setMessage("✔️ تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتأكيد الحساب.");
      // تفريغ الحقول بعد النجاح (اختياري)
      setFullNameAr("");
      setFullNameEn("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="bg-overlay"></div>
      <div className="glow-top-right"></div>
      
      <div className="glass-card">
        <h1 className="title">إنشاء حساب</h1>
        <p className="subtitle">انضم إلى مجتمع مفكر وكن جزءاً من المستقبل</p>

        {message && (
          <div className={`alert ${message.startsWith("✔️") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="form">
          <div className="input-row">
            <div className="input-group">
              <label>الاسم الثلاثي (عربي)</label>
              <input
                value={fullNameAr}
                onChange={(e) => setFullNameAr(e.target.value)}
                required
                placeholder="زياد محمد الغامدي"
              />
            </div>
            <div className="input-group">
              <label>الاسم الثلاثي (إنجليزي)</label>
              <input
                value={fullNameEn}
                onChange={(e) => setFullNameEn(e.target.value)}
                required
                placeholder="Ziyad Mohammed"
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>الإيميل</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>
            <div className="input-group">
              <label>رقم الجوال</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="05XXXXXXXX"
              />
            </div>
          </div>

          <div className="input-group">
            <label>الجامعة</label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            >
              <option value="">اختر الجامعة</option>
              {universities.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {university === "أخرى" && (
            <div className="input-group animate-fade">
              <label>اسم الجامعة الأخرى</label>
              <input
                value={otherUniversity}
                onChange={(e) => setOtherUniversity(e.target.value)}
                required
                placeholder="اكتب اسم جامعتك هنا"
              />
            </div>
          )}

          <div className="input-row">
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
            <div className="input-group">
              <label>تأكيد كلمة المرور</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="********"
              />
            </div>
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "جاري المعالجة..." : "إنشاء حساب"}
          </button>
        </form>

        <div className="footer-text">
          لديك حساب بالفعل؟ <Link href="/login">تسجيل دخول</Link>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .auth-page {
          min-height: 100vh;
          width: 100%;
          background-color: #031c26;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          position: relative;
          overflow: hidden;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(11, 42, 65, 0.4), #03151d);
          z-index: 1;
        }

        .glow-top-right {
          position: absolute;
          width: 600px;
          height: 600px;
          top: -150px;
          right: -150px;
          background: radial-gradient(circle, rgba(71, 214, 173, 0.1) 0%, transparent 70%);
          z-index: 2;
        }

        .glass-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 650px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          margin-bottom: 35px;
          font-size: 15px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .input-row {
          display: flex;
          gap: 15px;
        }

        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 600;
          padding-right: 5px;
        }

        input, select {
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: #ffffff;
          font-size: 15px;
          transition: all 0.3s ease;
          outline: none;
        }

        input:focus, select:focus {
          border-color: #47D6AD;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 15px rgba(71, 214, 173, 0.15);
        }

        select option {
          background: #0b2a41;
          color: #ffffff;
        }

        .btn-submit {
          margin-top: 15px;
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

        .alert.error { background: rgba(255, 82, 82, 0.15); color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.3); }
        .alert.success { background: rgba(71, 214, 173, 0.15); color: #47D6AD; border: 1px solid rgba(71, 214, 173, 0.3); }

        .footer-text {
          margin-top: 25px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .footer-text a {
          color: #47D6AD;
          text-decoration: none;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .input-row { flex-direction: column; gap: 18px; }
          .glass-card { padding: 35px 20px; }
        }

        .animate-fade {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}