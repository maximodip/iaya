import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, EmptyState } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ClientsTable } from '@/components/agency/clients-table'
import { Plus, Users } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: agencyOwner } = await supabase
    .from('agency_owners')
    .select('agency_id')
    .eq('user_id', user.id)
    .single()

  if (!agencyOwner) {
    redirect('/onboarding')
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('*, projects:projects(id)')
    .eq('agency_id', agencyOwner.agency_id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestiona los clientes de tu agencia"
      >
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </PageHeader>

      {clients && clients.length > 0 ? (
        <ClientsTable clients={clients} />
      ) : (
        <EmptyState
          icon={Users}
          title="No hay clientes"
          description="Crea tu primer cliente para comenzar a gestionar proyectos"
        >
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear Cliente
            </Link>
          </Button>
        </EmptyState>
      )}
    </div>
  )
}

