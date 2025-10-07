-- Create maintenance issues table
CREATE TABLE IF NOT EXISTS maintenance_issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'media',
  status VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  reported_by VARCHAR(255),
  assigned_to VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_status ON maintenance_issues(status);
CREATE INDEX IF NOT EXISTS idx_category ON maintenance_issues(category);
CREATE INDEX IF NOT EXISTS idx_created_at ON maintenance_issues(created_at DESC);

-- Insert sample data for testing
INSERT INTO maintenance_issues (title, description, category, location, priority, status, reported_by) VALUES
('Fuga de agua en baño', 'Hay una fuga considerable en el lavabo de la habitación', 'Fontanería', 'Habitación 305', 'alta', 'pendiente', 'María García'),
('Luz fundida en pasillo', 'La luz del pasillo del tercer piso no funciona', 'Electricidad', 'Pasillo 3er piso', 'media', 'pendiente', 'Carlos Ruiz'),
('Aire acondicionado ruidoso', 'El AC hace ruido excesivo', 'Climatización', 'Habitación 210', 'baja', 'pendiente', 'Ana López'),
('Puerta no cierra bien', 'La cerradura de la puerta está defectuosa', 'Carpintería', 'Habitación 405', 'alta', 'en_progreso', 'Pedro Martínez'),
('Mancha en alfombra', 'Mancha grande que requiere limpieza profunda', 'Limpieza', 'Lobby principal', 'media', 'resuelta', 'Laura Sánchez');
