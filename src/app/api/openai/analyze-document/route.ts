import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractPhasesFromDocument } from '@/lib/openai/client'
import { extractTextFromDocument, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/document-parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('project_id') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo es requerido' },
        { status: 400 }
      )
    }

    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo PDF, DOC y DOCX.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo de 10MB' },
        { status: 400 }
      )
    }

    // Verify user has access
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: agencyOwner } = await supabase
      .from('agency_owners')
      .select('agency_id')
      .eq('user_id', user.id)
      .single()

    if (!agencyOwner) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // If project_id is provided, verify project belongs to agency
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('id, agency_id')
        .eq('id', projectId)
        .eq('agency_id', agencyOwner.agency_id)
        .single()

      if (!project) {
        return NextResponse.json(
          { error: 'Proyecto no encontrado' },
          { status: 404 }
        )
      }
    }

    // Extract text from document
    const buffer = Buffer.from(await file.arrayBuffer())
    const documentText = await extractTextFromDocument(buffer, file.type)

    if (!documentText || documentText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No se pudo extraer texto del documento' },
        { status: 400 }
      )
    }

    // Analyze with OpenAI
    const result = await extractPhasesFromDocument(documentText)

    if (!result.phases || result.phases.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron fases en el documento' },
        { status: 400 }
      )
    }

    // If project_id is provided, save phases to database
    if (projectId) {
      const phasesToInsert = result.phases.map((phase, index) => ({
        project_id: projectId,
        phase_name: phase.name,
        phase_description: phase.description,
        status: 'pending' as const,
        order: index + 1,
      }))

      const { error: insertError } = await supabase
        .from('project_phases')
        .insert(phasesToInsert)

      if (insertError) {
        return NextResponse.json(
          { error: 'Error al guardar las fases' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      phases: result.phases,
      count: result.phases.length,
    })
  } catch (error) {
    console.error('Error analyzing document:', error)
    return NextResponse.json(
      { error: 'Error al analizar el documento' },
      { status: 500 }
    )
  }
}

