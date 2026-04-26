import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, Code, PencilRuler, LogOut, Terminal } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Coding', path: '/coding', icon: Code },
    { name: 'Design', path: '/design', icon: PencilRuler },
    { name: 'Admin', path: '/admin/questions', icon: PencilRuler },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="rounded-lg bg-emerald-500 p-1.5 transition-transform group-hover:scale-110">
            <Terminal className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            AI <span className="text-emerald-400">OA</span> Practice
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-400 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-mono uppercase">Rating: {user.rating}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-400 transition-all hover:bg-slate-800 hover:text-rose-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
