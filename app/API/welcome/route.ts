import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_WELCOME_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, fullName } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Missing email or fullName" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "مرحباً بك في مفكر 🌱",
      html: `
        <div style="
          background:#0b1f1a;
          padding:40px;
          font-family:Arial, sans-serif;
          color:#ffffff;
          direction:rtl;
          text-align:right;
        ">
          <div style="
            max-width:600px;
            margin:auto;
            background:#0f2d26;
            border-radius:12px;
            padding:30px;
          ">
            <h2 style="color:#47d6ad;">مرحباً ${fullName} 👋</h2>

            <p style="line-height:1.8;">
              سعداء بانضمامك إلى <strong>مفكر</strong> 🌱  
              حسابك تم إنشاؤه بنجاح ويمكنك البدء فوراً.
            </p>

            <p style="margin-top:20px;">
              نتمنى لك تجربة ملهمة ومليئة بالأفكار ✨
            </p>

            <hr style="border:none;border-top:1px solid #1f4d43;margin:30px 0;" />

            <p style="font-size:13px;color:#9fded0;">
              فريق مفكر 💚
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WELCOME EMAIL ERROR:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
