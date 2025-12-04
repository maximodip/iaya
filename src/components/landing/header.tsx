"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { LandingButton } from "./ui/landing-button"

const NAV_LINKS = [
  { href: "#features", label: "Características" },
  { href: "#how-it-works", label: "Cómo Funciona" },
  { href: "#pricing", label: "Precios" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-200 ${
        isScrolled ? "border-white/5 bg-black/50 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-3 items-center p-6 lg:px-8" aria-label="Global">
        <div className="flex flex-1">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <span className="text-xl font-mono font-bold tracking-tight text-white">IAya</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-x-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium leading-6 text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center justify-end gap-3 lg:flex">
          <LandingButton asChild variant="ghost" size="sm" className="font-mono">
            <Link href="/login">Iniciar Sesión</Link>
          </LandingButton>
          <LandingButton asChild size="sm" className="font-mono">
            <Link href="/register">Comenzar</Link>
          </LandingButton>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 flex w-full flex-col gap-4 border-b border-white/10 bg-[#0A0A0A] px-6 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="my-2 h-px bg-white/10" />
          <LandingButton
            asChild
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Link href="/login">Iniciar Sesión</Link>
          </LandingButton>
          <LandingButton asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
            <Link href="/register">Comenzar</Link>
          </LandingButton>
        </div>
      )}
    </header>
  )
}
