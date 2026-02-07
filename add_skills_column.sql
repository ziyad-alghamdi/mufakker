-- إضافة عمود skills إلى جدول users
-- نفذ هذا الكود في Supabase SQL Editor

-- 1. إضافة عمود skills
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS skills TEXT;

-- 2. تحديث القيمة الافتراضية للمستخدمين الحاليين (اختياري)
UPDATE users 
SET skills = '' 
WHERE skills IS NULL;

-- 3. التأكد من وجود Policy للتحديث
-- إذا لم يكن موجود، سيتم إنشاؤه
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update own data'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id)';
  END IF;
END $$;

-- 4. التحقق من الأعمدة الموجودة
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
