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

  // حالات إظهار كلمات المرور
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // أيقونة العين (SVG مدمج)
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.413 8.245 7.248 5.5 12 5.5s8.587 2.745 9.964 6.178c.07.245.07.492 0 .737C20.587 15.755 16.752 18.5 12 18.5s-8.587-2.745-9.964-6.177z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!phone.startsWith("05") || phone.length !== 10) {
      setMessage("❌ رقم الجوال يجب أن يبدأ بـ 05 ويكون 10 خانات");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("❌ كلمة المرور غير متطابقة");
      setLoading(false);
      return;
    }

    const finalUniversity = university === "أخرى" ? otherUniversity : university;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name_ar: fullNameAr,
          full_name_en: fullNameEn,
          phone: phone,
          university: finalUniversity,
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

  // إرسال إيميل الترحيب
  fetch("/api/welcome", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      fullName: fullNameAr,
    }),
  }).catch((err) => {
    console.error("Welcome email failed:", err);
  });

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
              <input value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} required placeholder="زياد محمد الغامدي" />
            </div>
            <div className="input-group">
              <label>الاسم الثلاثي (إنجليزي)</label>
              <input value={fullNameEn} onChange={(e) => setFullNameEn(e.target.value)} required placeholder="Ziyad Mohammed" />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>الإيميل</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" />
            </div>
            <div className="input-group">
              <label>رقم الجوال</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="05XXXXXXXX" />
            </div>
          </div>

          <div className="input-group">
            <label>الجامعة</label>
            <select value={university} onChange={(e) => setUniversity(e.target.value)} required>
              <option value="">اختر الجامعة</option>
              {universities.map((u) => (<option key={u} value={u}>{u}</option>))}
            </select>
          </div>

          {university === "أخرى" && (
            <div className="input-group animate-fade">
              <label>اسم الجامعة الأخرى</label>
              <input value={otherUniversity} onChange={(e) => setOtherUniversity(e.target.value)} required placeholder="اكتب اسم جامعتك هنا" />
            </div>
          )}

          <div className="input-row">
            {/* حقل كلمة المرور */}
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
                <button type="button" className="toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* حقل تأكيد كلمة المرور */}
            <div className="input-group">
              <label>تأكيد كلمة المرور</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="********"
                />
                <button type="button" className="toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
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
          min-height: 100vh; width: 100%; background-color: #020d12;
          display: flex; justify-content: center; align-items: center;
          padding: 40px 20px; font-family: 'Cairo', sans-serif;
          direction: rtl; position: relative; overflow: hidden;
        }

        .bg-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(11, 42, 65, 0.4), #03151d); z-index: 1; }
        .glow-top-right { position: absolute; width: 600px; height: 600px; top: -150px; right: -150px; background: radial-gradient(circle, rgba(71, 214, 173, 0.1) 0%, transparent 70%); z-index: 2; }

        .glass-card {
          position: relative; z-index: 10; width: 100%; max-width: 680px;
          background: rgba(15, 34, 43, 0.65); backdrop-filter: blur(25px);
          border-radius: 40px; border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 50px 40px; box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
        }

        .title { color: #ffffff; font-size: 32px; font-weight: 900; text-align: center; margin-bottom: 8px; }
        .subtitle { color: rgba(255, 255, 255, 0.4); text-align: center; margin-bottom: 35px; font-size: 15px; }

        .form { display: flex; flex-direction: column; gap: 20px; }
        .input-row { display: flex; gap: 15px; }
        .input-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        
        .password-wrapper { position: relative; display: flex; align-items: center; }
        .password-wrapper input { width: 100%; padding-left: 45px; }

        label { color: rgba(255, 255, 255, 0.7); font-size: 14px; font-weight: 600; padding-right: 5px; }

        /* ابحث عن هذه القسم في الـ Style وحدثه */

        input, select {
          padding: 14px 16px; 
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 16px;
          color: #ffffff; 
          font-size: 15px; 
          transition: 0.3s; 
          outline: none;
          cursor: pointer;
        }

        /* تنسيق قائمة الخيارات (المهم جداً) */
        select option {
          background-color: #0d1a21; /* لون خلفية غامق واحترافي */
          color: #ffffff; /* نص أبيض */
          padding: 10px;
        }

        /* لضمان عمل التنسيق على متصفحات معينة */
        select:focus {
          border-color: #47D6AD;
          background: #0d1a21; /* يتغير اللون عند الفتح لضمان التناسق */
        }

        input:focus, select:focus { border-color: #47D6AD; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 15px rgba(71, 214, 173, 0.15); }

        .toggle-btn {
          position: absolute; left: 12px; background: none; border: none;
          color: rgba(255, 255, 255, 0.3); cursor: pointer; display: flex; align-items: center; transition: 0.3s;
        }
        .toggle-btn:hover { color: #47D6AD; }
        .icon-svg { width: 20px; height: 20px; }

        .btn-submit {
          margin-top: 15px; padding: 18px; background: #47D6AD;
          color: #031c26; border: none; border-radius: 20px;
          font-size: 18px; font-weight: 800; cursor: pointer; transition: 0.3s;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }

        .alert { padding: 14px; border-radius: 12px; text-align: center; font-weight: 700; margin-bottom: 20px; }
        .alert.error { background: rgba(255, 82, 82, 0.1); color: #ff5252; }
        .alert.success { background: rgba(71, 214, 173, 0.1); color: #47D6AD; }

        .footer-text { margin-top: 25px; text-align: center; color: rgba(255, 255, 255, 0.4); }
        .footer-text a { color: #47D6AD; text-decoration: none; font-weight: 700; }

        @media (max-width: 600px) {
          .input-row { flex-direction: column; gap: 20px; }
          .glass-card { padding: 35px 20px; border-radius: 30px; }
        }

        .animate-fade { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}