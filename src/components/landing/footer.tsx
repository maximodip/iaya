import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 text-center text-sm text-gray-500 md:flex-row md:text-left lg:px-8">
        <div className="flex justify-center gap-6 text-gray-500">
          <Link href="https://github.com/maximodip" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            GitHub
          </Link>
          <Link
            href="https://www.linkedin.com/in/maximodipaparicio/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            LinkedIn
          </Link>
        </div>
        <p className="font-mono text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Plataforma IAya. Todos los sistemas operativos.
        </p>
      </div>
    </footer>
  )
}
