'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/shared'
import { toast } from 'sonner'
import { LogIn, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate Supabase configuration
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        toast.error('Error de configuración', {
          description: 'Las variables de entorno de Supabase no están configuradas correctamente.',
        })
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error('Error al iniciar sesión', {
          description: error.message,
        })
        setIsLoading(false)
        return
      }

      if (!data.user) {
        toast.error('Error al iniciar sesión', {
          description: 'No se pudo obtener la información del usuario.',
        })
        setIsLoading(false)
        return
      }

      toast.success('¡Bienvenido!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error inesperado', {
        description: errorMessage || 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      // Validate Supabase configuration
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        toast.error('Error de configuración', {
          description: 'Las variables de entorno de Supabase no están configuradas correctamente.',
        })
        setIsLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Check if provider is not enabled
        if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
          toast.error('Google OAuth no está configurado', {
            description: 'Por favor, habilita Google como proveedor de autenticación en el dashboard de Supabase.',
            duration: 6000,
          })
        } else {
          toast.error('Error al iniciar sesión con Google', {
            description: error.message,
          })
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Google login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error inesperado', {
        description: errorMessage || 'Por favor, intenta de nuevo.',
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">Iniciar Sesión</CardTitle>
        <CardDescription className="text-zinc-400">
          Ingresa tus credenciales para acceder
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-zinc-800 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500"
                required
                disabled={isLoading}
                aria-label="Correo electrónico"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-zinc-800 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500"
                required
                disabled={isLoading}
                aria-label="Contraseña"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
          <div className="flex items-center gap-4 w-full">
            <Separator className="flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500">o</span>
            <Separator className="flex-1 bg-zinc-800" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            aria-label="Iniciar sesión con Google"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuar con Google
              </>
            )}
          </Button>
          <p className="text-center text-sm text-zinc-400">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
              tabIndex={0}
              aria-label="Ir a registro"
            >
              Regístrate aquí
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

