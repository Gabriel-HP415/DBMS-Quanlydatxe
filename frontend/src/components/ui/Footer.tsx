import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant mt-auto">
      <div className="w-full py-8 px-4 flex flex-col md:flex-row justify-between items-center max-w-[var(--spacing-container-max)] mx-auto gap-4">
        <div className="text-lg font-black text-primary">BusTicket Pro</div>
        <nav className="flex flex-wrap gap-4 justify-center">
          {[
            { to: '/simulation', label: 'Mô phỏng TX' },
            { to: '/deadlock', label: 'Deadlock' },
            { to: '/admin', label: 'Quản trị' },
          ].map(l => (
            <Link key={l.to} to={l.to}
              className="text-sm text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-all">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-on-surface-variant">© 2026 BusTicket Pro — Đề tài DBMS</div>
      </div>
    </footer>
  )
}