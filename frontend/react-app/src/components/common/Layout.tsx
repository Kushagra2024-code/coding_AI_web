import type { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,#022c22,transparent)] pointer-events-none" />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-8 md:px-8 animate-in fade-in duration-700">
        {children}
      </main>
    </div>
  )
}
