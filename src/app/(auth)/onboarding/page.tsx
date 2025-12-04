'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared'
import { toast } from 'sonner'
import { Building2, Palette, Target, ArrowRight, Check, Image, Moon, Sun } from 'lucide-react'

const steps = [
  { id: 1, title: 'Nombre', icon: Building2 },
  { id: 2, title: 'Logo', icon: Image },
  { id: 3, title: 'Tema', icon: Moon },
  { id: 4, title: 'Colores', icon: Palette },
  { id: 5, title: 'Objetivo', icon: Target },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [agencyName, setAgencyName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6')
  const [mainObjective, setMainObjective] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleNext = async () => {
    if (currentStep === 1 && !agencyName.trim()) {
      toast.error('Por favor, ingresa el nombre de tu agencia')
      return
    }

    if (currentStep === 2 && logoFile && !logoUrl) {
      // Upload logo before proceeding
      await handleLogoUpload()
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

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

  const handleLogoUpload = async () => {
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
      toast.success('Logo subido exitosamente')
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setLogoUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!mainObjective.trim()) {
      toast.error('Por favor, describe el objetivo de tu agencia')
      return
    }

    setIsLoading(true)

    try {
      // Create agency via API route (handles RLS properly on server)
      const response = await fetch('/api/agencies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agencyName,
          logoUrl,
          theme,
          primaryColor,
          secondaryColor,
          mainObjective,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error('Error al crear la agencia', {
          description: result.error || result.details || 'Por favor, intenta de nuevo.',
        })
        return
      }

      toast.success('¡Agencia configurada exitosamente!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                currentStep >= step.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-500'
              }`}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-12 transition-colors ${
                  currentStep > step.id ? 'bg-primary' : 'bg-zinc-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {currentStep === 1 && 'Nombre de tu Agencia'}
            {currentStep === 2 && 'Logo de tu Agencia'}
            {currentStep === 3 && 'Tema de la Plataforma'}
            {currentStep === 4 && 'Colores de Marca'}
            {currentStep === 5 && 'Objetivo Principal'}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {currentStep === 1 && 'Elige un nombre que represente tu agencia'}
            {currentStep === 2 && 'Sube el logo de tu agencia (opcional)'}
            {currentStep === 3 && 'Elige si prefieres tema claro u oscuro'}
            {currentStep === 4 && 'Personaliza los colores de tu plataforma'}
            {currentStep === 5 && 'Describe brevemente el objetivo de tu agencia'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-2">
              <Label htmlFor="agencyName" className="text-zinc-300">
                Nombre de la Agencia
              </Label>
              <Input
                id="agencyName"
                type="text"
                placeholder="Mi Agencia de IA"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500"
                aria-label="Nombre de la agencia"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Label className="text-zinc-300">Logo de la Agencia</Label>
              {logoPreview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-8">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-48 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-zinc-700 bg-transparent text-white hover:bg-zinc-800"
                    >
                      Cambiar Logo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveLogo}
                      className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800"
                    >
                      Eliminar
                    </Button>
                  </div>
                  {logoFile && !logoUrl && (
                    <Button
                      type="button"
                      onClick={handleLogoUpload}
                      disabled={isUploadingLogo}
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
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 p-12 transition-colors hover:border-zinc-600"
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
                  <Image className="mb-4 h-12 w-12 text-zinc-500" />
                  <p className="mb-2 text-sm font-medium text-zinc-300">
                    Haz clic para subir un logo
                  </p>
                  <p className="text-xs text-zinc-500">
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
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Label className="text-zinc-300">Selecciona el Tema</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-8 transition-all ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10'
                      : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                  }`}
                  aria-label="Tema claro"
                >
                  <Sun className={`mb-4 h-12 w-12 ${theme === 'light' ? 'text-primary' : 'text-zinc-500'}`} />
                  <span className={`text-lg font-medium ${theme === 'light' ? 'text-primary' : 'text-zinc-300'}`}>
                    Claro
                  </span>
                  <span className="mt-2 text-xs text-zinc-500">Fondo blanco</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-8 transition-all ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10'
                      : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                  }`}
                  aria-label="Tema oscuro"
                >
                  <Moon className={`mb-4 h-12 w-12 ${theme === 'dark' ? 'text-primary' : 'text-zinc-500'}`} />
                  <span className={`text-lg font-medium ${theme === 'dark' ? 'text-primary' : 'text-zinc-300'}`}>
                    Oscuro
                  </span>
                  <span className="mt-2 text-xs text-zinc-500">Fondo negro</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-zinc-300">
                  Color Primario
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer border-zinc-800 bg-zinc-900 p-1"
                    aria-label="Color primario"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 border-zinc-800 bg-zinc-900 text-white"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor" className="text-zinc-300">
                  Color Secundario
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer border-zinc-800 bg-zinc-900 p-1"
                    aria-label="Color secundario"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 border-zinc-800 bg-zinc-900 text-white"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
              {/* Color Preview */}
              <div className="col-span-full">
                <Label className="text-zinc-300">Vista previa</Label>
                <div className="mt-2 flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-lg text-white text-xs font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primario
                  </div>
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-lg text-white text-xs font-medium"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secundario
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-2">
              <Label htmlFor="mainObjective" className="text-zinc-300">
                Objetivo Principal
              </Label>
              <Textarea
                id="mainObjective"
                placeholder="Describe el objetivo principal de tu agencia y qué tipo de proyectos realizas..."
                value={mainObjective}
                onChange={(e) => setMainObjective(e.target.value)}
                className="min-h-32 border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500"
                aria-label="Objetivo principal"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading || isUploadingLogo}
              className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800"
            >
              Atrás
            </Button>
          ) : (
            <div />
          )}
          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={isLoading || isUploadingLogo}>
              {currentStep === 2 && logoFile && !logoUrl ? (
                'Subir y Continuar'
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Completar
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

