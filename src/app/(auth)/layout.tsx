export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}

