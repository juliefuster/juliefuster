-- Create contactos table
CREATE TABLE IF NOT EXISTS contactos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_contacto TEXT CHECK (tipo_contacto IN ('Persona', 'Empresa')),
  nombre TEXT,
  apellido TEXT,
  cargo TEXT,
  empresa TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  departamento TEXT CHECK (departamento IN ('Recepción', 'Mantenimiento', 'Pisos', 'Desayunos', 'Administración', 'Otro')),
  hotel TEXT CHECK (hotel IN ('Chi', 'Caledonian', 'Ambos')),
  notas TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_contactos_hotel ON contactos(hotel);
CREATE INDEX IF NOT EXISTS idx_contactos_departamento ON contactos(departamento);
CREATE INDEX IF NOT EXISTS idx_contactos_tipo ON contactos(tipo_contacto);

-- Enable Row Level Security (optional, recommended)
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth needs)
CREATE POLICY "Enable all access for contactos" ON contactos
  FOR ALL
  USING (true)
  WITH CHECK (true);
