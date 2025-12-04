import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `Eres el asistente virtual de IAya, una plataforma SaaS B2B diseñada para agencias de inteligencia artificial. Tu objetivo es ayudar a potenciales clientes a entender cómo IAya puede transformar su negocio.

INSTRUCCIONES DE RESPUESTA:
- Responde siempre en español de manera amigable, profesional y conversacional
- Estructura tus respuestas en párrafos claros y bien separados
- Usa dobles saltos de línea (\\n\\n) para separar párrafos diferentes
- Sé detallado cuando sea necesario, pero mantén las respuestas concisas cuando la pregunta sea simple
- Muestra entusiasmo por el producto sin ser exagerado
- Si no estás seguro de algo, admítelo honestamente

INFORMACIÓN SOBRE IAYA:

PRECIO Y MODELO DE NEGOCIO:
- Early Bird: $997 USD para los primeros 2 usuarios (pago único, no recurrente)
- Precio Regular: $1,997 USD después del early bird (pago único, no recurrente)
- Acceso de por vida con todas las actualizaciones futuras incluidas
- Sin mensualidades ni costos ocultos
- Ideal para agencias que buscan una solución permanente
- Todos los costos de infraestructura (Supabase y OpenAI) están incluidos en el precio

FUNCIONALIDADES PRINCIPALES:
- Parser inteligente de documentos: Utiliza modelos avanzados de OpenAI (GPT-4o) para leer y analizar documentos en formato PDF, DOC y DOCX
- Extracción automática de fases: Identifica automáticamente las fases del proyecto y los entregables desde documentos de propuesta o contratos
- Ahorro de tiempo: Reduce horas de configuración manual a minutos de procesamiento automático

PORTAL DEL CLIENTE:
- Portal privado White-Label para cada cliente con la marca de la agencia
- Visualización en tiempo real del progreso de proyectos
- Interfaz moderna y profesional que refleja la identidad de la agencia
- Los clientes pueden ver el estado de cada fase y entregable

INFRAESTRUCTURA Y CONTROL:
- Infraestructura centralizada gestionada por IAya
- Base de datos Supabase dedicada y segura
- Análisis de documentos con OpenAI incluido (hasta 50 análisis/mes)
- Almacenamiento incluido (hasta 10GB)
- Privacidad y seguridad garantizadas con Row Level Security (RLS)
- Los datos de cada agencia están completamente aislados

CASOS DE USO:
- Gestión de proyectos de IA para múltiples clientes
- Seguimiento transparente del progreso de proyectos
- Comunicación profesional con clientes a través del portal
- Automatización de la configuración inicial de proyectos

Cuando respondas, siempre estructura la información en párrafos claros y separados para facilitar la lectura.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY no está configurada')
      return NextResponse.json({ 
        error: 'API key no configurada',
        details: 'Verifica que GOOGLE_GENERATIVE_AI_API_KEY esté en .env.local'
      }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    // Convertir mensajes al formato de Gemini
    // Filtrar solo mensajes de usuario y asistente
    const conversationMessages = messages.filter(
      (msg: { role: string; text: string }) => msg.role === 'user' || msg.role === 'assistant'
    )

    if (conversationMessages.length === 0) {
      return NextResponse.json({ error: 'No hay mensajes en la conversación' }, { status: 400 })
    }

    // Obtener el último mensaje del usuario
    const lastMessage = conversationMessages[conversationMessages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'El último mensaje debe ser del usuario' }, { status: 400 })
    }

    // Construir el historial de conversación para Gemini
    // El historial debe tener pares user-model alternados
    // Si el primer mensaje es del asistente, lo ignoramos porque el systemInstruction ya lo cubre
    const history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
    
    // Empezar desde el índice 0, pero saltar si el primer mensaje es del asistente
    let startIndex = 0
    if (conversationMessages.length > 1 && conversationMessages[0].role === 'assistant') {
      startIndex = 1
    }
    
    for (let i = startIndex; i < conversationMessages.length - 1; i++) {
      const msg = conversationMessages[i]
      const role = msg.role === 'user' ? 'user' : 'model'
      history.push({
        role,
        parts: [{ text: msg.text }],
      })
    }

    // Iniciar el chat con el historial
    const chatConfig: { history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> } = {}
    if (history.length > 0) {
      chatConfig.history = history
    }

    const chat = model.startChat(chatConfig)

    const result = await chat.sendMessage(lastMessage.text)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error('La respuesta de Gemini está vacía')
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Error en chat API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Detalles del error:', errorDetails)
    
    // En desarrollo, incluir más detalles del error
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud de chat',
        message: errorMessage,
        details: isDevelopment ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}

