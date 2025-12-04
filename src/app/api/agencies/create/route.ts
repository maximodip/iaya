import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { name, logoUrl, theme, primaryColor, secondaryColor, mainObjective } = await request.json()

    // Validate input
    if (!name || !primaryColor || !secondaryColor || !mainObjective) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validate theme
    if (theme && theme !== 'light' && theme !== 'dark') {
      return NextResponse.json(
        { error: 'El tema debe ser "light" o "dark"' },
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

    // Check if user already has an agency
    const { data: existingOwner } = await supabase
      .from('agency_owners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingOwner) {
      return NextResponse.json(
        { error: 'Ya tienes una agencia asociada' },
        { status: 400 }
      )
    }

    // Create agency using admin client to bypass RLS
    // This is safe because we've already verified the user is authenticated
    // and doesn't have an existing agency
    const adminClient = createAdminClient()
    const { data: agency, error: agencyError } = await adminClient
      .from('agencies')
      .insert({
        name,
        logo_url: logoUrl || null,
        theme: theme || 'dark',
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        main_objective: mainObjective,
      })
      .select()
      .single()

    if (agencyError) {
      console.error('Error creating agency:', agencyError)
      return NextResponse.json(
        { error: 'Error al crear la agencia', details: agencyError.message },
        { status: 500 }
      )
    }

    // Create agency owner record using regular client (has proper RLS policy)
    const { error: ownerError } = await supabase
      .from('agency_owners')
      .insert({
        agency_id: agency.id,
        user_id: user.id,
        email: user.email!,
        name: user.user_metadata.name || 'Dueño de Agencia',
      })

    if (ownerError) {
      console.error('Error creating agency owner:', ownerError)
      // Try to clean up the agency if owner creation fails
      await adminClient.from('agencies').delete().eq('id', agency.id)
      return NextResponse.json(
        { error: 'Error al crear el perfil', details: ownerError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        agency: {
          id: agency.id,
          name: agency.name,
          logo_url: agency.logo_url,
          theme: agency.theme,
          primary_color: agency.primary_color,
          secondary_color: agency.secondary_color,
          main_objective: agency.main_objective,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error inesperado', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

