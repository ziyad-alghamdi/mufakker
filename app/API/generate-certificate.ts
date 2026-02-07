/*import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';
import { supabase } from "../lib/supabaseClient"; // تأكد من استخدام المسار الصحيح لاستيراد supabase client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { registration_id, event_id, user_name } = req.body;

    // التحقق من البيانات الواردة
    if (!registration_id || !event_id || !user_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // جلب بيانات الفعالية
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('title, certificate_template_url')
        .eq('id', event_id)
        .single();

      if (eventError || !eventData) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // إنشاء PDF باستخدام PDFKit
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        // رفع PDF إلى Supabase Storage
        const fileName = `certificate-${registration_id}.pdf`;
        supabase.storage
          .from('certificates')
          .upload(fileName, pdfBuffer)
          .then(({ data, error }) => {
            if (error) {
              return res.status(500).json({ error: 'Error uploading PDF to storage' });
            }

            // تحديث رابط الشهادة في قاعدة البيانات
            supabase
              .from('event_registrations')
              .update({
                certificate_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${data.path}`,
                status: 'approved', // تغيير الحالة إلى معتمد
              })
              .eq('id', registration_id)
              .then(() => {
                res.status(200).json({
                  message: 'Certificate generated successfully',
                  certificate_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${data.path}`,
                });
              });
          });
      });

      // إعداد محتويات الشهادة
      doc.fontSize(20).text('شهادة حضور', { align: 'center' });
      doc.fontSize(16).text(`إلى: ${user_name}`, { align: 'center' });
      doc.fontSize(14).text(`الفعالية: ${eventData.title}`, { align: 'center' });
      doc.fontSize(12).text(`تاريخ الفعالية: ${new Date().toLocaleDateString()}`, { align: 'center' });
      
      doc.end();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
*/