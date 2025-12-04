-- =====================================================
-- MIGRACIÓN: Tabla de Whitelist
-- =====================================================

-- Crear tabla para whitelist de suscripciones
CREATE TABLE IF NOT EXISTS whitelist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    has_registered BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whitelist_email ON whitelist(email);
CREATE INDEX IF NOT EXISTS idx_whitelist_subscribed_at ON whitelist(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_whitelist_has_registered ON whitelist(has_registered);

-- Habilitar RLS
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede insertar en la whitelist (para suscripciones públicas)
CREATE POLICY "Anyone can subscribe to whitelist" ON whitelist
    FOR INSERT
    WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden ver la whitelist (para administración)
CREATE POLICY "Authenticated users can view whitelist" ON whitelist
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

