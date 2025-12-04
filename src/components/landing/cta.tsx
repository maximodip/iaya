import Link from "next/link"

import { LandingButton } from "./ui/landing-button"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-24">
      <div className="absolute inset-0 bg-white/[0.02]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          ¿Listo para escalar tu Agencia?
        </h2>
        <LandingButton asChild size="lg">
          <Link href="/register">Obtener Acceso Anticipado</Link>
        </LandingButton>
      </div>
    </section>
  )
}
