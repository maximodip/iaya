import { ArrowUpRight, BarChart3, Bot, FileText, Layout, ShieldCheck, Zap } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  className?: string
}

const FEATURE_CARDS: FeatureCardProps[] = [
  {
    title: "Portal White-Label",
    description:
      "Tu marca, no la nuestra. Personaliza colores y logo para que el cliente sienta que está en tu sistema.",
    icon: Layout,
  },
  {
    title: "Seguridad RLS",
    description: "Aislamiento total de datos. Cada cliente solo accede a la información que le pertenece.",
    icon: ShieldCheck,
  },
  {
    title: "Archivos Centralizados",
    description: "Docs técnicos, facturas y contratos organizados por proyecto y listos para descarga.",
    icon: FileText,
  },
  {
    title: "Métricas de Agencia",
    description: "Visualiza la salud de tu negocio, carga de trabajo y rendimiento de proyectos.",
    icon: BarChart3,
  },
]

function FeatureCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] p-6 transition-all hover:border-white/20 ${className ?? ""}`}
    >
      <div className="absolute right-0 top-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4 text-white" />
      </div>
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded border border-white/5 bg-[#151515] text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="border-t border-white/5 bg-[#050505] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="mb-2 font-mono text-base text-blue-400">Capacidades</h2>
          <p className="text-3xl font-bold tracking-tight text-white md:text-4xl">Diseñado para el futuro de las Agencias.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] p-8 md:col-span-2">
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/20 text-blue-400">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Parser Documental con IA</h3>
              </div>
              <p className="max-w-lg text-gray-400">
                No pierdas tiempo copiando y pegando. Sube tu PDF/DOCX de propuesta y nuestra IA entenderá el contexto,
                extraerá los entregables y creará las fases del proyecto automáticamente en segundos.
              </p>
              <div className="max-w-md rounded border border-white/10 bg-[#111] p-4 font-mono text-xs text-gray-500">
                <div className="mb-2 flex gap-2 border-b border-white/5 pb-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  propuesta_cliente_v2.pdf
                </div>
                <div className="text-green-400">Análisis completado. 4 fases extraídas.</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0A0A0A] p-8 transition-all hover:border-white/20 md:row-span-2">
            <div>
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded bg-yellow-500/10 text-yellow-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Sync en Tiempo Real</h3>
              <p className="text-sm text-gray-400">
                Impulsado por Supabase Realtime. Cuando cambias un estado, tu cliente lo ve en milisegundos.
              </p>
            </div>
            <div className="mt-8 space-y-2">
              <div className="rounded border border-white/5 bg-[#151515] p-2 font-mono text-xs text-gray-500">
                Servidor: Actualización recibida
              </div>
              <div className="rounded border border-white/5 bg-[#151515] p-2 font-mono text-xs text-gray-500">
                Cliente: Vista actualizada (12ms)
              </div>
            </div>
          </div>
          {FEATURE_CARDS.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
