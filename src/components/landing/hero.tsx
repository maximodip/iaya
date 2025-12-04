"use client"

import Link from "next/link"
import { Play, Terminal } from "lucide-react"

import { LandingButton } from "./ui/landing-button"
import { InteractiveDemo } from "./interactive-demo"
import { YouTubeVideoPlayer } from "./youtube-video-player"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function Hero() {
  const youtubeVideoId = "XwBeklSXGE4"

  return (
    <div className="relative overflow-hidden pb-20 pt-32 sm:pb-24 sm:pt-40">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full -translate-x-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent)]" />
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="font-mono text-xs text-gray-300">Beta v1.0 Disponible</span>
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Gestión de Proyectos <br />
          <span className="bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent">
            para Agencias de IA
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          IAya centraliza tus clientes, extrae fases de documentos PDF/DOCX con IA y mantiene a tus
          clientes informados en tiempo real. Profesionalizate y aumenta el valor de tu oferta.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Dialog>
            <DialogTrigger asChild>
              <LandingButton size="lg" className="group">
                Cómo funciona
                <Play className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
              </LandingButton>
            </DialogTrigger>
            <DialogContent className="max-w-[120vw] w-[120vw] p-0">
              <DialogTitle className="sr-only">Cómo funciona IAya</DialogTitle>
              <YouTubeVideoPlayer videoId={youtubeVideoId} />
            </DialogContent>
          </Dialog>
          <div className="relative">
            <LandingButton asChild variant="ghost" size="lg" className="gap-2">
              <Link href="#how-it-works">
                <Terminal className="h-4 w-4" />
                Leer Documentación
              </Link>
            </LandingButton>
            <span className="absolute -right-2 -top-2 rounded-full bg-yellow-500/90 px-2 py-0.5 text-[10px] font-semibold text-black">
              Próximamente
            </span>
          </div>
        </div>
        <div className="mt-20">
          <InteractiveDemo />
        </div>
      </div>
    </div>
  )
}
