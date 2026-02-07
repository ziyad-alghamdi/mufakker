import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { registration_id } = await req.json();

  const { data, error } = await supabase
    .from("registrations")
    .select("email, full_name_ar")
    .eq("id", registration_id)
    .single();

  if (error || !data?.email) {
    return new Response("User not found", { status: 404 });
  }

  await resend.emails.send({
    from: "Mufakker <community.mufakker@gmail.com>",
    to: data.email,
    subject: "تم قبولك في الورشة 🎉",
    html: `
      <p>مرحبًا ${data.full_name_ar || "عزيزنا المشارك"} 🌟</p>
      <p>يسعدنا إبلاغك بأنه تم <strong>قبولك</strong> في الورشة.</p>
      <p>سيتم التواصل معك قريبًا بالتفاصيل.</p>
      <p>تحياتنا<br/>فريق مفكر</p>
    `,
  });

  return Response.json({ success: true });
}
