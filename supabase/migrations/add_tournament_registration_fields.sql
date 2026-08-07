-- Add new configuration fields to tournaments
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_url TEXT;

-- Update registrations table to support atomized player details and new fields
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Kenya',
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS fide_id TEXT,
ADD COLUMN IF NOT EXISTS accompanying_person TEXT,
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT false;

-- Data Migration: Try to backfill first_name and last_name from player_name if they are null
UPDATE registrations
SET 
  first_name = split_part(player_name, ' ', 1),
  last_name = substring(player_name from length(split_part(player_name, ' ', 1)) + 2)
WHERE first_name IS NULL AND player_name IS NOT NULL;
