import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get project with document_url
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, document_url, agency_id, client_id')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    if (!project.document_url) {
      return NextResponse.json(
        { error: 'El proyecto no tiene documento asociado' },
        { status: 404 }
      )
    }

    // Check if user is agency owner
    const { data: agencyOwner } = await supabase
      .from('agency_owners')
      .select('agency_id')
      .eq('user_id', user.id)
      .eq('agency_id', project.agency_id)
      .single()

    // Check if user is client
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', project.client_id)
      .single()

    if (!agencyOwner && !client) {
      return NextResponse.json(
        { error: 'No tienes acceso a este documento' },
        { status: 403 }
      )
    }

    // Extract file path from document_url
    // document_url can be either:
    // 1. A full URL: https://[project].supabase.co/storage/v1/object/public/project-documents/[path]
    // 2. Just the path: [agency_id]/[filename]
    let filePath = project.document_url
    
    // If it's a full URL, extract the path
    if (filePath.includes('/storage/v1/object/public/project-documents/')) {
      filePath = filePath.split('/storage/v1/object/public/project-documents/')[1]
    } else if (filePath.includes('/project-documents/')) {
      filePath = filePath.split('/project-documents/')[1]
    }
    // If it's already just a path (format: agency_id/filename), use it directly

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('project-documents')
      .download(filePath)

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError)
      return NextResponse.json(
        { error: 'Error al descargar el documento' },
        { status: 500 }
      )
    }

    // Get file extension to determine content type
    const fileExtension = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (fileExtension === 'pdf') {
      contentType = 'application/pdf'
    } else if (fileExtension === 'doc') {
      contentType = 'application/msword'
    } else if (fileExtension === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filePath.split('/').pop()}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving document:', error)
    return NextResponse.json(
      { error: 'Error al servir el documento' },
      { status: 500 }
    )
  }
}

