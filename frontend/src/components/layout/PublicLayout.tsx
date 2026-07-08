import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { Footer } from '../ui/Footer'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}