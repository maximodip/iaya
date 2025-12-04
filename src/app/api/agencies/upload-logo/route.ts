import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo es requerido' },
        { status: 400 }
      )
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WEBP, SVG).' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo de 5MB.' },
        { status: 400 }
      )
    }

    // Verify the requester is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = fileName

    // Convert File to ArrayBuffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage using server client
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agency-logos')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Error uploading logo:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir el logo', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL (bucket is public, so we can use getPublicUrl)
    const { data: urlData } = supabase.storage
      .from('agency-logos')
      .getPublicUrl(filePath)
    
    const publicUrl = urlData.publicUrl

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        path: filePath,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error inesperado', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

