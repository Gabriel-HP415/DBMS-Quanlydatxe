import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Customer, Bus, Trip, Ticket, Route } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { FormField, TextInput, SelectInput } from '../components/ui/FormField'
import { Button } from '../components/ui/button'
import { formatCurrency, formatDateTime } from '../lib/utils'

type Tab = 'customers' | 'buses' | 'trips' | 'tickets'
type ModalMode = 'create' | 'edit'

interface ModalState {
  open: boolean
  mode: ModalMode
  tab: Tab
  id?: number
}

const EMPTY_CUSTOMER = { ho_ten: '', email: '', so_dien_thoai: '', trang_thai: 'HOAT_DONG' }
const EMPTY_BUS = { bien_so: '', loai_xe: '', so_ghe: 40, trang_thai: 'HOAT_DONG' }
const EMPTY_TRIP = { ma_tuyen: 0, ma_xe: 0, gio_khoi_hanh: '', gia_ve: 0, trang_thai: 'MO' }

function toDatetimeLocal(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('customers')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [customers, setCustomers] = useState<Customer[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [routes, setRoutes] = useState<Route[]>([])

  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'create', tab: 'customers' })
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER)
  const [busForm, setBusForm] = useState(EMPTY_BUS)
  const [tripForm, setTripForm] = useState(EMPTY_TRIP)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [c, b, t, tk, r] = await Promise.all([
        api.getCustomers(),
        api.getBuses(),
        api.getAdminTrips(),
        api.getAdminTickets(),
        api.getRoutes(),
      ])
      setCustomers(c.data)
      setBuses(b.data)
      setTrips(t.data)
      setTickets(tk.data)
      setRoutes(r.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const openCreate = () => {
    setError('')
    if (tab === 'customers') setCustomerForm(EMPTY_CUSTOMER)
    if (tab === 'buses') setBusForm(EMPTY_BUS)
    if (tab === 'trips') setTripForm({ ...EMPTY_TRIP, ma_tuyen: routes[0]?.ma_tuyen ?? 0, ma_xe: buses[0]?.ma_xe ?? 0 })
    setModal({ open: true, mode: 'create', tab })
  }

  const openEdit = (id: number) => {
    setError('')
    if (tab === 'customers') {
      const c = customers.find(x => x.ma_khach_hang === id)!
      setCustomerForm({ ho_ten: c.ho_ten, email: c.email, so_dien_thoai: c.so_dien_thoai, trang_thai: c.trang_thai })
    }
    if (tab === 'buses') {
      const b = buses.find(x => x.ma_xe === id)!
      setBusForm({ bien_so: b.bien_so, loai_xe: b.loai_xe, so_ghe: b.so_ghe, trang_thai: b.trang_thai })
    }
    if (tab === 'trips') {
      const t = trips.find(x => x.ma_chuyen === id)!
      setTripForm({
        ma_tuyen: t.ma_tuyen ?? routes[0]?.ma_tuyen ?? 0,
        ma_xe: t.ma_xe ?? buses[0]?.ma_xe ?? 0,
        gio_khoi_hanh: toDatetimeLocal(t.gio_khoi_hanh),
        gia_ve: t.gia_ve,
        trang_thai: t.trang_thai_chuyen,
      })
    }
    setModal({ open: true, mode: 'edit', tab, id })
  }

  const closeModal = () => setModal(m => ({ ...m, open: false }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (modal.tab === 'customers') {
        if (!customerForm.ho_ten || !customerForm.email || !customerForm.so_dien_thoai) {
          throw new Error('Vui lòng điền đầy đủ thông tin khách hàng')
        }
        if (modal.mode === 'create') {
          await api.createCustomer(customerForm)
        } else {
          await api.updateCustomer(modal.id!, customerForm)
        }
      }

      if (modal.tab === 'buses') {
        if (!busForm.bien_so || !busForm.loai_xe || busForm.so_ghe < 10) {
          throw new Error('Vui lòng điền đầy đủ thông tin xe (10–60 ghế)')
        }
        if (modal.mode === 'create') {
          await api.createBus({ bien_so: busForm.bien_so, loai_xe: busForm.loai_xe, so_ghe: busForm.so_ghe })
        } else {
          await api.updateBus(modal.id!, busForm)
        }
      }

      if (modal.tab === 'trips') {
        if (!tripForm.gio_khoi_hanh || tripForm.gia_ve <= 0 || !tripForm.ma_tuyen || !tripForm.ma_xe) {
          throw new Error('Vui lòng điền đầy đủ thông tin chuyến xe')
        }
        const payload = {
          ma_tuyen: tripForm.ma_tuyen,
          ma_xe: tripForm.ma_xe,
          gio_khoi_hanh: new Date(tripForm.gio_khoi_hanh).toISOString(),
          gia_ve: tripForm.gia_ve,
          trang_thai: tripForm.trang_thai,
        }
        if (modal.mode === 'create') {
          await api.createTrip(payload)
        } else {
          await api.updateTrip(modal.id!, payload)
        }
      }

      closeModal()
      await loadData()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    const labels: Record<Tab, string> = {
      customers: 'khóa khách hàng này',
      buses: 'ngừng xe này',
      trips: 'hủy chuyến xe này',
      tickets: 'hủy vé này',
    }
    if (!confirm(`Xác nhận ${labels[tab]}?`)) return

    try {
      if (tab === 'customers') await api.deleteCustomer(id)
      if (tab === 'buses') await api.deleteBus(id)
      if (tab === 'trips') await api.deleteTrip(id)
      if (tab === 'tickets') await api.cancelTicket(id)
      await loadData()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  const stats = [
    { label: 'Khách hàng', value: customers.length, icon: 'group', sub: 'Tổng trong hệ thống' },
    { label: 'Vé đã bán', value: tickets.filter(t => t.trang_thai === 'DA_DAT').length, icon: 'local_activity', sub: 'Vé đang hoạt động' },
    { label: 'Chuyến hoạt động', value: trips.filter(t => t.trang_thai_chuyen === 'MO').length, icon: 'route', sub: 'Đang mở đặt vé' },
  ]

  const q = search.toLowerCase()
  const filteredCustomers = customers.filter(c => !q || c.ho_ten.toLowerCase().includes(q) || c.email.includes(q))
  const filteredBuses = buses.filter(b => !q || b.bien_so.toLowerCase().includes(q) || b.loai_xe.toLowerCase().includes(q))
  const filteredTrips = trips.filter(t => !q || t.ten_tuyen.toLowerCase().includes(q) || t.diem_di.toLowerCase().includes(q))
  const filteredTickets = tickets.filter(t => !q || t.ten_khach_hang.toLowerCase().includes(q) || t.so_ghe.includes(q))

  const modalTitle = () => {
    const entity = { customers: 'Khách hàng', buses: 'Xe', trips: 'Chuyến xe' }[modal.tab as 'customers'|'buses'|'trips']
    return modal.mode === 'create' ? `Thêm ${entity}` : `Sửa ${entity}`
  }

  const ActionButtons = ({ id }: { id: number }) => (
    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {tab !== 'tickets' && (
        <button onClick={() => openEdit(id)} title="Sửa"
          className="text-secondary hover:text-primary p-1.5 rounded-full hover:bg-surface-container-high">
          <Icon name="edit" size={16} />
        </button>
      )}
      <button onClick={() => handleDelete(id)} title={tab === 'tickets' ? 'Hủy vé' : 'Xóa'}
        className="text-secondary hover:text-error p-1.5 rounded-full hover:bg-error-container">
        <Icon name={tab === 'tickets' ? 'cancel' : 'delete'} size={16} />
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Database Management"
        subtitle="CRUD Khách hàng, Xe, Chuyến xe, Vé — dữ liệu từ SQL Server"
        action={
          tab !== 'tickets' ? (
            <Button onClick={openCreate}><Icon name="add" size={18} /> Thêm mới</Button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-primary-container transition-colors">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20">
              <Icon name={s.icon} filled className="text-6xl text-primary" />
            </div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{s.label}</p>
            <h3 className="text-[32px] font-bold">{s.value}</h3>
            <p className="text-sm text-on-surface-variant mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant">
        <nav className="-mb-px flex flex-wrap gap-x-8">
          {([
            ['customers', 'Khách hàng'],
            ['buses', 'Xe'],
            ['trips', 'Chuyến xe'],
            ['tickets', 'Vé'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setSearch('') }}
              className={`border-b-2 py-4 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${
                tab === key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}>
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-outline-variant bg-surface flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm focus:outline-none"
              placeholder="Tìm kiếm..." />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <p className="p-8 text-center text-on-surface-variant">Đang tải...</p>
          ) : tab === 'customers' ? (
            <DataTable
              headers={['ID', 'Họ tên', 'Email', 'SĐT', 'Trạng thái', 'Thao tác']}
              rows={filteredCustomers.map(c => [
                `#CUS-${c.ma_khach_hang}`,
                c.ho_ten,
                c.email,
                c.so_dien_thoai,
                <StatusBadge key={c.ma_khach_hang} active={c.trang_thai === 'HOAT_DONG'} label={c.trang_thai === 'HOAT_DONG' ? 'Active' : 'Locked'} />,
                <ActionButtons key={`a-${c.ma_khach_hang}`} id={c.ma_khach_hang} />,
              ])}
            />
          ) : tab === 'buses' ? (
            <DataTable
              headers={['ID', 'Biển số', 'Loại xe', 'Số ghế', 'Trạng thái', 'Thao tác']}
              rows={filteredBuses.map(b => [
                `#${b.ma_xe}`,
                b.bien_so,
                b.loai_xe,
                b.so_ghe,
                <StatusBadge key={b.ma_xe} active={b.trang_thai === 'HOAT_DONG'} label={b.trang_thai} />,
                <ActionButtons key={`a-${b.ma_xe}`} id={b.ma_xe} />,
              ])}
            />
          ) : tab === 'trips' ? (
            <DataTable
              headers={['Mã', 'Tuyến', 'Khởi hành', 'Giá vé', 'Ghế còn', 'TT', 'Thao tác']}
              rows={filteredTrips.map(t => [
                `CX-${t.ma_chuyen}`,
                t.ten_tuyen,
                formatDateTime(t.gio_khoi_hanh),
                formatCurrency(t.gia_ve),
                `${t.ghe_con}/${t.tong_ghe}`,
                <StatusBadge key={t.ma_chuyen} active={t.trang_thai_chuyen === 'MO'} label={t.trang_thai_chuyen} />,
                <ActionButtons key={`a-${t.ma_chuyen}`} id={t.ma_chuyen} />,
              ])}
            />
          ) : (
            <DataTable
              headers={['Mã vé', 'Khách hàng', 'Tuyến', 'Ghế', 'Giá', 'Trạng thái', 'Thao tác']}
              rows={filteredTickets.map(t => [
                `#BT-${String(t.ma_ve).padStart(4, '0')}`,
                t.ten_khach_hang,
                t.ten_tuyen,
                t.so_ghe,
                formatCurrency(t.gia_thanh_toan),
                <TicketBadge key={t.ma_ve} status={t.trang_thai} />,
                t.trang_thai === 'DA_DAT' ? <ActionButtons key={`a-${t.ma_ve}`} id={t.ma_ve} /> : <span className="text-xs text-outline">N/A</span>,
              ])}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal open={modal.open} onClose={closeModal} title={modalTitle()}>
        {error && <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">{error}</div>}

        {modal.tab === 'customers' && (
          <div className="flex flex-col gap-4">
            <FormField label="Họ tên" required>
              <TextInput value={customerForm.ho_ten} onChange={e => setCustomerForm(f => ({ ...f, ho_ten: e.target.value }))} placeholder="Nguyễn Văn A" />
            </FormField>
            <FormField label="Email" required>
              <TextInput type="email" value={customerForm.email} onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </FormField>
            <FormField label="Số điện thoại" required>
              <TextInput value={customerForm.so_dien_thoai} onChange={e => setCustomerForm(f => ({ ...f, so_dien_thoai: e.target.value }))} placeholder="0901234567" />
            </FormField>
            {modal.mode === 'edit' && (
              <FormField label="Trạng thái">
                <SelectInput value={customerForm.trang_thai} onChange={e => setCustomerForm(f => ({ ...f, trang_thai: e.target.value }))}>
                  <option value="HOAT_DONG">HOAT_DONG</option>
                  <option value="KHOA">KHOA</option>
                </SelectInput>
              </FormField>
            )}
          </div>
        )}

        {modal.tab === 'buses' && (
          <div className="flex flex-col gap-4">
            <FormField label="Biển số" required>
              <TextInput value={busForm.bien_so} onChange={e => setBusForm(f => ({ ...f, bien_so: e.target.value }))} placeholder="51B-12345" />
            </FormField>
            <FormField label="Loại xe" required>
              <TextInput value={busForm.loai_xe} onChange={e => setBusForm(f => ({ ...f, loai_xe: e.target.value }))} placeholder="Giường nằm 40 chỗ" />
            </FormField>
            <FormField label="Số ghế" required>
              <TextInput type="number" min={10} max={60} value={busForm.so_ghe}
                onChange={e => setBusForm(f => ({ ...f, so_ghe: Number(e.target.value) }))}
                disabled={modal.mode === 'edit'} />
            </FormField>
            {modal.mode === 'edit' && (
              <FormField label="Trạng thái">
                <SelectInput value={busForm.trang_thai} onChange={e => setBusForm(f => ({ ...f, trang_thai: e.target.value }))}>
                  <option value="HOAT_DONG">HOAT_DONG</option>
                  <option value="BAO_TRI">BAO_TRI</option>
                  <option value="NGUNG">NGUNG</option>
                </SelectInput>
              </FormField>
            )}
            {modal.mode === 'create' && (
              <p className="text-xs text-on-surface-variant">Hệ thống tự tạo sơ đồ ghế khi thêm xe mới.</p>
            )}
          </div>
        )}

        {modal.tab === 'trips' && (
          <div className="flex flex-col gap-4">
            <FormField label="Tuyến xe" required>
              <SelectInput value={tripForm.ma_tuyen} onChange={e => setTripForm(f => ({ ...f, ma_tuyen: Number(e.target.value) }))}>
                <option value={0}>-- Chọn tuyến --</option>
                {routes.map(r => (
                  <option key={r.ma_tuyen} value={r.ma_tuyen}>{r.ten_tuyen} ({r.diem_di} → {r.diem_den})</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Xe" required>
              <SelectInput value={tripForm.ma_xe} onChange={e => setTripForm(f => ({ ...f, ma_xe: Number(e.target.value) }))}>
                <option value={0}>-- Chọn xe --</option>
                {buses.filter(b => b.trang_thai === 'HOAT_DONG').map(b => (
                  <option key={b.ma_xe} value={b.ma_xe}>{b.bien_so} — {b.loai_xe}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Giờ khởi hành" required>
              <TextInput type="datetime-local" value={tripForm.gio_khoi_hanh}
                onChange={e => setTripForm(f => ({ ...f, gio_khoi_hanh: e.target.value }))} />
            </FormField>
            <FormField label="Giá vé (VND)" required>
              <TextInput type="number" min={0} value={tripForm.gia_ve}
                onChange={e => setTripForm(f => ({ ...f, gia_ve: Number(e.target.value) }))} />
            </FormField>
            {modal.mode === 'edit' && (
              <FormField label="Trạng thái">
                <SelectInput value={tripForm.trang_thai} onChange={e => setTripForm(f => ({ ...f, trang_thai: e.target.value }))}>
                  <option value="MO">MO</option>
                  <option value="DONG">DONG</option>
                  <option value="HUY">HUY</option>
                </SelectInput>
              </FormField>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-outline-variant">
          <Button variant="secondary" onClick={closeModal}>Hủy</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Icon name="save" size={16} />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <table className="min-w-full divide-y divide-outline-variant">
      <thead className="bg-surface-container-low sticky top-0">
        <tr>
          {headers.map(h => (
            <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant">
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="py-8 text-center text-on-surface-variant">Không có dữ liệu</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} className="hover:bg-surface-container-low transition-colors group">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-sm">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
      active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'
    }`}>{label}</span>
  )
}

function TicketBadge({ status }: { status: string }) {
  if (status === 'DA_DAT') return <span className="inline-flex px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">Paid</span>
  if (status === 'DA_HUY') return <span className="inline-flex px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-semibold">Cancelled</span>
  return <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">{status}</span>
}