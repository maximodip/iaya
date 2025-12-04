'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, LogOut, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import type { Client } from '@/types'

interface ClientPortalHeaderProps {
  client: Client
  agency: {
    name: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
  } | null
}

export const ClientPortalHeader = ({ client, agency }: ClientPortalHeaderProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const primaryColor = agency?.primary_color || '#3b82f6'

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-background/98 backdrop-blur-md'
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link 
          href="/portal" 
          className="flex items-center gap-3 transition-transform hover:scale-105"
          aria-label="Ir al inicio del portal"
        >
          {agency?.logo_url ? (
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden transition-all bg-background border border-border"
            >
              <img 
                src={agency.logo_url} 
                alt={`${agency.name} logo`}
                className="h-full w-full object-contain p-1"
              />
            </div>
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-all"
              style={{ 
                backgroundColor: primaryColor
              }}
            >
              <Building2 className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="font-semibold text-foreground">{agency?.name || 'Mi Agencia'}</h1>
            <p className="text-xs text-muted-foreground">Portal de Cliente</p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 transition-all hover:bg-accent"
            >
              <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-offset-background transition-all hover:ring-primary/50" style={{ ringColor: `${primaryColor}40` }}>
                <AvatarFallback
                  className="text-sm font-medium"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                  }}
                >
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline font-medium">{client.name}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.email}</p>
            </div>
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
      </div>
    </header>
  )
}

