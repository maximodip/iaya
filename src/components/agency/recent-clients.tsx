'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, ArrowRight, Plus, Mail } from 'lucide-react'
import { EmptyState } from '@/components/shared'
import type { Client } from '@/types'

interface RecentClientsProps {
  clients: Client[]
}

export const RecentClients = ({ clients }: RecentClientsProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="Sin clientes"
            description="Agrega tu primer cliente para comenzar"
          >
            <Button asChild>
              <Link href="/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Link>
            </Button>
          </EmptyState>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Clientes Recientes
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">{client.name}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {formatDate(client.created_at)}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

