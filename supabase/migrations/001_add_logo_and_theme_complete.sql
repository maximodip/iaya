-- =====================================================
-- MIGRACIÓN: Agregar logo_url y theme a agencies
-- =====================================================

-- 1. Agregar campos logo_url y theme a la tabla agencies
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';

-- Asegurar que el constraint CHECK se aplique si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agencies_theme_check'
    ) THEN
        ALTER TABLE agencies 
        ADD CONSTRAINT agencies_theme_check 
        CHECK (theme IN ('light', 'dark'));
    END IF;
END $$;

-- Actualizar registros existentes que puedan tener theme NULL
UPDATE agencies 
SET theme = 'dark' 
WHERE theme IS NULL;

-- 2. Crear bucket para logos de agencias (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Logos are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Agency owners can delete their logos" ON storage.objects;

-- 4. Crear políticas RLS para logos de agencias
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'agency-logos' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Logos are publicly readable" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'agency-logos');

CREATE POLICY "Agency owners can delete their logos" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'agency-logos' AND
        (storage.foldername(name))[1] IN (
            SELECT user_id::text FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

