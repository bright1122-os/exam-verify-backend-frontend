-- ============================================================
-- ExamVerify — RLS & Trigger Fixes
-- Date: 2026-02-25
-- Fixes:
--   1. Add examiner SELECT policy on verifications (was missing — caused empty dashboard)
--   2. Add DB trigger: auto-set students.qr_used = true when approved verification inserted
--      (removes need for examiners to UPDATE students, which they have no RLS permission for)
--   3. Add examiner SELECT policy on students (already had one, ensuring it is correct)
-- Safe to run multiple times (DROP IF EXISTS guards).
-- ============================================================

-- ============================================================
-- 1. Examiner SELECT on verifications (CRITICAL — was completely missing)
-- ============================================================
DROP POLICY IF EXISTS "verifications_examiner_select" ON public.verifications;

CREATE POLICY "verifications_examiner_select" ON public.verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('examiner', 'admin')
    )
  );

-- Examiners should also be able to see verifications they personally created
DROP POLICY IF EXISTS "verifications_examiner_own_select" ON public.verifications;

CREATE POLICY "verifications_examiner_own_select" ON public.verifications
  FOR SELECT USING (examiner_id = auth.uid());

-- ============================================================
-- 2. Trigger: auto-mark QR as used when examiner approves entry
--    This removes the need for examiners to have UPDATE permission on students.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_verification_approved()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.students
    SET
      qr_used    = true,
      qr_used_at = NOW()
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_verification_approved ON public.verifications;

CREATE TRIGGER on_verification_approved
  AFTER INSERT ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_verification_approved();

-- ============================================================
-- 3. Verification: confirm policies exist
-- ============================================================
DO $$
BEGIN
  ASSERT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'verifications'
      AND policyname = 'verifications_examiner_select'
  ), 'FAILED: verifications_examiner_select policy not created';

  ASSERT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_verification_approved'
  ), 'FAILED: on_verification_approved trigger not created';

  RAISE NOTICE '✓ RLS & trigger fixes applied successfully.';
END $$;
