'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared'
import { toast } from 'sonner'
import { UserPlus, Mail, User, Lock, Copy, Check } from 'lucide-react'

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default function NewClientPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(generatePassword())
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Contraseña copiada al portapapeles')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get current user's agency
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('No se encontró sesión activa')
        router.push('/login')
        return
      }

      const { data: agencyOwner } = await supabase
        .from('agency_owners')
        .select('agency_id')
        .eq('user_id', user.id)
        .single()

      if (!agencyOwner) {
        toast.error('No se encontró la agencia')
        return
      }

      // Create client user via API route (needs service role for admin operations)
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          agency_id: agencyOwner.agency_id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error('Error al crear cliente', {
          description: result.error || 'Por favor, intenta de nuevo.',
        })
        return
      }

      toast.success('Cliente creado exitosamente', {
        description: 'El cliente puede iniciar sesión con las credenciales proporcionadas.',
      })

      router.push('/clients')
      router.refresh()
    } catch {
      toast.error('Error inesperado', {
        description: 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Nuevo Cliente"
        description="Crea una cuenta para tu cliente"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Información del Cliente</CardTitle>
          <CardDescription>
            El cliente recibirá estas credenciales para acceder a su portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nombre del cliente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  aria-label="Nombre del cliente"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  aria-label="Email del cliente"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña generada</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 font-mono"
                    required
                    disabled={isLoading}
                    aria-label="Contraseña del cliente"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyPassword}
                  className="shrink-0"
                  aria-label="Copiar contraseña"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPassword(generatePassword())}
                  disabled={isLoading}
                >
                  Regenerar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Guarda esta contraseña para compartirla con el cliente.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Crear Cliente'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

