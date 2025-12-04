'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  ArrowRight, 
  Rocket, 
  Menu,
  Home,
  Sparkles,
  FolderKanban,
  Settings
} from 'lucide-react'

const navLinks = [
  { href: '#features', label: 'Características', icon: Sparkles },
  { href: '#how-it-works', label: 'Cómo Funciona', icon: FolderKanban },
  { href: '#pricing', label: 'Precios', icon: Settings },
]

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setIsMobileMenuOpen(false)
      }
    }
  }

  // Only show navbar on home page
  if (pathname !== '/') {
    return null
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md'
          : 'border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 transition-transform hover:scale-105"
            aria-label="IAya - Inicio"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-all">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-white">IAya</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className="text-zinc-400 transition-colors hover:text-white hover:bg-zinc-900/50"
              >
                <Link href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Button 
              variant="ghost" 
              asChild 
              className="text-zinc-400 transition-colors hover:text-white hover:bg-zinc-900/50"
            >
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button 
              asChild
              className="bg-primary text-primary-foreground transition-all hover:scale-105"
            >
              <Link href="/register">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white hover:bg-zinc-900/50 md:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-full max-w-[320px] border-l border-zinc-800 bg-zinc-950 p-0"
            >
              <SheetHeader className="border-b border-zinc-800 px-6 py-5">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <Rocket className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-white">IAya</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 py-6">
                <Button
                  variant="ghost"
                  asChild
                  className="h-12 justify-start gap-3 rounded-lg px-4 text-base text-zinc-300 transition-colors hover:bg-zinc-900/50 hover:text-white"
                >
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <Home className="h-5 w-5" />
                    Inicio
                  </Link>
                </Button>
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    asChild
                    className="h-12 justify-start gap-3 rounded-lg px-4 text-base text-zinc-300 transition-colors hover:bg-zinc-900/50 hover:text-white"
                  >
                    <Link 
                      href={link.href} 
                      onClick={(e) => {
                        handleNavClick(e, link.href)
                      }}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
                <div className="my-3 border-t border-zinc-800" />
                <Button 
                  variant="ghost" 
                  asChild 
                  className="h-12 justify-start gap-3 rounded-lg px-4 text-base text-zinc-300 transition-colors hover:bg-zinc-900/50 hover:text-white"
                >
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button 
                  asChild
                  className="mt-2 h-12 justify-start gap-3 rounded-lg bg-primary px-4 text-base text-primary-foreground transition-all hover:bg-primary/90"
                >
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Comenzar Gratis
                    <ArrowRight className="ml-auto h-5 w-5" />
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}