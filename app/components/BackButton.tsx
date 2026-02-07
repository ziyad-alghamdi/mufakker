"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <button className="back-button" onClick={handleBack} aria-label="رجوع">
        <span className="back-icon">←</span>
        <span className="back-text">رجوع</span>
      </button>

      <style jsx>{`
        .back-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 24px;
          background: rgba(0, 78, 100, 0.95);
          backdrop-filter: blur(12px);
          border: 2px solid rgba(37, 161, 142, 0.5);
          border-radius: 50px;
          color: #eafff9;
          font-family: "Cairo", sans-serif;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .back-button:hover {
          background: rgba(37, 161, 142, 0.9);
          border-color: #47d6ad;
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 32px rgba(71, 214, 173, 0.4);
        }

        .back-button:active {
          transform: translateY(-2px) scale(1.02);
        }

        .back-icon {
          font-size: 22px;
          line-height: 1;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .back-button:hover .back-icon {
          transform: translateX(4px);
        }

        .back-text {
          font-size: 17px;
          line-height: 1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .back-button {
            bottom: 20px;
            right: 20px;
            padding: 14px 20px;
            font-size: 15px;
          }

          .back-icon {
            font-size: 20px;
          }

          .back-text {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .back-button {
            bottom: 16px;
            right: 16px;
            padding: 12px 16px;
            border-radius: 40px;
          }

          .back-text {
            display: none;
          }

          .back-icon {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
}
