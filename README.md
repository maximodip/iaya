# IAya - Plataforma de Gestión de Proyectos para Agencias de IA

Plataforma SaaS B2B que permite a dueños de agencias de IA gestionar sus clientes y mostrar el progreso de proyectos en tiempo real.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **UI:** ShadCN UI + Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL + Auth + Storage)
- **IA:** OpenAI API (GPT-4o para análisis de documentos)
- **Lenguaje:** TypeScript
- **Package Manager:** pnpm

## ✨ Características Principales

### Para Dueños de Agencia
- 📊 Dashboard con estadísticas de clientes y proyectos
- 👥 Gestión completa de clientes (crear, editar, eliminar)
- 📁 Gestión de proyectos con fases personalizables
- 🤖 Extracción automática de fases usando IA (GPT-4o)
- 📄 Subida de documentos (PDF, DOC, DOCX)
- 🎨 Personalización de colores de marca

### Para Clientes
- 🔍 Portal de visualización de proyectos
- 📈 Seguimiento de progreso en tiempo real
- 📋 Vista detallada de fases y estados

## 📦 Instalación

### Prerequisitos
- Node.js 18+
- pnpm
- Cuenta de Supabase
- API Key de OpenAI

### Pasos

1. **Clonar e instalar dependencias**
```bash
pnpm install
```

2. **Configurar variables de entorno**
Crear un archivo `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
OPENAI_API_KEY=tu_api_key_de_openai
GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key_de_google_gemini
```

3. **Configurar base de datos en Supabase**
- Ir al SQL Editor en tu proyecto de Supabase
- Ejecutar el script `supabase/schema.sql`

4. **Crear Storage Bucket**
- En Supabase, ir a Storage
- El bucket `project-documents` se crea automáticamente con el SQL

5. **Iniciar servidor de desarrollo**
```bash
pnpm dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 🗄️ Estructura de Base de Datos

### Tablas
- `agencies` - Información de las agencias
- `agency_owners` - Dueños de agencias (vinculados a auth.users)
- `clients` - Clientes de las agencias (vinculados a auth.users)
- `projects` - Proyectos asignados a clientes
- `project_phases` - Fases de cada proyecto

### Row Level Security (RLS)
- Los dueños solo acceden a datos de su agencia
- Los clientes solo ven sus proyectos asignados
- Políticas implementadas en todas las tablas

## 📁 Estructura del Proyecto

```
/src
  /app
    /(auth)           # Páginas de autenticación
      /login
      /register
      /onboarding
    /(agency)         # Panel de dueño de agencia
      /dashboard
      /clients
      /projects
      /settings
    /(client-portal)  # Portal del cliente
      /portal
    /api
      /clients/create
      /openai/analyze-document
  /components
    /ui               # Componentes ShadCN
    /agency           # Componentes del panel de agencia
    /client-portal    # Componentes del portal de cliente
    /shared           # Componentes compartidos
  /lib
    /supabase         # Clientes de Supabase
    /openai           # Cliente de OpenAI
  /types              # Definiciones de TypeScript
/supabase
  schema.sql          # Script de base de datos
```

## 🔐 Flujos de Autenticación

### Registro de Dueño de Agencia
1. Usuario se registra con email/password
2. Se redirige a onboarding
3. Completa nombre de agencia, colores y objetivo
4. Se crea registro en `agencies` y `agency_owners`
5. Redirige al dashboard

### Creación de Cliente
1. Dueño crea cliente desde panel
2. Se genera usuario en Supabase Auth
3. Se crea registro en `clients`
4. Cliente puede iniciar sesión con credenciales

## 📄 Análisis de Documentos con IA

El sistema utiliza GPT-4o para extraer fases de documentos:

1. El dueño sube un PDF/DOC/DOCX
2. Se extrae el texto del documento
3. Se envía a OpenAI con prompt específico
4. GPT-4o identifica las fases del proyecto
5. Las fases se guardan automáticamente en la base de datos

## 🎨 Personalización

Cada agencia puede personalizar:
- Color primario
- Color secundario
- Nombre de la agencia
- Objetivo principal

Los colores se aplican dinámicamente en el portal del cliente.

## 🛠️ Scripts Disponibles

```bash
pnpm dev      # Servidor de desarrollo
pnpm build    # Build de producción
pnpm start    # Iniciar producción
pnpm lint     # Verificar linting
```

## 📝 Licencia

MIT License
