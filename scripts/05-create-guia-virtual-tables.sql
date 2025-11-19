-- Create main guide table
CREATE TABLE IF NOT EXISTS guia_virtual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT,
  descripcion TEXT,
  departamento TEXT CHECK (departamento IN ('Recepción', 'Mantenimiento', 'Pisos', 'Desayunos', 'Administración', 'Informática', 'Otro')),
  hotel TEXT CHECK (hotel IN ('Chi', 'Caledonian', 'Ambos')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modificado_por TEXT
);

-- Create photos table
CREATE TABLE IF NOT EXISTS guia_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guia_id UUID REFERENCES guia_virtual(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  descripcion TEXT,
  -- Changed from fecha_subida to created_at to match API expectations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subido_por TEXT
);

-- Create history table
CREATE TABLE IF NOT EXISTS guia_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guia_id UUID REFERENCES guia_virtual(id) ON DELETE CASCADE,
  -- Changed from fecha to created_at to match API expectations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modificado_por TEXT,
  cambio TEXT NOT NULL,
  -- Added columns to store previous content for version history
  contenido_anterior_titulo TEXT,
  contenido_anterior_descripcion TEXT,
  contenido_anterior_departamento TEXT,
  contenido_anterior_hotel TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guia_virtual_hotel ON guia_virtual(hotel);
CREATE INDEX IF NOT EXISTS idx_guia_virtual_departamento ON guia_virtual(departamento);
CREATE INDEX IF NOT EXISTS idx_guia_fotos_guia_id ON guia_fotos(guia_id);
CREATE INDEX IF NOT EXISTS idx_guia_historial_guia_id ON guia_historial(guia_id);

-- Create text search index for titulo and descripcion
CREATE INDEX IF NOT EXISTS idx_guia_virtual_search ON guia_virtual USING gin(to_tsvector('spanish', coalesce(titulo, '') || ' ' || coalesce(descripcion, '')));

-- Add trigger to update ultima_modificacion
CREATE OR REPLACE FUNCTION update_guia_modified_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_modificacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_guia_modified_time ON guia_virtual;
CREATE TRIGGER trigger_update_guia_modified_time
  BEFORE UPDATE ON guia_virtual
  FOR EACH ROW
  EXECUTE FUNCTION update_guia_modified_time();
