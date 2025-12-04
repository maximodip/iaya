import { CallToAction } from "@/components/landing/cta"
import { ChatWidget } from "@/components/landing/chat-widget"
import { Features } from "@/components/landing/features"
import { Footer } from "@/components/landing/footer"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Pricing } from "@/components/landing/pricing"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CallToAction />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
