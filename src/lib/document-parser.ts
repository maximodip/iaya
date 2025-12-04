import * as mammoth from 'mammoth'

type PdfParseResult = { text: string }
type PdfParseFunction = (buffer: Buffer) => Promise<PdfParseResult>

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  // Dynamic import with type casting for ESM compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParseModule = await import('pdf-parse') as any
  const parse: PdfParseFunction = pdfParseModule.default || pdfParseModule
  const data = await parse(buffer)
  return data.text
}

export const extractTextFromDOCX = async (buffer: Buffer): Promise<string> => {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export const extractTextFromDocument = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer)
  }
  
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractTextFromDOCX(buffer)
  }
  
  throw new Error(`Unsupported file type: ${mimeType}`)
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const validateDocument = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan PDF, DOC y DOCX.',
    }
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'El archivo excede el tamaño máximo de 10MB.',
    }
  }
  
  return { valid: true }
}

