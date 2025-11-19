-- Create repair history table for Hidrokits LG and Schindler elevator
CREATE TABLE IF NOT EXISTS repair_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel TEXT NOT NULL,
  equipment_type TEXT NOT NULL, -- 'hidrokit_lg' or 'ascensor_schindler'
  repair_date DATE NOT NULL DEFAULT CURRENT_DATE,
  technician_name TEXT NOT NULL,
  work_description TEXT,
  parts_replaced JSONB, -- Array of {part_name: string, quantity: number, reference: string}
  cost DECIMAL(10, 2),
  hotel_person_present TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_repair_history_hotel ON repair_history(hotel);
CREATE INDEX IF NOT EXISTS idx_repair_history_equipment ON repair_history(equipment_type);
CREATE INDEX IF NOT EXISTS idx_repair_history_date ON repair_history(repair_date DESC);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_repair_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER repair_history_updated_at
  BEFORE UPDATE ON repair_history
  FOR EACH ROW
  EXECUTE FUNCTION update_repair_history_updated_at();
