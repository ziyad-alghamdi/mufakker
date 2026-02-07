"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

export default function MyCertificates() {
  const [certs, setCerts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("all");
  const [loading, setLoading] = useState(true);

  const TYPES = [
    { id: "all", label: "الكل" },
    { id: "course", label: "دورات" },
    { id: "workshop", label: "ورش عمل" },
    { id: "achievement", label: "مشاركات وإنجازات" },
    { id: "event", label: "فعاليات" },
    { id: "organizing", label: "تنظيم" }
  ];

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    setCerts(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  function filterByType(type: string) {
    setSelectedType(type);

    if (type === "all") {
      setFiltered(certs);
    } else {
      setFiltered(certs.filter((c) => c.type === type));
    }
  }

  return (
    <div className="page">
      <Sidebar />
      <BackButton />

      <div className="content">
        <h1 className="title">شهاداتي</h1>

        {/* أزرار التصفية */}
        <div className="filters">
          {TYPES.map((t) => (
            <button
              key={t.id}
              className={`filter-btn ${selectedType === t.id ? "active" : ""}`}
              onClick={() => filterByType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* عرض الشهادات */}
        <div className="list">
          {loading ? (
            <p className="loading-text">جاري تحميل الشهادات...</p>
          ) : filtered.length === 0 ? (
            <p className="empty-text">لا توجد شهادات حتى الآن.</p>
          ) : (
            filtered.map((c) => (
              <div className="card" key={c.id}>
                <h3>{c.title}</h3>
                <p className="type-label">
                  النوع: {TYPES.find((t) => t.id === c.type)?.label}
                </p>

                <span className="date">
                  📅 {new Date(c.created_at).toLocaleDateString("ar-SA")}
                </span>

                <a
                  href={c.file_url}
                  target="_blank"
                  className="download"
                >
                  تنزيل الشهادة ⬇
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CSS موحّد مع الهوية البصرية */}
      <style jsx>{`
        .page {
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 50px 30px;
          margin-right: 270px;
        }

        .title {
          font-size: 40px;
          font-weight: 900;
          color: #47d6ad;
          margin-bottom: 30px;
          text-align: right;
        }

        .filters {
          display: flex;
          gap: 12px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 12px 20px;
          background: rgba(0, 78, 100, 0.5);
          border: 1px solid rgba(37, 161, 142, 0.3);
          border-radius: 10px;
          color: #eafff9;
          font-weight: 700;
          font-family: "Cairo", sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          background: rgba(0, 78, 100, 0.7);
          border-color: rgba(37, 161, 142, 0.5);
        }

        .filter-btn.active {
          background: #25a18e;
          color: #0b2a41;
          border-color: #25a18e;
          box-shadow: 0 4px 12px rgba(37, 161, 142, 0.3);
        }

        .list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .card {
          background: rgba(0, 78, 100, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(37, 161, 142, 0.3);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          border-color: rgba(71, 214, 173, 0.6);
          box-shadow: 0 8px 24px rgba(71, 214, 173, 0.15);
        }

        h3 {
          font-size: 22px;
          margin-bottom: 12px;
          color: #47d6ad;
          font-weight: 700;
          text-align: right;
        }

        .type-label {
          font-size: 15px;
          color: #eafff9;
          margin-bottom: 12px;
          opacity: 0.9;
          text-align: right;
        }

        .date {
          display: inline-block;
          margin-bottom: 16px;
          padding: 8px 16px;
          background: rgba(37, 161, 142, 0.2);
          border-radius: 10px;
          color: #47d6ad;
          font-weight: 700;
          font-size: 14px;
        }

        .download {
          display: block;
          margin-top: 12px;
          background: #25a18e;
          padding: 14px;
          text-align: center;
          border-radius: 10px;
          color: white;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .download:hover {
          background: #47d6ad;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 161, 142, 0.3);
        }

        .loading-text,
        .empty-text {
          color: #eafff9;
          font-size: 18px;
          text-align: right;
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

          .list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
