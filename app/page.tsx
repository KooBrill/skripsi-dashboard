'use client'
import { useEffect, useState, useCallback } from 'react'
import { ThreatLog, BannedLog } from '@/types'
import StatCard from './components/StatCard'
import ThreatTable from './components/ThreatTable'
import BannedTable from './components/BannedTable'
import AttackChart from './components/AttackChart'
import LiveLog from './components/LiveLog'

export default function Dashboard() {
  const [threats, setThreats]   = useState<ThreatLog[]>([])
  const [banned, setBanned]     = useState<BannedLog[]>([])
  const [loading, setLoading]   = useState(true)
  const [last, setLast]         = useState(new Date())
  const [activeTab, setActiveTab] = useState<'threats' | 'banned'>('threats')

  const fetchData = useCallback(async () => {
    try {
      const [t, b] = await Promise.all([
        fetch('/api/threats').then(r => r.json()),
        fetch('/api/banned').then(r => r.json()),
      ])
      setThreats(Array.isArray(t) ? t : [])
      setBanned(Array.isArray(b) ? b : [])
      setLast(new Date())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 10000)
    return () => clearInterval(t)
  }, [fetchData])

  const uniqueIPs    = new Set(threats.map(t => t.ip_address)).size
  const toolHits     = threats.filter(t => t.is_tool).length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
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
            <p className="text-xs text-gray-400 font-mono">Update: {last.toLocaleTimeString('id-ID')}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-400">Memuat data...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="IP Diblokir"     value={banned.length}  color="red"   sub="permanen" />
              <StatCard label="Total Serangan"   value={threats.length} color="blue"  sub="semua event" />
              <StatCard label="IP Unik"          value={uniqueIPs}      color="amber" sub="penyerang berbeda" />
              <StatCard label="Pakai Tool"       value={toolHits}       color="green" sub="sqlmap, nikto, dll" />
            </div>

            {/* Chart + Log */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AttackChart data={threats} />
              <LiveLog data={threats} />
            </div>

            {/* Tab */}
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
