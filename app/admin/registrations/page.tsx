"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";
import Footer from "../../components/FooterBar";

type Registration = {
  id: number;
  course_id: number;
  user_id: string;
  status: string; // Pending, Accepted, Rejected
  name_ar: string;
  name_en: string;
  phone: string;
  email: string;
  university: string;
};

type Course = {
  id: number;
  title: string;
};

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      await loadCourses();
      await loadRegistrations();
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadCourses() {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) {
      console.error(error.message);
      return;
    }
    setCourses(data || []);
  }

  async function loadRegistrations() {
    const { data, error } = await supabase.from("course_registrations").select("*");
    if (error) {
      console.error(error.message);
      return;
    }
    setRegistrations(data || []);
  }

  async function updateRegistrationStatus(id: number, status: string) {
    const { error } = await supabase
      .from("course_registrations")
      .update({ status })
      .eq("id", id);

    if (error) {
      setToast("حدث خطأ أثناء تحديث الحالة");
      console.error(error.message);
    } else {
      setToast("تم تحديث الحالة بنجاح!");
      setTimeout(() => setToast(""), 2500);
      loadRegistrations(); // إعادة تحميل البيانات بعد التعديل
    }
  }

  if (loading)
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p className="loading-text">جاري تحميل البيانات...</p>
      </div>
    );

  return (
    <div className="registrations-page">
      <Sidebar />
      <BackButton />

      <div className="content">
        <header className="header-flex">
          <div className="header-text">
            <h1 className="title">إدارة المسجلين في الدورات</h1>
            <p className="subtitle">قائمة المسجلين في الدورات المتاحة.</p>
          </div>
        </header>

        {toast && (
          <div className="toast">
            <p>{toast}</p>
          </div>
        )}

        <div className="registrations-grid">
          {registrations.length === 0 ? (
            <p>لا توجد أي تسجيلات حالياً.</p>
          ) : (
            registrations.map((registration) => {
              const course = courses.find((c) => c.id === registration.course_id);
              return (
                <div className="registration-card" key={registration.id}>
                  <div className="card-header">
                    <h3>{course?.title}</h3>
                    <span className={`status ${registration.status}`}>
                      {registration.status === "pending"
                        ? "قيد الانتظار"
                        : registration.status === "accepted"
                        ? "مقبول"
                        : "مرفوض"}
                    </span>
                  </div>

                  <div className="card-body">
                    <div>
                      <strong>الاسم بالعربية:</strong> {registration.name_ar}
                    </div>
                    <div>
                      <strong>الاسم بالإنجليزية:</strong> {registration.name_en}
                    </div>
                    <div>
                      <strong>الهاتف:</strong> {registration.phone}
                    </div>
                    <div>
                      <strong>البريد الإلكتروني:</strong> {registration.email}
                    </div>
                    <div>
                      <strong>الجامعة:</strong> {registration.university}
                    </div>
                  </div>

                  <div className="card-footer">
                    <button
                      onClick={() => updateRegistrationStatus(registration.id, "accepted")}
                      className="btn-accept"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => updateRegistrationStatus(registration.id, "rejected")}
                      className="btn-reject"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />
      <style>{`
      
      .registrations-page {
  background: #1a202c;
  color: #e2e8f0;
  padding: 20px;
  min-height: 100vh;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-text {
  text-align: right;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.subtitle {
  font-size: 16px;
  color: #b0b7c3;
}

.toast {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.registrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.registration-card {
  background: #2d3748;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.registration-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status {
  padding: 5px 10px;
  font-weight: bold;
  border-radius: 5px;
}

.status.pending {
  background: #fbbf24;
  color: #1f2937;
}

.status.accepted {
  background: #34d399;
  color: #fff;
}

.status.rejected {
  background: #f87171;
  color: #fff;
}

.card-body {
  margin-bottom: 20px;
}

.card-body div {
  margin-bottom: 8px;
}

.card-footer {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

button {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.btn-accept {
  background: #34d399;
  color: #fff;
}

.btn-accept:hover {
  background: #10b981;
}

.btn-reject {
  background: #f87171;
  color: #fff;
}

.btn-reject:hover {
  background: #f43f5e;
}

      
      `}</style>
    </div>
  );
}
