import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "IAya - Gestión de Proyectos para Agencias de IA",
  description: "Plataforma de gestión de proyectos para agencias de inteligencia artificial. Gestiona clientes, proyectos y fases con IA.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
