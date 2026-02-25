-- Migration: Add qr_used column to students table
-- Session: 2026-02-24 (Session 3 — Production Setup)
-- Purpose: Enables single-use QR enforcement (Bug 5 fix requires this column)
-- Safe to run multiple times (IF NOT EXISTS guard)

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS qr_used BOOLEAN DEFAULT FALSE;

-- Also add qr_used_at timestamp for audit trail
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS qr_used_at TIMESTAMPTZ DEFAULT NULL;

-- Verify column was added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'qr_used'
  ) THEN
    RAISE EXCEPTION 'Migration failed: qr_used column was not added to students table';
  END IF;
  RAISE NOTICE 'Migration verified: qr_used column exists on students table';
END $$;
