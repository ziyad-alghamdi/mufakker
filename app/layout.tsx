import type { Metadata, Viewport } from "next"; // أضفنا Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. إضافة إعدادات الـ Viewport لضمان التجاوب مع "النتوء" في الجوالات
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // هذا السطر هو الحل لمشكلة هواتف آيفون
};

export const metadata: Metadata = {
  title: "منصة مجتمع مفكِّر",
  description: "جميع الحقوق محفوظة لمجتمع مفكِّر",
  icons: {
    icon: [
      { url: "/q1.png", type: "image/png", sizes: "32x32" },
      { url: "/q1.png", type: "image/png", sizes: "192x192" },
      { url: "/q1.png", type: "image/png", sizes: "512x512" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. تغيير lang إلى "ar" بما أن المنصة عربية ويدعم RTL
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0 }} // تأكيد عدم وجود هوامش خارجية تزيح الزر
      >
        {children}
      </body>
    </html>
  );
}