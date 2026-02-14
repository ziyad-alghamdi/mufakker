"use client";

import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaLinkedinIn, FaUsers, FaRegCalendarCheck, FaGraduationCap } from "react-icons/fa6";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                {/* قسم الشعار والوصف */}
                <div className="footer-section">
                    <div className="footer-logo-box">
                        <Image src="/q1.png" alt="Logo" width={120} height={120} priority />
                    </div>
                    <p className="footer-desc">
                        منصة مفكِّـر: وجهتك الأولى للورش والدورات التدريبية والابتكار التقني.
                    </p>
                </div>

                {/* قسم الوصول السريع - النص تحت الأيقونة */}
                <div className="footer-section">
                    <h3>الوصول السريع</h3>
                    <div className="icon-links-container">

                        <div className="icon-wrapper">
                            <Link href="/about" className="icon-link-card" title="من نحن">
                                <div className="icon-box">
                                    <FaUsers size={22} />
                                </div>
                            </Link>
                            <span className="icon-text">من نحن</span>
                        </div>

                        <div className="icon-wrapper">
                            <Link href="/workshops" className="icon-link-card" title="الورش والدورات">
                                <div className="icon-box">
                                    <FaGraduationCap size={22} />
                                </div>
                            </Link>
                            <span className="icon-text">الدورات</span>
                        </div>

                        <div className="icon-wrapper">
                            <Link href="/events" className="icon-link-card" title="المشاركات">
                                <div className="icon-box">
                                    <FaRegCalendarCheck size={22} />
                                </div>
                            </Link>
                            <span className="icon-text">المشاركات</span>
                        </div>

                    </div>
                </div>

                {/* قسم التواصل والشبكات الاجتماعية */}
                <div className="footer-section">
                    <h3>تواصل معنا</h3>
                    <p className="email-text">Email: community.mufakker@gmail.com</p>
                    <div className="social-icons">
                        <a
                            href="https://twitter.com/mufakkr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link x-link"
                            title="X (Twitter)"
                        >
                            <FaXTwitter size={20} />
                        </a>
                        <a
                            href="https://sa.linkedin.com/company/mufakker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link linkedin-link"
                            title="LinkedIn"
                        >
                            <FaLinkedinIn size={20} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لمجتمع مفكر</p>
            </div>

            <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

        .footer {
          background: #031c26;
          color: #fff;
          padding: 60px 20px 20px;
          font-family: 'Cairo', sans-serif;
          position: relative;
          border-top: 3px solid #47d6ad;
          box-shadow: 0 -5px 15px rgba(71, 214, 173, 0.3), 0 -10px 40px rgba(71, 214, 173, 0.1);
          width: 100%;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          direction: rtl;
        }

        .footer-logo-box {
          filter: drop-shadow(0 0 8px rgba(71, 214, 173, 0.2));
          margin-bottom: 10px;
        }

        .footer-section h3 {
          color: #47d6ad;
          margin-bottom: 25px;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .footer-desc {
          color: rgba(234, 255, 249, 0.6);
          line-height: 1.8;
          font-size: 0.95rem;
        }

        .email-text {
          color: rgba(234, 255, 249, 0.7);
          margin-bottom: 15px;
          font-size: 0.9rem;
        }

        .icon-links-container {
          display: flex;
          gap: 25px;
          margin-top: 10px;
        }

        /* حاوية تجمع الأيقونة والنص تحتها */
        .icon-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .icon-link-card, .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .icon-box, .social-link {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(71, 214, 173, 0.2);
          color: #47d6ad;
        }

        /* تأثير التحويم */
        .icon-link-card:hover .icon-box, .social-link:hover {
          background: #47d6ad;
          color: #031c26;
          box-shadow: 0 5px 20px rgba(71, 214, 173, 0.6);
          border-color: #47d6ad;
          transform: translateY(-5px);
        }

        /* ستايل النص تحت الأيقونة - أبيض */
        .icon-text {
          font-size: 0.8rem;
          color: #ffffff;
          font-weight: 600;
          opacity: 0.9;
        }

        .social-icons {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .footer-bottom {
          text-align: center;
          margin-top: 60px;
          padding-top: 25px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(234, 255, 249, 0.3);
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .footer-content { text-align: center; }
          .icon-links-container, .social-icons { justify-content: center; }
        }
      `}</style>
        </footer>
    );
}