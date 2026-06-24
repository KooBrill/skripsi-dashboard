'use client'

type RangeKey = '1h' | '4h' | '12h' | '24h' | '1w' | '1m' | '3m' | '6m' | '1y'

import { useEffect, useState, useCallback } from 'react'
import { ThreatLog, BannedLog } from '@/types'
import StatCard from './components/StatCard'
import ThreatTable from './components/ThreatTable'
import BannedTable from './components/BannedTable'
import AttackChart from './components/AttackChart'
import LiveLog from './components/LiveLog'

export default function Dashboard() {
  const [threats, setThreats]     = useState<ThreatLog[]>([])
  const [banned, setBanned]       = useState<BannedLog[]>([])
  const [loading, setLoading]     = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [last, setLast]           = useState(new Date())
  const [activeTab, setActiveTab] = useState<'threats' | 'banned'>('threats')
  const [chartRange, setChartRange] = useState<RangeKey>('24h')

  const fetchData = useCallback(async (range: RangeKey = chartRange) => {
    try {
      const [t, b] = await Promise.all([
        fetch(`/api/threats?range=${range}`).then(r => r.json()),
        fetch('/api/banned').then(r => r.json()),
      ])
      setThreats(Array.isArray(t) ? t : [])
      setBanned(Array.isArray(b) ? b : [])
      setLast(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setChartLoading(false)
    }
  }, [chartRange])

  const handleRangeChange = useCallback((r: RangeKey) => {
    setChartRange(r)
    setChartLoading(true)
    fetchData(r)
  }, [fetchData])

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 10000)
    return () => clearInterval(t)
  }, [fetchData])

  const uniqueIPs = new Set(threats.map(t => t.ip_address)).size
  const toolHits  = threats.filter(t => t.is_tool).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">🛡️</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Bangun Karya — Security Dashboard</p>
              <p className="text-xs text-gray-400">Active Defense System · v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Sistem Aktif
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Update: {last.toLocaleTimeString('id-ID')}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {loading ? (
          <>
            {/* Skeleton: Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-7 w-14 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Skeleton: Chart + LiveLog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chart skeleton */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2.5 w-28 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5,6,7,8,9].map(i => (
                    <div key={i} className="h-5 w-10 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                  ))}
                </div>
                <div className="flex items-end gap-0.5 h-28">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                      <div
                        className="w-full rounded-sm bg-gray-200 animate-pulse"
                        style={{ height: `${15 + Math.sin(i * 0.8) * 20 + 15}%`, animationDelay: `${i * 40}ms` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* LiveLog skeleton */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-10 bg-green-100 rounded-full animate-pulse" />
                </div>
                {[1,2,3,4,5,6,7].map(i => (
                  <div key={i} className="flex items-center gap-3" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="h-2.5 w-12 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-blue-100 rounded animate-pulse" />
                    <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                    <div className="ml-auto h-4 w-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton: Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            </div>

            {/* Skeleton: Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-blue-100 rounded-full animate-pulse" />
              </div>
              <div className="flex gap-4 border-b border-gray-100 pb-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex gap-4 py-2" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-6 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-10 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="IP Diblokir"     value={banned.length}  color="red"   sub="permanen" />
              <StatCard label="Total Serangan"   value={threats.length} color="blue"  sub="semua event" />
              <StatCard label="IP Unik"          value={uniqueIPs}      color="amber" sub="penyerang berbeda" />
              <StatCard label="Pakai Tool"       value={toolHits}       color="green" sub="sqlmap, nikto, dll" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AttackChart data={threats} range={chartRange} onRangeChange={handleRangeChange} loading={chartLoading} />
              <LiveLog data={threats} />
            </div>

            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('threats')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'threats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Log Serangan ({threats.length})
              </button>
              <button
                onClick={() => setActiveTab('banned')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'banned'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                IP Diblokir ({banned.length})
              </button>
            </div>

            {activeTab === 'threats' && <ThreatTable data={threats} />}
            {activeTab === 'banned'  && <BannedTable data={banned} />}
          </>
        )}
      </main>
    </div>
  )
}
