import { NavLink, Outlet } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'

export function Layout() {
  const { ids } = useCompare()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition ${
      isActive ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
    }`

  return (
    <div className="flex min-h-full flex-col">
      <header className="bg-brand-dark text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white font-black text-brand-dark">
              C
            </span>
            <span className="text-lg font-bold tracking-tight">Cortex</span>
            <span className="hidden text-xs font-medium text-blue-200 sm:inline">
              Player Intelligence
            </span>
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Squad
            </NavLink>
            <NavLink to="/market" className={navClass}>
              Market
            </NavLink>
            <NavLink to="/compare" className={navClass}>
              Compare
              {ids.length > 0 && (
                <span className="ml-1.5 rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-brand-dark">
                  {ids.length}
                </span>
              )}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-400">
        Cortex prototype · static mock data · on-ball metrics only (off-ball &amp; tracking data out
        of MVP scope)
      </footer>
    </div>
  )
}
