"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Loader2, MessageSquare, Minimize2, Send, X } from "lucide-react"

import { LandingButton } from "./ui/landing-button"

type MessageRole = "user" | "assistant"

interface Message {
  role: MessageRole
  text: string
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  text: "¡Hola! Soy el asistente de IAya. ¿Tienes dudas sobre el pago único o cómo funciona el parser de documentos?",
}


export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", text: userMessage }],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        const errorMsg = errorData.message || errorData.error || errorData.details || `Error ${response.status}: ${response.statusText}`
        throw new Error(errorMsg)
      }

      const data = await response.json()
      if (!data.text) {
        throw new Error("La respuesta no contiene texto")
      }
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }])
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Lo siento, hubo un error: ${errorMessage}. Por favor, intenta de nuevo.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <div
        className={`pointer-events-auto flex max-h-[600px] w-[350px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl transition-all duration-300 ${
          isOpen ? "mb-4 translate-y-0 opacity-100" : "h-0 translate-y-10 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-[#111] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-indigo-500/20 bg-indigo-500/10">
              <Bot className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Asistente IAya</h3>
              <p className="flex items-center gap-1 font-mono text-[10px] text-green-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                Online
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-gray-500 transition-colors hover:text-white"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-[#050505] p-4">
          {messages.map((message, index) => (
            <div key={`${message.text}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-line ${
                  message.role === "user"
                    ? "rounded-tr-none bg-white text-black"
                    : "rounded-tl-none border border-white/10 bg-[#151515] text-gray-200"
                }`}
              >
                {message.text.split('\n\n').map((paragraph, idx, arr) => (
                  <span key={idx}>
                    {paragraph}
                    {idx < arr.length - 1 && (
                      <>
                        <br />
                        <br />
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg rounded-tl-none border border-white/10 bg-[#151515] p-3">
                <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                <span className="font-mono text-xs text-gray-500">Pensando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-white/10 bg-[#111] p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Pregunta sobre precios o features..."
              className="flex-1 rounded-md border border-white/10 bg-[#050505] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-indigo-500/50"
            />
            <LandingButton size="sm" className="px-3" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </LandingButton>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full text-black shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 hover:scale-110 ${
          isOpen ? "border border-white/10 bg-[#151515] text-white" : "bg-white"
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  )
}
