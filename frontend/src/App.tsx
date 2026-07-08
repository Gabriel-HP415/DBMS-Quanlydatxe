import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PublicLayout } from './components/layout/PublicLayout'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { TripsPage } from './pages/TripsPage'
import { BookingPage } from './pages/BookingPage'
import { TicketsPage } from './pages/TicketsPage'
import { AdminPage } from './pages/AdminPage'
import { SimulationPage } from './pages/SimulationPage'
import { DeadlockPage } from './pages/DeadlockPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id/booking" element={<BookingPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/deadlock" element={<DeadlockPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}