# IAya - Plataforma de Gestión de Proyectos para Agencias de IA

## ¿Qué es IAya?

IAya es una plataforma diseñada para agencias de inteligencia artificial que necesitan gestionar sus proyectos y mantener a sus clientes informados sobre el progreso de sus trabajos.

## ¿Para quién es esta plataforma?

### Dueños de Agencias de IA
Personas que dirigen agencias de inteligencia artificial y necesitan:
- Organizar sus clientes y proyectos en un solo lugar
- Mostrar el progreso de los proyectos a sus clientes de forma profesional
- Ahorrar tiempo en la gestión administrativa

### Clientes de las Agencias
Empresas o personas que contratan servicios de agencias de IA y quieren:
- Ver el estado de sus proyectos en tiempo real
- Entender qué fases del proyecto están completadas, en proceso o pendientes
- Tener visibilidad clara del progreso de su inversión

## ¿Qué problemas resuelve?

### Para las Agencias:
- **Organización**: Centraliza toda la información de clientes y proyectos en un solo lugar
- **Comunicación**: Evita tener que enviar emails constantes para actualizar a los clientes
- **Profesionalismo**: Ofrece una experiencia moderna y profesional a los clientes
- **Automatización**: Extrae automáticamente las fases de un proyecto desde documentos usando inteligencia artificial

### Para los Clientes:
- **Transparencia**: Ven exactamente en qué etapa está su proyecto en cualquier momento
- **Claridad**: Entienden qué fases del proyecto están completadas y cuáles faltan
- **Confianza**: Tienen visibilidad constante del trabajo que están pagando

## ¿Cómo funciona?

### Para el Dueño de la Agencia:

1. **Registro y Onboarding**
   - Se registra en la plataforma con email y contraseña
   - Completa un proceso de onboarding en 3 pasos:
     - **Paso 1**: Define el nombre de su agencia
     - **Paso 2**: Personaliza los colores primario y secundario de su marca (con vista previa en tiempo real)
     - **Paso 3**: Describe el objetivo principal de su agencia
   - Una vez completado, accede al dashboard de la agencia

2. **Gestión de Clientes**
   - Accede a la sección "Clientes" desde el menú lateral
   - Crea nuevos clientes proporcionando:
     - Nombre del cliente
     - Email (se crea automáticamente una cuenta de usuario)
     - Contraseña temporal (el cliente puede cambiarla después)
   - Visualiza todos sus clientes en una tabla con información relevante
   - Puede editar la información de los clientes existentes
   - Cada cliente recibe credenciales de acceso y solo puede ver sus propios proyectos

3. **Creación de Proyectos**
   - Accede a la sección "Proyectos" y crea un nuevo proyecto
   - Define la información básica:
     - Nombre del proyecto
     - Descripción detallada
     - Cliente asignado (debe existir previamente)
   - Opcionalmente sube un documento (PDF, DOC, DOCX hasta 10MB):
     - El documento se almacena en Supabase Storage
     - La plataforma usa OpenAI para analizar el documento automáticamente
     - Se extraen las fases del proyecto con nombre y descripción
     - Si hay error en el análisis, el proyecto se crea sin fases (puede agregarlas manualmente después)
   - Puede editar, agregar o eliminar fases después de crear el proyecto
   - El documento queda disponible para consulta posterior

4. **Seguimiento de Progreso**
   - Visualiza cada proyecto con todas sus fases
   - Actualiza el estado de cada fase del proyecto:
     - 🔵 Pendiente (`pending`)
     - 🟡 En Proceso (`in_progress`)
     - 🟢 Terminada (`completed`)
   - Los cambios se guardan automáticamente
   - Los clientes ven estos cambios en tiempo real sin necesidad de refrescar la página

5. **Dashboard**
   - Ve un resumen completo con estadísticas:
     - Total de clientes
     - Total de proyectos
     - Proyectos pendientes
     - Proyectos en progreso
     - Proyectos completados
   - Visualiza los 5 proyectos más recientes con información resumida
   - Ve los 5 clientes más recientes
   - Navega rápidamente a cualquier proyecto o cliente

6. **Configuración de la Agencia**
   - Accede a "Configuración" desde el menú
   - Edita el nombre de la agencia
   - Modifica los colores primario y secundario (con vista previa en tiempo real)
   - Actualiza el objetivo principal
   - Los cambios se aplican inmediatamente en toda la plataforma (dashboard de agencia y portal de clientes)

### Para el Cliente:

1. **Acceso**
   - Recibe credenciales de acceso de su agencia (email y contraseña)
   - Inicia sesión en el portal de clientes
   - El portal está personalizado con los colores de marca de la agencia

2. **Visualización de Proyectos**
   - Ve todos los proyectos asignados a él en una vista de tarjetas
   - Cada proyecto muestra:
     - Nombre y descripción del proyecto
     - Progreso general del proyecto (porcentaje completado)
     - Todas las fases del proyecto en orden
     - Estado visual de cada fase con badges de color:
       - 🔵 Pendiente
       - 🟡 En Proceso
       - 🟢 Terminada
     - Timeline visual del progreso
   - Puede hacer clic en un proyecto para ver detalles completos

3. **Actualizaciones en Tiempo Real**
   - Cuando la agencia actualiza el estado de una fase, el cliente lo ve inmediatamente
   - No necesita refrescar la página para ver los cambios
   - El progreso se actualiza automáticamente en todas las vistas
   - La experiencia es fluida y sin interrupciones

## Características Principales

### Extracción Automática de Fases con IA
- La plataforma puede leer documentos de proyectos (PDF, DOC, DOCX) y extraer automáticamente las fases y etapas usando OpenAI
- El análisis se realiza después de crear el proyecto, permitiendo que el dueño de la agencia confirme las fases antes de continuar
- Si hay un error en el análisis, el proyecto se crea sin fases y el dueño puede agregarlas manualmente
- Soporta documentos hasta 10MB
- Los documentos se almacenan en Supabase Storage y están disponibles para consulta posterior

### Portal Personalizado para Clientes
- Cada cliente tiene su propio portal donde solo ve sus proyectos asignados
- El branding de la agencia se aplica automáticamente (colores primario y secundario)
- Interfaz limpia y profesional que refleja la identidad de la agencia
- Navegación intuitiva y fácil de usar

### Actualizaciones en Tiempo Real
- Implementado con Supabase Realtime
- Los cambios que hace la agencia se reflejan inmediatamente en el portal del cliente
- No requiere refrescar la página
- Sincronización automática de estados de fases y progreso
- Experiencia fluida y moderna

### Gestión Completa de Clientes
- Las agencias pueden crear, editar y gestionar todas las cuentas de sus clientes desde un panel centralizado
- Tabla de clientes con información relevante
- Creación de usuarios automática al crear un cliente
- Cada cliente tiene acceso independiente a su portal

### Seguimiento de Progreso Visual
- Los proyectos muestran claramente qué fases están completadas, cuáles están en proceso y cuáles están pendientes
- Indicadores visuales con badges de color para cada estado
- Porcentaje de progreso calculado automáticamente
- Timeline visual del progreso del proyecto
- Facilita la comunicación entre agencia y cliente

### Almacenamiento de Documentos
- Los documentos de proyectos se guardan en Supabase Storage
- Organizados por agencia para mejor gestión
- Accesibles desde la vista de detalles del proyecto
- Los clientes pueden ver y descargar los documentos relacionados con sus proyectos

### Dashboard con Estadísticas
- Vista general de toda la agencia
- Estadísticas en tiempo real:
  - Total de clientes
  - Total de proyectos
  - Proyectos por estado (pendientes, en progreso, completados)
- Lista de proyectos recientes
- Lista de clientes recientes
- Navegación rápida a cualquier sección

### Configuración de Agencia
- Panel de configuración accesible desde el menú
- Edición de información básica de la agencia
- Personalización de colores de marca con vista previa en tiempo real
- Los cambios se aplican inmediatamente en toda la plataforma

## Beneficios Clave

- **Ahorro de Tiempo**: La extracción automática de fases con IA reduce significativamente el tiempo de configuración de proyectos
- **Mejor Comunicación**: Los clientes siempre saben el estado de sus proyectos sin necesidad de contactar a la agencia
- **Profesionalismo**: Presenta una imagen moderna y profesional a los clientes con branding personalizado
- **Organización**: Todo está centralizado y fácil de encontrar en un solo lugar
- **Escalabilidad**: Puede manejar múltiples clientes y proyectos simultáneamente
- **Transparencia**: Los clientes tienen visibilidad completa del progreso en tiempo real
- **Eficiencia**: Reduce la carga administrativa de las agencias
- **Experiencia de Usuario**: Interfaz moderna y fácil de usar tanto para agencias como para clientes

## Precios y Planes

### Modelo de Precio Único

IAya utiliza un modelo de **pago único** que ofrece acceso completo y permanente a la plataforma.

#### Precio: $750 USD

**Pago único, sin suscripciones recurrentes**

### ¿Qué incluye el pago único?

✅ **Acceso de por vida**
- Una vez que pagas, tienes acceso completo a la plataforma de forma permanente
- Sin límites de tiempo ni renovaciones necesarias
- Tu cuenta permanece activa indefinidamente

✅ **Todas las funcionalidades incluidas**
- Gestión completa de clientes (ilimitados)
- Gestión de proyectos (ilimitados)
- Extracción automática de fases con IA (OpenAI)
- Portal personalizado para clientes
- Actualizaciones en tiempo real
- Almacenamiento de documentos
- Personalización de branding (colores, nombre, objetivo)
- Dashboard con estadísticas
- Configuración de agencia

✅ **Actualizaciones mensuales**
- Recibe mejoras y nuevas funcionalidades cada mes
- Basadas en el feedback de la comunidad de usuarios
- Sin costos adicionales

✅ **Soporte y configuración inicial**
- Después del pago, recibes un mini tutorial guiado
- Te ayuda a configurar tus credenciales de Supabase
- Te guía para configurar tu API Key de OpenAI
- Asistencia para comenzar a usar la plataforma

### ¿Por qué precio único?

- **Sin sorpresas**: Sabes exactamente cuánto pagarás, sin costos ocultos
- **Mejor inversión a largo plazo**: Más económico que suscripciones mensuales o anuales
- **Sin preocupaciones**: No necesitas recordar renovar suscripciones
- **Propiedad completa**: Tienes acceso permanente sin dependencias de pagos recurrentes

### Proceso de Pago y Activación

1. **Registro**: Crea tu cuenta en la plataforma
2. **Pago**: Realiza el pago único de $997 USD (procesado de forma segura)
3. **Tutorial de configuración**: Recibe guía paso a paso para:
   - Configurar tu proyecto de Supabase
   - Obtener y configurar tu API Key de OpenAI
   - Completar el onboarding de tu agencia
4. **¡Listo!**: Comienza a usar todas las funcionalidades de inmediato

### Costos Adicionales

**Importante**: El pago único cubre el acceso a la plataforma, pero necesitarás:

- **Cuenta de Supabase**: Puedes usar el plan gratuito o pagar según tu uso (almacenamiento, ancho de banda, etc.)
- **API Key de OpenAI**: Debes tener tu propia cuenta de OpenAI y pagar según el uso de la API (análisis de documentos)

Estos son servicios externos que tú gestionas directamente. La plataforma te guía en la configuración inicial de ambos.

## Casos de Uso

- Agencias que desarrollan chatbots y necesitan mostrar las fases de desarrollo
- Empresas que implementan soluciones de IA y quieren que sus clientes vean el progreso
- Consultoras de IA que gestionan múltiples proyectos simultáneamente
- Cualquier agencia que quiera mejorar la comunicación con sus clientes sobre el progreso de proyectos
- Startups de IA que necesitan una plataforma profesional para gestionar sus clientes
- Agencias que trabajan con múltiples proyectos complejos y necesitan organización

## Tecnologías y Arquitectura

### Stack Tecnológico
- **Frontend**: Next.js 14+ con App Router, React, TypeScript
- **Estilos**: TailwindCSS, componentes Shadcn/UI
- **Backend**: Next.js API Routes
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **Tiempo Real**: Supabase Realtime
- **IA**: OpenAI API para análisis de documentos

### Características Técnicas
- **Autenticación**: Sistema de autenticación con roles (dueño de agencia / cliente)
- **Row Level Security (RLS)**: Seguridad a nivel de fila en Supabase para proteger datos
- **Middleware**: Protección de rutas basada en roles de usuario
- **Server Components**: Uso de React Server Components para mejor rendimiento
- **Client Components**: Componentes interactivos donde es necesario
- **Hooks Personalizados**: Hooks para manejo de actualizaciones en tiempo real
- **Validación**: Validación de archivos (tipo y tamaño) antes de procesar
- **Manejo de Errores**: Manejo robusto de errores con mensajes claros al usuario

### Flujo de Datos
1. **Onboarding**: Usuario se registra → Crea agencia → Configura branding
2. **Gestión de Clientes**: Crea cliente → Se genera usuario automáticamente → Cliente puede iniciar sesión
3. **Creación de Proyectos**: Crea proyecto → Sube documento (opcional) → IA analiza → Extrae fases → Usuario confirma
4. **Actualización de Progreso**: Cambia estado de fase → Supabase Realtime → Cliente ve cambio inmediatamente

