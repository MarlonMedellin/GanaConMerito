# Configuración de Google Auth para Supabase

## Estado actual

El proyecto ya tiene:
- variables de entorno locales para Supabase
- cliente browser y server listos
- callback route en `src/app/api/auth/callback/route.ts`
- helper `signInWithGoogle` en `src/lib/supabase/auth.ts`
- bootstrap automático de `profiles` y `learning_profiles`

## Lo que ya hace el código

Después del callback exitoso:
1. intercambia el `code` por sesión
2. obtiene el usuario autenticado
3. crea o actualiza `profiles`
4. crea o actualiza `learning_profiles`
5. redirige al destino solicitado

## Lo que falta habilitar manualmente

La activación final de Google Auth se hace en el dashboard de Supabase y en Google Cloud Console.

## Paso 1. Crear credenciales OAuth en Google Cloud

Crear un cliente OAuth 2.0 de tipo Web application.

## Paso 2. Configurar Authorized redirect URI

Usar como URI principal:

```text
https://tsyutluozccpltygdrlb.supabase.co/auth/v1/callback
```

## Paso 3. Activar Google provider en Supabase

En Supabase:
- Authentication
- Providers
- Google

Configurar:
- Client ID
- Client Secret
- Enable provider

## Paso 4. Configurar Site URL y Redirect URLs

Definir al menos:

```text
https://ganaconmerito.com
https://ganaconmerito.com/api/auth/callback
https://cnsc.profemarlon.com
https://cnsc.profemarlon.com/api/auth/callback
http://localhost:3000
http://localhost:3000/api/auth/callback
```

## Paso 5. Flujo esperado en app

1. usuario elige login con Google
2. helper `signInWithGoogle()` inicia OAuth
3. Supabase redirige a Google
4. Google vuelve al callback
5. la ruta `src/app/api/auth/callback/route.ts` intercambia el code por sesión
6. el sistema bootstrappea `profiles` y `learning_profiles`
7. el usuario vuelve a la app autenticado

## Trabajo siguiente recomendado

- crear página/login real
- proteger rutas privadas
- implementar sign out
- decidir redirección post-login definitiva (`/home` u onboarding)
