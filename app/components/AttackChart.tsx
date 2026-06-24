'use client'
import { ThreatLog } from '@/types'
import { useMemo, useState } from 'react'

// ─── Konfigurasi Range ───────────────────────────────────────────────────────
type RangeKey = '1h' | '4h' | '12h' | '24h' | '1w' | '1m' | '3m' | '6m' | '1y'

interface RangeConfig {
  label: string
  hours: number
  buckets: number
  bucketHours: number
  // Fungsi untuk menghasilkan label sumbu X per bucket
  formatLabel: (date: Date) => string
  // Apakah tampilkan semua label atau setiap N bucket
  showEvery: number
}

const WIB_OFFSET = 7 * 60 // menit

/** Konversi timestamp UTC ke Date dalam zona WIB */
function toWIB(utcString: string): Date {
  const utc = new Date(utcString)
  return new Date(utc.getTime() + WIB_OFFSET * 60 * 1000)
}

/** Date sekarang dalam WIB */
function nowWIB(): Date {
  return new Date(Date.now() + WIB_OFFSET * 60 * 1000)
}

const RANGES: Record<RangeKey, RangeConfig> = {
  '1h': {
    label: '1 Jam', hours: 1, buckets: 12, bucketHours: 1 / 12,
    formatLabel: (d) => `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`,
    showEvery: 3,
  },
  '4h': {
    label: '4 Jam', hours: 4, buckets: 16, bucketHours: 0.25,
    formatLabel: (d) => `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`,
    showEvery: 4,
  },
  '12h': {
    label: '12 Jam', hours: 12, buckets: 12, bucketHours: 1,
    formatLabel: (d) => `${String(d.getUTCHours()).padStart(2,'0')}:00`,
    showEvery: 2,
  },
  '24h': {
    label: '24 Jam', hours: 24, buckets: 24, bucketHours: 1,
    formatLabel: (d) => `${String(d.getUTCHours()).padStart(2,'0')}:00`,
    showEvery: 6,
  },
  '1w': {
    label: '1 Minggu', hours: 24 * 7, buckets: 7, bucketHours: 24,
    formatLabel: (d) => d.toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'UTC' }),
    showEvery: 1,
  },
  '1m': {
    label: '1 Bulan', hours: 24 * 30, buckets: 30, bucketHours: 24,
    formatLabel: (d) => `${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
    showEvery: 5,
  },
  '3m': {
    label: '3 Bulan', hours: 24 * 90, buckets: 90, bucketHours: 24,
    formatLabel: (d) => `${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
    showEvery: 15,
  },
  '6m': {
    label: '6 Bulan', hours: 24 * 180, buckets: 180, bucketHours: 24,
    formatLabel: (d) => `${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
    showEvery: 30,
  },
  '1y': {
    label: '1 Tahun', hours: 24 * 365, buckets: 12, bucketHours: 24 * 30,
    formatLabel: (d) => d.toLocaleDateString('id-ID', { month: 'short', timeZone: 'UTC' }),
    showEvery: 1,
  },
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface AttackChartProps {
  data: ThreatLog[]
  range: RangeKey
  onRangeChange: (r: RangeKey) => void
  loading?: boolean
}

// ─── Komponen ────────────────────────────────────────────────────────────────
export default function AttackChart({ data, range, onRangeChange, loading = false }: AttackChartProps) {
  const cfg = RANGES[range]

  const chart = useMemo(() => {
    const nowMs = nowWIB().getTime()
    const bucketMs = cfg.bucketHours * 60 * 60 * 1000

    // Buat array bucket dari paling lama → paling baru
    const buckets = Array.from({ length: cfg.buckets }, (_, i) => {
      const startMs = nowMs - (cfg.buckets - i) * bucketMs
      const endMs   = startMs + bucketMs
      return {
        startMs,
        endMs,
        label: cfg.formatLabel(new Date(startMs)),
        count: 0,
      }
    })

    // Masukkan data ke bucket
    data.forEach(row => {
      const rowMs = toWIB(row.detected_at).getTime()
      const bucket = buckets.find(b => rowMs >= b.startMs && rowMs < b.endMs)
      if (bucket) bucket.count++
    })

    return buckets
  }, [data, range, cfg])

  const max = Math.max(...chart.map(d => d.count), 1)
  const total = chart.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Serangan — {cfg.label} Terakhir</h2>
          <p className="text-xs text-gray-400 mt-0.5">{total} event · Waktu Indonesia (WIB)</p>
        </div>
      </div>

      {/* Tombol Range */}
      <div className="flex flex-wrap gap-1 mb-4">
        {(Object.keys(RANGES) as RangeKey[]).map(r => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            className={`px-2 py-0.5 text-xs rounded font-medium transition-all ${
              r === range
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {RANGES[r].label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        /* ─── Skeleton Loading ─── */
        <div className="flex items-end gap-0.5 h-28">
          {Array.from({ length: cfg.buckets }, (_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
              <div
                className="w-full rounded-sm bg-gray-200 animate-pulse"
                style={{
                  height: `${20 + Math.sin(i * 0.7) * 15 + Math.random() * 30}%`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
              <span className="font-mono leading-none" style={{ fontSize: '7px' }}>
                <span className="inline-block w-4 h-1.5 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* ─── Chart Asli ─── */
        <div className="flex items-end gap-0.5 h-28">
          {chart.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
              <div
                className={`w-full rounded-sm transition-all duration-500 ${
                  d.count === max && max > 0
                    ? 'bg-red-400'
                    : d.count > 0
                    ? 'bg-blue-400'
                    : 'bg-gray-100'
                }`}
                style={{
                  height: `${(d.count / max) * 100}%`,
                  minHeight: d.count > 0 ? '4px' : '2px',
                }}
                title={`${d.label} — ${d.count} serangan`}
              />
              <span className="text-gray-300 font-mono leading-none" style={{ fontSize: '7px' }}>
                {i % cfg.showEvery === 0 ? d.label : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" /> Serangan
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Tertinggi
        </span>
        {loading && (
          <span className="flex items-center gap-1 text-blue-500">
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memuat...
          </span>
        )}
        <span className="ml-auto">GMT+7</span>
      </div>
    </div>
  )
}
