import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'

const navItems = [
  { to: '/', icon: 'home', label: 'Trang chủ', end: true },
  { to: '/trips', icon: 'directions_bus', label: 'Chuyến xe' },
  { to: '/tickets', icon: 'confirmation_number', label: 'Vé của tôi' },
  { to: '/simulation', icon: 'science', label: 'Mô phỏng TX' },
  { to: '/deadlock', icon: 'warning', label: 'Deadlock' },
  { to: '/admin', icon: 'admin_panel_settings', label: 'Quản trị' },
]

export function Sidebar() {
  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-surface border-r border-outline-variant flex-col p-4 gap-1 z-40">
      <div className="mb-6 px-1">
        <h1 className="text-xl font-bold text-primary tracking-tight">BusTicket Pro</h1>
        <p className="text-xs text-on-surface-variant mt-1">Management System</p>
      </div>

      <div className="flex flex-col gap-0.5 flex-grow">
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all group relative',
              isActive
                ? 'bg-secondary-container text-on-secondary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-primary rounded-r-full" />
                )}
                <Icon name={icon} size={20} filled={isActive} className={isActive ? 'text-primary' : 'group-hover:text-primary'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto border-t border-outline-variant pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
            <Icon name="person" size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface">Nghiên cứu viên</p>
            <p className="text-[10px] text-on-surface-variant">DBMS Project</p>
          </div>
        </div>
      </div>
    </nav>
  )
}