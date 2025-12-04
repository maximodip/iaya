import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Intentar insertar en la whitelist
    const { data, error } = await supabase
      .from('whitelist')
      .insert({
        email: email.toLowerCase().trim(),
        name: name || null,
      })
      .select()
      .single()

    if (error) {
      // Si el email ya existe, retornar éxito (idempotente)
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: true, 
            message: 'Ya estás en la whitelist',
            alreadySubscribed: true 
          },
          { status: 200 }
        )
      }

      console.error('Error inserting into whitelist:', error)
      return NextResponse.json(
        { error: 'Error al suscribirse. Por favor, intenta de nuevo.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Te has suscrito exitosamente a la whitelist',
        data 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in whitelist subscribe:', error)
    return NextResponse.json(
      { error: 'Error inesperado. Por favor, intenta de nuevo.' },
      { status: 500 }
    )
  }
}

