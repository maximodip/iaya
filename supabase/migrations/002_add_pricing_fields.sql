-- =====================================================
-- MIGRACIÓN: Campos de Pricing y Tracking
-- =====================================================

-- Agregar campos de pricing a la tabla agencies
ALTER TABLE agencies
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS purchase_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS is_early_bird BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS monthly_analysis_limit INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS monthly_analysis_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_limit_gb INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS last_usage_reset TIMESTAMPTZ DEFAULT NOW();

-- Crear tabla para tracking de uso
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    usage_type TEXT NOT NULL CHECK (usage_type IN ('document_analysis', 'storage')),
    amount DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_agency_id ON usage_tracking(agency_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_agencies_purchase_date ON agencies(purchase_date);
CREATE INDEX IF NOT EXISTS idx_agencies_is_early_bird ON agencies(is_early_bird);

-- Función para resetear uso mensual (ejecutar con cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE agencies
    SET 
        monthly_analysis_used = 0,
        last_usage_reset = NOW()
    WHERE last_usage_reset < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

