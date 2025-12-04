'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, LoadingSpinner } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, User, Mail, Save } from 'lucide-react'
import type { Client } from '@/types'

export default function EditClientPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const supabase = createClient()

  const loadClient = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: agencyOwner } = await supabase
        .from('agency_owners')
        .select('agency_id')
        .eq('user_id', user.id)
        .single()

      if (!agencyOwner) {
        router.push('/onboarding')
        return
      }

      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('agency_id', agencyOwner.agency_id)
        .single()

      if (!clientData) {
        toast.error('Cliente no encontrado')
        router.push('/clients')
        return
      }

      setClient(clientData)
      setName(clientData.name)
      setEmail(clientData.email)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, clientId, router])

  useEffect(() => {
    loadClient()
  }, [loadClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!email.trim()) {
      toast.error('El email es requerido')
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('clients')
        .update({ name, email })
        .eq('id', clientId)

      if (error) {
        toast.error('Error al actualizar cliente', {
          description: error.message,
        })
        return
      }

      toast.success('Cliente actualizado exitosamente')
      router.push(`/clients/${clientId}`)
      router.refresh()
    } catch {
      toast.error('Error inesperado')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando cliente..." />
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/clients/${clientId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al cliente
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Editar Cliente"
        description={`Modificando información de ${client.name}`}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Información del Cliente</CardTitle>
          <CardDescription>
            Actualiza los datos del cliente.
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                  aria-label="Email del cliente"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Nota: Cambiar el email aquí no actualiza las credenciales de acceso del cliente.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

