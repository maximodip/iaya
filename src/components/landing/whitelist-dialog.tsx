"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/shared"
import { toast } from "sonner"
import { Mail, Sparkles } from "lucide-react"

interface WhitelistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const WhitelistDialog = ({ open, onOpenChange, onSuccess }: WhitelistDialogProps) => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Email requerido', {
        description: 'Por favor, ingresa tu correo electrónico.',
      })
      return
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Email inválido', {
        description: 'Por favor, ingresa un correo electrónico válido.',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/whitelist/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al suscribirse')
      }

      toast.success('¡Te has suscrito exitosamente!', {
        description: data.message || 'Te notificaremos cuando la plataforma esté disponible.',
        duration: 5000,
      })

      // Limpiar el formulario y cerrar el diálogo
      setEmail("")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Subscribe error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al suscribirse', {
        description: errorMessage || 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Limpiar el email cuando se cierra el diálogo
      setEmail("")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-[#0A0A0A] text-white sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10">
            <Sparkles className="h-7 w-7 text-indigo-400" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Únete a la Whitelist
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Ingresa tu correo electrónico para recibir acceso prioritario cuando lancemos la plataforma.
            Serás notificado cuando esté disponible para ti.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubscribe} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="whitelist-email" className="text-gray-300">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="whitelist-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500 focus-visible:border-indigo-500"
                required
                disabled={isLoading}
                aria-label="Correo electrónico"
                autoComplete="email"
              />
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-indigo-400" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-white">¿Qué recibirás?</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>• Acceso prioritario al lanzamiento</li>
                  <li>• Notificaciones sobre nuevas características</li>
                  <li>• Ofertas exclusivas para miembros de la whitelist</li>
                </ul>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-gray-200"
            disabled={isLoading}
            aria-label="Suscribirse a la whitelist"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Suscribiendo...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Suscribirse
              </>
            )}
          </Button>
          <p className="text-center text-xs text-gray-500">
            Al continuar, aceptas que guardemos tu email en nuestra whitelist
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

