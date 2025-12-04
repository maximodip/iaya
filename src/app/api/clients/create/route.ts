import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, agency_id } = await request.json()

    // Validate input
    if (!name || !email || !password || !agency_id) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verify the requester is an agency owner of this agency
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { data: agencyOwner } = await supabase
      .from('agency_owners')
      .select('agency_id')
      .eq('user_id', user.id)
      .eq('agency_id', agency_id)
      .single()

    if (!agencyOwner) {
      return NextResponse.json(
        { error: 'No autorizado para esta agencia' },
        { status: 403 }
      )
    }

    // Create user with admin client
    const adminClient = createAdminClient()
    
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'client',
      },
    })

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    // Create client record
    const { error: clientError } = await adminClient
      .from('clients')
      .insert({
        agency_id,
        user_id: newUser.user.id,
        email,
        name,
      })

    if (clientError) {
      // Rollback: delete the created user
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: clientError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, user_id: newUser.user.id })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

