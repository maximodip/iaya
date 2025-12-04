import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export const PHASE_EXTRACTION_PROMPT = `Analiza el siguiente documento de proyecto y extrae todas las fases o etapas del proyecto.
Devuelve la respuesta en formato JSON con la siguiente estructura:
{
  "phases": [
    {
      "name": "Nombre de la fase",
      "description": "Breve descripción de la fase"
    }
  ]
}

Si el documento no contiene fases claras, intenta identificar las etapas lógicas del trabajo descrito.
Siempre devuelve al menos una fase.

Documento:
`

export const extractPhasesFromDocument = async (documentText: string) => {
  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Eres un experto en gestión de proyectos. Tu tarea es analizar documentos y extraer las fases del proyecto de manera precisa y estructurada.',
      },
      {
        role: 'user',
        content: PHASE_EXTRACTION_PROMPT + documentText,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  return JSON.parse(content) as { phases: Array<{ name: string; description: string }> }
}

