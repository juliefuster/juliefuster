-- Fix existing guia_virtual, guia_fotos, and guia_historial tables to match API expectations

-- Fix guia_fotos: rename fecha_subida to created_at if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'guia_fotos' AND column_name = 'fecha_subida') THEN
    ALTER TABLE guia_fotos RENAME COLUMN fecha_subida TO created_at;
  END IF;
END $$;

-- Fix guia_historial: rename fecha to created_at if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'guia_historial' AND column_name = 'fecha') THEN
    ALTER TABLE guia_historial RENAME COLUMN fecha TO created_at;
  END IF;
END $$;

-- Ensure created_at columns exist with proper defaults
ALTER TABLE guia_fotos 
  ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE guia_historial 
  ALTER COLUMN created_at SET DEFAULT NOW();
