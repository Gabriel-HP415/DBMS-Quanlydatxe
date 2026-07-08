import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { DeadlockLog, DeadlockRunResult, DeadlockSeatInfo } from '../types'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Icon } from '../components/ui/Icon'
import { PageHeader } from '../components/ui/PageHeader'
import { cn } from '../lib/utils'

const STEPS = [
  { tx: 'A', action: 'BEGIN TRANSACTION', lock: 'Khóa ghế A1 (XLOCK)', status: 'RUNNING' },
  { tx: 'B', action: 'BEGIN TRANSACTION', lock: 'Khóa ghế A2 (XLOCK)', status: 'RUNNING' },
  { tx: 'A', action: 'WAITFOR delay', lock: 'Cố khóa ghế A2', status: 'BLOCKED', wait: 'A2 held by B' },
  { tx: 'B', action: 'WAITFOR delay', lock: 'Cố khóa ghế A1', status: 'BLOCKED', wait: 'A1 held by A' },
  { tx: 'B', action: 'DEADLOCK DETECTED', lock: 'Error 1205', status: 'DEADLOCK', wait: 'Chosen as VICTIM' },
  { tx: 'A', action: 'COMMIT', lock: 'Giữ A1 + A2', status: 'COMMIT', wait: 'Survivor' },
]

export function DeadlockPage() {
  const [step, setStep] = useState(0)
  const [seatInfo, setSeatInfo] = useState<DeadlockSeatInfo | null>(null)
  const [delayGiay, setDelayGiay] = useState(5)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<DeadlockRunResult | null>(null)
  const [logs, setLogs] = useState<DeadlockLog[]>([])
  const [error, setError] = useState<string | null>(null)

  const refreshInfo = useCallback(() => {
    api.getDeadlockInfo()
      .then(r => setSeatInfo(r.data))
      .catch(() => setSeatInfo(null))
  }, [])

  useEffect(() => { refreshInfo() }, [refreshInfo])

  const runSimulator = async () => {
    setRunning(true)
    setError(null)
    setResult(null)
    setStep(0)

    const progress = setInterval(() => {
      setStep(s => Math.min(STEPS.length - 1, s + 1))
    }, (delayGiay * 1000) / STEPS.length)

    try {
      const res = await api.runDeadlock({ ma_chuyen: 1, delay_giay: delayGiay })
      setResult(res.data)
      setLogs(res.data.deadlock_logs)
      setStep(STEPS.length - 1)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      clearInterval(progress)
      setRunning(false)
    }
  }

  const statusVariant = (s: string) => {
    if (s === 'COMMIT') return 'success'
    if (s === 'DEADLOCK') return 'danger'
    if (s === 'BLOCKED' || s === 'ROLLBACK') return 'warning'
    return 'info'
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deadlock Simulator"
        subtitle="Bấm nút bên dưới — Tx A khóa A1 đợi A2, Tx B khóa A2 đợi A1 → Error 1205"
      />

      {/* Web Simulator Panel */}
      <div className="bg-surface-container-lowest border-2 border-primary/30 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Icon name="play_circle" size={22} className="text-primary" />
          <h3 className="font-semibold text-lg">Chạy trên Web</h3>
          <Badge variant="info">sp_DeadlockDemo</Badge>
        </div>

        {seatInfo && (
          <p className="text-sm text-on-surface-variant">
            Chuyến {seatInfo.ma_chuyen}: ghế <strong>{seatInfo.so_ghe_A1}</strong> (ma_ghe={seatInfo.ma_ghe_A1})
            {' ↔ '}
            <strong>{seatInfo.so_ghe_A2}</strong> (ma_ghe={seatInfo.ma_ghe_A2})
          </p>
        )}

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant">Delay giữa 2 lần khóa (giây)</label>
            <input
              type="number"
              min={2}
              max={30}
              value={delayGiay}
              onChange={e => setDelayGiay(Number(e.target.value))}
              disabled={running}
              className="block mt-1 w-24 px-3 py-2 border border-outline-variant rounded text-sm"
            />
          </div>
          <Button onClick={runSimulator} disabled={running} className="min-w-[200px]">
            <Icon name="bolt" size={18} />
            {running ? 'Đang chạy Tx A + Tx B...' : 'Chạy Deadlock Simulator'}
          </Button>
        </div>

        {running && (
          <div className="flex items-center gap-2 text-sm text-warning">
            <Icon name="hourglass_top" size={18} />
            2 transaction đang chạy song song trên SQL Server (~{delayGiay}s delay mỗi tx)...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {[result.txA, result.txB].map(tx => (
              <div
                key={tx.vai_tro}
                className={cn(
                  'rounded-xl border p-4',
                  tx.ket_qua === 'DEADLOCK' ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold font-mono">Transaction {tx.vai_tro}</span>
                  <Badge variant={statusVariant(tx.ket_qua)}>{tx.ket_qua}</Badge>
                </div>
                <p className="text-xs font-mono text-on-surface-variant">SPID: {tx.spid ?? '—'}</p>
                <p className="text-sm mt-2">{tx.thong_bao}</p>
                {tx.ket_qua === 'DEADLOCK' && (
                  <p className="text-xs text-red-700 font-semibold mt-2">☠ DEADLOCK VICTIM — Error 1205</p>
                )}
                {tx.ket_qua === 'COMMIT' && (
                  <p className="text-xs text-green-700 font-semibold mt-2">✓ SURVIVOR — COMMIT thành công</p>
                )}
              </div>
            ))}
          </div>
        )}

        {result?.deadlock_detected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
            <strong>Deadlock đã xảy ra!</strong> SQL Server phát hiện chu trình Wait-For Graph
            và chọn Tx <strong>{result.victim?.vai_tro}</strong> làm nạn nhân (SPID {result.victim?.spid}).
          </div>
        )}
      </div>

      {/* Deadlock Log */}
      {logs.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-4 border-b border-outline-variant font-semibold">DEADLOCK_LOG (mới nhất)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-surface-container-low">
                <tr>
                  {['SPID Victim', 'Error', 'Thông báo', 'Thời gian'].map(h => (
                    <th key={h} className="py-2 px-3 text-left font-semibold text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {logs.map(log => (
                  <tr key={log.ma_log}>
                    <td className="py-2 px-3">{log.session_victim}</td>
                    <td className="py-2 px-3">{log.error_code}</td>
                    <td className="py-2 px-3 max-w-md truncate">{log.thong_bao}</td>
                    <td className="py-2 px-3">{new Date(log.thoi_gian).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wait-For Graph diagram */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <h3 className="font-semibold mb-4">Wait-For Graph</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap text-sm font-mono">
          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 text-center min-w-[120px]">
            <p className="font-bold text-blue-800">Transaction A</p>
            <p className="text-xs mt-1 text-blue-600">Giữ lock A1</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-danger font-bold">đợi →</span>
            <span className="text-xs text-on-surface-variant">Lock A2</span>
          </div>
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-center min-w-[120px]">
            <p className="font-bold text-red-800">Lock A2</p>
            <p className="text-xs mt-1 text-red-600">held by Tx B</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 flex-wrap text-sm font-mono mt-4">
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 text-center min-w-[120px]">
            <p className="font-bold text-green-800">Transaction B</p>
            <p className="text-xs mt-1 text-green-600">Giữ lock A2</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-danger font-bold">đợi →</span>
            <span className="text-xs text-on-surface-variant">Lock A1</span>
          </div>
          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 text-center min-w-[120px]">
            <p className="font-bold text-blue-800">Lock A1</p>
            <p className="text-xs mt-1 text-blue-600">held by Tx A</p>
          </div>
        </div>
        <p className="text-center text-danger font-semibold mt-4 text-sm">
          ⟳ Chu trình (cycle) trong đồ thị → DEADLOCK DETECTED!
        </p>
      </div>

      {/* Step-by-step animation */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Log từng bước</h3>
          <div className="flex gap-2">
            <button onClick={() => setStep(Math.max(0, step - 1))}
              className="px-3 py-1 border border-outline-variant rounded text-sm hover:bg-surface-container">← Trước</button>
            <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              className="px-3 py-1 bg-primary-container text-on-primary rounded text-sm">Tiếp →</button>
          </div>
        </div>

        <div className="space-y-2">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              i === step ? 'border-primary bg-secondary-container' : i < step ? 'border-outline-variant opacity-60' : 'border-transparent opacity-30'
            }`}>
              <span className="font-mono font-bold w-6">Tx{s.tx}</span>
              <Icon name="arrow_forward" size={14} className="text-outline" />
              <span className="text-sm flex-grow">{s.action} — {s.lock}</span>
              <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
              {s.wait && <span className="text-xs text-on-surface-variant">{s.wait}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Error 1205 */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
          <Icon name="info" size={18} /> SQL Server Error 1205
        </h3>
        <code className="block bg-red-100 text-red-900 p-3 rounded text-xs font-mono leading-relaxed">
          Transaction (Process ID {'{SPID}'}) was deadlocked on lock resources with another process
          and has been chosen as the deadlock victim. Rerun the transaction.
        </code>
        <ul className="mt-4 text-sm text-red-800 space-y-2 list-disc list-inside">
          <li><strong>Deadlock Victim:</strong> SQL Server chọn 1 transaction rollback (tiêu chí: ít tốn kém nhất)</li>
          <li><strong>Survivor:</strong> Transaction còn lại tiếp tục và COMMIT</li>
          <li><strong>Khắc phục:</strong> Thứ tự khóa nhất quán, transaction ngắn, retry khi gặp 1205</li>
        </ul>
      </div>

      {/* SSMS fallback */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 text-sm">
        <h3 className="font-semibold mb-3">Chạy thủ công trên SSMS (tùy chọn)</h3>
        <ol className="space-y-2 list-decimal list-inside text-on-surface-variant">
          <li>File <code className="bg-surface-container-highest px-1 rounded">database/05_deadlock_demo.sql</code></li>
          <li>Mở 2 cửa sổ Query, chạy SCRIPT A và SCRIPT B trong vòng 10 giây</li>
        </ol>
      </div>
    </div>
  )
}