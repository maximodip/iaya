-- =====================================================
-- SCHEMA DE BASE DE DATOS - IAYA
-- Plataforma de Gestión de Proyectos para Agencias de IA
-- =====================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TIPOS ENUM
-- =====================================================

-- Tipo para el estado de las fases
CREATE TYPE phase_status AS ENUM ('pending', 'in_progress', 'completed');

-- =====================================================
-- TABLAS
-- =====================================================

-- Tabla: agencies
-- Almacena la información de las agencias
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    primary_color TEXT DEFAULT '#3b82f6',
    secondary_color TEXT DEFAULT '#8b5cf6',
    main_objective TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: agency_owners
-- Relaciona usuarios de Supabase Auth con agencias (dueños)
CREATE TABLE IF NOT EXISTS agency_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla: clients
-- Clientes de las agencias
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla: projects
-- Proyectos de las agencias asignados a clientes
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: project_phases
-- Fases de cada proyecto
CREATE TABLE IF NOT EXISTS project_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase_name TEXT NOT NULL,
    phase_description TEXT,
    status phase_status DEFAULT 'pending',
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_agency_owners_user_id ON agency_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_owners_agency_id ON agency_owners(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_agency_id ON projects(agency_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_phases_updated_at
    BEFORE UPDATE ON project_phases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA AGENCY OWNERS
-- =====================================================

-- Agencies: Los dueños pueden ver y editar su propia agencia
CREATE POLICY "Agency owners can view their agency" ON agencies
    FOR SELECT
    USING (
        id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can update their agency" ON agencies
    FOR UPDATE
    USING (
        id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create agencies" ON agencies
    FOR INSERT
    WITH CHECK (true);

-- Agency Owners: Pueden ver su propio registro
CREATE POLICY "Agency owners can view their own record" ON agency_owners
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create agency owner records" ON agency_owners
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Clients: Los dueños de agencia pueden gestionar clientes
CREATE POLICY "Agency owners can view their clients" ON clients
    FOR SELECT
    USING (
        agency_id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can create clients" ON clients
    FOR INSERT
    WITH CHECK (
        agency_id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can update their clients" ON clients
    FOR UPDATE
    USING (
        agency_id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can delete their clients" ON clients
    FOR DELETE
    USING (
        agency_id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

-- Projects: Los dueños de agencia pueden gestionar proyectos
CREATE POLICY "Agency owners can view their projects" ON projects
    FOR SELECT
    USING (
        agency_id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can create projects" ON projects
    FOR INSERT
    WITH CHECK (
        agency_id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can update their projects" ON projects
    FOR UPDATE
    USING (
        agency_id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can delete their projects" ON projects
    FOR DELETE
    USING (
        agency_id IN (
            SELECT agency_id FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

-- Project Phases: Los dueños de agencia pueden gestionar fases
CREATE POLICY "Agency owners can view project phases" ON project_phases
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN agency_owners ao ON p.agency_id = ao.agency_id
            WHERE ao.user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can create project phases" ON project_phases
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN agency_owners ao ON p.agency_id = ao.agency_id
            WHERE ao.user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can update project phases" ON project_phases
    FOR UPDATE
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN agency_owners ao ON p.agency_id = ao.agency_id
            WHERE ao.user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can delete project phases" ON project_phases
    FOR DELETE
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN agency_owners ao ON p.agency_id = ao.agency_id
            WHERE ao.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA CLIENTES
-- =====================================================

-- Clients: Los clientes pueden ver su propio registro
CREATE POLICY "Clients can view their own record" ON clients
    FOR SELECT
    USING (user_id = auth.uid());

-- Agencies: Los clientes pueden ver la agencia a la que pertenecen
CREATE POLICY "Clients can view their agency" ON agencies
    FOR SELECT
    USING (
        id IN (
            SELECT agency_id FROM clients 
            WHERE user_id = auth.uid()
        )
    );

-- Projects: Los clientes pueden ver sus proyectos asignados
CREATE POLICY "Clients can view their projects" ON projects
    FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM clients 
            WHERE user_id = auth.uid()
        )
    );

-- Project Phases: Los clientes pueden ver las fases de sus proyectos
CREATE POLICY "Clients can view their project phases" ON project_phases
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN clients c ON p.client_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- =====================================================
-- REALTIME CONFIGURATION
-- =====================================================

-- Habilitar Realtime para la tabla project_phases
-- Esto permite que los cambios se reflejen automáticamente
-- en todas las sesiones conectadas sin necesidad de refrescar.

-- Nota: Si el comando falla, ejecuta este SQL manualmente en el SQL Editor de Supabase:
-- ALTER PUBLICATION supabase_realtime ADD TABLE project_phases;

-- Intentar agregar la tabla a la publicación de Realtime
-- Si la publicación no existe o ya tiene la tabla, esto puede fallar silenciosamente
DO $$
BEGIN
    -- Verificar si la tabla ya está en la publicación
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'project_phases'
    ) THEN
        -- Agregar la tabla a la publicación
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE project_phases';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Si falla, registrar el error pero continuar
        RAISE NOTICE 'No se pudo agregar project_phases a supabase_realtime: %', SQLERRM;
END $$;

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Crear bucket para documentos de proyectos
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para logos de agencias
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Los dueños de agencia pueden subir documentos
CREATE POLICY "Agency owners can upload documents" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'project-documents' AND
        (storage.foldername(name))[1] IN (
            SELECT agency_id::text FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

-- Política: Los dueños de agencia pueden ver documentos
CREATE POLICY "Agency owners can view documents" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'project-documents' AND
        (storage.foldername(name))[1] IN (
            SELECT agency_id::text FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

-- Política: Los dueños de agencia pueden eliminar documentos
CREATE POLICY "Agency owners can delete documents" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'project-documents' AND
        (storage.foldername(name))[1] IN (
            SELECT agency_id::text FROM agency_owners 
            WHERE user_id = auth.uid()
        )
    );

-- Política: Los clientes pueden ver documentos de sus proyectos
CREATE POLICY "Clients can view their project documents" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'project-documents' AND
        (storage.foldername(name))[1] IN (
            SELECT c.agency_id::text FROM clients c 
            WHERE c.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA LOGOS DE AGENCIAS
-- =====================================================

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

