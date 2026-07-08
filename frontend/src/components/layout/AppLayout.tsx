import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Footer } from '../ui/Footer'
import { Icon } from '../ui/Icon'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

const mobileLinks = [
  ['/', 'Trang chủ'], ['/trips', 'Chuyến xe'], ['/tickets', 'Vé'],
  ['/simulation', 'Mô phỏng'], ['/deadlock', 'Deadlock'], ['/admin', 'Quản trị'],
]

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <header className="md:hidden sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex justify-between items-center px-4 h-16">
          <span className="font-bold text-primary">BusTicket Pro</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-on-surface-variant">
            <Icon name="menu" />
          </button>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col p-2 border-t border-outline-variant">
            {mobileLinks.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn('px-4 py-2.5 rounded-lg text-sm', isActive && 'bg-secondary-container font-bold')}>
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <Sidebar />

      <main className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[var(--spacing-container-max)] mx-auto w-full">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  )
}