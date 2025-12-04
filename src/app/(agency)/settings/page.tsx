'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, LoadingSpinner } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Building2, Palette, Save, Image, Moon, Sun, X } from 'lucide-react'
import type { Agency } from '@/types'

export default function SettingsPage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [name, setName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6')
  const [mainObjective, setMainObjective] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const loadAgency = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: agencyOwner } = await supabase
        .from('agency_owners')
        .select('agency_id, agencies(*)')
        .eq('user_id', user.id)
        .single()

      if (!agencyOwner?.agencies) {
        router.push('/onboarding')
        return
      }

      const agencyData = agencyOwner.agencies as Agency
      setAgency(agencyData)
      setName(agencyData.name)
      setLogoUrl(agencyData.logo_url || null)
      setTheme((agencyData.theme as 'light' | 'dark') || 'dark')
      setPrimaryColor(agencyData.primary_color)
      setSecondaryColor(agencyData.secondary_color)
      setMainObjective(agencyData.main_objective || '')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    loadAgency()
  }, [loadAgency])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido', {
        description: 'Solo se aceptan imágenes (JPEG, PNG, GIF, WEBP, SVG).',
      })
      return
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Archivo demasiado grande', {
        description: 'El archivo no puede exceder los 5MB.',
      })
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setLogoUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error('Por favor, selecciona un logo')
      return
    }

    setIsUploadingLogo(true)

    try {
      const formData = new FormData()
      formData.append('file', logoFile)

      const response = await fetch('/api/agencies/upload-logo', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error('Error al subir el logo', {
          description: result.error || result.details || 'Por favor, intenta de nuevo.',
        })
        return
      }

      setLogoUrl(result.url)
      setLogoFile(null)
      toast.success('Logo subido exitosamente')
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSave = async () => {
    if (!agency) return

    if (!name.trim()) {
      toast.error('El nombre de la agencia es requerido')
      return
    }

    setIsSaving(true)

    try {
      // If there's a new logo file, upload it first
      let finalLogoUrl = logoUrl
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)

        const response = await fetch('/api/agencies/upload-logo', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          toast.error('Error al subir el logo', {
            description: result.error || result.details || 'Por favor, intenta de nuevo.',
          })
          setIsSaving(false)
          return
        }

        finalLogoUrl = result.url
        setLogoUrl(result.url)
        setLogoFile(null)
      }

      // Debug: Log what we're saving
      console.log('Saving colors:', { primaryColor, secondaryColor, theme })

      const { error, data } = await supabase
        .from('agencies')
        .update({
          name,
          logo_url: finalLogoUrl,
          theme,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          main_objective: mainObjective,
        })
        .eq('id', agency.id)
        .select()

      if (error) {
        console.error('Error saving:', error)
        toast.error('Error al guardar cambios', {
          description: error.message,
        })
        return
      }

      console.log('Saved successfully:', data)

      toast.success('Configuración guardada exitosamente')
      // Reload the page to apply theme and color changes
      window.location.reload()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error inesperado')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando configuración..." />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Personaliza tu agencia y preferencias"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agency Info */}
        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-4">Información de la Agencia</CardTitle>
            <CardDescription>
              Actualiza los datos básicos de tu agencia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la agencia</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi Agencia de IA"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo principal</Label>
              <Textarea
                id="objective"
                value={mainObjective}
                onChange={(e) => setMainObjective(e.target.value)}
                placeholder="Describe el objetivo de tu agencia..."
                className="min-h-24"
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo & Theme */}
        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-4">Logo y Tema</CardTitle>
            <CardDescription>
              Personaliza el logo y el tema de tu plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo de la Agencia</Label>
              {logoPreview || logoUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center rounded-lg border bg-card p-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview || logoUrl || ''}
                      alt="Logo preview"
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSaving || isUploadingLogo}
                      className="flex-1"
                    >
                      Cambiar Logo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveLogo}
                      disabled={isSaving || isUploadingLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {logoFile && !logoUrl && (
                    <Button
                      type="button"
                      onClick={handleUploadLogo}
                      disabled={isUploadingLogo || isSaving}
                      className="w-full"
                    >
                      {isUploadingLogo ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Subiendo...
                        </>
                      ) : (
                        'Subir Logo'
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8 transition-colors hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      fileInputRef.current?.click()
                    }
                  }}
                  aria-label="Seleccionar logo"
                >
                  <Image className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-sm font-medium">Haz clic para subir un logo</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF, WEBP o SVG (máx. 5MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Input de archivo para logo"
                disabled={isSaving || isUploadingLogo}
              />
            </div>

            <Separator />

            {/* Theme Selection */}
            <div className="space-y-2">
              <Label>Tema de la Plataforma</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  disabled={isSaving}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                  aria-label="Tema claro"
                >
                  <Sun className={`mb-3 h-8 w-8 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-foreground'}`}>
                    Claro
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  disabled={isSaving}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                  aria-label="Tema oscuro"
                >
                  <Moon className={`mb-3 h-8 w-8 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-foreground'}`}>
                    Oscuro
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-4">Colores de Marca</CardTitle>
            <CardDescription>
              Personaliza los colores de tu plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Color primario</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                    disabled={isSaving}
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Color secundario</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                    disabled={isSaving}
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Preview */}
            <div>
              <Label>Vista previa</Label>
              <div className="mt-2 rounded-lg border p-4">
                <div className="flex gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primario
                  </div>
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secundario
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    style={{ backgroundColor: primaryColor }}
                    className="hover:opacity-90"
                  >
                    Botón primario
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ borderColor: secondaryColor, color: secondaryColor }}
                  >
                    Botón secundario
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
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
    </div>
  )
}

