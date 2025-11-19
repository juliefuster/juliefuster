-- Add hotel column to inventario table
ALTER TABLE inventario 
ADD COLUMN hotel TEXT;

-- Add check constraint to ensure only valid hotel values
ALTER TABLE inventario
ADD CONSTRAINT inventario_hotel_check 
CHECK (hotel IN ('Chi', 'Caledonian'));

-- Create index for better query performance
CREATE INDEX idx_inventario_hotel ON inventario(hotel);

-- Optionally set a default value for existing rows (you can change this or set individually)
UPDATE inventario 
SET hotel = 'Chi' 
WHERE hotel IS NULL;
