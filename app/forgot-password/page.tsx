"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://mufakker-ivory.vercel.app/reset-password",
    });

    if (error) {
      setMessage("❌ حصل خطأ، تأكد من الإيميل");
    } else {
      setMessage("✔️ تم إرسال رابط تغيير كلمة المرور على الإيميل");
    }
  };

  return (
    <form onSubmit={handleReset}>
      <h1>استعادة كلمة المرور</h1>
      <input
        type="email"
        placeholder="اكتب إيميلك"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">إرسال الرابط</button>
      {message && <p>{message}</p>}
    </form>
  );
}
