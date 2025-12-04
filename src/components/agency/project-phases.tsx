'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProjectPhasesRealtime } from '@/hooks/use-project-phases-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PhaseBadge, EmptyState, LoadingSpinner } from '@/components/shared'
import { toast } from 'sonner'
import { Plus, GripVertical, Pencil, Trash2, ListChecks } from 'lucide-react'
import type { ProjectPhase, PhaseStatus } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ProjectPhasesProps {
  projectId: string
  phases: ProjectPhase[]
}

interface SortablePhaseItemProps {
  phase: ProjectPhase
  index: number
  onStatusChange: (phaseId: string, newStatus: PhaseStatus) => void
  onEdit: (phase: ProjectPhase) => void
  onDelete: (phaseId: string) => void
}

const SortablePhaseItem = ({
  phase,
  index,
  onStatusChange,
  onEdit,
  onDelete,
}: SortablePhaseItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-3 text-muted-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {index + 1}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{phase.phase_name}</h4>
        {phase.phase_description && (
          <p className="text-sm text-muted-foreground truncate">
            {phase.phase_description}
          </p>
        )}
      </div>
      <Select
        value={phase.status}
        onValueChange={(value) => onStatusChange(phase.id, value as PhaseStatus)}
      >
        <SelectTrigger className="w-[160px]" aria-label="Cambiar estado">
          <SelectValue>
            <PhaseBadge status={phase.status} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <PhaseBadge status="pending" />
          </SelectItem>
          <SelectItem value="in_progress">
            <PhaseBadge status="in_progress" />
          </SelectItem>
          <SelectItem value="completed">
            <PhaseBadge status="completed" />
          </SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(phase)}
          aria-label="Editar fase"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(phase.id)}
          className="text-destructive hover:text-destructive"
          aria-label="Eliminar fase"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export const ProjectPhases = ({ projectId, phases: initialPhases }: ProjectPhasesProps) => {
  const { phases } = useProjectPhasesRealtime({ projectId, initialPhases })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null)
  const [newPhaseName, setNewPhaseName] = useState('')
  const [newPhaseDescription, setNewPhaseDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleStatusChange = async (phaseId: string, newStatus: PhaseStatus) => {
    try {
      const { error } = await supabase
        .from('project_phases')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', phaseId)

      if (error) {
        toast.error('Error al actualizar estado')
        return
      }

      toast.success('Estado actualizado')
      router.refresh()
    } catch {
      toast.error('Error inesperado')
    }
  }

  // Ordenar las fases por el campo order
  const sortedPhases = [...phases].sort((a, b) => a.order - b.order)

  const handleAddPhase = async () => {
    if (!newPhaseName.trim()) {
      toast.error('El nombre de la fase es requerido')
      return
    }

    setIsLoading(true)

    try {
      const newOrder = sortedPhases.length + 1

      const { data, error } = await supabase
        .from('project_phases')
        .insert({
          project_id: projectId,
          phase_name: newPhaseName,
          phase_description: newPhaseDescription,
          status: 'pending',
          order: newOrder,
        })
        .select()
        .single()

      if (error) {
        toast.error('Error al crear fase')
        return
      }

      setNewPhaseName('')
      setNewPhaseDescription('')
      setIsAddDialogOpen(false)
      toast.success('Fase creada exitosamente')
      router.refresh()
    } catch {
      toast.error('Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPhase = async () => {
    if (!selectedPhase || !newPhaseName.trim()) {
      toast.error('El nombre de la fase es requerido')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('project_phases')
        .update({
          phase_name: newPhaseName,
          phase_description: newPhaseDescription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPhase.id)

      if (error) {
        toast.error('Error al actualizar fase')
        return
      }

      setIsEditDialogOpen(false)
      setSelectedPhase(null)
      toast.success('Fase actualizada')
      router.refresh()
    } catch {
      toast.error('Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePhase = async (phaseId: string) => {
    try {
      const { error } = await supabase
        .from('project_phases')
        .delete()
        .eq('id', phaseId)

      if (error) {
        toast.error('Error al eliminar fase')
        return
      }

      toast.success('Fase eliminada')
      router.refresh()
    } catch {
      toast.error('Error inesperado')
    }
  }

  const openEditDialog = (phase: ProjectPhase) => {
    setSelectedPhase(phase)
    setNewPhaseName(phase.phase_name)
    setNewPhaseDescription(phase.phase_description || '')
    setIsEditDialogOpen(true)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedPhases.findIndex((phase) => phase.id === active.id)
    const newIndex = sortedPhases.findIndex((phase) => phase.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const reorderedPhases = arrayMove(sortedPhases, oldIndex, newIndex)

    try {
      // Actualizar el orden de todas las fases afectadas
      const updates = reorderedPhases.map((phase, index) => ({
        id: phase.id,
        order: index + 1,
      }))

      // Actualizar todas las fases en una sola transacción
      const updatePromises = updates.map((update) =>
        supabase
          .from('project_phases')
          .update({ order: update.order, updated_at: new Date().toISOString() })
          .eq('id', update.id)
      )

      const results = await Promise.all(updatePromises)
      const hasError = results.some((result) => result.error)

      if (hasError) {
        toast.error('Error al actualizar el orden de las fases')
        return
      }

      toast.success('Orden actualizado')
      router.refresh()
    } catch {
      toast.error('Error inesperado al actualizar el orden')
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Fases del Proyecto
          </CardTitle>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Fase
          </Button>
        </CardHeader>
        <CardContent>
          {sortedPhases.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Sin fases"
              description="Agrega fases manualmente o sube un documento para extraerlas"
            >
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primera Fase
              </Button>
            </EmptyState>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedPhases.map((phase) => phase.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedPhases.map((phase, index) => (
                    <SortablePhaseItem
                      key={phase.id}
                      phase={phase}
                      index={index}
                      onStatusChange={handleStatusChange}
                      onEdit={openEditDialog}
                      onDelete={handleDeletePhase}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Add Phase Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Fase</DialogTitle>
            <DialogDescription>
              Crea una nueva fase para este proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la fase</label>
              <Input
                placeholder="Ej: Diseño inicial"
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Textarea
                placeholder="Describe esta fase..."
                value={newPhaseDescription}
                onChange={(e) => setNewPhaseDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddPhase} disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Phase Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fase</DialogTitle>
            <DialogDescription>
              Modifica los detalles de esta fase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la fase</label>
              <Input
                placeholder="Ej: Diseño inicial"
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Textarea
                placeholder="Describe esta fase..."
                value={newPhaseDescription}
                onChange={(e) => setNewPhaseDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditPhase} disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

