'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Client } from '@/types'

interface ClientsTableProps {
  clients: Array<Client & { projects: { id: string }[] }>
}

export const ClientsTable = ({ clients }: ClientsTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  const handleDelete = async () => {
    if (!selectedClient) return

    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id)

      if (error) {
        toast.error('Error al eliminar cliente', {
          description: error.message,
        })
        return
      }

      toast.success('Cliente eliminado exitosamente')
      router.refresh()
    } catch {
      toast.error('Error inesperado')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedClient(null)
    }
  }

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Proyectos</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {client.projects?.length || 0} proyecto(s)
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(client.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Abrir menú de acciones"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/clients/${client.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/clients/${client.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(client)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar cliente?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente a {selectedClient?.name} y todos
              sus datos asociados. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

