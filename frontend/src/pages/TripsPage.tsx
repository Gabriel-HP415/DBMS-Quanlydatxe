import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Trip } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Icon } from '../components/ui/Icon'
import { formatCurrency, formatDateTime } from '../lib/utils'

function seatBadge(count: number) {
  if (count === 0) return 'bg-[#FEE2E2] text-[#991B1B]'
  if (count <= 5) return 'bg-[#FEF9C3] text-[#854D0E]'
  return 'bg-[#DCFCE7] text-[#166534]'
}

export function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    api.getTrips().then(r => setTrips(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = trips.filter(t => {
    if (departure && !t.diem_di.toLowerCase().includes(departure.toLowerCase())) return false
    if (destination && !t.diem_den.toLowerCase().includes(destination.toLowerCase())) return false
    if (date) {
      const d = new Date(t.gio_khoi_hanh).toISOString().split('T')[0]
      if (d !== date) return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bus Trips"
        subtitle="Manage and schedule intercity bus routes."
      />

      {/* Filter Bento */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {[
            { label: 'Điểm đi', icon: 'location_on', val: departure, set: setDeparture },
            { label: 'Điểm đến', icon: 'pin_drop', val: destination, set: setDestination },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{f.label}</label>
              <div className="relative">
                <Icon name={f.icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
                <input value={f.val} onChange={e => f.set(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-bright text-sm focus:outline-none"
                  placeholder="Chọn thành phố" />
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày</label>
            <div className="relative">
              <Icon name="calendar_today" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-bright text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setDeparture(''); setDestination(''); setDate('') }}
              className="flex-1 bg-surface-container-highest text-on-surface px-4 py-2 rounded border border-outline-variant hover:bg-surface-dim text-sm font-semibold h-[42px]">
              Clear
            </button>
            <button className="flex-2 bg-primary text-on-primary px-4 py-2 rounded hover:bg-on-primary-fixed-variant text-sm font-semibold flex items-center justify-center gap-1 h-[42px] shadow-sm">
              <Icon name="search" size={16} /> Search
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="text-lg font-semibold text-on-surface">Active Schedules (CHUYEN_XE)</h3>
          <span className="text-xs text-on-surface-variant font-semibold">Showing {filtered.length} trips</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant">
                {['Mã chuyến', 'Tuyến xe', 'Điểm đi', 'Điểm đến', 'Khởi hành', 'Giá vé', 'Ghế còn', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-on-surface-variant">Đang tải...</td></tr>
              ) : filtered.map(trip => (
                <tr key={trip.ma_chuyen} className={`hover:bg-[#F1F5F9] transition-colors group ${trip.ghe_con === 0 ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-4 font-mono text-xs font-semibold">CX-{trip.ma_chuyen}</td>
                  <td className="py-3 px-4">{trip.ten_tuyen}</td>
                  <td className="py-3 px-4">{trip.diem_di}</td>
                  <td className="py-3 px-4">{trip.diem_den}</td>
                  <td className="py-3 px-4">{formatDateTime(trip.gio_khoi_hanh)}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(trip.gia_ve)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[11px] font-bold ${seatBadge(trip.ghe_con)}`}>
                      {trip.ghe_con}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {trip.ghe_con > 0 ? (
                      <Link to={`/trips/${trip.ma_chuyen}/booking`}
                        className="bg-surface-bright border border-outline-variant text-primary px-3 py-1.5 rounded hover:bg-surface-container text-[13px] font-semibold inline-flex items-center gap-1 shadow-sm">
                        <Icon name="book_online" size={16} /> Đặt vé
                      </Link>
                    ) : (
                      <span className="bg-surface-variant text-outline px-3 py-1.5 rounded text-[13px] font-semibold inline-flex opacity-70 cursor-not-allowed">
                        Hết vé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}