const STEPS = [
  {
    id: "01",
    title: "Onboarding",
    description: "Registro de agencia y configuración de marca en < 2min.",
  },
  {
    id: "02",
    title: "Ingestión IA",
    description: "Sube requerimientos. La IA estructura el roadmap.",
  },
  {
    id: "03",
    title: "Acceso Cliente",
    description: "Clientes reciben credenciales a su portal privado.",
  },
  {
    id: "04",
    title: "Delivery",
    description: "Marca hitos. El cliente celebra el progreso.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-white/5 bg-[#050505] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Workflow Simplificado</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.id} className="relative border-l border-white/10 px-6 py-2 transition-colors hover:border-white/30">
              <span className="absolute -top-4 right-4 select-none text-4xl font-mono font-bold text-white/10">
                {step.id}
              </span>
              <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
