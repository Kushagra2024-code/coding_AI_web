import { useState } from 'react'
import { registerForDemo } from '../api/coding'
import { useAuthStore } from '../store/authStore'
import { Terminal, Shield, Cpu, BarChart3, ArrowRight, Play, CheckCircle2 } from 'lucide-react'

export default function Landing() {
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDemoLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await registerForDemo()
      setAuth(data.token, data.user)
    } catch {
      setError('System connection failed. Please ensure backend is operational.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-emerald-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#064e3b,transparent_50%)] pointer-events-none" />
      
      <main className="relative z-10 pt-20 pb-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-semibold text-emerald-400 mb-8 animate-in slide-in-from-top duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Production Ready - Open Source Platform
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 animate-in fade-in zoom-in duration-1000">
            AI <span className="text-emerald-400">OA</span> PRACTICE
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-medium">
            Elevate your interview preparation with our AI-powered ecosystem. 
            Simulate realistic technical screens, solve complex challenges, and master system design.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in slide-in-from-bottom duration-1000 delay-200">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="group flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-bold text-slate-950 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="h-5 w-5 fill-current" />
              {loading ? 'Initializing...' : 'Get Started for Free'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/50 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800 hover:border-slate-600"
            >
              Star on GitHub
            </a>
          </div>

          {error && <p className="mb-8 text-rose-400 font-mono text-sm">{error}</p>}

          <div className="grid gap-8 md:grid-cols-3 text-left">
            <FeatureCard 
              icon={Terminal} 
              title="AI Coding Evaluator" 
              desc="Real-time feedback on complexity, readability, and edge cases. Powered by Gemini Pro." 
            />
            <FeatureCard 
              icon={Cpu} 
              title="Universal Compiler" 
              desc="Support for C++, Python, Java, and JavaScript with Judge0 cloud execution." 
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Deep Analytics" 
              desc="Historical performance tracking and AI-driven weakness identification." 
            />
          </div>
        </div>
      </main>

      <section className="relative z-10 py-24 bg-slate-900/50 border-t border-slate-800 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Full Interview Lifecycle</h2>
            <p className="text-slate-400 mt-2">Comprehensive features for end-to-end preparation</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <CheckItem text="AI Interview Simulator" />
            <CheckItem text="System Design Drawboard" />
            <CheckItem text="Anti-Cheat Detection" />
            <CheckItem text="Session Scoring Engine" />
            <CheckItem text="Gemini Question Lab" />
            <CheckItem text="Test Case Validation" />
            <CheckItem text="Topic Heatmaps" />
            <CheckItem text="Multi-language Support" />
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 border-t border-slate-900 text-center text-slate-500 text-sm font-mono uppercase tracking-[0.2em]">
        Built for the Open Source Community &middot; 2026
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-8 transition-all hover:bg-slate-900/50 hover:border-emerald-500/30 group">
      <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm font-medium">{desc}</p>
    </div>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-300 font-medium">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
      {text}
    </div>
  )
}
