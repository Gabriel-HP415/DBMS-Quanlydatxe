import type {
  ApiResponse, Trip, Seat, Ticket, BookingResult,
  SimulationStats, TransactionLog, Customer, Bus, CheDoKhoa,
  Route, TripInput, DeadlockSeatInfo, DeadlockRunResult,
} from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || json.error || 'Lỗi API')
  }
  return json
}

export const api = {
  getTrips: () => request<ApiResponse<Trip[]>>('/trips'),
  getTrip: (id: number) => request<ApiResponse<Trip>>(`/trips/${id}`),
  getSeats: (tripId: number) => request<ApiResponse<Seat[]>>(`/seats/${tripId}`),

  book: (body: {
    ma_chuyen: number
    ma_ghe: number
    ma_khach_hang: number
    che_do_khoa?: CheDoKhoa
    session_id?: string
    delay_ms?: number
  }) => request<ApiResponse<BookingResult>>('/booking', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  cancelTicket: (id: number) => request<ApiResponse<BookingResult>>(`/booking/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({}),
  }),

  getTickets: (ma_khach_hang?: number) => {
    const q = ma_khach_hang ? `?ma_khach_hang=${ma_khach_hang}` : ''
    return request<ApiResponse<Ticket[]>>(`/tickets${q}`)
  },

  getSimulationStatus: () => request<ApiResponse<{
    stats: SimulationStats
    recent_logs: TransactionLog[]
    deadlock_logs: unknown[]
  }>>('/simulation/status'),

  resetSimulation: () => request<ApiResponse<null>>('/simulation/reset', { method: 'POST' }),

  getDeadlockInfo: (ma_chuyen?: number) => {
    const q = ma_chuyen ? `?ma_chuyen=${ma_chuyen}` : ''
    return request<ApiResponse<DeadlockSeatInfo>>(`/deadlock/info${q}`)
  },

  runDeadlock: (body: { ma_chuyen?: number; delay_giay?: number }) =>
    request<ApiResponse<DeadlockRunResult>>('/deadlock/run', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // --- Admin CRUD ---
  getCustomers: () => request<ApiResponse<Customer[]>>('/admin/customers'),
  createCustomer: (data: { ho_ten: string; email: string; so_dien_thoai: string }) =>
    request<ApiResponse<Customer>>('/admin/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: number, data: Partial<Customer>) =>
    request<ApiResponse<Customer>>(`/admin/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: number) =>
    request<ApiResponse<null>>(`/admin/customers/${id}`, { method: 'DELETE' }),

  getBuses: () => request<ApiResponse<Bus[]>>('/admin/buses'),
  createBus: (data: { bien_so: string; loai_xe: string; so_ghe: number }) =>
    request<ApiResponse<Bus>>('/admin/buses', { method: 'POST', body: JSON.stringify(data) }),
  updateBus: (id: number, data: Partial<Bus>) =>
    request<ApiResponse<Bus>>(`/admin/buses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBus: (id: number) =>
    request<ApiResponse<null>>(`/admin/buses/${id}`, { method: 'DELETE' }),

  getAdminTrips: () => request<ApiResponse<Trip[]>>('/admin/trips'),
  createTrip: (data: TripInput) =>
    request<ApiResponse<{ ma_chuyen: number }>>('/admin/trips', { method: 'POST', body: JSON.stringify(data) }),
  updateTrip: (id: number, data: Partial<TripInput>) =>
    request<ApiResponse<null>>(`/admin/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (id: number) =>
    request<ApiResponse<null>>(`/admin/trips/${id}`, { method: 'DELETE' }),

  getRoutes: () => request<ApiResponse<Route[]>>('/admin/routes'),
  getAdminTickets: () => request<ApiResponse<Ticket[]>>('/admin/tickets'),
}