-- Agregar campos logo_url y theme a la tabla agencies
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark'));

-- Crear bucket para logos de agencias
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Los usuarios autenticados pueden subir logos durante onboarding
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'agency-logos' AND
        auth.uid() IS NOT NULL
    );

-- Política: Los logos son públicos para lectura
CREATE POLICY "Logos are publicly readable" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'agency-logos');

-- Política: Los dueños de agencia pueden eliminar sus logos
CREATE POLICY "Agency owners can delete their logos" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'agency-logos' AND
        (storage.foldername(name))[1] IN (
            SELECT user_id::text FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

