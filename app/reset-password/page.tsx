"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
useEffect(() => {
  const hash = window.location.hash;

  if (!hash) return;

  supabase.auth
    .exchangeCodeForSession(hash.replace("#", ""))
    .then(({ error }) => {
      if (error) {
        setMessage("❌ رابط تغيير كلمة المرور غير صالح أو منتهي");
      }
    });
}, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("❌ فشل تحديث كلمة المرور");
    } else {
      setMessage("✔️ تم تحديث كلمة المرور بنجاح");
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <h1>تغيير كلمة المرور</h1>
      <input
        type="password"
        placeholder="كلمة المرور الجديدة"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">تحديث</button>
      {message && <p>{message}</p>}
    </form>
  );
}
