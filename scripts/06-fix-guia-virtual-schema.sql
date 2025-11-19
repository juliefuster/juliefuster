-- Add updated_at column if it doesn't exist (for backwards compatibility)
ALTER TABLE guia_virtual ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to set updated_at = ultima_modificacion
UPDATE guia_virtual SET updated_at = ultima_modificacion WHERE updated_at IS NULL;

-- Create or replace trigger to update both timestamps
CREATE OR REPLACE FUNCTION update_guia_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_modificacion = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_guia_timestamps ON guia_virtual;
CREATE TRIGGER trigger_update_guia_timestamps
  BEFORE UPDATE ON guia_virtual
  FOR EACH ROW
  EXECUTE FUNCTION update_guia_timestamps();
