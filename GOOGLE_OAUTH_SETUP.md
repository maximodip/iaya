# Configuración de Google OAuth en Supabase

Este documento explica cómo habilitar Google OAuth en tu proyecto de Supabase.

## Paso 1: Crear credenciales OAuth en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en **Create Credentials** → **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento OAuth:
   - Tipo de aplicación: **External**
   - Completa la información requerida
   - Guarda y continúa
6. Crea el OAuth Client ID:
   - Tipo de aplicación: **Web application**
   - Nombre: Ej. "IAYA - Supabase Auth"
   - **Authorized redirect URIs**: Añade la siguiente URL:
     ```
     https://ckmesaeevbkjpuhxllwz.supabase.co/auth/v1/callback
     ```
     Reemplaza `[TU-PROYECTO-ID]` con el ID de tu proyecto Supabase (lo encuentras en la URL del dashboard de Supabase)
7. Copia el **Client ID** y **Client Secret** generados

## Paso 2: Habilitar Google OAuth en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. Navega a **Authentication** → **Providers**
3. Busca **Google** en la lista de proveedores
4. Haz clic en el toggle para **habilitar** Google
5. Ingresa las credenciales:
   - **Client ID (for OAuth)**: Pega el Client ID de Google Cloud Console
   - **Client Secret (for OAuth)**: Pega el Client Secret de Google Cloud Console
6. Haz clic en **Save**

## Paso 3: Verificar la configuración

1. Asegúrate de que la URL de redirect en Google Cloud Console coincida exactamente con:
   ```
   https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback
   ```
2. Verifica que las variables de entorno en tu proyecto Next.js estén configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Paso 4: Probar el login

1. Inicia tu servidor de desarrollo: `npm run dev` o `pnpm dev`
2. Ve a la página de login: `http://localhost:3000/login`
3. Haz clic en "Continuar con Google"
4. Deberías ser redirigido a Google para autenticarte

## Solución de problemas

### Error: "Unsupported provider: provider is not enabled"
- **Solución**: Asegúrate de haber habilitado Google en Supabase Dashboard → Authentication → Providers

### Error: "redirect_uri_mismatch"
- **Solución**: Verifica que la URL de redirect en Google Cloud Console sea exactamente:
  ```
  https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback
  ```
  Sin barras al final y con el protocolo `https://`

### Error: "invalid_client"
- **Solución**: Verifica que el Client ID y Client Secret en Supabase sean correctos y coincidan con los de Google Cloud Console

## Notas importantes

- El Client Secret debe mantenerse seguro y nunca exponerse en el código del cliente
- Para producción, asegúrate de añadir tu dominio de producción a las URLs autorizadas en Google Cloud Console
- El flujo de OAuth funciona tanto para login como para registro automáticamente

