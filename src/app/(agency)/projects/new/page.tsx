'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader, LoadingSpinner } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { FolderPlus, FileText, Upload, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { Client } from '@/types'
import { Badge } from '@/components/ui/badge'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedPhases, setExtractedPhases] = useState<Array<{ name: string; description: string }>>([])
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const loadClients = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: agencyOwner } = await supabase
        .from('agency_owners')
        .select('agency_id')
        .eq('user_id', user.id)
        .single()

      if (!agencyOwner) return

      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('agency_id', agencyOwner.agency_id)
        .order('name')

      setClients(data || [])
    } finally {
      setIsLoadingClients(false)
    }
  }, [supabase])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const analyzeDocument = async (fileToAnalyze: File) => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    setExtractedPhases([])

    try {
      const formData = new FormData()
      formData.append('file', fileToAnalyze)

      const response = await fetch('/api/openai/analyze-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.error || 'No se pudieron extraer las fases del documento.'
        setAnalysisError(errorMessage)
        toast.error('Error al analizar el documento', {
          description: errorMessage,
        })
        return
      }

      const result = await response.json()
      if (result.phases && result.phases.length > 0) {
        setExtractedPhases(result.phases)
        toast.success('Documento analizado exitosamente', {
          description: `Se encontraron ${result.phases.length} fases.`,
        })
      } else {
        setAnalysisError('No se encontraron fases en el documento')
        toast.warning('Sin fases encontradas', {
          description: 'El documento no contiene fases identificables.',
        })
      }
    } catch (error) {
      const errorMessage = 'Error inesperado al analizar el documento'
      setAnalysisError(errorMessage)
      toast.error('Error al analizar el documento', {
        description: 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error('Tipo de archivo no permitido', {
        description: 'Solo se aceptan archivos PDF, DOC y DOCX.',
      })
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('Archivo demasiado grande', {
        description: 'El archivo no puede exceder los 10MB.',
      })
      return
    }

    setFile(selectedFile)
    // Automatically analyze the document when selected
    await analyzeDocument(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
    setExtractedPhases([])
    setAnalysisError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId) {
      toast.error('Selecciona un cliente')
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('No se encontró sesión activa')
        router.push('/login')
        return
      }

      const { data: agencyOwner } = await supabase
        .from('agency_owners')
        .select('agency_id')
        .eq('user_id', user.id)
        .single()

      if (!agencyOwner) {
        toast.error('No se encontró la agencia')
        return
      }

      let documentUrl = null
      let uploadedFilePath: string | null = null

      // If there's a document and phases were extracted, upload it
      if (file && extractedPhases.length > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `${agencyOwner.agency_id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-documents')
          .upload(filePath, file)

        if (uploadError) {
          toast.error('Error al subir el documento', {
            description: uploadError.message,
          })
          return
        }

        uploadedFilePath = filePath
        // Store the file path instead of public URL since bucket is private
        documentUrl = filePath
      } else if (file && analysisError) {
        // If there's a file but analysis failed, don't create the project
        toast.error('No se puede crear el proyecto', {
          description: 'El documento no pudo ser analizado correctamente.',
        })
        return
      }

      // Create project (only if analysis succeeded or no file was provided)
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          agency_id: agencyOwner.agency_id,
          client_id: clientId,
          name,
          description,
          document_url: documentUrl,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (projectError) {
        // If project creation fails and we uploaded a file, delete it
        if (uploadedFilePath) {
          await supabase.storage
            .from('project-documents')
            .remove([uploadedFilePath])
        }
        toast.error('Error al crear el proyecto', {
          description: projectError.message,
        })
        return
      }

      // Save the extracted phases to the database
      if (extractedPhases.length > 0 && project) {
        const phasesToInsert = extractedPhases.map((phase, index) => ({
          project_id: project.id,
          phase_name: phase.name,
          phase_description: phase.description,
          status: 'pending' as const,
          order: index + 1,
        }))

        const { error: phasesError } = await supabase
          .from('project_phases')
          .insert(phasesToInsert)

        if (phasesError) {
          toast.warning('Proyecto creado pero no se pudieron guardar las fases', {
            description: phasesError.message,
          })
        } else {
          toast.success('Proyecto creado exitosamente', {
            description: `Proyecto creado con ${extractedPhases.length} fases.`,
          })
        }
      } else {
        toast.success('Proyecto creado exitosamente')
      }

      router.push(`/projects/${project.id}`)
      router.refresh()
    } catch {
      toast.error('Error inesperado', {
        description: 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Nuevo Proyecto"
        description="Crea un proyecto y sube un documento para analizar"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FolderPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-4">Información del Proyecto</CardTitle>
            <CardDescription>
              Define los detalles básicos del proyecto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del proyecto</Label>
                <Input
                  id="name"
                  placeholder="Mi nuevo proyecto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-label="Nombre del proyecto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el proyecto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24"
                  disabled={isLoading}
                  aria-label="Descripción del proyecto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente asignado</Label>
                {isLoadingClients ? (
                  <div className="flex h-10 items-center justify-center rounded-md border">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : clients.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    No tienes clientes. Crea uno primero.
                  </div>
                ) : (
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger aria-label="Seleccionar cliente">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={Boolean(
                    isLoading ||
                    clients.length === 0 ||
                    isAnalyzing ||
                    (file && analysisError != null) ||
                    (file && extractedPhases.length === 0 && !analysisError)
                  )}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Crear Proyecto'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-4">Documento del Proyecto</CardTitle>
            <CardDescription>
              Sube un documento para extraer las fases automáticamente con IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {file ? (
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {isAnalyzing ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : extractedPhases.length > 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : analysisError ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {isAnalyzing && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Analizando documento...
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      disabled={isAnalyzing}
                      aria-label="Eliminar archivo"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {analysisError && (
                  <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-600">Error al analizar</p>
                        <p className="text-xs text-red-600/80 mt-1">{analysisError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {extractedPhases.length > 0 && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium">Fases extraídas ({extractedPhases.length})</h4>
                      <Badge variant="secondary">Listo</Badge>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {extractedPhases.map((phase, index) => (
                        <div
                          key={index}
                          className="rounded-md border bg-background p-3 text-sm"
                        >
                          <div className="flex items-start gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{phase.name}</p>
                              {phase.description && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {phase.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-primary/50">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 font-medium">
                    Arrastra un archivo o haz clic para seleccionar
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    PDF, DOC, DOCX hasta 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            )}

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <h4 className="font-medium">¿Cómo funciona?</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Sube un documento con el plan del proyecto</li>
                <li>• La IA analizará el contenido automáticamente</li>
                <li>• Se extraerán las fases y etapas del proyecto</li>
                <li>• Podrás editar las fases después de crearlas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

