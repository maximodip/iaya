'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Agency, AgencyOwner } from '@/types'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Settings, 
  LogOut,
  ChevronUp,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'

interface AgencySidebarProps {
  agency: Agency | null
  user: AgencyOwner
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Clientes',
    href: '/clients',
    icon: Users,
  },
  {
    title: 'Proyectos',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
]

export const AgencySidebar = ({ agency, user }: AgencySidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          {agency?.logo_url ? (
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-primary/10 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={agency.logo_url}
                alt={agency.name || 'Logo de agencia'}
                className="h-full w-full object-contain p-1"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {agency?.name || 'Mi Agencia'}
            </span>
            <span className="text-xs text-muted-foreground">Panel de Control</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="transition-all hover:bg-sidebar-accent/80"
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-4 w-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent transition-all hover:bg-sidebar-accent/80"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-offset-sidebar ring-primary/20 transition-all">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col text-left text-sm">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="top"
                align="start"
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

