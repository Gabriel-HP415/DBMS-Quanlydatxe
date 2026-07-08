import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/trips', label: 'Trips' },
  { to: '/tickets', label: 'My Tickets' },
  { to: '/simulation', label: 'Simulation' },
  { to: '/admin', label: 'Admin' },
]

export function TopNav() {
  return (
    <header className="w-full bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 h-16 max-w-[var(--spacing-container-max)] mx-auto">
        <div className="flex items-center gap-2">
          <Icon name="directions_bus" filled className="text-primary text-3xl" />
          <span className="text-lg font-bold text-primary">BusTicket Pro</span>
        </div>
        <nav className="hidden md:flex gap-6 items-center h-full">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'h-full flex items-center text-xs font-semibold uppercase tracking-wide transition-colors px-1',
                isActive
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              )}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="p-1 rounded-full hover:bg-surface-container-low text-primary transition-transform active:scale-95">
          <Icon name="account_circle" size={28} />
        </button>
      </div>
    </header>
  )
}