# Prompt Detallado: Plataforma de Gestión de Proyectos para Agencias de IA

## Contexto General
Necesito crear una aplicación web SaaS B2B donde vendo acceso a dueños de agencias de inteligencia artificial. Esta plataforma permite a los dueños de agencias gestionar sus clientes y mostrarles el progreso de sus proyectos en tiempo real.

## Stack Tecnológico
- **Framework:** Next.js (App Router)
- **UI Library:** ShadCN UI
- **Base de datos y Backend:** Supabase (Auth, Database, Storage)
- **IA:** OpenAI API (análisis de documentos)
- **Package Manager:** pnpm
- **IDE:** Cursor
- **MCPs a utilizar:** Vercel MCP, Context7 MCP, Next.js MCP, ShadCN MCP, Supabase MCP

## Arquitectura de Usuarios (3 Niveles)

### 1. Admin/Propietario (Tú)
- Gestiona las cuentas de dueños de agencias
- (Fuera del scope inicial, no necesita interfaz ahora)

### 2. Dueños de Agencia (Clientes principales)
- Compran acceso a la plataforma
- Configuran su agencia (branding)
- Crean y gestionan cuentas de sus clientes
- Crean proyectos y suben documentos
- Actualizan el estado de las fases de proyectos

### 3. Clientes de las Agencias (Usuarios finales)
- Reciben acceso de su agencia
- Ven sus proyectos asignados
- Monitorean el progreso de las fases en tiempo real

## Funcionalidades Principales

### A. Onboarding del Dueño de Agencia
Al iniciar sesión por primera vez, el dueño debe completar:
1. **Nombre de la agencia**
2. **Configuración de colores** (color primario, secundario, etc.)
3. **Objetivo principal** (texto descriptivo)

**Nota:** Durante desarrollo, usar diseño neutro. En producción, aplicar el branding según configuración de cada agencia.

### B. Dashboard del Dueño de Agencia
Debe incluir:
- Lista de clientes registrados
- Botón para crear nuevos clientes
- Lista de proyectos activos
- Botón para crear nuevos proyectos
- Resumen de estados de proyectos (pendientes, en proceso, terminados)

### C. Gestión de Clientes
El dueño de agencia puede:
- Crear cuentas para sus clientes (email, nombre, contraseña generada/enviada)
- Ver lista de todos sus clientes
- Editar información de clientes
- Asignar proyectos a clientes

### D. Creación y Gestión de Proyectos
Flujo completo:
1. **Crear proyecto:** Nombre, descripción, cliente asignado
2. **Subir documento:** Aceptar formatos DOC, DOCX, PDF
3. **Almacenar en Supabase Storage:** Guardar el archivo
4. **Procesamiento con OpenAI:**
   - Extraer texto del documento (usar librería apropiada para PDFs/DOCs)
   - Enviar a OpenAI API con prompt específico para identificar fases del proyecto
   - Solicitar respuesta estructurada (JSON) con las fases detectadas
5. **Mostrar fases extraídas:** Lista editable de fases
6. **Gestión de estados:** Cada fase puede estar en:
   - 🔵 Pendiente
   - 🟡 En Proceso
   - 🟢 Terminada

### E. Vista del Cliente Final
Cuando un cliente inicia sesión:
- Ver proyectos asignados a él
- Ver el nombre del proyecto y descripción
- Ver todas las fases con su estado actual
- Actualización en tiempo real (cuando el dueño cambia estados)
- Diseño limpio y fácil de entender

## Estructura de Base de Datos (Supabase)

### Tablas principales:

**agencies**
- id (uuid, PK)
- name (text)
- primary_color (text)
- secondary_color (text)
- main_objective (text)
- created_at (timestamp)

**agency_owners**
- id (uuid, PK)
- agency_id (uuid, FK → agencies)
- user_id (uuid, FK → auth.users)
- email (text)
- name (text)
- created_at (timestamp)

**clients**
- id (uuid, PK)
- agency_id (uuid, FK → agencies)
- user_id (uuid, FK → auth.users)
- email (text)
- name (text)
- created_at (timestamp)

**projects**
- id (uuid, PK)
- agency_id (uuid, FK → agencies)
- client_id (uuid, FK → clients)
- name (text)
- description (text)
- document_url (text) // Supabase Storage URL
- created_at (timestamp)
- updated_at (timestamp)

**project_phases**
- id (uuid, PK)
- project_id (uuid, FK → projects)
- phase_name (text)
- phase_description (text)
- status (enum: 'pending', 'in_progress', 'completed')
- order (integer) // Para mantener orden de fases
- created_at (timestamp)
- updated_at (timestamp)

### Row Level Security (RLS)
- Los dueños de agencia solo pueden ver/editar datos de su propia agencia
- Los clientes solo pueden ver sus propios proyectos asignados
- Implementar políticas RLS en todas las tablas

## Flujo de Autenticación (Supabase Auth)

### Para Dueños de Agencia:
- Registro/Login con email y contraseña
- Al registrarse, crear entrada en `agencies` y `agency_owners`
- Redirigir a onboarding si no ha completado configuración

### Para Clientes:
- Cuenta creada por el dueño de agencia
- Login con credenciales enviadas
- Solo acceso de lectura a sus proyectos

## Integración con OpenAI

### Prompt para extracción de fases:
```
Analiza el siguiente documento de proyecto y extrae todas las fases o etapas del proyecto.
Devuelve la respuesta en formato JSON con la siguiente estructura:
{
  "phases": [
    {
      "name": "Nombre de la fase",
      "description": "Breve descripción de la fase"
    }
  ]
}

Documento:
[TEXTO_DEL_DOCUMENTO]
```

### Implementación:
- Usar `openai` npm package
- Modelo recomendado: `gpt-4-turbo` o `gpt-4o` para mejor análisis
- Manejar errores y timeouts
- Mostrar indicador de carga durante procesamiento

## Almacenamiento de Archivos (Supabase Storage)

### Bucket: `project-documents`
- Estructura: `{agency_id}/{project_id}/{filename}`
- Configuración de seguridad: Solo owners pueden subir
- Tipos permitidos: PDF, DOC, DOCX
- Tamaño máximo: 10MB

## Diseño UI/UX

### Durante Desarrollo (Neutro):
- Usar colores predeterminados de ShadCN
- Diseño limpio y profesional
- Enfoque en funcionalidad

### En Producción:
- Aplicar colores de `agencies.primary_color` y `secondary_color`
- Mostrar nombre de agencia en header
- Personalización dinámica según sesión

## Componentes Clave de ShadCN a Utilizar

- **Form** (formularios de onboarding, creación)
- **Table** (listas de clientes, proyectos)
- **Card** (visualización de proyectos y fases)
- **Badge** (estados de fases)
- **Button** (acciones principales)
- **Dialog** (modales de creación/edición)
- **Tabs** (navegación en dashboard)
- **Avatar** (perfiles de usuarios)
- **Progress** (barra de progreso del proyecto)
- **Upload** (subida de documentos)

## Estructura de Carpetas Sugerida

```
/app
  /(auth)
    /login
    /register
  /(agency)
    /dashboard
    /clients
    /projects
      /[id]
    /settings
  /(client-portal)
    /projects
      /[id]
  /api
    /openai
      /analyze-document
/components
  /ui (ShadCN components)
  /agency
  /client-portal
  /shared
/lib
  /supabase
  /openai
  /utils
/types
```

## Pasos de Implementación Recomendados

### Fase 1: Setup y Configuración
1. Inicializar proyecto Next.js con pnpm
2. Configurar ShadCN UI
3. Configurar Supabase (crear proyecto, tablas, RLS)
4. Configurar OpenAI API

### Fase 2: Autenticación
1. Implementar registro/login con Supabase Auth
2. Crear middleware de protección de rutas
3. Implementar onboarding

### Fase 3: Dashboard de Agencia
1. Crear layout principal
2. Implementar gestión de clientes
3. Implementar creación de proyectos
4. Integrar subida de documentos a Storage

### Fase 4: Integración OpenAI
1. Crear API route para análisis de documentos
2. Implementar extracción de texto (PDF/DOC)
3. Procesar con OpenAI
4. Guardar fases en base de datos

### Fase 5: Gestión de Fases
1. Interfaz para ver fases
2. Cambio de estados
3. Actualización en tiempo real (Supabase Realtime opcional)

### Fase 6: Portal del Cliente
1. Vista de proyectos asignados
2. Visualización de fases y estados
3. Diseño responsivo

### Fase 7: Personalización (Producción)
1. Aplicar branding dinámico
2. Temas por agencia
3. Testing final

## Consideraciones de Seguridad

- ✅ Implementar RLS en todas las tablas de Supabase
- ✅ Validar archivos subidos (tipo, tamaño)
- ✅ Sanitizar inputs de usuarios
- ✅ Proteger API routes con autenticación
- ✅ No exponer API keys en frontend
- ✅ Usar variables de entorno para secrets

## Variables de Entorno Necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## Testing

- Probar flujo completo: registro → onboarding → creación cliente → proyecto → análisis
- Verificar RLS: clientes no pueden ver proyectos de otros
- Probar con diferentes tipos de documentos
- Verificar estados de fases en tiempo real

## Próximos Pasos

1. ¿Quieres que comience con el setup inicial del proyecto?
2. ¿Necesitas ayuda con el schema detallado de Supabase?
3. ¿Prefieres empezar por alguna funcionalidad específica?