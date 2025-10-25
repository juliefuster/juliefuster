-- Fix fumigation_records observations column type from jsonb to text
-- This allows storing simple text observations instead of requiring JSON format

ALTER TABLE fumigation_records 
ALTER COLUMN observations TYPE text USING observations::text;

-- Add comment to document the change
COMMENT ON COLUMN fumigation_records.observations IS 'Text field for fumigation observations and notes';
