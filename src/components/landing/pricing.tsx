"use client"

import { useEffect, useState } from "react"
import { Check, Info, Key, Server, Sparkles } from "lucide-react"

import { LandingButton } from "./ui/landing-button"
import { WhitelistDialog } from "./whitelist-dialog"
import type { PricingInfo } from "@/lib/pricing"

const INCLUDED_ITEMS = [
  "Clientes y Proyectos Ilimitados",
  "Parser de Fases con IA (OpenAI)",
  "Portal de Cliente White-Label",
  "Sincronización en Tiempo Real",
  "Actualizaciones Mensuales Gratuitas",
  "Soporte de Configuración Inicial",
]

const ACTIVATION_STEPS = [
  { title: "Registro y Pago", desc: "Crea tu cuenta y realiza el pago único seguro." },
  { title: "Inicia sesión", desc: "Inicio con google o email y contraseña" },
  { title: "Personaliza tu marca", desc: "Personaliza tu marca y sube tu primer cliente." },
  { title: "Sube tu primer cliente", desc: "Sube tu primer cliente y comienza a usar la plataforma." },
  { title: "Comienza a usar la plataforma", desc: "Comienza a usar la plataforma y comienza a ganar dinero." },
]

const ONE_TIME_REASONS = [
  { title: "Sin Sorpresas", desc: "Olvídate de cargos mensuales en tu tarjeta." },
  { title: "ROI Inmediato", desc: "Recupéralo con 1 solo cliente y agrega valor premium a tu oferta." },
  { title: "Propiedad", desc: "Acceso garantizado independientemente de nosotros." },
]

export function Pricing() {
  const [pricingInfo, setPricingInfo] = useState<PricingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWhitelistDialogOpen, setIsWhitelistDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/pricing')
        const data = await response.json()
        setPricingInfo(data)
      } catch (error) {
        console.error('Error fetching pricing:', error)
        // Fallback a precio early bird si hay error
        setPricingInfo({
          currentPrice: 997,
          isEarlyBird: true,
          earlyBirdSpotsRemaining: 2,
          totalPurchases: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPricing()
  }, [])


  const displayPrice = pricingInfo?.currentPrice || 997
  const isEarlyBird = pricingInfo?.isEarlyBird ?? true
  const spotsRemaining = pricingInfo?.earlyBirdSpotsRemaining ?? 2

  return (
    <section id="pricing" className="relative overflow-hidden border-t border-white/5 bg-[#050505] py-24">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-2 font-mono text-base text-indigo-400">Licencia Vitalicia</h2>
          <p className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Pago único. <span className="text-gray-500">Sin suscripciones.</span>
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Adquiere el software completo para tu agencia. Todo incluido: infraestructura, análisis con IA y soporte.
          </p>
        </div>
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl sm:p-12">
          <div className="absolute right-0 top-0 p-4 opacity-50">
            <div className="h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
          </div>
          {isEarlyBird && spotsRemaining > 0 && (
            <div className="absolute left-4 top-4 z-10">
              <div className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-yellow-400" />
                <span className="font-mono text-xs font-medium text-yellow-400">
                  Early Bird: {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} restante{spotsRemaining === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-baseline gap-2">
                {isLoading ? (
                  <span className="font-mono text-5xl font-bold text-white tracking-tight">...</span>
                ) : (
                  <>
                    <span className="font-mono text-5xl font-bold text-white tracking-tight">
                      ${displayPrice.toLocaleString()}
                    </span>
                    {isEarlyBird && displayPrice === 997 && (
                      <span className="rounded bg-yellow-500/20 px-2 py-0.5 font-mono text-xs text-yellow-400">
                        Early Bird
                      </span>
                    )}
                    {!isEarlyBird && (
                      <>
                        <span className="line-through font-mono text-xl text-gray-600">$997</span>
                        <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-xs text-indigo-400">
                          Precio Regular
                        </span>
                      </>
                    )}
                  </>
                )}
                <span className="font-mono text-xl text-gray-500">USD</span>
              </div>
              {isEarlyBird && displayPrice === 997 && (
                <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="mb-1 font-mono text-sm font-semibold text-red-400">
                    ⚠️ Precio aumentará a $1,997 USD
                  </p>
                  <p className="font-mono text-xs text-red-300/80">
                    Después de agotar los spots Early Bird, el precio será $1,997 USD
                  </p>
                </div>
              )}
              {!isEarlyBird && displayPrice === 1997 && (
                <p className="mb-2 font-mono text-xs text-gray-500">
                  Después de los primeros 2 usuarios (Early Bird agotado)
                </p>
              )}
              <p className="mb-8 flex items-center gap-2 font-mono text-sm text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Acceso de por vida
              </p>
              <LandingButton 
                size="lg" 
                className="mb-4 w-full bg-white text-black hover:bg-gray-200"
                onClick={() => setIsWhitelistDialogOpen(true)}
              >
                Comprar Licencia Ahora
              </LandingButton>
              <p className="text-center font-mono text-xs text-gray-500">Pago seguro vía Stripe. Activación inmediata.</p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium text-white">Todo incluido:</h3>
              <ul className="space-y-3">
                {INCLUDED_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="flex-none rounded-full bg-indigo-500/10 p-1 text-indigo-400">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-white">
              <Info className="h-4 w-4 text-gray-500" />
              Proceso de Activación
            </h3>
            <div className="relative space-y-6 pl-2">
              <div className="absolute left-[15px] top-2 bottom-4 w-px bg-[#222]" />
              {ACTIVATION_STEPS.map((step, idx) => (
                <div key={step.title} className="relative flex gap-4">
                  <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#111] text-xs font-mono text-gray-400">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">{step.title}</h4>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0A0A0A] p-6">
            <div>
              <h3 className="mb-4 text-white">Todo Incluido</h3>
              <p className="mb-4 text-sm text-gray-400">
                No necesitas configurar nada. Toda la infraestructura está incluida y gestionada por nosotros:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded border border-white/5 bg-[#111] p-3">
                  <Server className="mt-0.5 h-4 w-4 text-green-400" />
                  <div>
                    <div className="font-mono text-sm text-white">Supabase</div>
                    <div className="text-xs text-gray-500">
                      Base de datos y realtime incluidos. Hasta 10GB de almacenamiento.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded border border-white/5 bg-[#111] p-3">
                  <Key className="mt-0.5 h-4 w-4 text-green-400" />
                  <div>
                    <div className="font-mono text-sm text-white">OpenAI API</div>
                    <div className="text-xs text-gray-500">
                      Análisis de documentos incluido. Hasta 50 análisis por mes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h3 className="mb-6 text-lg font-bold text-white">¿Por qué un pago único?</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ONE_TIME_REASONS.map((reason) => (
              <div key={reason.title} className="rounded border border-white/5 bg-white/5 p-4">
                <div className="text-sm font-medium text-gray-200">{reason.title}</div>
                <div className="mt-1 text-xs text-gray-500">{reason.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <WhitelistDialog 
        open={isWhitelistDialogOpen} 
        onOpenChange={setIsWhitelistDialogOpen}
        onSuccess={() => {
          setIsWhitelistDialogOpen(false)
        }}
      />
    </section>
  )
}
