import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { api } from '../api/client'
import type { Trip } from '../types'


const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJdKq8jFGbOQkENTjKa98O1qOjubcftHfDuA0pfraSQnK62kGVaYJjql00V-WD0jQStQ1ZWAgwI-TL3qQ0SXrkxMpzpfEJ6H0DUUnURIJOY0iiQQvDRzpoIvNa6fXgZmDk_hGgKET541jppRdzPId4leY2MF_Mx-KEdbXJ91riH1UdSPmySFMWdVbLAaoLyF_sLHjr1Bbo_fEChDj-07lTlNDI9oEDyv6Lr3GmnyVwaaBHNvISZxAIrorsosYqnKFoI_60KdawTi1L'

const ROUTE_CARDS = [
  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs7R45W37KgHrymeIGC7VF5lFYZbae0srthgqec6L2LIHx1o550EWdHaYFDAwY12Jy7qxOVpX2v8X8yP2jfwCOAkm3vbboSCzCHZHJS1FZQHcsM2UUcx-hnFhUqEBmY3IxOsuR1PjRIftUWSnZMUW4QwV9gbQ6kVRmL5KtiClO60MmrWBYNh4nDoSAtpbiL1fnoAYTqVMiSk-qFggO1lkhqhI8bWnrZHY6wd-ybOM1xOH2K_1Hv7Yrf9W1rNOceogkzX8cQglhO6nV', from: 'TP.HCM', to: 'Đà Lạt', price: '350k', time: '8h 00m' },
  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm68HoMnDJx_ZqEB3Z0ODDGgtibjcV8Z7CO9KsdN_OJuHO9UrRfaHAiAi_3Q1bOELRtG1WdYJ-NlTERcff1aNkMZLCumBqcX3SVkUk_Mww7C13CQCb4doLupZaVaxVGDb4xuotFQBCJLDk4MVL2DdGjazal4I6nOgM5Jf3lun3b42kaoeEPO70-2rC06woHcCFkjJIi1HqFbRrt1GIjEq2o-NYtpXYCg9MlpETe9cSztzOuot0DyPCSQxHlXFwZD918QQCLk6myeH3', from: 'TP.HCM', to: 'Nha Trang', price: '280k', time: '9h 00m' },
  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLpj2EJgWoilkNy0S3jgc5e89uJXfHhJu0nBzsV0quQP1nOIwQs6auLv186g39Z-E933ui8GcLbgEtJkYIPzBkZ5HunZ2ojyPVPRM-KvP1zjRpPksbpzTfWo1D_E5s3uEIBpGKkMj93zmnmbW37Ei6yzkLAMiRu7zvoV3RZN5-sWHN_-5VbnMO78BsdQxGiSQ33fsTC_xNZcwyM7fWhx1W0QZw_nSqzIDrvOei-VkOqjcOmqigpfLpy0l30HE6Q-Q94O00_u_33Zj8', from: 'TP.HCM', to: 'Cần Thơ', price: '180k', time: '4h 00m' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => { api.getTrips().then(r => setTrips(r.data)).catch(() => {}) }, [])

  const handleSearch = () => navigate('/trips')

  return (
    <>
      {/* Hero */}
      <section className="relative w-full min-h-[500px] flex items-center pt-8 pb-32 px-4">
        <div className="absolute inset-0 z-0 bg-surface-container-high overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMG}')` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 to-surface/40" />
        </div>
        <div className="relative z-10 w-full max-w-[var(--spacing-container-max)] mx-auto flex flex-col items-start gap-6">
          <div className="max-w-2xl">
            <h1 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight leading-tight">
              Đặt vé xe khách trực tuyến dễ dàng
            </h1>
            <p className="text-base text-on-surface-variant">
              Hệ thống mô phỏng nghiên cứu Concurrency Control & Deadlock trên SQL Server.
              Powered by Stored Procedures và Transaction.
            </p>
          </div>

          {/* Search Bento */}
          <div className="w-full max-w-4xl bg-surface/80 backdrop-blur-md border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {[
                { label: 'Điểm đi', icon: 'location_on', value: departure, set: setDeparture, ph: 'TP. Hồ Chí Minh' },
                { label: 'Điểm đến', icon: 'pin_drop', value: destination, set: setDestination, ph: 'Đà Lạt' },
              ].map(f => (
                <div key={f.label} className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">{f.label}</label>
                  <div className="relative">
                    <Icon name={f.icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
                    <input value={f.value} onChange={e => f.set(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                      placeholder={f.ph} />
                  </div>
                </div>
              ))}
              <div className="w-full md:w-auto min-w-[200px]">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Ngày</label>
                <div className="relative">
                  <Icon name="calendar_month" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-base focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <button onClick={handleSearch}
                className="w-full md:w-auto bg-primary text-on-primary text-xs font-semibold uppercase tracking-wide px-6 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-1 h-[42px]">
                <Icon name="search" size={18} /> Tìm chuyến
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="w-full max-w-[var(--spacing-container-max)] mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-on-surface">Tuyến phổ biến</h2>
          <Link to="/trips" className="text-primary text-xs font-semibold uppercase tracking-wide hover:underline flex items-center gap-1">
            Xem tất cả <Icon name="arrow_forward" size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROUTE_CARDS.map(card => (
            <Link key={card.to} to="/trips"
              className="group bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="h-48 w-full bg-surface-container-highest relative overflow-hidden">
                <img src={card.img} alt={card.to} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur text-primary text-xs font-semibold px-2 py-1 rounded border border-outline-variant">
                  Từ {card.price} VND
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{card.from}</span>
                  <Icon name="sync_alt" className="text-outline text-sm" />
                  <span className="font-semibold">{card.to}</span>
                </div>
                <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-auto">
                  <Icon name="schedule" size={14} /> {card.time}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Simulation */}
      <section className="w-full max-w-[var(--spacing-container-max)] mx-auto px-4 pb-8">
        <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-primary">Bắt đầu mô phỏng Transaction</h3>
            <p className="text-sm text-on-surface-variant mt-1">Mở nhiều tab trình duyệt để minh họa Concurrency Control trước giảng viên</p>
          </div>
          <Link to="/simulation"
            className="bg-primary-container text-on-primary px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-primary transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
            <Icon name="science" size={18} /> Mô phỏng ngay
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="w-full bg-surface-container-low border-t border-outline-variant py-8 px-4">
        <div className="max-w-[var(--spacing-container-max)] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-4">Về hệ thống BusTicket Pro</h2>
            <p className="text-base text-on-surface-variant mb-4">
              Nền tảng mô phỏng đặt vé xe khách phục vụ đề tài nghiên cứu kiểm soát đồng thời và xử lý bế tắc trên SQL Server.
            </p>
            <ul className="space-y-3">
              {[
                { icon: 'database', text: 'Schema 3NF với Stored Procedure + Transaction' },
                { icon: 'lock', text: 'ACID-compliant: Pessimistic & Optimistic Locking' },
                { icon: 'warning', text: 'Deadlock demo với Error 1205 và Wait-For Graph' },
              ].map(item => (
                <li key={item.icon} className="flex items-start gap-2">
                  <Icon name={item.icon} className="text-primary mt-0.5" size={20} />
                  <span className="text-sm text-on-surface-variant">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-center min-h-[220px] relative overflow-hidden">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #004ac6 0, #004ac6 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
            <div className="text-center relative z-10">
              <Icon name="schema" className="text-6xl text-outline mb-2 block" />
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {trips.length} chuyến xe đang hoạt động
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}