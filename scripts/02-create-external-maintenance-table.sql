-- Create external_maintenance_records table for external maintenance tasks
CREATE TABLE IF NOT EXISTS external_maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'aire_acondicionado', 'grupo_electrogeno', 'alarma_extintores', 'control_legionela', 'control_plagas', 'ascensor_montacargas'
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_done TEXT, -- What was done
  operator_name TEXT NOT NULL,
  hotel_person_present TEXT, -- Person from hotel who was present
  replacement_materials JSONB, -- Array of {quantity, reference_number}
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_external_maintenance_hotel_task ON external_maintenance_records(hotel, task_type);
CREATE INDEX IF NOT EXISTS idx_external_maintenance_date ON external_maintenance_records(date DESC);
