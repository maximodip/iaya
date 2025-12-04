-- =====================================================
-- SCRIPT PARA HABILITAR REALTIME EN SUPABASE
-- =====================================================
-- 
-- Ejecuta este script en el SQL Editor de Supabase
-- (Dashboard > SQL Editor > New Query)
--
-- Este script habilita Realtime para la tabla project_phases
-- permitiendo actualizaciones en tiempo real del progreso del proyecto.
-- =====================================================

-- Método 1: Agregar directamente a la publicación (recomendado)
ALTER PUBLICATION supabase_realtime ADD TABLE project_phases;

-- Si el comando anterior falla con error de que la tabla ya existe,
-- puedes verificar el estado con:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Método 2: Si necesitas crear una publicación personalizada (alternativa)
-- CREATE PUBLICATION supabase_realtime_project_phases FOR TABLE project_phases;

-- Verificar que la replicación esté habilitada
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE tablename = 'project_phases';

