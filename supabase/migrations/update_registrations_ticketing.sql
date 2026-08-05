ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS attendance_status TEXT NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'checked-in'));
