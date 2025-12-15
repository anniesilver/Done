-- Migration: Add calendar sync fields to tasks table
-- Description: Adds fields needed for calendar sync functionality (source tracking, deduplication)
-- Run this in Supabase SQL Editor

-- Add new columns to tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_event_id TEXT,
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;

-- Add index for efficient lookups when syncing
CREATE INDEX IF NOT EXISTS idx_tasks_source
  ON tasks(user_id, source_type, source_event_id);

-- Add comment explaining the fields
COMMENT ON COLUMN tasks.source_type IS 'Source of the task: manual, iphone_calendar, or google_calendar';
COMMENT ON COLUMN tasks.source_event_id IS 'External event ID from calendar for deduplication';
COMMENT ON COLUMN tasks.synced_at IS 'Timestamp when task was imported from calendar';
