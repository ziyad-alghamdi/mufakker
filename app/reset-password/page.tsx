"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
