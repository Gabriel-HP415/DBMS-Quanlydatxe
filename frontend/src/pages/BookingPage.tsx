import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Trip, Seat, CheDoKhoa } from '../types'
import { Icon } from '../components/ui/Icon'
import { cn, formatCurrency, formatDateTime } from '../lib/utils'

const CHE_DO: { value: CheDoKhoa; label: string; desc: string }[] = [
  { value: 'KHONG_KHOA', label: 'Không khóa', desc: 'Lost Update' },
  { value: 'BI_QUAN', label: 'Pessimistic', desc: 'UPDLOCK' },
  { value: 'LE_QUAN', label: 'Optimistic', desc: 'rowversion' },
]

export function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tripId = Number(id)

  const [trip, setTrip] = useState<Trip | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [customerId, setCustomerId] = useState(1)
  const [cheDoKhoa, setCheDoKhoa] = useState<CheDoKhoa>('BI_QUAN')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const loadSeats = () => api.getSeats(tripId).then(r => setSeats(r.data)).catch(console.error)

  useEffect(() => {
    api.getTrip(tripId).then(r => setTrip(r.data)).catch(console.error)
    loadSeats()
  }, [tripId])

  const selectedSeat = seats.find(s => s.ma_ghe === selected)

  const handleBook = async () => {
    if (!selected) return
    setLoading(true); setResult(null)
    try {
      const res = await api.book({
        ma_chuyen: tripId, ma_ghe: selected, ma_khach_hang: customerId,
        che_do_khoa: cheDoKhoa, session_id: `WEB_${Date.now()}`,
      })
      const d = res.data
      setResult({ ok: d.ket_qua === 'COMMIT', msg: d.thong_bao })
      if (d.ket_qua === 'COMMIT') { loadSeats(); setSelected(null) }
    } catch (e) {
      setResult({ ok: false, msg: (e as Error).message })
    } finally { setLoading(false) }
  }

  const renderSeat = (seat: Seat) => {
    const isSelected = selected === seat.ma_ghe
    const isBooked = seat.trang_thai_ghe === 'DA_DAT'
    return (
      <button key={seat.ma_ghe} disabled={isBooked}
        onClick={() => setSelected(isSelected ? null : seat.ma_ghe)}
        className={cn(
          'seat w-12 h-12 rounded-lg flex items-center justify-center text-sm select-none',
          isBooked && 'seat-booked',
          !isBooked && !isSelected && 'seat-available text-on-surface-variant',
          isSelected && 'seat-selecting',
        )}>
        {seat.so_ghe}
      </button>
    )
  }

  // Group seats into rows of 4 (A1-A4, B1-B4...)
  const rows: Seat[][] = []
  const sorted = [...seats].sort((a, b) => a.so_ghe.localeCompare(b.so_ghe))
  for (let i = 0; i < sorted.length; i += 4) rows.push(sorted.slice(i, i + 4))

  return (
    <div className="pb-28">
      <div className="mb-6 flex items-center gap-2 text-on-surface-variant">
        <Link to="/trips" className="hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="arrow_back" size={20} />
          <span className="text-xs font-semibold uppercase tracking-wide ml-1">Back to Trips</span>
        </Link>
      </div>

      <h1 className="text-[32px] font-bold text-on-surface mb-8 tracking-tight">Booking Details</h1>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        {/* Left */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Trip Summary */}
          {trip && (
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-on-surface mb-4 pb-2 border-b border-outline-variant flex items-center gap-2">
                <Icon name="route" className="text-primary" /> Trip Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1">Route</label>
                  <div className="font-semibold flex items-center gap-1">
                    {trip.diem_di} <Icon name="arrow_forward" size={16} /> {trip.diem_den}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1">Date & Time</label>
                  <div className="font-semibold">{formatDateTime(trip.gio_khoi_hanh)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1">Bus Type</label>
                  <div>{trip.loai_xe} ({trip.bien_so})</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1">Base Price</label>
                  <div className="font-semibold text-primary">{formatCurrency(trip.gia_ve)} <span className="text-on-surface-variant font-normal text-xs">/ghế</span></div>
                </div>
              </div>
            </section>
          )}

          {/* Customer + Concurrency */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-on-surface mb-4 pb-2 border-b border-outline-variant flex items-center gap-2">
              <Icon name="person" className="text-primary" /> Customer & Concurrency
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1">Khách hàng</label>
                <select value={customerId} onChange={e => setCustomerId(Number(e.target.value))}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                  {[1,2,3,4,5].map(id => <option key={id} value={id}>Khách hàng #{id}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1">Chế độ khóa</label>
                <div className="flex flex-wrap gap-2">
                  {CHE_DO.map(opt => (
                    <button key={opt.value} onClick={() => setCheDoKhoa(opt.value)}
                      className={cn('px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                        cheDoKhoa === opt.value ? 'border-primary bg-secondary-container text-on-secondary-container' : 'border-outline-variant hover:bg-surface-container')}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {result && (
              <div className={cn('mt-4 p-3 rounded-lg text-sm font-medium', result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')}>
                {result.msg}
              </div>
            )}
          </section>
        </div>

        {/* Right - Seat Map */}
        <div className="xl:col-span-5">
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col items-center">
            <h2 className="text-lg font-semibold text-on-surface mb-4 pb-2 border-b border-outline-variant w-full flex items-center justify-between">
              <span className="flex items-center gap-2"><Icon name="airline_seat_recline_normal" className="text-primary" /> Select Seats</span>
              <span className="text-xs font-semibold bg-primary-container text-on-primary-fixed px-2 py-1 rounded-full">Front of Bus</span>
            </h2>

            <div className="flex justify-center gap-4 mb-6 w-full text-xs font-semibold">
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 border-[#22c55e] bg-white" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#f1f5f9] relative overflow-hidden"><span className="absolute w-[120%] h-[2px] bg-[#ef4444] rotate-[-45deg] top-1/2 left-[-10%]" /></span> Booked</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#eab308]" /> Selecting</span>
            </div>

            <div className="bg-surface-container border-2 border-outline-variant rounded-[32px] p-4 w-full max-w-[320px]">
              <div className="flex justify-end mb-4 pr-4 pb-2 border-b-2 border-dashed border-outline-variant">
                <Icon name="directions_bus" className="text-on-surface-variant text-[32px]" />
              </div>
              <div className="flex flex-col gap-4 items-center">
                {rows.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-4 gap-x-2 gap-y-4 justify-items-center w-full">
                    {row.map((seat, si) => (
                      <div key={seat.ma_ghe} className={si === 1 ? 'mr-6' : ''}>
                        {renderSeat(seat)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Bar - Stitch style */}
      <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-surface border-t border-outline-variant p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-30">
        <div className="max-w-[var(--spacing-container-max)] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase block">Selected Seats</span>
              <span className="text-lg font-bold">{selectedSeat?.so_ghe || '—'}</span>
            </div>
            <div className="h-8 w-px bg-outline-variant hidden sm:block" />
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase block">Total Price</span>
              <span className="text-2xl font-bold text-primary">{trip ? formatCurrency(selected ? trip.gia_ve : 0) : '—'}</span>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => navigate('/trips')}
              className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-surface border border-outline-variant text-on-surface text-xs font-semibold uppercase tracking-wider hover:bg-surface-container-low">
              Hủy
            </button>
            <button onClick={handleBook} disabled={!selected || loading}
              className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
              <Icon name="check_circle" size={18} />
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}