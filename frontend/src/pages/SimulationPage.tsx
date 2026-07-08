import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import type { SimulationStats, TransactionLog, CheDoKhoa } from '../types'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { cn } from '../lib/utils'
import { Icon } from '../components/ui/Icon'
import { PageHeader } from '../components/ui/PageHeader'

/**
 * Transaction Simulator - Trang quan trọng nhất cho đề tài nghiên cứu.
 * Cho phép mở nhiều tab trình duyệt, mỗi tab đại diện 1 Transaction (A, B, C).
 * Gọi sp_DatVe đồng thời trên cùng 1 ghế để minh họa Lock/Block/Rollback.
 */
export function SimulationPage() {
  const [stats, setStats] = useState<SimulationStats | null>(null)
  const [logs, setLogs] = useState<TransactionLog[]>([])
  const [cheDoKhoa, setCheDoKhoa] = useState<CheDoKhoa>('BI_QUAN')
  const [maChuyen, setMaChuyen] = useState(1)
  const [maGhe, setMaGhe] = useState(3) // A3
  const [running, setRunning] = useState<string | null>(null)

  const refresh = useCallback(() => {
    api.getSimulationStatus()
      .then(r => { setStats(r.data.stats); setLogs(r.data.recent_logs) })
      .catch(console.error)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [refresh])

  const runTransaction = async (label: string, customerId: number) => {
    setRunning(label)
    try {
      const res = await api.book({
        ma_chuyen: maChuyen,
        ma_ghe: maGhe,
        ma_khach_hang: customerId,
        che_do_khoa: cheDoKhoa,
        session_id: label,
        delay_ms: 3000,
      })
      alert(`${label}: ${res.data.ket_qua}\n${res.data.thong_bao}`)
    } catch (e) {
      alert(`${label}: Lỗi - ${(e as Error).message}`)
    } finally {
      setRunning(null)
      refresh()
    }
  }

  const statusColor = (s: string) => {
    if (s === 'COMMIT') return 'success'
    if (s === 'ROLLBACK') return 'danger'
    if (s === 'DEADLOCK') return 'danger'
    if (s === 'WAITING' || s === 'BLOCKED') return 'warning'
    return 'default'
  }

  const statCards = stats ? [
    { label: 'Tổng TX', value: stats.tong_transaction, color: 'text-on-surface' },
    { label: 'Đang chạy', value: stats.dang_chay, color: 'text-blue-600' },
    { label: 'Bị Block', value: stats.bi_block, color: 'text-warning' },
    { label: 'Rollback', value: stats.rollback_count, color: 'text-danger' },
    { label: 'Commit', value: stats.commit_count, color: 'text-success' },
    { label: 'Deadlock', value: stats.deadlock_count, color: 'text-danger' },
    { label: 'Chờ TB (ms)', value: Math.round(stats.avg_lock_wait_ms), color: 'text-on-surface-variant' },
  ] : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transaction Simulator"
        subtitle="Mở nhiều tab trình duyệt → bấm TX A, B, C cùng lúc để mô phỏng concurrency"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={refresh}><Icon name="refresh" size={16} /> Refresh</Button>
            <Button variant="secondary" size="sm" onClick={() => api.resetSimulation().then(refresh)}>
              <Icon name="restart_alt" size={16} /> Reset log
            </Button>
          </div>
        }
      />

      {/* Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center">
            <p className="text-xs text-on-surface-variant font-semibold uppercase">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Config */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4">
        <h3 className="font-semibold">Cấu hình mô phỏng</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant">Chuyến xe (ma_chuyen)</label>
            <input type="number" value={maChuyen} onChange={e => setMaChuyen(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant">Ghế (ma_ghe) — dùng A1=1, A2=2, A3=3</label>
            <input type="number" value={maGhe} onChange={e => setMaGhe(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant">Chế độ khóa</label>
            <select value={cheDoKhoa} onChange={e => setCheDoKhoa(e.target.value as CheDoKhoa)}
              className="w-full mt-1 px-3 py-2 border border-outline-variant rounded text-sm">
              <option value="KHONG_KHOA">KHONG_KHOA (Lost Update)</option>
              <option value="BI_QUAN">BI_QUAN (Pessimistic)</option>
              <option value="LE_QUAN">LE_QUAN (Optimistic)</option>
            </select>
          </div>
        </div>

        {/* Transaction buttons */}
        <div className="flex flex-wrap gap-3 mt-2">
          {[
            { label: 'Transaction A', customer: 1 },
            { label: 'Transaction B', customer: 2 },
            { label: 'Transaction C', customer: 3 },
          ].map(tx => (
            <Button
              key={tx.label}
              onClick={() => runTransaction(tx.label, tx.customer)}
              disabled={!!running}
              className="min-w-[160px]"
            >
              <Icon name="bolt" size={16} />
              {running === tx.label ? 'Đang chạy...' : tx.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant">
          💡 Mở 2-3 tab trình duyệt cùng URL này, bấm TX A/B/C gần như đồng thời (trong 3 giây delay) để quan sát Block/Commit/Rollback.
        </p>
      </div>

      {/* Log */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-4 border-b border-outline-variant font-semibold">Transaction Log (realtime)</div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-container-low">
              <tr>
                {['Session', 'SP', 'Chế độ', 'Trạng thái', 'Ghế', 'Thông báo', 'Thời gian (ms)'].map(h => (
                  <th key={h} className="py-2 px-3 text-left font-semibold text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-mono">
              {logs.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-on-surface-variant">Chưa có log</td></tr>
              ) : logs.map(log => (
                <tr key={log.ma_log} className="hover:bg-surface-container-low">
                  <td className="py-2 px-3">{log.session_id}</td>
                  <td className="py-2 px-3">{log.ten_thu_tuc}</td>
                  <td className="py-2 px-3">{log.che_do_khoa}</td>
                  <td className="py-2 px-3"><Badge variant={statusColor(log.trang_thai)}>{log.trang_thai}</Badge></td>
                  <td className="py-2 px-3">{log.ma_ghe}</td>
                  <td className="py-2 px-3 max-w-xs truncate">{log.thong_bao}</td>
                  <td className="py-2 px-3">{log.thoi_gian_cho_ms ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}