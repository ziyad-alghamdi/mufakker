"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      const { data: row } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!row || row.role !== "admin") {
        router.push("/");
        return;
      }

      setAdmin(row);
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading)
    return (
      <div className="loading-screen">
        <h2>جاري التحقق...</h2>
        <style jsx>{`
          .loading-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0b2a41 0%, #004e64 100%);
            color: #47d6ad;
            font-size: 20px;
            font-weight: 700;
            font-family: "Cairo", sans-serif;
          }
        `}</style>
      </div>
    );

  return (
    <div className="admin-page">
      <Sidebar />
      <BackButton />

      <div className="content">
        <div className="header">
          <h1 className="title">لوحة إدارة مفكّر</h1>
          <p className="subtitle">مرحباً يا {admin.full_name_ar} 👋</p>
        </div>

        <div className="dashboard-grid">
          <a href="/admin/workshops" className="dashboard-btn">
            <div className="btn-icon">📚</div>
            <div className="btn-text">إدارة الورش والدورات</div>
          </a>

          <a href="/admin/AdminEvents" className="dashboard-btn">
            <div className="btn-icon">🎉</div>
            <div className="btn-text">إدارة الفعاليات</div>
          </a>

          <a href="/admin/users" className="dashboard-btn">
            <div className="btn-icon">👥</div>
            <div className="btn-text">إدارة المستخدمين</div>
          </a>

          <a href="/admin/registrations" className="dashboard-btn">
            <div className="btn-icon">✍️</div>
            <div className="btn-text">المسجلين في الورش</div>
          </a>

          <a href="/admin/event_registrations" className="dashboard-btn">
            <div className="btn-icon">🎫</div>
            <div className="btn-text">المسجلين في الفعاليات</div>
          </a>
        </div>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          width: 100%;
          padding: 0;
          font-family: "Cairo", sans-serif;
          background: linear-gradient(135deg, #0b2a41 0%, #004e64 100%);
          color: #eafff9;
          box-sizing: border-box;
          direction: rtl;
        }

        .content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 50px 30px;
          margin-right: 270px;
        }

        /* Header Section */
        .header {
          text-align: center;
          margin-bottom: 50px;
        }

        .title {
          font-size: 42px;
          font-weight: 900;
          margin-bottom: 12px;
          color: #47d6ad;
          text-align: center;
        }

        .subtitle {
          font-size: 22px;
          color: #eafff9;
          text-align: center;
          font-weight: 600;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Dashboard Buttons */
        .dashboard-btn {
          background: rgba(0, 78, 100, 0.6);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(37, 161, 142, 0.4);
          border-radius: 18px;
          padding: 32px 24px;
          text-decoration: none;
          color: #eafff9;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .dashboard-btn:hover {
          background: rgba(37, 161, 142, 0.2);
          border-color: #47d6ad;
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(71, 214, 173, 0.25);
        }

        .btn-icon {
          font-size: 48px;
          line-height: 1;
        }

        .btn-text {
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          color: #eafff9;
        }

        .dashboard-btn:hover .btn-text {
          color: #47d6ad;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .content {
            margin-right: 0;
            padding: 40px 20px;
          }
        }

        @media (max-width: 768px) {
          .content {
            padding: 30px 16px;
          }

          .title {
            font-size: 32px;
          }

          .subtitle {
            font-size: 18px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .dashboard-btn {
            padding: 24px 20px;
          }

          .btn-icon {
            font-size: 40px;
          }

          .btn-text {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
