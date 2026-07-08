import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Ticket } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Icon } from '../components/ui/Icon'
import { formatCurrency, formatDateTime } from '../lib/utils'

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [customerId, setCustomerId] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getTickets(customerId).then(r => setTickets(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [customerId])

  const handleCancel = async (ma_ve: number) => {
    if (!confirm('Xác nhận hủy vé?')) return
    try { await api.cancelTicket(ma_ve); load() } catch (e) { alert((e as Error).message) }
  }

  const statusBadge = (s: string) => {
    if (s === 'DA_DAT') return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">Paid</span>
    if (s === 'DA_HUY') return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-semibold">Cancelled</span>
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">{s}</span>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Tickets" subtitle="View your booking history and manage active tickets."
        action={
          <select value={customerId ?? ''} onChange={e => setCustomerId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none">
            <option value="">Tất cả khách hàng</option>
            {[1,2,3,4,5].map(id => <option key={id} value={id}>Khách #{id}</option>)}
          </select>
        }
      />

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                {['Mã vé', 'Khách hàng', 'Chuyến xe', 'Ghế', 'Giá', 'Ngày đặt', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} className="py-2 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-on-surface-variant">Đang tải...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-on-surface-variant">Chưa có vé</td></tr>
              ) : tickets.map(t => {
                const cancelled = t.trang_thai !== 'DA_DAT'
                return (
                  <tr key={t.ma_ve} className={`hover:bg-surface-container-low transition-colors group ${cancelled ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-4 text-sm font-medium">#BT-{String(t.ma_ve).padStart(4,'0')}</td>
                    <td className="py-3 px-4 text-sm text-on-surface-variant">{t.ten_khach_hang}</td>
                    <td className="py-3 px-4 text-sm text-on-surface-variant">{t.ten_tuyen}</td>
                    <td className="py-3 px-4 text-sm text-on-surface-variant">{t.so_ghe}</td>
                    <td className="py-3 px-4 text-sm">{formatCurrency(t.gia_thanh_toan)}</td>
                    <td className="py-3 px-4 text-sm text-on-surface-variant">{formatDateTime(t.ngay_dat)}</td>
                    <td className="py-3 px-4 text-center">{statusBadge(t.trang_thai)}</td>
                    <td className="py-3 px-4 text-right">
                      {t.trang_thai === 'DA_DAT' ? (
                        <button onClick={() => handleCancel(t.ma_ve)}
                          className="inline-flex items-center gap-1 text-error text-xs font-semibold hover:underline">
                          <Icon name="cancel" size={16} /> Hủy vé
                        </button>
                      ) : <span className="text-xs text-outline">N/A</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}