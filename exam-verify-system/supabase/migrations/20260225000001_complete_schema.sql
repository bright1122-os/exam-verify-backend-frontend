-- ============================================================
-- ExamVerify — Complete Database Schema
-- Project: ifpvklpkmokiagmxcsjq
-- Date: 2026-02-25
-- Purpose: Full schema creation for new Supabase project.
--          Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to run multiple times (IF NOT EXISTS + ON CONFLICT guards throughout)
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- Table: profiles (one row per auth.users row)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'student'
                          CHECK (role IN ('student', 'examiner', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Table: students
CREATE TABLE IF NOT EXISTS public.students (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matric_number         TEXT        UNIQUE NOT NULL,
  faculty               TEXT,
  department            TEXT,
  level                 TEXT,
  photo_url             TEXT,
  registration_complete BOOLEAN     DEFAULT FALSE,
  payment_verified      BOOLEAN     DEFAULT FALSE,
  qr_generated          BOOLEAN     DEFAULT FALSE,
  qr_used               BOOLEAN     DEFAULT FALSE,
  qr_used_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Table: payments
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      NUMERIC     NOT NULL,
  rrr         TEXT,
  status      TEXT        DEFAULT 'pending'
                          CHECK (status IN ('pending', 'verified', 'failed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Table: verifications
CREATE TABLE IF NOT EXISTS public.verifications (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  examiner_id    UUID        NOT NULL REFERENCES auth.users(id),
  status         TEXT        DEFAULT 'approved'
                             CHECK (status IN ('approved', 'denied')),
  exam_hall      TEXT,
  notes          TEXT,
  denial_reason  TEXT,
  scanned_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own row
DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Students: own record + examiners/admins can read all
DROP POLICY IF EXISTS "students_select_own"      ON public.students;
DROP POLICY IF EXISTS "students_insert_own"      ON public.students;
DROP POLICY IF EXISTS "students_update_own"      ON public.students;
DROP POLICY IF EXISTS "students_examiner_read"   ON public.students;
DROP POLICY IF EXISTS "students_admin_all"       ON public.students;

CREATE POLICY "students_select_own" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "students_insert_own" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "students_update_own" ON public.students
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "students_examiner_read" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('examiner', 'admin')
    )
  );

CREATE POLICY "students_admin_all" ON public.students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Payments: own record + admin full access
DROP POLICY IF EXISTS "payments_select_own"  ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own"  ON public.payments;
DROP POLICY IF EXISTS "payments_admin_all"   ON public.payments;

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_admin_all" ON public.payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Verifications: examiners insert, admins all, students read their own
DROP POLICY IF EXISTS "verifications_examiner_insert"  ON public.verifications;
DROP POLICY IF EXISTS "verifications_admin_all"        ON public.verifications;
DROP POLICY IF EXISTS "verifications_student_select"   ON public.verifications;

CREATE POLICY "verifications_examiner_insert" ON public.verifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('examiner', 'admin')
    )
  );

CREATE POLICY "verifications_admin_all" ON public.verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "verifications_student_select" ON public.verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = student_id AND students.user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE — photos bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

DROP POLICY IF EXISTS "photos_public_read"           ON storage.objects;
DROP POLICY IF EXISTS "photos_authenticated_upload"  ON storage.objects;
DROP POLICY IF EXISTS "photos_own_delete"            ON storage.objects;

CREATE POLICY "photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "photos_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "photos_own_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND auth.uid() IS NOT NULL
  );

-- ============================================================
-- TRIGGER — auto-create profile on new user signup
-- (Handles email/password AND Google OAuth signups)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- VERIFICATION (fails loudly if anything is missing)
-- ============================================================

DO $$
BEGIN
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ), 'FAILED: profiles table not created';

  ASSERT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'students'
  ), 'FAILED: students table not created';

  ASSERT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'payments'
  ), 'FAILED: payments table not created';

  ASSERT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verifications'
  ), 'FAILED: verifications table not created';

  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students'
    AND column_name = 'qr_used'
  ), 'FAILED: qr_used column missing from students';

  ASSERT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'photos'
  ), 'FAILED: photos storage bucket not created';

  RAISE NOTICE '✓ Schema verification passed — all tables, policies, bucket, and trigger ready.';
END $$;
